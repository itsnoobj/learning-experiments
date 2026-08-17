/**
 * Mission/chapter id → title, for the short label under each map node.
 *
 * Single source of truth: this is generated from each chapter's own
 * `content/chapters/**\/{id}.json` `title` (see scripts/generate-mission-titles.mjs,
 * run by sync-assets.sh). The map therefore always shows the exact title the
 * story page shows. Do NOT hand-edit — a previously hand-maintained table here
 * drifted out of sync after missions were renumbered.
 */
import missionTitles from '../../../../../content/missionTitles.json';

export const MISSION_TITLES: Record<string, string> = missionTitles;

/** Get mission title by id, with fallback. */
export function getMissionTitle(missionId: string): string {
  return MISSION_TITLES[missionId] ?? `Mission ${missionId}`;
}
