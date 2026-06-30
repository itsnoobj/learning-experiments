/**
 * Shared domain types for the Field Guide.
 * Consumed by both the Next.js web app and the Fastify API.
 */

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

/** One selectable option in a scenario or spot-the-force challenge. */
export interface ChallengeOption {
  text: string;
  correct: boolean;
  /** Explanation shown after the option is chosen. */
  feedback: string;
}

/** Pick the best response to a workplace situation. */
export interface ScenarioChoiceChallenge {
  type: 'scenario-choice';
  situation: string;
  options: ChallengeOption[];
}

/** Identify which human force is driving the described behavior. */
export interface SpotTheForceChallenge {
  type: 'spot-the-force';
  situation: string;
  question: string;
  options: ChallengeOption[];
}

/** Flip a card to reveal the principle/answer on the back. */
export interface CardFlipChallenge {
  type: 'card-flip';
  front: string;
  back: string;
}

/** A single orderable item in a drag-match challenge. */
export interface DragMatchItem {
  /** Stable id used to check against the correct order. */
  id: string;
  /** Display text. */
  text: string;
}

/** Put items in the correct sequence/order. */
export interface DragMatchChallenge {
  type: 'drag-match';
  instruction: string;
  items: DragMatchItem[];
  /** Ids in their correct sequence. */
  correctOrder: string[];
}

/** One of the two scenarios in a before-after challenge. */
export interface BeforeAfterScenario {
  /** Short label shown above the text (e.g. "Manager A"). */
  label: string;
  /** The scenario description. */
  text: string;
}

/** Choose which of two scenarios applied the principle correctly. */
export interface BeforeAfterChallenge {
  type: 'before-after';
  context: string;
  scenarioA: BeforeAfterScenario;
  scenarioB: BeforeAfterScenario;
  correctScenario: 'A' | 'B';
  explanation: string;
}

/** Discriminated union of all supported quiz challenge templates. */
export type QuizChallenge =
  | ScenarioChoiceChallenge
  | SpotTheForceChallenge
  | CardFlipChallenge
  | DragMatchChallenge
  | BeforeAfterChallenge;

/** The principle a chapter's quiz reinforces. */
export interface Principle {
  text: string;
  subtext?: string;
}

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
