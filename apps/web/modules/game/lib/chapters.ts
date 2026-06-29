/** A chapter surfaced when the player collides with an obstacle. */
export interface GameChapter {
  id: string;
  title: string;
  /** The problem statement shown on the interstitial. */
  situation: string;
}

/**
 * Chapters mapped to obstacles, in the order they are encountered. Each
 * collision reveals the next entry's dilemma before sending the player off to
 * read and solve it.
 */
export const gameChapters: GameChapter[] = [
  {
    id: '31',
    title: 'Resisting Change',
    situation: "Your team won't adopt the new process. You've shown them the data three times.",
  },
  {
    id: '12',
    title: 'The Ego Trap',
    situation: 'You realize mid-argument that you’re wrong. But backing down feels impossible.',
  },
  {
    id: '5',
    title: 'Fear of Incompetence',
    situation: 'You’re asked a question in a meeting you don’t know the answer to.',
  },
  {
    id: '34',
    title: 'Building Trust',
    situation: 'You’re new to the team. Nobody takes your suggestions seriously yet.',
  },
  {
    id: '50',
    title: 'Nobody Owns It',
    situation: 'A critical problem is reported. Everyone agrees it’s important. No one acts.',
  },
];

/** The chapter ids in encounter order, convenient for obstacle spawning. */
export const gameChapterIds: string[] = gameChapters.map((c) => c.id);
