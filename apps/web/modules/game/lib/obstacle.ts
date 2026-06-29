/** The three obstacle silhouettes the runner can throw at the player. */
export type ObstacleType = 'pipe' | 'block' | 'gap';

/** A rectangular hazard tied to a chapter the player unlocks on collision. */
export interface ObstacleData {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Chapter revealed when the player collides with this obstacle. */
  chapterId: string;
  type: ObstacleType;
}

/**
 * A scrolling hazard. Each obstacle carries a `chapterId`; colliding with it
 * surfaces the corresponding chapter interstitial.
 */
export class Obstacle implements ObstacleData {
  x: number;
  y: number;
  width: number;
  height: number;
  chapterId: string;
  type: ObstacleType;

  constructor(data: ObstacleData) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.chapterId = data.chapterId;
    this.type = data.type;
  }

  /** Scroll the obstacle left by `speed` px. */
  update(speed: number): void {
    this.x -= speed;
  }

  /** True once the obstacle has fully scrolled off the left edge. */
  isOffscreen(): boolean {
    return this.x + this.width < 0;
  }

  /**
   * Draw the obstacle as an outlined rectangle with an internal X.
   * The outline is white; the X is grey, giving a minimalist hazard marker.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'miter';

    // Outline
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Internal X pattern
    ctx.strokeStyle = '#666666';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.moveTo(this.x + this.width, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.stroke();

    ctx.restore();
  }
}

/** Per-type silhouette dimensions relative to the configured base height. */
const TYPE_DIMENSIONS: Record<ObstacleType, { widthFactor: number; heightFactor: number }> = {
  // Tall and narrow.
  pipe: { widthFactor: 0.7, heightFactor: 1.2 },
  // Squat and square.
  block: { widthFactor: 1, heightFactor: 0.7 },
  // Wide and short — a "gap" rendered as a low bar.
  gap: { widthFactor: 1.6, heightFactor: 0.5 },
};

const OBSTACLE_TYPES: ObstacleType[] = ['pipe', 'block', 'gap'];

export interface SpawnConfig {
  /** Ground line the obstacle sits on. */
  groundY: number;
  /** x to spawn at (typically just past the right edge). */
  spawnX: number;
  /** Base obstacle height in px; type factors scale from this. */
  baseHeight?: number;
  /**
   * Difficulty 0..1. Higher difficulty narrows spacing and (via the loop)
   * speeds the world. Used here to bias the next gap.
   */
  difficulty?: number;
  /** Deterministic RNG injection point for tests. Defaults to Math.random. */
  rng?: () => number;
}

/**
 * Build a single obstacle at `spawnX` with a randomly chosen silhouette and a
 * chapter pulled round-robin from `chapterIds`.
 *
 * @param config      spawn geometry and difficulty.
 * @param chapterIds  pool of chapter ids to assign.
 * @param spawnCount  how many obstacles have spawned so far (for round-robin).
 */
export function spawnObstacle(
  config: SpawnConfig,
  chapterIds: string[],
  spawnCount: number,
): Obstacle {
  const rng = config.rng ?? Math.random;
  const baseHeight = config.baseHeight ?? 48;
  const type = OBSTACLE_TYPES[Math.floor(rng() * OBSTACLE_TYPES.length)];
  const dims = TYPE_DIMENSIONS[type];

  const height = baseHeight * dims.heightFactor;
  const width = baseHeight * dims.widthFactor;
  const chapterId = chapterIds.length
    ? chapterIds[spawnCount % chapterIds.length]
    : String(spawnCount);

  return new Obstacle({
    x: config.spawnX,
    y: config.groundY - height,
    width,
    height,
    chapterId,
    type,
  });
}

/**
 * Compute horizontal spacing (in px) to the next obstacle. Spacing shrinks as
 * difficulty rises, with a little jitter so the cadence never feels metronomic.
 *
 * @param difficulty 0..1.
 * @param rng        RNG for jitter; defaults to Math.random.
 */
export function nextSpacing(difficulty = 0, rng: () => number = Math.random): number {
  const clamped = Math.min(1, Math.max(0, difficulty));
  const maxGap = 520;
  const minGap = 260;
  const base = maxGap - (maxGap - minGap) * clamped;
  const jitter = (rng() - 0.5) * 120;
  return Math.max(minGap, base + jitter);
}
