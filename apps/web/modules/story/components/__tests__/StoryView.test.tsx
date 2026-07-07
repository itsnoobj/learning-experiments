import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoryView } from '../StoryView';

const sections = {
  situation: { content: 'You face a difficult coworker.' },
  story: { title: 'The Tale', content: 'Once upon a time.' },
  principle: { content: 'Understand the force at play.' },
};

describe('StoryView', () => {
  it('renders the chapter title as a heading', () => {
    render(<StoryView title="Why People Resist Change" sections={sections} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Why People Resist Change' }),
    ).toBeInTheDocument();
  });

  it('renders all section bodies', () => {
    render(<StoryView title="Chapter" sections={sections} />);
    expect(screen.getByText('You face a difficult coworker.')).toBeInTheDocument();
    expect(screen.getByText('Once upon a time.')).toBeInTheDocument();
    expect(screen.getByText('Understand the force at play.')).toBeInTheDocument();
  });

  it('applies the correct section type labels', () => {
    render(<StoryView title="Chapter" sections={sections} />);
    // Default label falls back to the section type.
    expect(screen.getByRole('heading', { level: 2, name: 'situation' })).toBeInTheDocument();
    // Custom title overrides the type label.
    expect(screen.getByRole('heading', { level: 2, name: 'The Tale' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'principle' })).toBeInTheDocument();
  });
});
