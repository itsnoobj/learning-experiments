import { describe, it, expect } from 'vitest';
import { Player } from '../lib/player';

const GRAVITY = 0.6; // must match GameCanvas constant
const GROUND_Y = 300;

function simulateJump(player: Player): number {
  player.jump();
  let minY = player.y;
  // Simulate frames until player lands
  for (let i = 0; i < 200; i++) {
    player.update(GRAVITY);
    if (player.y < minY) minY = player.y;
    if (player.grounded) break;
  }
  return GROUND_Y - player.height - minY; // max height reached above standing position
}

describe('Player jump physics', () => {
  it('default jump clears the tallest obstacle (spike = 60px)', () => {
    const player = new Player({ groundY: GROUND_Y });
    const maxHeight = simulateJump(player);
    expect(maxHeight).toBeGreaterThan(60);
  });

  it('default jump clears pipe height (57.6px)', () => {
    const player = new Player({ groundY: GROUND_Y });
    const maxHeight = simulateJump(player);
    expect(maxHeight).toBeGreaterThan(57.6);
  });

  it('jump height provides comfortable margin (> 20px clearance over 60px spike)', () => {
    const player = new Player({ groundY: GROUND_Y });
    const maxHeight = simulateJump(player);
    expect(maxHeight).toBeGreaterThan(80);
  });

  it('jump does not go off-screen (stays within canvas)', () => {
    const player = new Player({ groundY: GROUND_Y });
    player.jump();
    for (let i = 0; i < 200; i++) {
      player.update(GRAVITY);
      expect(player.y).toBeGreaterThan(0);
      if (player.grounded) break;
    }
  });

  it('player lands back on ground after jump', () => {
    const player = new Player({ groundY: GROUND_Y });
    player.jump();
    for (let i = 0; i < 200; i++) {
      player.update(GRAVITY);
      if (player.grounded) break;
    }
    expect(player.grounded).toBe(true);
    expect(player.y).toBe(GROUND_Y - player.height);
  });

  it('cannot double-jump', () => {
    const player = new Player({ groundY: GROUND_Y });
    player.jump();
    player.update(GRAVITY);
    const vyAfterFirstFrame = player.vy;
    player.jump(); // should be no-op
    expect(player.vy).toBe(vyAfterFirstFrame);
  });

  it('jump velocity is -13', () => {
    const player = new Player({ groundY: GROUND_Y });
    expect(player.jumpVelocity).toBe(-13);
  });
});
