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

  it('renders the gold star', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    const star = screen.getByRole('img', { name: /gold star/i });
    expect(star).toBeInTheDocument();
    expect(star).toHaveTextContent('★');
  });

  it('renders the "Principle Unlocked" label', () => {
    render(<PrincipleReveal text={principle} subtext={subtext} />);
    expect(screen.getByText(/principle unlocked/i)).toBeInTheDocument();
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
