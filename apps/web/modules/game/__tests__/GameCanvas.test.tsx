import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCanvas } from '../components/GameCanvas';

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
    expect(await screen.findByText('Tap or Press Space to Begin')).toBeInTheDocument();
  });
});
