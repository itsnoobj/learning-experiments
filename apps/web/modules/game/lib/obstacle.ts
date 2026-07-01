/** The obstacle silhouettes the runner can throw at the player. */
export type ObstacleType = 'pipe' | 'block' | 'gap' | 'crate' | 'spike';

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
   * Draw the obstacle with a silhouette that matches its type. Sprites are the
   * primary visual in {@link GameCanvas}; this canvas-drawn fallback renders
   * when a sprite hasn't loaded and must still read as the right hazard:
   *
   * - `spike`: an upward-pointing triangle (sharp, dangerous looking).
   * - `crate` / others: an outlined rectangle with an internal X (a packing
   *   crate / generic hazard marker).
   *
   * The outline color is theme-aware; interior strokes are a muted grey so the
   * marker stays visible in both light and dark modes.
   *
   * @param ctx         the 2D rendering context.
   * @param strokeColor outline color (white on dark, near-black on light).
   */
  draw(ctx: CanvasRenderingContext2D, strokeColor = '#FFFFFF'): void {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'miter';

    if (this.type === 'spike') {
      // Upward-pointing triangle filling the obstacle's bounding box.
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y); // apex
      ctx.lineTo(this.x + this.width, this.y + this.height); // bottom-right
      ctx.lineTo(this.x, this.y + this.height); // bottom-left
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Outline (rectangle).
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Internal X pattern (crate slats / generic hazard marker).
    ctx.strokeStyle = '#888888';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.moveTo(this.x + this.width, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Per-type silhouette dimensions. `pipe`/`block`/`gap` scale from the
 * configured base height via factors; `crate`/`spike` use fixed absolute
 * dimensions so they keep their distinctive shape regardless of base height.
 */
interface TypeDimension {
  /** Width as a multiple of baseHeight (used when `width` is absent). */
  widthFactor?: number;
  /** Height as a multiple of baseHeight (used when `height` is absent). */
  heightFactor?: number;
  /** Absolute width in px; overrides `widthFactor`. */
  width?: number;
  /** Absolute height in px; overrides `heightFactor`. */
  height?: number;
}

const TYPE_DIMENSIONS: Record<ObstacleType, TypeDimension> = {
  // Tall and narrow.
  pipe: { widthFactor: 0.7, heightFactor: 1.2 },
  // Squat and square.
  block: { widthFactor: 1, heightFactor: 0.7 },
  // Wide and short — a "gap" rendered as a low bar.
  gap: { widthFactor: 1.6, heightFactor: 0.5 },
  // Shorter and wider — a shipping crate.
  crate: { width: 45, height: 35 },
  // Narrow and tall — a dangerous spike.
  spike: { width: 15, height: 60 },
};

const OBSTACLE_TYPES: ObstacleType[] = ['pipe', 'block', 'gap', 'crate', 'spike'];

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
 * chapter pulled round-robin from `chapterIds`, skipping any IDs in `seenIds`.
 * When all chapters have been seen, the full pool is used again (graceful reset).
 *
 * @param config      spawn geometry and difficulty.
 * @param chapterIds  pool of chapter ids to assign.
 * @param spawnCount  how many obstacles have spawned so far (for round-robin).
 * @param seenIds     chapters already shown this session; skipped if possible.
 */
export function spawnObstacle(
  config: SpawnConfig,
  chapterIds: string[],
  spawnCount: number,
  seenIds?: Set<string>,
): Obstacle {
  const rng = config.rng ?? Math.random;
  const baseHeight = config.baseHeight ?? 48;
  const type = OBSTACLE_TYPES[Math.floor(rng() * OBSTACLE_TYPES.length)];
  const dims = TYPE_DIMENSIONS[type];

  const height = dims.height ?? baseHeight * (dims.heightFactor ?? 1);
  const width = dims.width ?? baseHeight * (dims.widthFactor ?? 1);

  // Pick a chapter: prefer unseen ones, fall back to full pool if all seen.
  let pool = chapterIds;
  if (seenIds && seenIds.size > 0 && seenIds.size < chapterIds.length) {
    pool = chapterIds.filter((id) => !seenIds.has(id));
  }
  const chapterId = pool.length ? pool[spawnCount % pool.length] : String(spawnCount);

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
