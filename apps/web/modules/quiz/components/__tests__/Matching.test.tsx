import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Matching } from '../Matching';
import type { MatchingPair } from '@field-guide/shared-types';

const PAIRS: MatchingPair[] = [
  { left: 'Back-channel', right: 'Communication in a non-cooperative game' },
  { left: 'Rotating units', right: 'Preventing repeated-game conditions' },
  { left: 'Visible faces', right: 'Making identities visible' },
];

function setup(onCorrect = vi.fn()) {
  render(<Matching pairs={PAIRS} onCorrect={onCorrect} />);
  return { onCorrect };
}

describe('Matching', () => {
  beforeEach(() => {
    // Math.random -> 0 makes the shuffle a no-op, so the right column stays in
    // input order and pairings are deterministic for the test.
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a default instruction when none is given', () => {
    setup();
    expect(screen.getByText('Match each concept to its description.')).toBeInTheDocument();
  });

  it('rejects a wrong pairing without solving', () => {
    const { onCorrect } = setup();
    fireEvent.click(screen.getByText(PAIRS[0].left));
    fireEvent.click(screen.getByText(PAIRS[1].right)); // wrong description
    expect(screen.getByText(/not a match/i)).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('accepts all correct pairings, then calls onCorrect on Next', () => {
    const { onCorrect } = setup();
    for (const pair of PAIRS) {
      fireEvent.click(screen.getByText(pair.left));
      fireEvent.click(screen.getByText(pair.right));
    }
    const next = screen.getByRole('button', { name: /next/i });
    expect(next).toBeInTheDocument();
    fireEvent.click(next);
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});
