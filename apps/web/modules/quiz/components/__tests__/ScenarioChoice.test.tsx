import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ChallengeOption } from '@field-guide/shared-types';
import { ScenarioChoice } from '../ScenarioChoice';

const SITUATION = 'A teammate takes credit for your work in a meeting.';

const OPTIONS: ChallengeOption[] = [
  { text: 'Call them out angrily', correct: false, feedback: 'Escalating burns trust.' },
  {
    text: 'Privately clarify ownership later',
    correct: true,
    feedback: 'Calm, direct, preserves the relationship.',
  },
  { text: 'Say nothing and resent it', correct: false, feedback: 'Avoidance compounds.' },
];

function setup(onCorrect = vi.fn()) {
  render(<ScenarioChoice situation={SITUATION} options={OPTIONS} onCorrect={onCorrect} />);
  return { onCorrect };
}

describe('ScenarioChoice', () => {
  it('renders the situation', () => {
    setup();
    expect(screen.getByText(SITUATION)).toBeInTheDocument();
  });

  it('renders three options', () => {
    setup();
    OPTIONS.forEach((option) => {
      expect(screen.getByRole('button', { name: option.text })).toBeInTheDocument();
    });
  });

  it('shows gold border and feedback when the correct option is chosen', () => {
    setup();
    const correctButton = screen.getByRole('button', { name: OPTIONS[1].text });
    fireEvent.click(correctButton);

    expect(correctButton).toHaveStyle({ border: '2px solid var(--color-gold)' });
    expect(screen.getByText(OPTIONS[1].feedback)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();
  });

  it('shows red border and feedback when a wrong option is chosen', () => {
    setup();
    const wrongButton = screen.getByRole('button', { name: OPTIONS[0].text });
    fireEvent.click(wrongButton);

    expect(wrongButton).toHaveStyle({ border: '2px solid var(--color-wrong)' });
    expect(screen.getByText(OPTIONS[0].feedback)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next →' })).not.toBeInTheDocument();
  });
});
