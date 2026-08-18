import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultCTA } from '../ResultCTA';
import { ReflectionPrompt } from '../ReflectionPrompt';

describe('ReflectionPrompt', () => {
  it('renders the reflection question', () => {
    render(<ReflectionPrompt question="What did you learn?" />);
    expect(screen.getByText('What did you learn?')).toBeInTheDocument();
  });

  it('renders the Reflect label', () => {
    render(<ReflectionPrompt question="Test" />);
    expect(screen.getByText('Reflect')).toBeInTheDocument();
  });

  it('renders the thought bubble emoji', () => {
    render(<ReflectionPrompt question="Test" />);
    expect(screen.getByLabelText('thought bubble')).toBeInTheDocument();
  });
});

describe('ResultCTA', () => {
  const defaultProps = {
    onContinue: vi.fn(),
    fromGame: false,
    onGoToMap: vi.fn(),
    onGoToGame: vi.fn(),
    onShare: vi.fn(),
  };

  it('renders "Back to Map" when not from game', () => {
    render(<ResultCTA {...defaultProps} />);
    expect(screen.getByText('Back to Map →')).toBeInTheDocument();
  });

  it('renders "Continue Running" when from game', () => {
    render(<ResultCTA {...defaultProps} fromGame={true} />);
    expect(screen.getByText('Continue Running →')).toBeInTheDocument();
  });

  it('calls onContinue when primary button clicked', () => {
    const onContinue = vi.fn();
    render(<ResultCTA {...defaultProps} onContinue={onContinue} />);
    fireEvent.click(screen.getByText('Back to Map →'));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('shows "Or play the Game" when not from game', () => {
    render(<ResultCTA {...defaultProps} />);
    expect(screen.getByText('Or play the Game →')).toBeInTheDocument();
  });

  it('shows "Or explore the Map" when from game', () => {
    render(<ResultCTA {...defaultProps} fromGame={true} />);
    expect(screen.getByText('Or explore the Map')).toBeInTheDocument();
  });

  it('calls onGoToGame when secondary clicked (not from game)', () => {
    const onGoToGame = vi.fn();
    render(<ResultCTA {...defaultProps} onGoToGame={onGoToGame} />);
    fireEvent.click(screen.getByText('Or play the Game →'));
    expect(onGoToGame).toHaveBeenCalledOnce();
  });

  it('calls onShare when share button clicked', () => {
    const onShare = vi.fn();
    render(<ResultCTA {...defaultProps} onShare={onShare} />);
    fireEvent.click(screen.getByText('Share this principle'));
    expect(onShare).toHaveBeenCalledOnce();
  });

  it('shows unlock message when not from game', () => {
    render(<ResultCTA {...defaultProps} />);
    expect(screen.getByText('Next chapter unlocked on the map')).toBeInTheDocument();
  });

  it('shows obstacle message when from game', () => {
    render(<ResultCTA {...defaultProps} fromGame={true} />);
    expect(screen.getByText(/Obstacle cleared/)).toBeInTheDocument();
  });

  it('calls onGoToMap when secondary clicked (from game)', () => {
    const onGoToMap = vi.fn();
    render(<ResultCTA {...defaultProps} fromGame={true} onGoToMap={onGoToMap} />);
    fireEvent.click(screen.getByText('Or explore the Map'));
    expect(onGoToMap).toHaveBeenCalledOnce();
  });

  it('toggles hover state on the primary and secondary buttons without error', () => {
    render(<ResultCTA {...defaultProps} />);
    const primary = screen.getByText('Back to Map →');
    const secondary = screen.getByText('Or play the Game →');
    const share = screen.getByText('Share this principle');
    for (const el of [primary, secondary, share]) {
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);
    }
    // Still interactive after hover in/out.
    expect(primary).toBeInTheDocument();
  });
});
