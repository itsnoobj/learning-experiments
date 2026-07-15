#!/usr/bin/env node
/**
 * Validate that every mission has all required assets.
 *
 * Usage:
 *   node scripts/check-missions.mjs           # Check all available missions
 *   node scripts/check-missions.mjs 7 8 9     # Check specific missions only
 *   node scripts/check-missions.mjs --all     # Check ALL missions in hierarchy
 *   node scripts/check-missions.mjs --strict  # Treat warnings as errors
 *
 * Exit 0 = pass, Exit 1 = errors found.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CONTENT_DIR = join(ROOT, 'content', 'chapters');
const PUBLIC_CONTENT = join(ROOT, 'apps', 'web', 'public', 'content');
const PUBLIC_OG = join(ROOT, 'apps', 'web', 'public', 'og');
const AVAILABLE_JSON = join(ROOT, 'content', 'available.json');
const HIERARCHY_JSON = join(ROOT, 'content', 'hierarchy.json');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const checkAll = args.includes('--all');
const missionIds = args.filter(a => !a.startsWith('--'));

function findInParts(filename) {
  try {
    const parts = readdirSync(CONTENT_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name.startsWith('part-'))
      .map(d => d.name);

    for (const part of parts) {
      const candidate = join(CONTENT_DIR, part, filename);
      if (existsSync(candidate)) return candidate;
    }
  } catch {}
  return null;
}

function loadJson(filepath) {
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

// Determine which missions to check
let idsToCheck;

if (missionIds.length > 0) {
  idsToCheck = missionIds;
} else if (checkAll) {
  const hierarchy = loadJson(HIERARCHY_JSON);
  if (!hierarchy) { console.error('✗ Cannot load hierarchy.json'); process.exit(1); }
  idsToCheck = [];
  for (const world of hierarchy.worlds) {
    for (const region of world.regions) {
      idsToCheck.push(...region.missions);
    }
  }
} else {
  const available = loadJson(AVAILABLE_JSON);
  if (!available) { console.error('✗ Cannot load available.json'); process.exit(1); }
  idsToCheck = available;
}

const REQUIRED_SECTIONS = ['situation'];
const RECOMMENDED_SECTIONS = ['story', 'principle', 'move'];
const ALL_SECTIONS = ['situation', 'story', 'contrast', 'principle', 'psychology', 'trap', 'move'];

console.log(`\n🔍 Checking ${idsToCheck.length} mission(s)...\n`);

let totalErrors = 0;
let totalWarnings = 0;
const results = [];

for (const id of idsToCheck) {
  const errors = [];
  const warnings = [];
  const checks = {};

  // Chapter JSON
  const chapterPath = findInParts(`${id}.json`);
  if (!chapterPath) {
    errors.push('Missing chapter JSON ({id}.json)');
    checks.chapter = '✗';
  } else {
    checks.chapter = '✓';
    const chapter = loadJson(chapterPath);
    if (!chapter) {
      errors.push('Chapter JSON is malformed');
    } else {
      if (!chapter.id) errors.push('Chapter missing "id"');
      if (!chapter.title) errors.push('Chapter missing "title"');
      if (!chapter.forces?.length) errors.push('Chapter missing "forces"');
      if (chapter.sections) {
        for (const sec of REQUIRED_SECTIONS) {
          if (!chapter.sections[sec]?.content) errors.push(`Missing required section: "${sec}"`);
        }
        for (const sec of RECOMMENDED_SECTIONS) {
          if (!chapter.sections[sec]?.content) warnings.push(`Missing recommended section: "${sec}"`);
        }
        const present = ALL_SECTIONS.filter(s => chapter.sections[s]?.content);
        checks.sections = `${present.length}/${ALL_SECTIONS.length} (${present.join(', ')})`;
      } else {
        errors.push('Chapter missing "sections"');
      }
    }
  }

  // Quiz JSON
  const quizPath = findInParts(`${id}.quiz.json`);
  if (!quizPath) {
    errors.push('Missing quiz JSON ({id}.quiz.json)');
    checks.quiz = '✗';
  } else {
    checks.quiz = '✓';
    const quiz = loadJson(quizPath);
    if (!quiz) {
      errors.push('Quiz JSON is malformed');
    } else if (!quiz.challenges?.length) {
      errors.push('Quiz has no challenges');
    } else {
      if (quiz.challenges.length < 3) warnings.push(`Quiz has only ${quiz.challenges.length} challenges (recommend 3-5)`);
      const types = new Set(quiz.challenges.map(c => c.type));
      if (types.size < 2) warnings.push('Quiz uses only 1 challenge type (recommend 2-3)');
      checks.quizDetail = `${quiz.challenges.length} challenges, ${types.size} types (${[...types].join(', ')})`;
      if (!quiz.principle?.text) warnings.push('Quiz missing principle text');
      if (!quiz.reflection) warnings.push('Quiz missing reflection prompt');
    }
  }

  // SVG illustration
  const svgPath = findInParts(`${id}.svg`);
  if (!svgPath) {
    errors.push('Missing illustration SVG ({id}.svg)');
    checks.svg = '✗';
  } else {
    checks.svg = '✓';
    try {
      if (readFileSync(svgPath).length < 1000) warnings.push('SVG may be a placeholder (< 1KB)');
    } catch {}
  }

  // Audio MP3
  const mp3Path = join(PUBLIC_CONTENT, `${id}.mp3`);
  checks.audio = existsSync(mp3Path) ? '✓' : '✗';
  if (!existsSync(mp3Path)) errors.push('Missing audio (public/content/{id}.mp3)');

  // Rendered PNG (generated, so warning only)
  const pngPath = join(PUBLIC_CONTENT, `${id}.png`);
  checks.png = existsSync(pngPath) ? '✓' : '⚠';
  if (!existsSync(pngPath)) warnings.push('Missing rendered PNG (run sync-assets.sh)');

  // OG image (generated, so warning only)
  const ogPath = join(PUBLIC_OG, `mission-${id}.png`);
  checks.og = existsSync(ogPath) ? '✓' : '⚠';
  if (!existsSync(ogPath)) warnings.push('Missing OG image (run sync-assets.sh)');

  totalErrors += errors.length;
  totalWarnings += warnings.length;
  results.push({ id, errors, warnings, checks });
}

// Output
for (const { id, errors, warnings, checks } of results) {
  const status = errors.length > 0 ? '❌' : warnings.length > 0 ? '⚠️' : '✅';
  console.log(`${status} Mission ${id}`);
  console.log(`   chapter: ${checks.chapter || '?'}  quiz: ${checks.quiz || '?'}  svg: ${checks.svg || '?'}  audio: ${checks.audio || '?'}  png: ${checks.png || '?'}  og: ${checks.og || '?'}`);
  if (checks.sections) console.log(`   sections: ${checks.sections}`);
  if (checks.quizDetail) console.log(`   quiz: ${checks.quizDetail}`);
  for (const err of errors) console.log(`   ❌ ${err}`);
  for (const warn of warnings) console.log(`   ⚠️  ${warn}`);
  console.log('');
}

console.log('─'.repeat(50));
console.log(`  Missions: ${idsToCheck.length}  Errors: ${totalErrors}  Warnings: ${totalWarnings}`);
console.log('─'.repeat(50));

if (totalErrors > 0) {
  console.log('\n💥 FAIL — fix errors above before shipping.\n');
  process.exit(1);
} else if (strict && totalWarnings > 0) {
  console.log('\n⚠️  FAIL (--strict) — warnings treated as errors.\n');
  process.exit(1);
} else {
  console.log(totalWarnings > 0 ? '\n⚠️  PASS with warnings.\n' : '\n✅ ALL CLEAR.\n');
}
