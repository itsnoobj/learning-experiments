#!/usr/bin/env node
/**
 * Verify mission renumbering correctness.
 * Run: node scripts/verify-renumber.mjs
 * 
 * Checks:
 * 1. Every mission in hierarchy.json has matching directory + files
 * 2. Every chapter JSON has matching id, audio, visual fields
 * 3. Every quiz JSON has matching id or chapterId
 * 4. Every connections reference points to a valid mission
 * 5. available.json matches actual files on disk
 * 6. No orphan directories (old IDs left behind)
 * 7. All public assets (mp3, png, og) exist for available missions
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHAPTERS = resolve(ROOT, 'content/chapters');
const PUBLIC = resolve(ROOT, 'apps/web/public');

let errors = 0;
let warnings = 0;
let checks = 0;

function check(condition, msg) {
  checks++;
  if (!condition) { errors++; console.log(`  ❌ ${msg}`); }
}

function warn(msg) {
  warnings++; console.log(`  ⚠️  ${msg}`);
}

// Load hierarchy
const hierarchy = JSON.parse(readFileSync(join(ROOT, 'content/hierarchy.json'), 'utf8'));
const available = JSON.parse(readFileSync(join(ROOT, 'content/available.json'), 'utf8'));

// Collect all mission IDs from hierarchy
const allHierarchyMissions = [];
for (const world of hierarchy.worlds) {
  for (const region of world.regions) {
    allHierarchyMissions.push(...region.missions);
  }
}

console.log(`\n=== Mission Renumbering Verification ===\n`);
console.log(`Hierarchy missions: ${allHierarchyMissions.length}`);
console.log(`Available missions: ${available.length}`);
console.log('');

// Check 1: Every hierarchy mission that's available has files
console.log('--- Check 1: Available hierarchy missions have files ---');
for (const id of allHierarchyMissions) {
  const inPart01 = existsSync(join(CHAPTERS, 'part-01', id, `${id}.json`));
  const inPart02 = existsSync(join(CHAPTERS, 'part-02', id, `${id}.json`));
  if (available.includes(id)) {
    check(inPart01 || inPart02, `Mission ${id}: in available.json but no chapter JSON found`);
  } else if (!inPart01 && !inPart02) {
    // Planned but not yet written — expected, not an error
    warn(`Mission ${id}: in hierarchy but not yet written (expected for planned missions)`);
  }
}

// Check 2: Chapter JSON id/audio/visual match filename
console.log('--- Check 2: Chapter JSON internal consistency ---');
for (const id of available) {
  let jsonPath = join(CHAPTERS, 'part-01', id, `${id}.json`);
  if (!existsSync(jsonPath)) jsonPath = join(CHAPTERS, 'part-02', id, `${id}.json`);
  if (!existsSync(jsonPath)) { check(false, `Mission ${id}: file not found`); continue; }
  
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  check(data.id === id, `Mission ${id}: JSON id is "${data.id}" (expected "${id}")`);
  check(data.audio === `${id}.mp3`, `Mission ${id}: audio is "${data.audio}" (expected "${id}.mp3")`);
  check(data.visual === `${id}.svg`, `Mission ${id}: visual is "${data.visual}" (expected "${id}.svg")`);
}

// Check 3: Quiz JSON id/chapterId matches
console.log('--- Check 3: Quiz JSON consistency ---');
for (const id of available) {
  let quizPath = join(CHAPTERS, 'part-01', id, `${id}.quiz.json`);
  if (!existsSync(quizPath)) quizPath = join(CHAPTERS, 'part-02', id, `${id}.quiz.json`);
  if (!existsSync(quizPath)) { warn(`Mission ${id}: no quiz file`); continue; }
  
  const data = JSON.parse(readFileSync(quizPath, 'utf8'));
  if (data.id) {
    check(data.id === id, `Mission ${id}: quiz id is "${data.id}" (expected "${id}")`);
  }
  if (data.chapterId) {
    check(data.chapterId === id, `Mission ${id}: quiz chapterId is "${data.chapterId}" (expected "${id}")`);
  }
}

// Check 4: Connections reference valid missions
console.log('--- Check 4: Connections reference valid missions ---');
const allValidIds = new Set(allHierarchyMissions);
for (const id of available) {
  let jsonPath = join(CHAPTERS, 'part-01', id, `${id}.json`);
  if (!existsSync(jsonPath)) jsonPath = join(CHAPTERS, 'part-02', id, `${id}.json`);
  if (!existsSync(jsonPath)) continue;
  
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  if (data.connections) {
    for (const conn of data.connections) {
      if (!allValidIds.has(conn)) {
        warn(`Mission ${id}: connection "${conn}" not found in hierarchy`);
      }
    }
  }
}

// Check 5: available.json matches files on disk
console.log('--- Check 5: available.json matches disk ---');
for (const id of available) {
  const inPart01 = existsSync(join(CHAPTERS, 'part-01', id));
  const inPart02 = existsSync(join(CHAPTERS, 'part-02', id));
  check(inPart01 || inPart02, `Available ${id}: directory not found on disk`);
}

// Check 6: No orphan directories with old IDs
console.log('--- Check 6: No orphan directories ---');
const oldGameBoardIds = new Set(Array.from({length: 17}, (_, i) => String(111 + i)));
const oldMirrorIds = new Set(); // 1-25 is fine if they don't exist
for (const part of ['part-01', 'part-02']) {
  const partDir = join(CHAPTERS, part);
  if (!existsSync(partDir)) continue;
  for (const dir of readdirSync(partDir)) {
    if (dir.startsWith('__tmp')) check(false, `Temp directory found: ${part}/${dir}`);
    if (oldGameBoardIds.has(dir)) check(false, `Old Game Board ID still exists: ${part}/${dir}`);
  }
}

// Check 7: Public assets exist
console.log('--- Check 7: Public assets exist ---');
for (const id of available) {
  check(existsSync(join(PUBLIC, 'content', `${id}.mp3`)), `Mission ${id}: missing MP3`);
  check(existsSync(join(PUBLIC, 'content', `${id}.png`)), `Mission ${id}: missing PNG`);
  check(existsSync(join(PUBLIC, 'og', `mission-${id}.png`)), `Mission ${id}: missing OG image`);
  
  let svgPath = join(CHAPTERS, 'part-01', id, `${id}.svg`);
  if (!existsSync(svgPath)) svgPath = join(CHAPTERS, 'part-02', id, `${id}.svg`);
  check(existsSync(svgPath), `Mission ${id}: missing SVG`);
}

// Summary
console.log(`\n=== Results ===`);
console.log(`Checks: ${checks}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);
console.log(errors === 0 ? '\n✅ All checks passed!' : '\n❌ ERRORS FOUND — see above');
process.exit(errors > 0 ? 1 : 0);
