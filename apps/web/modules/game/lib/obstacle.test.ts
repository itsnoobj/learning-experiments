import { describe, it, expect } from 'vitest';
import { spawnObstacle, Obstacle, type ObstacleType } from './obstacle';

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

describe('spawnObstacle — chapter rotation variety', () => {
  const FIVE_CHAPTERS = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];

  it('assigns chapters round-robin based on spawnCount', () => {
    const rng = () => 0; // always pick first obstacle type
    const chapters = Array.from(
      { length: 5 },
      (_, i) => spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, i).chapterId,
    );
    expect(chapters).toEqual(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']);
  });

  it('wraps around after exhausting all chapters', () => {
    const rng = () => 0;
    const sixth = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 5);
    expect(sixth.chapterId).toBe('ch1'); // wraps back to index 0
  });

  it('different spawnCount offsets produce different starting chapters', () => {
    const rng = () => 0;
    const fromZero = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 0);
    const fromThree = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 3);
    expect(fromZero.chapterId).not.toBe(fromThree.chapterId);
    expect(fromZero.chapterId).toBe('ch1');
    expect(fromThree.chapterId).toBe('ch4');
  });

  it('random offset covers all chapters across multiple seeds', () => {
    const rng = () => 0;
    const seen = new Set<string>();
    for (let offset = 0; offset < FIVE_CHAPTERS.length; offset++) {
      const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, offset);
      seen.add(obstacle.chapterId);
    }
    expect(seen.size).toBe(5); // all chapters reachable
  });

  it('excludes already-seen chapters from assignment', () => {
    const rng = () => 0;
    const seen = new Set(['ch1', 'ch2']);
    const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 0, seen);
    expect(seen.has(obstacle.chapterId)).toBe(false);
    expect(['ch3', 'ch4', 'ch5']).toContain(obstacle.chapterId);
  });

  it('cycles through unseen chapters only', () => {
    const rng = () => 0;
    const seen = new Set(['ch1', 'ch3']);
    const results = Array.from(
      { length: 3 },
      (_, i) => spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, i, seen).chapterId,
    );
    // Pool is ['ch2', 'ch4', 'ch5'], round-robin with spawnCount 0,1,2
    expect(results).toEqual(['ch2', 'ch4', 'ch5']);
  });

  it('falls back to full pool when all chapters have been seen', () => {
    const rng = () => 0;
    const seen = new Set(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']);
    const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 0, seen);
    // All seen → uses full pool, so back to ch1
    expect(obstacle.chapterId).toBe('ch1');
  });

  it('works with empty seenIds (no filtering)', () => {
    const rng = () => 0;
    const seen = new Set<string>();
    const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, FIVE_CHAPTERS, 0, seen);
    expect(obstacle.chapterId).toBe('ch1');
  });
});

describe('spawnObstacle — session simulation (no repeats until exhaustion)', () => {
  const CHAPTERS = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];

  it('simulates a multi-hit session without repeating chapters', () => {
    const rng = () => 0;
    const seen = new Set<string>();
    const hits: string[] = [];

    // Simulate 5 rounds: spawn → "hit" → record → spawn next
    for (let round = 0; round < 5; round++) {
      const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, CHAPTERS, round, seen);
      // The chapter should not have been seen before
      expect(seen.has(obstacle.chapterId)).toBe(false);
      // Record the hit
      seen.add(obstacle.chapterId);
      hits.push(obstacle.chapterId);
    }

    // All 5 chapters should have been shown exactly once
    expect(new Set(hits).size).toBe(5);
  });

  it('resets gracefully after all chapters exhausted', () => {
    const rng = () => 0;
    const seen = new Set(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']);

    // All seen — should fall back to full pool and not crash
    const obstacle = spawnObstacle({ groundY: 400, spawnX: 800, rng }, CHAPTERS, 0, seen);
    expect(CHAPTERS).toContain(obstacle.chapterId);
  });

  it('second session after exhaustion still produces valid chapters', () => {
    const rng = () => 0;
    const seen = new Set(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']);

    // Simulate clearing the seen set (as if starting fresh after exhaustion)
    seen.clear();
    const results: string[] = [];
    for (let i = 0; i < 5; i++) {
      const o = spawnObstacle({ groundY: 400, spawnX: 800, rng }, CHAPTERS, i, seen);
      expect(seen.has(o.chapterId)).toBe(false);
      seen.add(o.chapterId);
      results.push(o.chapterId);
    }
    expect(new Set(results).size).toBe(5);
  });
});
