import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardFlip } from '../CardFlip';

const FRONT = 'What drives someone to defend a bad decision?';
const BACK = 'Identity: admitting fault feels like losing the self.';

function setup(onCorrect = vi.fn()) {
  render(<CardFlip front={FRONT} back={BACK} onCorrect={onCorrect} />);
  return { onCorrect };
}

describe('CardFlip', () => {
  it('renders the front text', () => {
    setup();
    expect(screen.getByText(FRONT)).toBeInTheDocument();
  });

  it('renders the back text after flipping on click', () => {
    setup();
    // Back text exists in the DOM but the "Got it" affordance appears on flip.
    expect(screen.queryByRole('button', { name: 'Got it →' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Flip card' }));

    expect(screen.getByText(BACK)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it →' })).toBeInTheDocument();
  });

  it('calls onCorrect when "Got it" is pressed after flipping', () => {
    const { onCorrect } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Flip card' }));
    fireEvent.click(screen.getByRole('button', { name: 'Got it →' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});

describe('CardFlip snapshot', () => {
  it('matches the flipped markup with the shared Got-it button', () => {
    const { container } = render(<CardFlip front={FRONT} back={BACK} onCorrect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Flip card' }));
    expect(container).toMatchSnapshot();
  });
});
