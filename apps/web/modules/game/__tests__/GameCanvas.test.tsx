import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameCanvas } from '../components/GameCanvas';
import { HitInterstitial } from '../components/HitInterstitial';

// StartScreen pulls in next/link; render it as a plain anchor so no App Router
// context is required in jsdom.
vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

/** A no-op 2D context covering every call the canvas draw loop makes. */
function mockContext(): CanvasRenderingContext2D {
  return {
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  } as unknown as CanvasRenderingContext2D;
}

/**
 * jsdom never fires load events for images, so the canvas would sit on its
 * "Loading…" screen forever. This stub resolves each image immediately, letting
 * assetsReady flip to true and the StartScreen render.
 */
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = true;
  naturalWidth = 64;
  naturalHeight = 32;
  private _src = '';
  set src(value: string) {
    this._src = value;
    if (this.onload) setTimeout(() => this.onload?.(), 0);
  }
  get src() {
    return this._src;
  }
}

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    mockContext(),
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  vi.stubGlobal('Image', MockImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GameCanvas', () => {
  it('renders without crashing', () => {
    const { container } = render(<GameCanvas />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('shows the StartScreen once assets are ready', async () => {
    render(<GameCanvas />);
    // Images resolve on the next tick, flipping assetsReady and revealing the
    // start overlay.
    expect(await screen.findByText('Tap to Run')).toBeInTheDocument();
  });

  it('starts the game when space key is pressed in idle phase', async () => {
    render(<GameCanvas />);
    // Wait for assets to load and StartScreen to appear
    expect(await screen.findByText('Tap to Run')).toBeInTheDocument();

    // Press space to start
    act(() => {
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    });

    // StartScreen should disappear after starting
    expect(screen.queryByText('Tap to Run')).not.toBeInTheDocument();
  });

  it('starts a run without errors after multiple space presses (chapter tracking stable)', async () => {
    render(<GameCanvas />);
    expect(await screen.findByText('Tap to Run')).toBeInTheDocument();

    // Start → should not throw even with seenChapters tracking active
    act(() => {
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    });
    expect(screen.queryByText('Tap to Run')).not.toBeInTheDocument();

    // Additional space presses (jump) should not throw
    act(() => {
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    });
    act(() => {
      fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    });
    // No crash = seenChaptersRef integration is stable
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });
});

describe('HitInterstitial', () => {
  it('renders as a transparent modal overlay (not opaque)', () => {
    const { container } = render(<HitInterstitial title="Test Title" situation="Test situation" />);
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeInTheDocument();
    // Should have semi-transparent backdrop, not opaque
    expect(dialog.style.background).toContain('rgba');
    expect(dialog.style.background).not.toBe('rgba(0, 0, 0, 0.9)');
  });

  it('renders the chapter title and situation', () => {
    render(<HitInterstitial title="The Ego Trap" situation="You realize you are wrong." />);
    expect(screen.getByText('The Ego Trap')).toBeInTheDocument();
    expect(screen.getByText('You realize you are wrong.')).toBeInTheDocument();
  });

  it('renders the accept challenge button', () => {
    render(<HitInterstitial title="Test" situation="Test" />);
    expect(screen.getByRole('button', { name: /accept the challenge/i })).toBeInTheDocument();
  });
});
