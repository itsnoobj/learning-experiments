import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioToggle } from '../components/AudioToggle';

describe('AudioToggle', () => {
  it('renders mute button when not muted', () => {
    render(<AudioToggle muted={false} onToggle={vi.fn()} />);
    const btn = screen.getByRole('button', { name: 'Mute audio' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('🔊');
  });

  it('renders unmute button when muted', () => {
    render(<AudioToggle muted={true} onToggle={vi.fn()} />);
    const btn = screen.getByRole('button', { name: 'Unmute audio' });
    expect(btn).toHaveTextContent('🔇');
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<AudioToggle muted={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation on click', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <AudioToggle muted={false} onToggle={vi.fn()} />
      </div>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
