// VERIFIED DATA-DRIVEN (auto-extending map): generateMapLayout derives every
// node, edge and region band purely from the `regions` array and each region's
// `missions` array — coordinates are computed programmatically
// (MARGIN_X + index * SPACING_X, serpentine rows, etc.), never hard-coded.
// Adding regions or missions to hierarchy.json therefore extends the map with
// no code changes. Covered by generateMapLayout.test.ts, including the
// "generates more nodes when more missions are added" case.
import type { MapNodeStatus } from '../components/MapNode';
import { getMissionTitle } from './missionTitles';

/** A region as consumed by the map layout (subset of the hierarchy Region). */
export interface LayoutRegion {
  /** Region id within its world (e.g. "A"). */
  id: string;
  /** Region title (used for grouping; no longer rendered as a label). */
  title: string;
  /** Emoji landmark rendered at the top-centre of the region's band. */
  emoji?: string;
  /** Visual terrain hint that drives background decorations. */
  terrain?: string;
  /** Ordered mission ids placed along this region's horizontal band. */
  missions: string[];
}

/** A positioned mission node on the world map. */
export interface LayoutNode {
  /** Mission id (also the chapter id). */
  id: string;
  /** SVG x coordinate of the node centre. */
  x: number;
  /** SVG y coordinate of the node centre. */
  y: number;
  /** Number shown inside the node (derived from the mission id). */
  label: number;
  /** Short label rendered below the node. */
  title: string;
  /** Owning region id. */
  regionId: string;
  /** Computed lifecycle status driven by completed missions. */
  status: MapNodeStatus;
}

/** A path segment between two nodes. */
export interface LayoutEdge {
  /** Stable React key. */
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Both endpoints completed. */
  completed: boolean;
  /** True when this segment bridges the last node of one region to the
   * first node of the next (a "gate" between regions). */
  isGate: boolean;
}

/** The bounding band of a region, used to place terrain decorations. */
export interface RegionArea {
  /** Region id. */
  id: string;
  /** Emoji landmark rendered at the top-centre of the band. */
  emoji?: string;
  /** Terrain hint that selects which decorations are drawn here. */
  terrain?: string;
  /** Left edge of the band. */
  x: number;
  /** Top edge of the band. */
  y: number;
  /** Band width. */
  width: number;
  /** Band height. */
  height: number;
}

/** The full programmatic layout for a world's regions. */
export interface MapLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  /** Per-region bands, used to scatter terrain decorations behind nodes. */
  regionAreas: RegionArea[];
  /** SVG viewBox width, sized to the widest region. */
  width: number;
  /** SVG viewBox height, sized to the number of regions. */
  height: number;
}

// Layout constants, tuned for a Super Mario World style overworld. Coordinates
// are generated rather than hand-placed so any region/mission shape works.
const MARGIN_Y = 60;
const SPACING_Y = 150;
const TOP_PADDING = 50;
/** Horizontal offset of a mission node — alternates left/right for serpentine. */
const NODE_OFFSET_LEFT = 150;
const NODE_OFFSET_RIGHT = 350;
const MIN_WIDTH = 500;

/**
 * Lays out a single region's missions in a serpentine (boustrophedon) pattern:
 * left-to-right on the first row, right-to-left on the next, and so on. This
 * fills the SVG canvas more interestingly than one flat horizontal band and
 * keeps every sequential mission spatially adjacent (the end of a row sits
 * directly above the start of the row below). One region area spanning the full
 * canvas carries the region's terrain and emoji landmark.
 */
function generateSerpentineLayout(
  region: LayoutRegion,
  statusFor: (missionId: string) => MapNodeStatus,
): MapLayout {
  const missions = region.missions;
  const rows = missions.length;

  const width = MIN_WIDTH;
  const height = TOP_PADDING + rows * SPACING_Y + MARGIN_Y;

  const nodes: LayoutNode[] = missions.map((missionId, index) => {
    // Alternate left/right for serpentine vertical layout
    const x = index % 2 === 0 ? NODE_OFFSET_LEFT : NODE_OFFSET_RIGHT;
    const y = TOP_PADDING + MARGIN_Y + index * SPACING_Y;

    return {
      id: missionId,
      x,
      y,
      label: Number.parseInt(missionId, 10) || index + 1,
      title: getMissionTitle(missionId),
      regionId: region.id,
      status: statusFor(missionId),
    };
  });

  const edges: LayoutEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const from = nodes[i];
    const to = nodes[i + 1];
    edges.push({
      key: `${from.id}-${to.id}`,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      completed: from.status === 'done' && to.status === 'done',
      isGate: false,
    });
  }

  const regionAreas: RegionArea[] = [
    {
      id: region.id,
      emoji: region.emoji,
      terrain: region.terrain,
      x: 0,
      y: TOP_PADDING,
      width,
      height: rows * SPACING_Y + MARGIN_Y,
    },
  ];

  return { nodes, edges, regionAreas, width, height };
}

/**
 * Builds the map layout for a world from its `regions`.
 *
 * Each region occupies a horizontal band; its missions are spaced left to
 * right along that band. Sequential missions within a region are connected,
 * and a "gate" segment links the last mission of one region to the first of
 * the next. Node status is derived from `completedMissions`: completed nodes
 * are `done`, the first uncompleted node (in flat order) is `recommended`, and
 * every other node is `available`. Nothing is ever locked.
 */
export function generateMapLayout(regions: LayoutRegion[], completedMissions: string[]): MapLayout {
  const completed = new Set(completedMissions);
  let recommendedAssigned = false;

  const statusFor = (missionId: string): MapNodeStatus => {
    if (completed.has(missionId)) return 'done';
    if (!recommendedAssigned) {
      recommendedAssigned = true;
      return 'recommended';
    }
    return 'available';
  };

  // Single-region maps (the per-region mission view) get a more creative
  // serpentine layout that uses the full SVG canvas instead of one flat band.
  if (regions.length === 1) {
    return generateSerpentineLayout(regions[0], statusFor);
  }

  const nodes: LayoutNode[] = [];
  // Track the first/last node of each region so we can wire gate edges.
  const regionEndpoints: Array<{ first?: LayoutNode; last?: LayoutNode }> = [];

  regions.forEach((region, regionIndex) => {
    const regionStartY =
      TOP_PADDING + regionIndex * (region.missions.length * SPACING_Y + MARGIN_Y);

    const endpoints: { first?: LayoutNode; last?: LayoutNode } = {};

    region.missions.forEach((missionId, missionIndex) => {
      const node: LayoutNode = {
        id: missionId,
        x: missionIndex % 2 === 0 ? NODE_OFFSET_LEFT : NODE_OFFSET_RIGHT,
        y: regionStartY + MARGIN_Y + missionIndex * SPACING_Y,
        label: Number.parseInt(missionId, 10) || missionIndex + 1,
        title: getMissionTitle(missionId),
        regionId: region.id,
        status: statusFor(missionId),
      };
      nodes.push(node);
      if (missionIndex === 0) endpoints.first = node;
      endpoints.last = node;
    });

    regionEndpoints.push(endpoints);
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges: LayoutEdge[] = [];

  const pushEdge = (from: LayoutNode, to: LayoutNode, isGate: boolean) => {
    edges.push({
      key: `${from.id}-${to.id}`,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      completed: from.status === 'done' && to.status === 'done',
      isGate,
    });
  };

  // Sequential edges within each region.
  regions.forEach((region) => {
    for (let i = 0; i < region.missions.length - 1; i += 1) {
      const from = nodeById.get(region.missions[i]);
      const to = nodeById.get(region.missions[i + 1]);
      if (from && to) pushEdge(from, to, false);
    }
  });

  // Gate edges: last node of region N → first node of region N+1.
  for (let r = 0; r < regionEndpoints.length - 1; r += 1) {
    const from = regionEndpoints[r].last;
    const to = regionEndpoints[r + 1].first;
    if (from && to) pushEdge(from, to, true);
  }

  const totalMissions = regions.reduce((sum, region) => sum + region.missions.length, 0);
  const width = MIN_WIDTH;
  const height = TOP_PADDING + totalMissions * SPACING_Y + regions.length * MARGIN_Y;

  // One band per region, spanning the full map width, for terrain placement.
  let yOffset = TOP_PADDING;
  const regionAreas: RegionArea[] = regions.map((region) => {
    const regionHeight = region.missions.length * SPACING_Y + MARGIN_Y;
    const area = {
      id: region.id,
      emoji: region.emoji,
      terrain: region.terrain,
      x: 0,
      y: yOffset,
      width,
      height: regionHeight,
    };
    yOffset += regionHeight;
    return area;
  });

  return { nodes, edges, regionAreas, width, height };
}
