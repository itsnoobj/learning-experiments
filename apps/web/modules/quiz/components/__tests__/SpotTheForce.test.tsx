import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ChallengeOption } from '@field-guide/shared-types';
import { SpotTheForce } from '../SpotTheForce';

const situation = 'A manager hoards information from the team.';
const question = 'Which force is at play?';

const options: ChallengeOption[] = [
  { text: 'Power', correct: true, feedback: 'Correct — control through scarcity of information.' },
  { text: 'Trust', correct: false, feedback: 'Not quite — this is about leverage, not trust.' },
  { text: 'Reciprocity', correct: false, feedback: 'No — no exchange of favors here.' },
];

describe('SpotTheForce', () => {
  it('renders the situation text', () => {
    render(
      <SpotTheForce
        situation={situation}
        question={question}
        options={options}
        onCorrect={vi.fn()}
      />,
    );
    expect(screen.getByText(situation)).toBeInTheDocument();
  });

  it('renders the question text', () => {
    render(
      <SpotTheForce
        situation={situation}
        question={question}
        options={options}
        onCorrect={vi.fn()}
      />,
    );
    expect(screen.getByText(question)).toBeInTheDocument();
  });

  it('renders three options', () => {
    render(
      <SpotTheForce
        situation={situation}
        question={question}
        options={options}
        onCorrect={vi.fn()}
      />,
    );
    // Before any answer, the only buttons are the three options.
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('shows gold feedback for the correct answer', () => {
    render(
      <SpotTheForce
        situation={situation}
        question={question}
        options={options}
        onCorrect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Power' }));

    const feedback = screen.getByRole('status');
    expect(feedback).toHaveTextContent('Correct — control through scarcity of information.');
    // Correct feedback uses the gold accent on its left border.
    expect(feedback.getAttribute('style')).toContain('var(--color-gold)');
  });

  it('shows red feedback for a wrong answer', () => {
    render(
      <SpotTheForce
        situation={situation}
        question={question}
        options={options}
        onCorrect={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Trust' }));

    const feedback = screen.getByRole('status');
    expect(feedback).toHaveTextContent('Not quite — this is about leverage, not trust.');
    // Wrong feedback uses the "wrong" (red) accent on its left border.
    expect(feedback.getAttribute('style')).toContain('var(--color-wrong)');
  });
});
