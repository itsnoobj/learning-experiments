#!/usr/bin/env node
/**
 * Mission renumbering migration.
 * 
 * New world order:
 *   Game Board (old 111-127) → new 1-17
 *   Mirror    (old 1-25)    → new 18-42
 *   Crowd     (old 26-48)   → new 43-65
 *
 * Steps:
 *   1. Rename all dirs/files to temp names (avoid collisions)
 *   2. Rename temp to final
 *   3. Update JSON id, audio, visual fields
 *   4. Update connections arrays using the full mapping
 *   5. Update hierarchy.json
 */

import { readdirSync, renameSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FE_ROOT = resolve(__dirname, '..');
const CHAPTERS = resolve(FE_ROOT, 'content/chapters');
const PUBLIC = resolve(FE_ROOT, 'apps/web/public');

// Build mapping: old_id (string) → new_id (string)
const MAP = {};

// Game Board: 111-127 → 1-17
for (let i = 0; i <= 16; i++) MAP[String(111 + i)] = String(1 + i);
// Mirror: 1-25 → 18-42
for (let i = 0; i <= 24; i++) MAP[String(1 + i)] = String(18 + i);
// Crowd: 26-48 → 43-65
for (let i = 0; i <= 22; i++) MAP[String(26 + i)] = String(43 + i);

console.log(`Migration: ${Object.keys(MAP).length} missions to renumber\n`);

// Determine which part each old mission is in
function findPart(oldId) {
  if (existsSync(join(CHAPTERS, 'part-01', oldId))) return 'part-01';
  if (existsSync(join(CHAPTERS, 'part-02', oldId))) return 'part-02';
  return null;
}

const PARTS = {};
for (const oldId of Object.keys(MAP)) {
  PARTS[oldId] = findPart(oldId);
  if (!PARTS[oldId]) console.log(`  SKIP: ${oldId} (no directory found)`);
}

// Phase 1: Rename to temp (prefix __tmp_)
console.log('Phase 1: Rename to temp...');
for (const [oldId, newId] of Object.entries(MAP)) {
  const part = PARTS[oldId];
  if (!part) continue;

  const srcDir = join(CHAPTERS, part, oldId);
  const tmpDir = join(CHAPTERS, part, `__tmp_${newId}`);

  if (existsSync(srcDir)) {
    renameSync(srcDir, tmpDir);
    // Rename files inside
    for (const ext of ['.json', '.quiz.json', '.svg']) {
      const oldFile = join(tmpDir, `${oldId}${ext}`);
      const tmpFile = join(tmpDir, `__tmp_${newId}${ext}`);
      if (existsSync(oldFile)) renameSync(oldFile, tmpFile);
    }
  }

  // Public assets
  const mp3 = join(PUBLIC, 'content', `${oldId}.mp3`);
  const png = join(PUBLIC, 'content', `${oldId}.png`);
  const og = join(PUBLIC, 'og', `mission-${oldId}.png`);
  if (existsSync(mp3)) renameSync(mp3, join(PUBLIC, 'content', `__tmp_${newId}.mp3`));
  if (existsSync(png)) renameSync(png, join(PUBLIC, 'content', `__tmp_${newId}.png`));
  if (existsSync(og)) renameSync(og, join(PUBLIC, 'og', `__tmp_mission-${newId}.png`));
}
console.log('  Done.\n');

// Phase 2: Rename temp to final
console.log('Phase 2: Rename temp to final...');
for (const [oldId, newId] of Object.entries(MAP)) {
  const part = PARTS[oldId];
  if (!part) continue;

  const tmpDir = join(CHAPTERS, part, `__tmp_${newId}`);
  const finalDir = join(CHAPTERS, part, newId);

  if (existsSync(tmpDir)) {
    renameSync(tmpDir, finalDir);
    for (const ext of ['.json', '.quiz.json', '.svg']) {
      const tmpFile = join(finalDir, `__tmp_${newId}${ext}`);
      const finalFile = join(finalDir, `${newId}${ext}`);
      if (existsSync(tmpFile)) renameSync(tmpFile, finalFile);
    }
  }

  // Public assets
  const mp3t = join(PUBLIC, 'content', `__tmp_${newId}.mp3`);
  const pngt = join(PUBLIC, 'content', `__tmp_${newId}.png`);
  const ogt = join(PUBLIC, 'og', `__tmp_mission-${newId}.png`);
  if (existsSync(mp3t)) renameSync(mp3t, join(PUBLIC, 'content', `${newId}.mp3`));
  if (existsSync(pngt)) renameSync(pngt, join(PUBLIC, 'content', `${newId}.png`));
  if (existsSync(ogt)) renameSync(ogt, join(PUBLIC, 'og', `mission-${newId}.png`));
}
console.log('  Done.\n');

// Phase 3: Update JSON content (id, audio, visual fields)
console.log('Phase 3: Update JSON id/audio/visual fields...');
for (const [oldId, newId] of Object.entries(MAP)) {
  const part = PARTS[oldId];
  if (!part) continue;

  const jsonFile = join(CHAPTERS, part, newId, `${newId}.json`);
  if (existsSync(jsonFile)) {
    let content = readFileSync(jsonFile, 'utf8');
    content = content.replace(`"id": "${oldId}"`, `"id": "${newId}"`);
    content = content.replace(`"audio": "${oldId}.mp3"`, `"audio": "${newId}.mp3"`);
    content = content.replace(`"visual": "${oldId}.svg"`, `"visual": "${newId}.svg"`);
    writeFileSync(jsonFile, content);
  }

  const quizFile = join(CHAPTERS, part, newId, `${newId}.quiz.json`);
  if (existsSync(quizFile)) {
    let content = readFileSync(quizFile, 'utf8');
    content = content.replace(`"id": "${oldId}"`, `"id": "${newId}"`);
    writeFileSync(quizFile, content);
  }
}
console.log('  Done.\n');

// Phase 4: Update connections arrays in ALL chapter JSONs
console.log('Phase 4: Update connections references...');
// We need to replace connection IDs. To avoid "1" matching inside "13",
// we match the exact JSON pattern: elements in arrays like ["1", "26", "111"]
// Strategy: parse JSON, update connections array values, rewrite.
function updateConnections(filePath) {
  if (!existsSync(filePath)) return;
  let content = readFileSync(filePath, 'utf8');
  let data;
  try { data = JSON.parse(content); } catch { return; }
  
  if (data.connections && Array.isArray(data.connections)) {
    data.connections = data.connections.map(id => MAP[id] || id);
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    return true;
  }
  return false;
}

let updated = 0;
for (const part of ['part-01', 'part-02']) {
  const partDir = join(CHAPTERS, part);
  if (!existsSync(partDir)) continue;
  for (const dir of readdirSync(partDir)) {
    const jsonFile = join(partDir, dir, `${dir}.json`);
    if (updateConnections(jsonFile)) updated++;
  }
}
console.log(`  Updated connections in ${updated} files.\n`);

// Phase 5: Update hierarchy.json
console.log('Phase 5: Update hierarchy.json...');
const hierPath = join(FE_ROOT, 'content/hierarchy.json');
let hier = JSON.parse(readFileSync(hierPath, 'utf8'));
for (const world of hier.worlds) {
  for (const region of world.regions) {
    region.missions = region.missions.map(id => MAP[id] || id);
  }
}
writeFileSync(hierPath, JSON.stringify(hier, null, 2) + '\n');
console.log('  Done.\n');

console.log('=== Migration complete ===');
console.log('Next: bash scripts/sync-assets.sh && cd apps/web && npx vitest run');
