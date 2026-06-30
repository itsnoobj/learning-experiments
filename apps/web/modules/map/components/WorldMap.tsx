'use client';

import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progressStore';
import { generateMapLayout, type LayoutRegion } from '../data/mapNodes';
import { generateTerrain, generateBackdrop } from '../lib/terrain';
import { MapPath } from './MapPath';
import { MapNode } from './MapNode';
import { PlayerIndicator } from './PlayerIndicator';
import { PathUnlocked } from './PathUnlocked';

/** Props for {@link WorldMap}. */
export interface WorldMapProps {
  /**
   * The world's regions, rendered as connected bands of mission nodes. Optional
   * when {@link WorldMapProps.region} is supplied instead.
   */
  regions?: LayoutRegion[];
  /**
   * A single region to render on its own (the per-region mission view). When
   * provided it takes precedence over {@link WorldMapProps.regions} and the
   * layout switches to a serpentine pattern that fills the canvas.
   */
  region?: LayoutRegion;
  /** Accent colour used for completed paths, nodes, and the player indicator. */
  accent: string;
  /** Owning world id, used to build mission → chapter navigation links. */
  worldId?: number | string;
  /** Region id, used to build mission → chapter navigation links. */
  regionId?: string;
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
export function WorldMap({
  regions,
  region,
  accent,
  worldId,
  regionId,
  showUnlocked,
  onUnlockedDone,
}: WorldMapProps) {
  const router = useRouter();
  const completedChapters = useProgressStore((state) => state.completedChapters);

  // A single `region` takes precedence and triggers the serpentine layout.
  const effectiveRegions = region ? [region] : (regions ?? []);
  const isSingleRegion = effectiveRegions.length === 1;

  const { nodes, edges, regionAreas, width, height } = generateMapLayout(
    effectiveRegions,
    completedChapters,
  );

  const recommendedNode = nodes.find((node) => node.status === 'recommended');
  const accentColor = accent || GOLD;

  // Clicking a mission opens its chapter at `/chapter/{missionId}`. When we
  // know the world/region we carry them through so the result screen can route
  // back to this map.
  const targetRegionId = regionId ?? region?.id;
  const missionHref = (missionId: string) =>
    worldId != null && targetRegionId != null
      ? `/chapter/${missionId}?from=map&world=${worldId}&region=${targetRegionId}`
      : `/chapter/${missionId}`;

  const backdrop = generateBackdrop(width, height);
  const terrain = regionAreas.flatMap((area) =>
    generateTerrain(area.terrain, area.x, area.y, area.width, area.height),
  );

  return (
    <div>
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto"
          style={{
            width: '100%',
          }}
          role="img"
          aria-label={`World map with ${nodes.length} missions`}
        >
          {/* Dark canvas so the white-stroked landscape and nodes read clearly. */}
          <rect x={0} y={0} width={width} height={height} fill="#16140f" rx={12} />

          {/* Landscape backdrop, drawn first so it sits behind everything. */}
          <g aria-hidden="true">{backdrop}</g>
          <g aria-hidden="true">{terrain}</g>

          {/* Region emoji landmarks. For a single region we draw one large,
              faint landmark across the canvas; otherwise a small emoji sits at
              the top-centre of each region's band. */}
          {isSingleRegion ? (
            regionAreas[0]?.emoji ? (
              <text
                aria-hidden="true"
                x={width / 2}
                y={regionAreas[0].y + regionAreas[0].height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(width, regionAreas[0].height) * 0.6}
                opacity={0.08}
              >
                {regionAreas[0].emoji}
              </text>
            ) : null
          ) : (
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
          )}

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
              onClick={() => router.push(missionHref(node.id))}
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
    </div>
  );
}
