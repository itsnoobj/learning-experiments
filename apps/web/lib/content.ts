import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';

import { z } from 'zod';

import type { QuizChallenge } from '@field-guide/shared-types';

import { logger } from '@/shared/lib/logger';
import type { StorySectionType } from '@/modules/story';

/**
 * Server-only content loaders.
 *
 * Chapter and quiz JSON live at the repo root under
 * `content/chapters/part-XX/{id}.json` and `{id}.quiz.json`. Rather than
 * hard-coding a single chapter, these loaders scan every `part-*` directory at
 * request time to find the file matching a given id, so any authored chapter
 * is reachable by id with no code changes.
 *
 * Every loaded document is validated at runtime with Zod before it is handed
 * to the rest of the app. Validation is a *safety net*, not a blocker: a
 * missing or malformed file logs a warning and yields `null` so the page can
 * render a not-found state instead of crashing.
 *
 * These functions use Node's `fs` and must only be called from server
 * components / server code. Client components that need the (static) chapter 31
 * content should import from {@link file://./content.static.ts} instead.
 */

// ---------------------------------------------------------------------------
// Runtime validation schemas
//
// These mirror the canonical Zod definitions in `content/schema/*.schema.ts`.
// They are duplicated inline rather than imported because `content/schema` is
// a standalone, non-workspace ESM package outside `apps/web` and is not
// reachable through the app's module resolution / path aliases. Keep the two
// in sync when either changes.
// ---------------------------------------------------------------------------

const sectionTypeSchema = z.enum([
  'situation',
  'story',
  'contrast',
  'principle',
  'psychology',
  'trap',
  'move',
]);

const chapterSectionSchema = z.object({
  type: sectionTypeSchema,
  title: z.string().optional(),
  content: z.string().min(1, 'section content must not be empty'),
});

const chapterSchema = z.object({
  id: z.string().min(1),
  part: z.number().int(),
  section: z.string().min(1),
  title: z.string().min(1),
  forces: z.array(z.string()).nonempty('a chapter must list at least one force'),
  connections: z.array(z.string()),
  audio: z.string().min(1),
  visual: z.string().min(1),
  sections: z.array(chapterSectionSchema).nonempty('a chapter must have at least one section'),
});

const challengeOptionSchema = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
  feedback: z.string().min(1),
});

const quizChallengeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('scenario-choice'),
    situation: z.string().min(1),
    options: z.array(challengeOptionSchema).min(2),
  }),
  z.object({
    type: z.literal('spot-the-force'),
    situation: z.string().min(1),
    question: z.string().min(1),
    options: z.array(challengeOptionSchema).min(2),
  }),
  z.object({
    type: z.literal('card-flip'),
    front: z.string().min(1),
    back: z.string().min(1),
  }),
  z.object({
    type: z.literal('drag-match'),
    instruction: z.string().min(1),
    items: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
    correctOrder: z.array(z.string().min(1)).min(2),
  }),
  z.object({
    type: z.literal('before-after'),
    context: z.string().min(1),
    scenarioA: z.object({ label: z.string().min(1), text: z.string().min(1) }),
    scenarioB: z.object({ label: z.string().min(1), text: z.string().min(1) }),
    correctScenario: z.enum(['A', 'B']),
    explanation: z.string().min(1),
  }),
]);

const quizSchema = z.object({
  chapterId: z.string().min(1),
  challenges: z.array(quizChallengeSchema).nonempty('a quiz must have at least one challenge'),
  principle: z.object({
    text: z.string().min(1),
    subtext: z.string().min(1).optional(),
  }),
  reflection: z.string().min(1),
});

/** A narrative section of a chapter, after `type` narrowing. */
export interface ChapterSection {
  type: StorySectionType;
  title?: string;
  content: string;
}

/** A fully-loaded chapter, with asset names pointing at `public/content/`. */
export interface LoadedChapter {
  id: string;
  part: number;
  section: string;
  title: string;
  forces: string[];
  connections: string[];
  /** Asset filename served from `public/content/` (e.g. `31.svg`). */
  visual: string;
  /** Asset filename served from `public/content/` (e.g. `31.mp3`). */
  audio: string;
  sections: ChapterSection[];
}

/** A fully-loaded quiz, with challenges narrowed to the discriminated union. */
export interface LoadedQuiz {
  chapterId: string;
  challenges: QuizChallenge[];
  principle: { text: string; subtext?: string };
  reflection: string;
}

/**
 * Candidate locations for the repo-root `content/chapters` directory.
 *
 * `process.cwd()` is `apps/web` when running `next dev`/`next build` from the
 * app, but may be the monorepo root in other contexts (tests, turbo). We probe
 * the likely candidates and use the first that exists.
 */
const CONTENT_ROOT_CANDIDATES = [
  path.join(process.cwd(), '..', '..', 'content', 'chapters'),
  path.join(process.cwd(), 'content', 'chapters'),
];

/** Only allow simple ids so a URL param can never escape the content dir. */
const VALID_ID = /^[A-Za-z0-9_-]+$/;

let cachedRoot: string | null = null;

/** Resolve the content root directory once, probing the known candidates. */
async function resolveContentRoot(): Promise<string> {
  if (cachedRoot) return cachedRoot;
  for (const candidate of CONTENT_ROOT_CANDIDATES) {
    try {
      await fs.access(candidate);
      cachedRoot = candidate;
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  // Fall back to the primary candidate; callers handle the missing-file case.
  cachedRoot = CONTENT_ROOT_CANDIDATES[0];
  return cachedRoot;
}

/**
 * Find the absolute path to `{id}{suffix}` by scanning every `part-*`
 * directory under the content root. Returns `null` when no part contains the
 * file.
 */
async function findContentFile(id: string, suffix: string): Promise<string | null> {
  if (!VALID_ID.test(id)) return null;

  const root = await resolveContentRoot();

  let entries: import('fs').Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return null;
  }

  const partDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('part-'))
    .map((entry) => entry.name)
    .sort();

  for (const part of partDirs) {
    const candidate = path.join(root, part, `${id}${suffix}`);
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Not in this part; keep scanning.
    }
  }

  return null;
}

/**
 * List every chapter id that has a file ending in `suffix` across all
 * `part-*` directories. When `exclude` is given, files ending in it are
 * skipped (used so `.json` enumeration doesn't pick up `.quiz.json`).
 *
 * Used at build time by `generateStaticParams` to pre-render every available
 * chapter/quiz page for static export.
 */
async function listContentIds(suffix: string, exclude?: string): Promise<string[]> {
  const root = await resolveContentRoot();

  let entries: import('fs').Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const partDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('part-'))
    .map((entry) => entry.name);

  const ids = new Set<string>();
  for (const part of partDirs) {
    let files: string[];
    try {
      files = await fs.readdir(path.join(root, part));
    } catch {
      continue;
    }
    for (const file of files) {
      if (exclude && file.endsWith(exclude)) continue;
      if (file.endsWith(suffix)) {
        ids.add(file.slice(0, -suffix.length));
      }
    }
  }

  return [...ids];
}

/** Ids of all chapters that have a `{id}.json` content file. */
export async function listChapterIds(): Promise<string[]> {
  return listContentIds('.json', '.quiz.json');
}

/** Ids of all chapters that have a `{id}.quiz.json` file. */
export async function listQuizIds(): Promise<string[]> {
  return listContentIds('.quiz.json');
}

/**
 * Read and JSON-parse a content file, returning `null` (and logging) on any
 * read or parse failure rather than throwing.
 */
async function readJsonFile(file: string): Promise<unknown | null> {
  let raw: string;
  try {
    raw = await fs.readFile(file, 'utf-8');
  } catch (error) {
    logger.error(`Failed to read content file: ${file}`, error);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    logger.warn(`Malformed JSON in content file: ${file}`, error);
    return null;
  }
}

/**
 * Load the chapter with the given id, or `null` if it does not exist or fails
 * validation.
 *
 * The chapter's `visual`/`audio` fields are overridden with the `{id}.svg` /
 * `{id}.mp3` asset names served from `public/content/` (the chapter page builds
 * `/content/${visual|audio}`), and section `type` is narrowed to the
 * `StorySectionType` union expected by the story components.
 */
export async function loadChapter(id: string): Promise<LoadedChapter | null> {
  const file = await findContentFile(id, '.json');
  if (!file) return null;

  const data = await readJsonFile(file);
  if (data === null) return null;

  const result = chapterSchema.safeParse(data);
  if (!result.success) {
    logger.warn(`Chapter "${id}" failed schema validation (${file}):`, result.error.flatten());
    return null;
  }

  const chapter = result.data;

  return {
    id: chapter.id,
    part: chapter.part,
    section: chapter.section,
    title: chapter.title,
    forces: chapter.forces,
    connections: chapter.connections,
    visual: `${id}.svg`,
    audio: `${id}.mp3`,
    sections: chapter.sections.map((s) => ({
      type: s.type,
      title: s.title,
      content: s.content,
    })),
  };
}

/**
 * Load the quiz for the given chapter id, or `null` if it does not exist or
 * fails validation. Challenges are narrowed to the discriminated
 * {@link QuizChallenge} union by Zod — no unsafe casts required.
 */
export async function loadQuiz(id: string): Promise<LoadedQuiz | null> {
  const file = await findContentFile(id, '.quiz.json');
  if (!file) return null;

  const data = await readJsonFile(file);
  if (data === null) return null;

  const result = quizSchema.safeParse(data);
  if (!result.success) {
    logger.warn(`Quiz "${id}" failed schema validation (${file}):`, result.error.flatten());
    return null;
  }

  const quiz = result.data;

  return {
    chapterId: quiz.chapterId,
    challenges: quiz.challenges,
    principle: quiz.principle,
    reflection: quiz.reflection,
  };
}

/**
 * Get the filesystem modification time of a chapter's content file.
 * Used by the sitemap to set meaningful `lastModified` dates instead of
 * `new Date()` which Google ignores.
 *
 * Returns `null` if the file doesn't exist.
 */
export async function getContentMtime(id: string): Promise<Date | null> {
  const file = await findContentFile(id, '.json');
  if (!file) return null;

  try {
    const stat = await fs.stat(file);
    return stat.mtime;
  } catch {
    return null;
  }
}
