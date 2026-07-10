import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorySection } from '../StorySection';

describe('StorySection', () => {
  it('renders a non-collapsible section with heading and content', () => {
    render(<StorySection type="situation" content="You face a hard choice." />);
    expect(screen.getByRole('heading', { level: 2, name: 'The Situation' })).toBeInTheDocument();
    expect(screen.getByText('You face a hard choice.')).toBeInTheDocument();
  });

  it('uses custom title when provided', () => {
    render(<StorySection type="story" title="A Custom Title" content="Once upon a time." />);
    expect(screen.getByRole('heading', { level: 2, name: 'A Custom Title' })).toBeInTheDocument();
  });

  it('uses default labels from DEFAULT_LABELS map', () => {
    render(<StorySection type="psychology" content="The brain does this because..." />);
    expect(screen.getByRole('heading', { level: 2, name: 'Why It Happens' })).toBeInTheDocument();
  });

  it('renders principle section with gold styling', () => {
    render(<StorySection type="principle" content="The core idea." />);
    const heading = screen.getByRole('heading', { level: 2, name: 'The Principle' });
    expect(heading).toHaveStyle({ color: 'var(--color-gold)' });
  });

  it('splits content into paragraphs on double newlines', () => {
    const content = 'First paragraph.\n\nSecond paragraph.';
    render(<StorySection type="situation" content={content} />);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  describe('collapsible mode', () => {
    it('renders a details/summary element when collapsible is true', () => {
      const { container } = render(
        <StorySection type="contrast" content="A different angle." collapsible />,
      );
      const details = container.querySelector('details');
      expect(details).toBeInTheDocument();
    });

    it('renders the label inside the summary', () => {
      render(<StorySection type="contrast" content="A different angle." collapsible />);
      // The label should be inside a summary
      expect(screen.getByText('A Different Angle')).toBeInTheDocument();
    });

    it('renders the arrow indicator', () => {
      const { container } = render(<StorySection type="move" content="Step 1." collapsible />);
      const arrow = container.querySelector('.details-arrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveTextContent('▶');
    });

    it('does not render as details when collapsible is false', () => {
      const { container } = render(
        <StorySection type="contrast" content="A different angle." collapsible={false} />,
      );
      const details = container.querySelector('details');
      expect(details).not.toBeInTheDocument();
    });

    it('still renders content inside the collapsible', () => {
      render(<StorySection type="psychology" content="The brain tricks you." collapsible />);
      expect(screen.getByText('The brain tricks you.')).toBeInTheDocument();
    });
  });
});
