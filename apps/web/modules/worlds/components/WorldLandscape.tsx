'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useProgressStore } from '@/store/progressStore';
import type { World } from '@/lib/hierarchy';

/** Props for {@link WorldLandscape}. */
export interface WorldLandscapeProps {
  /** Worlds from the hierarchy, rendered in order across the map. */
  worlds: World[];
}

const GOLD = '#DAA520';
const WHITE = '#FFFFFF';

/** Fixed serpentine positions for the ten worlds across the 1000×600 canvas. */
const POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 90, y: 200 },
  { x: 190, y: 410 },
  { x: 290, y: 190 },
  { x: 390, y: 420 },
  { x: 490, y: 200 },
  { x: 590, y: 410 },
  { x: 690, y: 190 },
  { x: 790, y: 420 },
  { x: 880, y: 210 },
  { x: 945, y: 405 },
];

/** Ordered mission ids across all of a world's regions. */
function missionIds(world: World): string[] {
  return world.regions.flatMap((region) => region.missions);
}

/** True when the learner has completed at least one mission in the world. */
function hasProgress(world: World, completed: Set<string>): boolean {
  return missionIds(world).some((id) => completed.has(id));
}

/* ----------------------------------------------------------- world icons */

/**
 * Draws the terrain emblem for a world, centred at (cx, cy) within roughly a
 * 60×60 area. Stroke colour is driven by hover (accent) vs idle (white).
 */
function worldIcon(id: number, cx: number, cy: number, stroke: string): ReactNode {
  const s = { stroke, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const };

  switch (id) {
    case 1: // The Mirror — a small lake
      return (
        <g {...s}>
          <ellipse cx={cx} cy={cy + 6} rx={30} ry={14} />
          <path d={`M ${cx - 16} ${cy + 2} q 8 -6 16 0 q 8 6 16 0`} />
          <path d={`M ${cx - 12} ${cy + 10} q 6 -4 12 0 q 6 4 12 0`} />
        </g>
      );
    case 2: // The Crowd — cluster of houses
      return (
        <g {...s}>
          {[
            [cx - 20, cy + 8],
            [cx + 2, cy + 4],
            [cx + 20, cy + 10],
          ].map(([hx, hy], i) => (
            <g key={i}>
              <rect x={hx - 9} y={hy - 4} width={18} height={16} />
              <polyline points={`${hx - 9},${hy - 4} ${hx},${hy - 14} ${hx + 9},${hy - 4}`} />
            </g>
          ))}
        </g>
      );
    case 3: // The Campfire — mountain + fire/smoke
      return (
        <g {...s}>
          <polyline points={`${cx - 26},${cy + 16} ${cx - 6},${cy - 14} ${cx + 14},${cy + 16}`} />
          <path d={`M ${cx + 18} ${cy + 16} l -4 -10 l 6 -6 l -3 -8`} />
          <path d={`M ${cx + 8} ${cy + 16} q 4 -8 0 -16`} />
        </g>
      );
    case 4: // The Summit — tall peak
      return (
        <g {...s}>
          <polyline points={`${cx - 24},${cy + 18} ${cx},${cy - 24} ${cx + 24},${cy + 18}`} />
          <polyline points={`${cx - 8},${cy - 4} ${cx},${cy - 12} ${cx + 8},${cy - 4}`} />
        </g>
      );
    case 5: // The Maze — small labyrinth grid
      return (
        <g {...s}>
          <rect x={cx - 24} y={cy - 18} width={48} height={36} />
          <line x1={cx - 12} y1={cy - 18} x2={cx - 12} y2={cy + 6} />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 18} />
          <line x1={cx + 12} y1={cy - 18} x2={cx + 12} y2={cy + 6} />
          <line x1={cx - 24} y1={cy} x2={cx} y2={cy} />
        </g>
      );
    case 6: // The Crossroads — forking paths
      return (
        <g {...s}>
          <line x1={cx} y1={cy + 18} x2={cx} y2={cy} />
          <line x1={cx} y1={cy} x2={cx - 20} y2={cy - 18} />
          <line x1={cx} y1={cy} x2={cx + 20} y2={cy - 18} />
        </g>
      );
    case 7: // The Bridge — two platforms + span
      return (
        <g {...s}>
          <line x1={cx - 30} y1={cy + 8} x2={cx - 12} y2={cy + 8} />
          <line x1={cx + 12} y1={cy + 8} x2={cx + 30} y2={cy + 8} />
          <path d={`M ${cx - 12} ${cy + 8} Q ${cx} ${cy - 16} ${cx + 12} ${cy + 8}`} />
          <line x1={cx - 4} y1={cy - 2} x2={cx - 4} y2={cy + 8} />
          <line x1={cx + 4} y1={cy - 2} x2={cx + 4} y2={cy + 8} />
        </g>
      );
    case 8: // The Arena — circular ring
      return (
        <g {...s}>
          <ellipse cx={cx} cy={cy + 4} rx={28} ry={16} />
          <ellipse cx={cx} cy={cy + 4} rx={16} ry={9} />
        </g>
      );
    case 9: // The Scale — balance
      return (
        <g {...s}>
          <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 16} />
          <line x1={cx - 22} y1={cy - 12} x2={cx + 22} y2={cy - 12} />
          <path d={`M ${cx - 22} ${cy - 12} l -6 12 h 12 z`} />
          <path d={`M ${cx + 22} ${cy - 12} l -6 12 h 12 z`} />
          <line x1={cx - 12} y1={cy + 16} x2={cx + 12} y2={cy + 16} />
        </g>
      );
    case 10: // The Horizon — wavy road to a point
    default:
      return (
        <g {...s}>
          <line x1={cx - 24} y1={cy + 18} x2={cx - 2} y2={cy - 16} />
          <line x1={cx + 24} y1={cy + 18} x2={cx + 2} y2={cy - 16} />
          <line x1={cx - 14} y1={cy + 8} x2={cx + 12} y2={cy + 8} />
          <line x1={cx - 8} y1={cy - 2} x2={cx + 8} y2={cy - 2} />
        </g>
      );
  }
}

/** A single interactive world zone (icon + name + progress dot). */
function WorldZone({
  world,
  x,
  y,
  progressed,
  hovered,
  onHover,
  onSelect,
}: {
  world: World;
  x: number;
  y: number;
  progressed: boolean;
  hovered: boolean;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
}) {
  const stroke = hovered ? world.accent : WHITE;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${world.worldName} — ${world.title}`}
      onClick={() => onSelect(world.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(world.id);
        }
      }}
      onMouseEnter={() => onHover(world.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(world.id)}
      onBlur={() => onHover(null)}
      style={{
        cursor: 'pointer',
        filter: hovered ? `drop-shadow(0 0 8px ${world.accent})` : 'none',
        transition: 'filter 150ms ease',
      }}
    >
      {/* Generous transparent hit area. */}
      <rect x={x - 40} y={y - 48} width={80} height={104} fill="transparent" />

      {/* Progress dot above the icon. */}
      <circle
        cx={x}
        cy={y - 38}
        r={5}
        fill={progressed ? GOLD : WHITE}
        stroke={progressed ? GOLD : WHITE}
      />

      {worldIcon(world.id, x, y, stroke)}

      <text
        x={x}
        y={y + 40}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill={hovered ? world.accent : WHITE}
      >
        {world.worldName}
      </text>
      <text
        x={x}
        y={y + 54}
        textAnchor="middle"
        fontSize={9}
        fontWeight={400}
        fill={hovered ? world.accent : '#888'}
        opacity={0.9}
      >
        {world.title}
      </text>
    </g>
  );
}

/**
 * The zoomed-out landscape overview of all worlds.
 *
 * Renders a single SVG map (1000×600) on a dark canvas. Each world is a small
 * terrain emblem (lake, houses, peak, …) drawn in white outlines, with its name
 * below and a progress dot above (gold once any mission is done, white
 * otherwise). Dotted trails connect adjacent worlds like landmarks on a map.
 * Every world is always selectable — there are no locks. On hover/focus a world
 * glows in its accent colour. The map scrolls horizontally on small screens.
 */
export function WorldLandscape({ worlds }: WorldLandscapeProps) {
  const router = useRouter();
  const completedChapters = useProgressStore((state) => state.completedChapters);
  const completed = new Set(completedChapters);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const placed = worlds.map((world, index) => ({
    world,
    pos: POSITIONS[index] ?? { x: 500, y: 300 },
  }));

  return (
    <div
      style={{
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        style={{ minWidth: '760px', width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="World map — choose a world to explore"
      >
        <rect x={0} y={0} width={1000} height={600} fill="#16140f" rx={16} />

        {/* Trails between adjacent worlds. */}
        {placed.slice(0, -1).map(({ pos }, i) => {
          const next = placed[i + 1].pos;
          return (
            <line
              key={`trail-${i}`}
              x1={pos.x}
              y1={pos.y}
              x2={next.x}
              y2={next.y}
              stroke="#5a554c"
              strokeWidth={2}
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
          );
        })}

        {placed.map(({ world, pos }) => (
          <WorldZone
            key={world.id}
            world={world}
            x={pos.x}
            y={pos.y}
            progressed={hasProgress(world, completed)}
            hovered={hoveredId === world.id}
            onHover={setHoveredId}
            onSelect={(id) => router.push(`/worlds/${id}`)}
          />
        ))}
      </svg>

      <p
        className="md:hidden"
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-dim)',
          marginTop: 'var(--spacing-sm)',
        }}
      >
        Scroll to explore →
      </p>
    </div>
  );
}

export default WorldLandscape;
