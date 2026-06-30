'use client';

import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progressStore';
import { generateMapLayout, type LayoutRegion } from '../data/mapNodes';
import { generateTerrain, generateBackdrop } from '../lib/terrain';
import { usePannable } from '../hooks/usePannable';
import { MapPath } from './MapPath';
import { MapNode } from './MapNode';
import { PlayerIndicator } from './PlayerIndicator';
import { PathUnlocked } from './PathUnlocked';

/** Props for {@link WorldMap}. */
export interface WorldMapProps {
  /** The world's regions, rendered as connected bands of mission nodes. */
  regions: LayoutRegion[];
  /** Accent colour used for completed paths, nodes, and the player indicator. */
  accent: string;
  /**
   * When provided, a "Path Unlocked" celebration is shown over the map
   * announcing the route from `from` to `to`. The parent owns this state and
   * should clear it via {@link WorldMapProps.onUnlockedDone}.
   */
  showUnlocked?: { from: string; to: string } | null;
  /** Called when the unlock celebration finishes or is dismissed. */
  onUnlockedDone?: () => void;
}

const GOLD = '#DAA520';

/** Perpendicular curve magnitude for path squiggles; sign alternates per edge. */
const CURVE_MAGNITUDE = 28;

/**
 * The Super Mario World style overworld map for a single world.
 *
 * Node positions, paths, and region bands are generated programmatically from
 * the world's {@link WorldMapProps.regions} via {@link generateMapLayout}.
 * Behind the nodes sits a subtle hand-sketched landscape: ambient clouds,
 * mountains, trees and stones, plus per-region terrain decorations chosen by
 * each region's terrain hint. Each region also carries an emoji landmark drawn
 * at the top of its band. Paths between nodes squiggle organically, curving in
 * alternating directions. Regions are visual groupings only — they are not
 * labelled. Every mission is reachable; the first uncompleted one pulses and
 * gets a ✨ sparkle as a gentle recommendation. Clicking any node navigates to
 * its chapter. The whole map can be dragged/panned.
 */
export function WorldMap({ regions, accent, showUnlocked, onUnlockedDone }: WorldMapProps) {
  const router = useRouter();
  const completedChapters = useProgressStore((state) => state.completedChapters);

  const { nodes, edges, regionAreas, width, height } = generateMapLayout(
    regions,
    completedChapters,
  );

  const recommendedNode = nodes.find((node) => node.status === 'recommended');
  const accentColor = accent || GOLD;

  const backdrop = generateBackdrop(width, height);
  const terrain = regionAreas.flatMap((area) =>
    generateTerrain(area.terrain, area.x, area.y, area.width, area.height),
  );

  const { containerRef, handlers, offset, isDragging } = usePannable<HTMLDivElement>();

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
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto"
          style={{
            minWidth: `${width}px`,
            width: '100%',
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
          role="img"
          aria-label={`World map with ${nodes.length} missions`}
        >
          {/* Dark canvas so the white-stroked landscape and nodes read clearly. */}
          <rect x={0} y={0} width={width} height={height} fill="#16140f" rx={12} />

          {/* Landscape backdrop, drawn first so it sits behind everything. */}
          <g aria-hidden="true">{backdrop}</g>
          <g aria-hidden="true">{terrain}</g>

          {/* Region emoji landmarks, at the top-centre of each region's band. */}
          <g aria-hidden="true">
            {regionAreas.map((area) =>
              area.emoji ? (
                <text
                  key={`emoji-${area.id}`}
                  x={area.x + area.width / 2}
                  y={area.y + 30}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={24}
                >
                  {area.emoji}
                </text>
              ) : null,
            )}
          </g>

          {edges.map((edge, i) => (
            <MapPath
              key={edge.key}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              curveOffset={i % 2 === 0 ? CURVE_MAGNITUDE : -CURVE_MAGNITUDE}
              completed={edge.completed}
              isGate={edge.isGate}
              accent={accentColor}
            />
          ))}

          {nodes.map((node) => (
            <MapNode
              key={node.id}
              x={node.x}
              y={node.y}
              label={node.label}
              title={node.title}
              status={node.status}
              accent={accentColor}
              onClick={() => router.push('/chapter')}
            />
          ))}

          {recommendedNode && (
            <PlayerIndicator x={recommendedNode.x} y={recommendedNode.y} accent={accentColor} />
          )}

          {/* Sparkle beside the recommended (first uncompleted) mission. */}
          {recommendedNode && (
            <text
              aria-hidden="true"
              x={recommendedNode.x + 24}
              y={recommendedNode.y - 18}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
            >
              ✨
            </text>
          )}
        </svg>

        {showUnlocked && (
          <PathUnlocked
            fromNode={showUnlocked.from}
            toNode={showUnlocked.to}
            onDone={() => onUnlockedDone?.()}
          />
        )}
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
