import { describe, it, expect } from 'vitest';
import { spawnObstacle, Obstacle, type ObstacleType } from '../lib/obstacle';

const CHAPTERS = ['c1', 'c2', 'c3'];

/** Deterministic rng that always selects the type at `index` in the type pool. */
function rngForIndex(index: number, poolSize: number): () => number {
  return () => index / poolSize;
}

describe('spawnObstacle — obstacle types', () => {
  it('can produce a crate with its fixed wide/short dimensions', () => {
    // Pool order: pipe, block, gap, crate, spike (5 types). crate is index 3.
    const crate = spawnObstacle({ groundY: 400, spawnX: 800, rng: rngForIndex(3, 5) }, CHAPTERS, 0);
    expect(crate.type).toBe('crate');
    expect(crate.width).toBe(45);
    expect(crate.height).toBe(35);
    // Sits on the ground line.
    expect(crate.y).toBe(400 - 35);
  });

  it('can produce a spike with its fixed narrow/tall dimensions', () => {
    const spike = spawnObstacle({ groundY: 400, spawnX: 800, rng: rngForIndex(4, 5) }, CHAPTERS, 0);
    expect(spike.type).toBe('spike');
    expect(spike.width).toBe(15);
    expect(spike.height).toBe(60);
    expect(spike.y).toBe(400 - 60);
  });

  it('still produces the original factor-based pipe', () => {
    const pipe = spawnObstacle(
      { groundY: 400, spawnX: 800, baseHeight: 48, rng: rngForIndex(0, 5) },
      CHAPTERS,
      0,
    );
    expect(pipe.type).toBe('pipe');
    expect(pipe.width).toBeCloseTo(48 * 0.7);
    expect(pipe.height).toBeCloseTo(48 * 1.2);
  });

  it('draw() does not throw for any obstacle type', () => {
    const types: ObstacleType[] = ['pipe', 'block', 'gap', 'crate', 'spike'];
    // A minimal canvas-context stub recording no-ops.
    const ctx = {
      save: () => {},
      restore: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      lineWidth: 0,
      lineJoin: 'miter',
      strokeStyle: '',
    } as unknown as CanvasRenderingContext2D;

    for (const type of types) {
      const o = new Obstacle({ x: 0, y: 0, width: 20, height: 40, chapterId: 'c', type });
      expect(() => o.draw(ctx, '#fff')).not.toThrow();
    }
  });
});
