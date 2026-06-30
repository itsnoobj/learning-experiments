import hierarchyJson from '../../../content/hierarchy.json';

/** A sub-theme within a world. Holds the atomic missions to complete. */
export interface Region {
  /** Stable region id within its world (e.g. "A", "B"). */
  id: string;
  /** Human-readable region title (e.g. "Identity", "Trust"). */
  title: string;
  /** A short, evocative description of what this region explores. */
  description: string;
  /** Emoji landmark representing the region on the mission map. */
  emoji: string;
  /** Visual terrain hint for the map renderer. */
  terrain?: string;
  /** Mission ids (also chapter/quiz ids) laid out along this region's band. */
  missions: string[];
}

/** A major theme. Worlds are unlocked sequentially as the previous completes. */
export interface World {
  /** Numeric world id, used as the `/worlds/[id]` route param. */
  id: number;
  /** The theme title (e.g. "Understanding Yourself"). */
  title: string;
  /** A short, evocative 2-3 word tagline shown on the world map (e.g. "Know thyself"). */
  tagline: string;
  /** The evocative world name shown prominently (e.g. "The Mirror"). */
  worldName: string;
  /** Landscape hint for the world card / map backdrop. */
  landscape: string;
  /** Accent colour (hex) used for paths, progress bars, and highlights. */
  accent: string;
  /** Sub-theme regions. Empty for worlds not yet authored. */
  regions: Region[];
}

/** The full hierarchy of worlds, narrowed from the JSON import. */
export const worlds: World[] = hierarchyJson.worlds as World[];

/** Look up a world by its numeric id (accepts string or number). */
export function getWorld(id: string | number): World | undefined {
  const numericId = typeof id === 'string' ? Number.parseInt(id, 10) : id;
  return worlds.find((world) => world.id === numericId);
}

/** Flatten a world's regions into an ordered list of mission ids. */
export function worldMissionIds(world: World): string[] {
  return world.regions.flatMap((region) => region.missions);
}

/** Where a mission/chapter lives in the hierarchy. */
export interface ChapterLocation {
  /** Numeric world id (route param for `/worlds/[id]`). */
  worldId: number;
  /** Region id within the world (route param for `.../region/[regionId]`). */
  regionId: string;
}

/**
 * Find the world/region a chapter (mission) belongs to by scanning every
 * world's regions for the given mission id. Returns `null` when no region
 * lists the id, so callers can fall back to the worlds map.
 */
export function findChapterLocation(chapterId: string): ChapterLocation | null {
  for (const world of worlds) {
    for (const region of world.regions) {
      if (region.missions.includes(chapterId)) {
        return { worldId: world.id, regionId: region.id };
      }
    }
  }
  return null;
}
