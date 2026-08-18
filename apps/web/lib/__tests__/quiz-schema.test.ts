import { describe, it, expect } from 'vitest';
import { quizSchema } from '@field-guide/shared-types';

/** A minimal valid quiz document exercising each challenge type. */
const validQuiz = {
  chapterId: '1',
  challenges: [
    {
      type: 'scenario-choice',
      situation: 'A situation.',
      options: [
        { text: 'right', correct: true, feedback: 'yes' },
        { text: 'wrong', correct: false, feedback: 'no' },
      ],
    },
    { type: 'card-flip', front: 'front', back: 'back' },
    {
      type: 'matching',
      pairs: [
        { left: 'a', right: '1' },
        { left: 'b', right: '2' },
      ],
    },
    {
      type: 'before-after',
      context: 'ctx',
      scenarioA: { label: 'A', text: 'a' },
      scenarioB: { label: 'B', text: 'b' },
      correctScenario: 'A',
      explanation: 'because',
    },
  ],
  principle: { text: 'the principle' },
  reflection: 'reflect on this',
};

describe('quizSchema (single source of truth)', () => {
  it('accepts a valid quiz including matching and optional principle.subtext', () => {
    const result = quizSchema.safeParse(validQuiz);
    expect(result.success).toBe(true);
  });

  it('rejects a scenario option missing feedback', () => {
    const bad = structuredClone(validQuiz);
    // @ts-expect-error intentionally drop a required field
    delete bad.challenges[0].options[0].feedback;
    expect(quizSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a matching challenge with fewer than two pairs', () => {
    const bad = structuredClone(validQuiz);
    // @ts-expect-error narrow to the matching challenge for the test
    bad.challenges[2].pairs = [{ left: 'a', right: '1' }];
    expect(quizSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown challenge type', () => {
    const bad = structuredClone(validQuiz);
    // @ts-expect-error unknown discriminant
    bad.challenges.push({ type: 'mystery' });
    expect(quizSchema.safeParse(bad).success).toBe(false);
  });
});
