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
 *
 * IMPORTANT: Only reference chapters that have content in content/chapters/.
 * If you add a chapter here without a matching JSON, the /chapter/{id} route
 * will 404.
 */
export const gameChapters: GameChapter[] = [
  {
    id: '31',
    title: 'Resisting Change',
    situation:
      "Your team won't adopt the new process. You've shown them the data three times.",
  },
  {
    id: '1',
    title: 'Defending Wrong Decisions',
    situation:
      'Three months ago you chose the vendor. Now the cracks are showing — and you hear yourself defending it.',
  },
  {
    id: '5',
    title: 'Fear of Incompetence',
    situation:
      "You're asked a question in a meeting you don't know the answer to.",
  },
  {
    id: '3',
    title: 'The Comparison Trap',
    situation:
      'Your colleague got promoted. You got a raise. But all you can think about is the promotion.',
  },
  {
    id: '2',
    title: 'Admitting Mistakes',
    situation:
      "You shipped a feature with a known bug. Now it's in production and someone noticed.",
  },
];

/** The chapter ids in encounter order, convenient for obstacle spawning. */
export const gameChapterIds: string[] = gameChapters.map((c) => c.id);
