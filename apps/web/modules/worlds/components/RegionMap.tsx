// VERIFIED DATA-DRIVEN (auto-extending map): RegionMap renders by iterating the
// `regions` prop (regions.map(...)) and derives layout from regions.length via
// regionPositions(), which has tuned cases for 1-4 regions and a generic
// serpentine fallback for any larger count. Adding regions to hierarchy.json
// extends the map automatically — no positions are hard-coded per region id.
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { usePannable } from '@/modules/map/hooks/usePannable';

/** A region as rendered on the map. Mirrors the shape used by the hierarchy. */
export interface RegionMapRegion {
  /** Stable region id within its world (e.g. "A", "B"). */
  id: string;
  /** Human-readable region title. */
  title: string;
  /** Emoji landmark for the region. */
  emoji: string;
  /** Short, evocative description. */
  description: string;
  /** Mission ids belonging to this region. */
  missions: string[];
}

/** Props for {@link RegionMap}. */
export interface RegionMapProps {
  /** Owning world id, used to build region routes. */
  worldId: number;
  /** The world's evocative name (used for the accessible map label). */
  worldName: string;
  /** World accent colour (hex) used for hover glow, borders, and progress. */
  accent: string;
  /** Regions to place on the map, in order. */
  regions: RegionMapRegion[];
  /** Set of completed mission/chapter ids, used to derive per-region progress. */
  completedMissions: Set<string>;
}

const WHITE = '#FFFFFF';
const VIEW_W = 500;
const VIEW_H = 800;

/* ------------------------------------------------------------------ helpers */

/** Small deterministic PRNG (mulberry32) so scatter is stable across renders. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Truncate a description to keep zone labels compact. */
function truncate(text: string, max = 22): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * Fixed serpentine/diagonal positions per region count. Positions are tuned to
 * keep each ~150px-wide zone inside the 800×500 canvas.
 */
function regionPositions(count: number): ReadonlyArray<{ x: number; y: number }> {
  switch (count) {
    case 1:
      return [{ x: 250, y: 400 }];
    case 2:
      return [
        { x: 150, y: 250 },
        { x: 350, y: 550 },
      ];
    case 3:
      return [
        { x: 150, y: 150 },
        { x: 350, y: 400 },
        { x: 150, y: 650 },
      ];
    case 4:
      return [
        { x: 150, y: 120 },
        { x: 350, y: 320 },
        { x: 150, y: 520 },
        { x: 350, y: 720 },
      ];
    default: {
      // Generic serpentine fallback for >4 regions (vertical).
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i += 1) {
        const x = i % 2 === 0 ? 150 : 350;
        const y = 120 + (i * 560) / Math.max(1, count - 1);
        pts.push({ x, y });
      }
      return pts;
    }
  }
}

/**
 * Builds a winding, multi-segment cubic-bezier path between two points so the
 * connector reads like a hand-drawn road rather than a straight line.
 */
function squigglyPath(x1: number, y1: number, x2: number, y2: number): string {
  const segments = 3;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Unit perpendicular to the connecting line; control points push along it.
  const px = -dy / len;
  const py = dx / len;
  const amp = 26;

  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  let prevX = x1;
  let prevY = y1;

  for (let i = 1; i <= segments; i += 1) {
    const t = i / segments;
    const sign = i % 2 === 0 ? -1 : 1;
    const targetX = i === segments ? x2 : x1 + dx * t + px * amp * sign;
    const targetY = i === segments ? y2 : y1 + dy * t + py * amp * sign;

    const c1x = prevX + (dx / segments) * 0.5 + px * amp * sign;
    const c1y = prevY + (dy / segments) * 0.5 + py * amp * sign;
    const c2x = targetX - (dx / segments) * 0.5 + px * amp * sign;
    const c2y = targetY - (dy / segments) * 0.5 + py * amp * sign;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
    prevX = targetX;
    prevY = targetY;
  }

  return d;
}

/* -------------------------------------------------------------- decorations */

function tree(x: number, y: number, s: number, key: string): ReactNode {
  return (
    <g key={key} stroke={WHITE} strokeWidth={1.2} fill="none" opacity={0.25}>
      <polyline points={`${x - s * 0.6},${y} ${x},${y - s} ${x + s * 0.6},${y}`} />
      <line x1={x} y1={y} x2={x} y2={y + s * 0.5} />
    </g>
  );
}

function bush(x: number, y: number, s: number, key: string): ReactNode {
  return (
    <path
      key={key}
      d={`M ${x - s} ${y} A ${s} ${s} 0 0 1 ${x + s} ${y}`}
      stroke={WHITE}
      strokeWidth={1.2}
      fill="none"
      opacity={0.22}
    />
  );
}

function rock(x: number, y: number, s: number, key: string): ReactNode {
  return (
    <polygon
      key={key}
      points={`${x - s},${y} ${x - s * 0.4},${y - s * 0.7} ${x + s * 0.5},${y - s * 0.6} ${x + s},${y} ${x + s * 0.3},${y + s * 0.4} ${x - s * 0.5},${y + s * 0.3}`}
      stroke={WHITE}
      strokeWidth={1.1}
      fill="none"
      opacity={0.22}
    />
  );
}

function flower(x: number, y: number, key: string): ReactNode {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [x + Math.cos(r) * 4, y + Math.sin(r) * 4] as const;
  });
  return (
    <g key={key} stroke={WHITE} strokeWidth={1} fill="none" opacity={0.28}>
      {petals.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={2} />
      ))}
      <circle cx={x} cy={y} r={1.4} />
      <line x1={x} y1={y + 4} x2={x} y2={y + 12} />
    </g>
  );
}

/** Gentle background hills (low arcs) spanning the lower third of the map. */
function hills(): ReactNode {
  return (
    <g stroke={WHITE} strokeWidth={1.5} fill="none" opacity={0.16} aria-hidden="true">
      <path d="M -20 430 Q 120 360 260 430" />
      <path d="M 220 445 Q 400 365 580 445" />
      <path d="M 540 430 Q 680 360 820 430" />
    </g>
  );
}

/** A thin wavy stream crossing the map. */
function river(): ReactNode {
  return (
    <path
      d="M 0 90 C 160 60 240 175 400 150 C 560 128 660 60 800 175"
      stroke={WHITE}
      strokeWidth={2}
      fill="none"
      opacity={0.2}
      aria-hidden="true"
    />
  );
}

/**
 * Scatters trees, bushes, rocks and flowers along the connectors and near each
 * region. Placement is deterministic (seeded by region count) so server and
 * client renders agree and the map looks identical across reloads.
 */
function natureScatter(positions: ReadonlyArray<{ x: number; y: number }>): ReactNode[] {
  const rng = makeRng(positions.length * 97 + 13);
  const items: ReactNode[] = [];

  // Trees + bushes + a flower clustered around the midpoint of each connector,
  // so the greenery reads as lining the winding road.
  for (let i = 0; i < positions.length - 1; i += 1) {
    const a = positions[i];
    const b = positions[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    // 3-4 trees scattered between this pair of regions.
    const treeCount = 3 + Math.round(rng());
    for (let t = 0; t < treeCount; t += 1) {
      const ox = (rng() - 0.5) * 120;
      const oy = (rng() - 0.5) * 80;
      items.push(tree(mx + ox, my + oy, 14 + rng() * 8, `tree-${i}-${t}`));
    }

    // 2-3 bushes along the path.
    const bushCount = 2 + Math.round(rng());
    for (let bIdx = 0; bIdx < bushCount; bIdx += 1) {
      const ox = (rng() - 0.5) * 130;
      const oy = (rng() - 0.5) * 70;
      items.push(bush(mx + ox, my + oy, 7 + rng() * 5, `bush-${i}-${bIdx}`));
    }

    // 1 flower near the path.
    items.push(flower(mx + (rng() - 0.5) * 90, my + 20 + rng() * 24, `flower-${i}`));
  }

  // A handful of rocks scattered across the lower canvas.
  for (let r = 0; r < 4; r += 1) {
    const rx = 80 + rng() * (VIEW_W - 160);
    const ry = 300 + rng() * 150;
    items.push(rock(rx, ry, 8 + rng() * 6, `rock-${r}`));
  }

  // A couple of standalone flowers near the first and last regions.
  const first = positions[0];
  const last = positions[positions.length - 1];
  items.push(flower(first.x - 60, first.y + 60, 'flower-first'));
  items.push(flower(last.x + 56, last.y - 50, 'flower-last'));

  return items;
}

/* ----------------------------------------------------------------- a region */

interface RegionZoneProps {
  region: RegionMapRegion;
  x: number;
  y: number;
  completedCount: number;
  total: number;
  accent: string;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/** A single navigable region zone: emoji landmark, title, description, progress. */
function RegionZone({
  region,
  x,
  y,
  completedCount,
  total,
  accent,
  hovered,
  onHover,
  onSelect,
}: RegionZoneProps) {
  const pct = total > 0 ? completedCount / total : 0;
  const zoneW = 150;
  const zoneH = 150;
  const zoneX = x - zoneW / 2;
  const zoneY = y - 78;
  const emojiY = y - 26;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${region.title} — ${completedCount} of ${total} missions complete`}
      onClick={() => onSelect(region.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(region.id);
        }
      }}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(region.id)}
      onBlur={() => onHover(null)}
      style={{
        cursor: 'pointer',
        filter: hovered ? `drop-shadow(0 0 10px ${accent})` : 'none',
        transition: 'filter 150ms ease',
      }}
    >
      {/* Zone border + faint accent wash, revealed on hover. */}
      <rect
        x={zoneX}
        y={zoneY}
        width={zoneW}
        height={zoneH}
        rx={10}
        fill={hovered ? `${accent}1f` : 'transparent'}
        stroke={hovered ? accent : 'transparent'}
        strokeWidth={1.5}
        style={{ transition: 'fill 150ms ease, stroke 150ms ease' }}
      />

      {/* Emoji landmark — scales slightly on hover. */}
      <text
        x={x}
        y={emojiY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={32}
        style={{
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
          transformBox: 'view-box',
          transformOrigin: `${x}px ${emojiY}px`,
          transition: 'transform 150ms ease',
        }}
      >
        {region.emoji}
      </text>

      {/* Title. */}
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={hovered ? accent : WHITE}
      >
        {region.title}
      </text>

      {/* Description (truncated). */}
      <text x={x} y={y + 28} textAnchor="middle" fontSize={10} fill="#9a9a9a">
        {truncate(region.description)}
      </text>

      {/* Progress count + thin bar. */}
      <text x={x} y={y + 46} textAnchor="middle" fontSize={10} fontWeight={600} fill="#bcbcbc">
        {completedCount}/{total}
      </text>
      <rect x={x - 30} y={y + 52} width={60} height={4} rx={2} fill="#3a3a3a" />
      <rect x={x - 30} y={y + 52} width={60 * pct} height={4} rx={2} fill={accent} />

      {/* Transparent hit area on top so the whole zone is clickable. */}
      <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill="transparent" />
    </g>
  );
}

/* -------------------------------------------------------------------- map */

/**
 * The region-selection map for a single world.
 *
 * Renders the world's regions as larger navigable zones (emoji landmark, title,
 * description and a small progress bar) positioned in a serpentine/diagonal
 * pattern across a dark 800×500 canvas. Zones are linked by dotted, squiggly
 * cubic-bezier "roads", and the scene is dressed with subtle, hand-sketched
 * nature: background hills, a crossing stream, and scattered trees, bushes,
 * rocks and flowers (all low-opacity white outlines, no external libraries).
 * The whole map can be dragged/panned. Darkened edges (a vignette) and a thin
 * frame make it feel like a zoomed-in slice of a larger world. Selecting a zone
 * routes to that region's mission map at `/worlds/[worldId]/region/[regionId]`.
 */
export function RegionMap({
  worldId,
  worldName,
  accent,
  regions,
  completedMissions,
}: RegionMapProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { containerRef, handlers, offset, isDragging } = usePannable<HTMLDivElement>();

  const positions = regionPositions(regions.length);
  const placed = regions.map((region, i) => ({
    region,
    pos: positions[i] ?? { x: VIEW_W / 2, y: VIEW_H / 2 },
  }));

  const decorations = natureScatter(placed.map((p) => p.pos));

  return (
    <div>
      <div
        ref={containerRef}
        {...handlers}
        style={{
          position: 'relative',
          maxWidth: '100%',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
          role="img"
          aria-label={`Map of ${worldName} — choose a region to explore`}
        >
          <defs>
            {/* Vignette: transparent centre fading to dark at the edges. */}
            <radialGradient id={`region-vignette-${worldId}`} cx="50%" cy="50%" r="72%">
              <stop offset="55%" stopColor="#000000" stopOpacity={0} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
            </radialGradient>
          </defs>

          {/* Dark canvas. */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#16140f" rx={14} />

          {/* Background nature, drawn first so it sits behind the roads. */}
          {hills()}
          {river()}

          {/* Squiggly dotted roads between consecutive regions. */}
          <g aria-hidden="true">
            {placed.slice(0, -1).map(({ pos }, i) => {
              const next = placed[i + 1].pos;
              return (
                <path
                  key={`road-${i}`}
                  d={squigglyPath(pos.x, pos.y, next.x, next.y)}
                  stroke={WHITE}
                  strokeWidth={3}
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.7}
                />
              );
            })}
          </g>

          {/* Scattered foreground nature. */}
          <g aria-hidden="true">{decorations}</g>

          {/* Vignette overlay (above scenery, below the interactive zones). */}
          <rect
            x={0}
            y={0}
            width={VIEW_W}
            height={VIEW_H}
            rx={14}
            fill={`url(#region-vignette-${worldId})`}
            pointerEvents="none"
          />

          {/* Region zones. */}
          {placed.map(({ region, pos }) => {
            const total = region.missions.length;
            const completedCount = region.missions.filter((id) => completedMissions.has(id)).length;
            return (
              <RegionZone
                key={region.id}
                region={region}
                x={pos.x}
                y={pos.y}
                completedCount={completedCount}
                total={total}
                accent={accent}
                hovered={hoveredId === region.id}
                onHover={setHoveredId}
                onSelect={(id) => router.push(`/worlds/${worldId}/region/${id}`)}
              />
            );
          })}

          {/* Thin frame around the whole map. */}
          <rect
            x={2}
            y={2}
            width={VIEW_W - 4}
            height={VIEW_H - 4}
            rx={13}
            fill="none"
            stroke="#3a352c"
            strokeWidth={2}
            pointerEvents="none"
          />
        </svg>
      </div>

      <p
        className="md:hidden"
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-dim)',
          marginTop: 'var(--spacing-sm)',
        }}
      >
        Drag to explore ↔
      </p>
    </div>
  );
}

export default RegionMap;
