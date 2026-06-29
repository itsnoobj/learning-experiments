import { describe, it, expect } from 'vitest';
import { checkCollision, type Rect } from '../lib/collision';

const player: Rect = { x: 100, y: 100, width: 40, height: 60 };

describe('checkCollision', () => {
  it('returns true when rectangles overlap', () => {
    const obstacle: Rect = { x: 120, y: 120, width: 40, height: 40 };
    expect(checkCollision(player, obstacle)).toBe(true);
  });

  it('returns true when one rectangle is fully inside the other', () => {
    const inner: Rect = { x: 110, y: 110, width: 10, height: 10 };
    expect(checkCollision(player, inner)).toBe(true);
  });

  it('returns false when rectangles are separated horizontally', () => {
    const obstacle: Rect = { x: 200, y: 100, width: 40, height: 60 };
    expect(checkCollision(player, obstacle)).toBe(false);
  });

  it('returns false when rectangles are separated vertically', () => {
    const obstacle: Rect = { x: 100, y: 200, width: 40, height: 60 };
    expect(checkCollision(player, obstacle)).toBe(false);
  });

  it('returns false when edges merely touch on the x-axis', () => {
    // player right edge = 140; obstacle starts exactly at 140.
    const obstacle: Rect = { x: 140, y: 100, width: 20, height: 60 };
    expect(checkCollision(player, obstacle)).toBe(false);
  });

  it('returns false when edges merely touch on the y-axis', () => {
    // player bottom edge = 160; obstacle starts exactly at 160.
    const obstacle: Rect = { x: 100, y: 160, width: 40, height: 20 };
    expect(checkCollision(player, obstacle)).toBe(false);
  });

  it('detects a one-pixel overlap', () => {
    const obstacle: Rect = { x: 139, y: 100, width: 20, height: 60 };
    expect(checkCollision(player, obstacle)).toBe(true);
  });

  it('is symmetric in its arguments', () => {
    const obstacle: Rect = { x: 120, y: 120, width: 40, height: 40 };
    expect(checkCollision(player, obstacle)).toBe(checkCollision(obstacle, player));
  });
});
