#!/usr/bin/env node
/**
 * Generate content/missionTitles.json — a map of mission/chapter id → title,
 * derived directly from each chapter's own {id}.json `title`.
 *
 * The world map renders a short label under every mission node. Those labels
 * used to live in a hand-maintained table (modules/map/data/missionTitles.ts)
 * that silently drifted from the real chapter titles after missions were
 * renumbered — so the map and the story page showed different names for the
 * same mission. This makes the chapter JSON the single source of truth: the
 * map now shows exactly the title the story page shows.
 *
 * Run standalone (`node scripts/generate-mission-titles.mjs`) or via
 * sync-assets.sh, which regenerates it alongside content/available.json.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content', 'chapters');
const OUT = join(ROOT, 'content', 'missionTitles.json');

/** Recursively collect every {id}.json chapter file (excluding *.quiz.json). */
function findChapterJsons(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findChapterJsons(full));
    } else if (entry.name.endsWith('.json') && !entry.name.endsWith('.quiz.json')) {
      out.push(full);
    }
  }
  return out;
}

const titles = {};
for (const file of findChapterJsons(CONTENT_DIR)) {
  let chapter;
  try {
    chapter = JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    console.error(`✗ Skipping malformed JSON: ${file}`);
    continue;
  }
  if (chapter?.id && chapter?.title) {
    titles[String(chapter.id)] = chapter.title;
  }
}

// Sort numerically so the file is stable and diffs stay small.
const sorted = Object.fromEntries(Object.entries(titles).sort(([a], [b]) => Number(a) - Number(b)));

writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`✓ Generated content/missionTitles.json (${Object.keys(sorted).length} titles)`);
