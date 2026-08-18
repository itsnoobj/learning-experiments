/**
 * Shared domain types for the Field Guide.
 * Consumed by both the Next.js web app and the Fastify API.
 */

import type { QuizChallenge, Principle } from './quiz';

/** A recurring human force that drives behavior (see README philosophy table). */
export type Force =
  | 'incentives'
  | 'ego'
  | 'fear'
  | 'trust'
  | 'status'
  | 'identity'
  | 'scarcity'
  | 'power'
  | 'uncertainty'
  | 'reciprocity';

/** A single narrative beat within a chapter's story. */
export interface StorySection {
  /** Narrative text for this beat. */
  text: string;
  /** Optional visual key referencing an illustration/frame. */
  visual?: string;
}

/** Audio narration metadata for a chapter. */
export interface ChapterAudio {
  /** URL or path to the audio file. */
  src: string;
  /** Duration in seconds, when known. */
  durationSeconds?: number;
}

/** Visual asset metadata for a chapter. */
export interface ChapterVisual {
  /** URL or path to the SVG/image. */
  src: string;
  /** Accessible description of the visual. */
  alt: string;
}

/** A full chapter: story, audio, visual and metadata. */
export interface Chapter {
  /** Stable chapter id (e.g. "31"). */
  id: string;
  /** Part of the guide this chapter belongs to (e.g. "II"). */
  part: string;
  /** Section within the part (e.g. "A"). */
  section: string;
  /** Human-readable chapter title. */
  title: string;
  /** Human forces this chapter explores. */
  forces: Force[];
  /** Ids of related chapters this one connects to. */
  connections: string[];
  /** Optional narrated audio. */
  audio?: ChapterAudio;
  /** Optional hero visual. */
  visual?: ChapterVisual;
  /** Ordered narrative beats. */
  sections: StorySection[];
}

/**
 * Quiz challenge types, the QuizChallenge union, ChallengeOption, Principle,
 * and their Zod validators — defined once in ./quiz and re-exported here so
 * types and runtime validation share a single source of truth.
 */
export * from './quiz';

/** Quiz payload for a chapter. */
export interface QuizData {
  /** Id of the chapter this quiz belongs to. */
  chapterId: string;
  /** Ordered challenges to present. */
  challenges: QuizChallenge[];
  /** The core principle revealed on completion. */
  principle: Principle;
  /** A reflection prompt for the learner. */
  reflection: string;
}

/** A learner's progress through the guide. */
export interface Progress {
  /** Ids of chapters the learner has completed. */
  completedChapters: string[];
  /** Cumulative score across completed quizzes. */
  score: number;
  /** Id of the chapter currently in progress, if any. */
  currentChapter?: string;
}
