'use client';

import { useProgressStore } from '@/store/progressStore';
import { mapNodes } from '../data/mapNodes';
import type { MapNodeStatus } from '../components/MapNode';

/** Map of node id → its computed status. */
export type NodeStatusMap = Record<number, MapNodeStatus>;

/**
 * Derives each node's status from the progress store.
 *
 * Completed chapters render as `done`. The first non-completed node in map
 * order becomes `current`; everything after it is `locked`. With an empty
 * store this naturally makes the very first node `current` and the rest
 * `locked`, so progression always reflects real completion state.
 */
export function useMapProgress(): NodeStatusMap {
  const completedChapters = useProgressStore((state) => state.completedChapters);

  const statuses: NodeStatusMap = {};
  let currentAssigned = false;

  for (const node of mapNodes) {
    if (completedChapters.includes(node.chapterId)) {
      statuses[node.id] = 'done';
    } else if (!currentAssigned) {
      statuses[node.id] = 'current';
      currentAssigned = true;
    } else {
      statuses[node.id] = 'locked';
    }
  }

  return statuses;
}
