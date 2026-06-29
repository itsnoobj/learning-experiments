/** Anything with a position and size that can take part in a collision test. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Axis-aligned bounding-box overlap test.
 *
 * Returns true when the two rectangles overlap on both axes. Edges that merely
 * touch (zero-area overlap) are treated as *not* colliding, which keeps the
 * runner forgiving when the player just grazes an obstacle's edge.
 *
 * @param a first rectangle (typically the player).
 * @param b second rectangle (typically the obstacle).
 */
export function checkCollision(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
