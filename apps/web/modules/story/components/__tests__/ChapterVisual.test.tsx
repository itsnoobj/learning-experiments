import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChapterVisual } from '../ChapterVisual';

describe('ChapterVisual', () => {
  it('renders an image with the given src and alt', () => {
    render(<ChapterVisual src="/content/1.png" alt="Chapter 1 illustration" />);
    const img = screen.getByAltText('Chapter 1 illustration');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/content/1.png');
  });

  it('renders inside a figure element', () => {
    render(<ChapterVisual src="/content/2.png" alt="Test" />);
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });

  it('accepts PNG paths (SVG→PNG migration)', () => {
    const visual = '3.svg';
    const pngPath = `/content/${visual.replace('.svg', '.png')}`;
    render(<ChapterVisual src={pngPath} alt="Mission 3" />);
    const img = screen.getByAltText('Mission 3');
    expect(img).toHaveAttribute('src', '/content/3.png');
  });
});
