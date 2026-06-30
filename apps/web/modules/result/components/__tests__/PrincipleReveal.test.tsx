import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrincipleReveal } from '../PrincipleReveal';

describe('PrincipleReveal', () => {
  const principle = "People don't resist change. They resist loss.";
  const subtext = 'The brain weighs losses roughly twice as heavily as equivalent gains.';

  it('renders the principle text', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(principle)).toBeInTheDocument();
  });

  it('renders the subtext', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(subtext)).toBeInTheDocument();
  });

  it('renders the open book icon', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    const book = screen.getByRole('img', { name: /open book/i });
    expect(book).toBeInTheDocument();
    expect(book.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the "Obstacle Cleared" label', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(/obstacle cleared/i)).toBeInTheDocument();
  });

  it('renders the motivational line', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(/one step closer\. keep moving\./i)).toBeInTheDocument();
  });

  it('renders the score badge when counts are provided', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} correctCount={3} totalCount={3} />);
    expect(screen.getByText('3/3 correct')).toBeInTheDocument();
  });

  it('falls back to a "Chapter Complete" badge without counts', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(/chapter complete/i)).toBeInTheDocument();
  });

  it('renders the read-time stat', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} readTime="~5 min read" />);
    expect(screen.getByText('~5 min read')).toBeInTheDocument();
  });
});
