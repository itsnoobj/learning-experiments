/**
 * The auto-running stick-figure player.
 *
 * The player only moves vertically — the world scrolls horizontally past it.
 * Physics are a simple gravity + impulse model: {@link jump} sets an upward
 * velocity, {@link update} integrates it each frame, and the player is clamped
 * to the ground line.
 */
export class Player {
  /** Horizontal position (fixed; the world scrolls instead). */
  x: number;
  /** Vertical position of the player's top edge. */
  y: number;
  /** Vertical velocity in px/frame (negative is up). */
  vy: number;
  width: number;
  height: number;
  /** True while airborne. */
  jumping: boolean;
  /** True while standing on the ground line. */
  grounded: boolean;
  /** The y coordinate of the ground line the player rests on. */
  groundY: number;
  /** Impulse applied on jump (negative = upward). */
  jumpVelocity: number;

  constructor(options: {
    x?: number;
    groundY: number;
    width?: number;
    height?: number;
    jumpVelocity?: number;
  }) {
    this.width = options.width ?? 28;
    this.height = options.height ?? 56;
    this.x = options.x ?? 80;
    this.groundY = options.groundY;
    this.y = options.groundY - this.height;
    this.vy = 0;
    this.jumping = false;
    this.grounded = true;
    // Tuned so the arc reliably clears all obstacle types (spike=60px,
    // pipe=57px) even on lower/variable frame rates (Windows). The old value
    // of -10 gave only ~62px clearance which failed on inconsistent deltas.
    this.jumpVelocity = options.jumpVelocity ?? -13;
  }

  /** Recompute the ground line (e.g. after a resize) and reseat if grounded. */
  setGroundY(groundY: number): void {
    this.groundY = groundY;
    if (this.grounded) {
      this.y = groundY - this.height;
    }
  }

  /** Launch the player upward. No-op while already airborne. */
  jump(): void {
    if (!this.grounded) return;
    this.vy = this.jumpVelocity;
    this.jumping = true;
    this.grounded = false;
  }

  /**
   * Advance the player one frame under the given gravity.
   * @param gravity downward acceleration in px/frame^2.
   */
  update(gravity: number): void {
    this.vy += gravity;
    this.y += this.vy;

    const floor = this.groundY - this.height;
    if (this.y >= floor) {
      this.y = floor;
      this.vy = 0;
      this.jumping = false;
      this.grounded = true;
    }
  }

  /**
   * Draw the player as a stick figure in the given stroke color.
   *
   * Head is a stroked circle, the body a vertical line, arms a slight V, and the
   * legs alternate their splay based on `distance` to fake a running gait. While
   * airborne the legs tuck together.
   *
   * @param ctx         the 2D rendering context.
   * @param distance    world distance travelled, used to phase the run cycle.
   * @param strokeColor figure stroke color (theme-aware; white on dark, near-black on light).
   */
  draw(ctx: CanvasRenderingContext2D, distance = 0, strokeColor = '#FFFFFF'): void {
    const cx = this.x + this.width / 2;
    const top = this.y;
    const headRadius = this.width / 2;
    const headCenterY = top + headRadius;
    const bodyTop = top + this.width;
    const bodyBottom = top + this.height - this.width * 0.6;

    ctx.save();
    // Render the figure slightly larger than its hitbox for presence, anchored
    // at the feet so the visual growth never sinks below the ground line. This
    // is purely cosmetic — the collision box (width/height) is unchanged.
    const visualScale = 1.18;
    const feetX = cx;
    const feetY = top + this.height;
    ctx.translate(feetX, feetY);
    ctx.scale(visualScale, visualScale);
    ctx.translate(-feetX, -feetY);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Head
    ctx.beginPath();
    ctx.arc(cx, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(cx, bodyTop);
    ctx.lineTo(cx, bodyBottom);
    ctx.stroke();

    // Arms (slight forward V)
    const armY = bodyTop + (bodyBottom - bodyTop) * 0.35;
    const armSpread = this.width * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx, armY);
    ctx.lineTo(cx + armSpread, armY + this.width * 0.3);
    ctx.moveTo(cx, armY);
    ctx.lineTo(cx - armSpread, armY + this.width * 0.4);
    ctx.stroke();

    // Legs: alternating V to suggest running. Tucked together while airborne.
    const legLength = top + this.height - bodyBottom;
    const phase = this.grounded ? Math.sin(distance / 12) : 0;
    const legSpread = this.width * 0.5 * (0.6 + 0.4 * phase);
    const legSpreadBack = this.width * 0.5 * (0.6 - 0.4 * phase);

    ctx.beginPath();
    ctx.moveTo(cx, bodyBottom);
    ctx.lineTo(cx + legSpread, bodyBottom + legLength);
    ctx.moveTo(cx, bodyBottom);
    ctx.lineTo(cx - legSpreadBack, bodyBottom + legLength);
    ctx.stroke();

    ctx.restore();
  }
}
