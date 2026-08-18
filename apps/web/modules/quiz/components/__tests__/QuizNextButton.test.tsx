import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizNextButton } from '../QuizNextButton';

describe('QuizNextButton', () => {
  it('renders the default label', () => {
    render(<QuizNextButton onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<QuizNextButton onClick={vi.fn()} label="Got it →" />);
    expect(screen.getByRole('button', { name: 'Got it →' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<QuizNextButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('bubbles the click to parents by default', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <QuizNextButton onClick={vi.fn()} />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(parentClick).toHaveBeenCalledTimes(1);
  });

  it('stops propagation when stopPropagation is set (e.g. inside a clickable card)', () => {
    const parentClick = vi.fn();
    const onClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <QuizNextButton onClick={onClick} stopPropagation />
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
