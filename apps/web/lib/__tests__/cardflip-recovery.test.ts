import { describe, it, expect } from 'vitest';
import { loadQuiz } from '../content';

/**
 * Regression guard for the card-flip recovery: the migration previously kept
 * only the first card-flip pair per mission, dropping the rest. Mission 1's
 * prisoner's-dilemma payoff matrix has four outcomes, so its quiz must expose
 * all four as card-flip challenges.
 */
describe('card-flip recovery', () => {
  it('mission 1 preserves all four payoff-matrix card-flips', async () => {
    const quiz = await loadQuiz('1');
    expect(quiz).not.toBeNull();
    const cardFlips = quiz!.challenges.filter((c) => c.type === 'card-flip');
    expect(cardFlips.length).toBe(4);
  });

  it('each recovered card-flip has non-empty front and back', async () => {
    const quiz = await loadQuiz('1');
    expect(quiz).not.toBeNull();
    for (const c of quiz!.challenges) {
      if (c.type === 'card-flip') {
        expect(c.front.length).toBeGreaterThan(0);
        expect(c.back.length).toBeGreaterThan(0);
      }
    }
  });
});
