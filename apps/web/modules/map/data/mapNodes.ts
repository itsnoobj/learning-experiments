import type { MapNodeStatus } from '../components/MapNode';

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
const MARGIN_X = 90;
const SPACING_X = 130;
const BAND_HEIGHT = 150;
const TOP_PADDING = 50;
/** Vertical offset of a mission node from the top of its band. */
const NODE_OFFSET_Y = 80;
const MIN_WIDTH = 700;

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

  const nodes: LayoutNode[] = [];
  // Track the first/last node of each region so we can wire gate edges.
  const regionEndpoints: Array<{ first?: LayoutNode; last?: LayoutNode }> = [];

  regions.forEach((region, regionIndex) => {
    const bandTop = TOP_PADDING + regionIndex * BAND_HEIGHT;
    const nodeY = bandTop + NODE_OFFSET_Y;

    const endpoints: { first?: LayoutNode; last?: LayoutNode } = {};

    region.missions.forEach((missionId, missionIndex) => {
      const node: LayoutNode = {
        id: missionId,
        x: MARGIN_X + missionIndex * SPACING_X,
        y: nodeY,
        label: Number.parseInt(missionId, 10) || missionIndex + 1,
        title: `Mission ${missionId}`,
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

  const maxMissions = regions.reduce((max, region) => Math.max(max, region.missions.length), 0);
  const width = Math.max(MIN_WIDTH, MARGIN_X * 2 + Math.max(0, maxMissions - 1) * SPACING_X);
  const height = TOP_PADDING + regions.length * BAND_HEIGHT;

  // One band per region, spanning the full map width, for terrain placement.
  const regionAreas: RegionArea[] = regions.map((region, regionIndex) => ({
    id: region.id,
    emoji: region.emoji,
    terrain: region.terrain,
    x: 0,
    y: TOP_PADDING + regionIndex * BAND_HEIGHT,
    width,
    height: BAND_HEIGHT,
  }));

  return { nodes, edges, regionAreas, width, height };
}
