/** Props for {@link MapPath}. */
export interface MapPathProps {
  /** Start x coordinate. */
  x1: number;
  /** Start y coordinate. */
  y1: number;
  /** End x coordinate. */
  x2: number;
  /** End y coordinate. */
  y2: number;
  /**
   * Perpendicular offset (in SVG units) applied to the curve's control point.
   * Positive and negative values bow the path in opposite directions; `0`
   * yields an effectively straight segment. Alternating the sign across
   * segments produces an organic, squiggly trail.
   */
  curveOffset?: number;
  /** Whether the segment has been completed (drawn in the accent colour). */
  completed: boolean;
  /** Accent colour used for completed segments. Defaults to gold. */
  accent?: string;
  /** Whether this is a region-to-region "gate" segment (drawn with a wider dash). */
  isGate?: boolean;
}

const GOLD = '#DAA520';
const WHITE = '#FFFFFF';

/**
 * Builds a quadratic bezier path string between two points. The single control
 * point sits at the segment's midpoint, pushed perpendicular to the line by
 * `curveOffset`, so the path bows organically rather than running straight.
 */
function curvedPath(x1: number, y1: number, x2: number, y2: number, curveOffset: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;

  // Unit vector perpendicular to the line (rotate the direction 90°).
  const px = -dy / length;
  const py = dx / length;

  const cx = mx + px * curveOffset;
  const cy = my + py * curveOffset;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/**
 * A dotted, curvy path segment connecting two level nodes, Super Mario World
 * style. Rendered as a quadratic bezier whose control point is offset
 * perpendicular to the line by `curveOffset`, giving organic squiggly trails.
 * Accent-coloured when completed, white otherwise. Gate segments (between
 * regions) use a longer dash to read as a transition. No locked state — every
 * path is walkable.
 */
export function MapPath({
  x1,
  y1,
  x2,
  y2,
  curveOffset = 0,
  completed,
  accent = GOLD,
  isGate = false,
}: MapPathProps) {
  const stroke = completed ? accent : WHITE;

  return (
    <path
      d={curvedPath(x1, y1, x2, y2, curveOffset)}
      fill="none"
      stroke={stroke}
      strokeWidth={5}
      strokeLinecap="round"
      strokeDasharray={isGate ? '2 18' : '2 12'}
    />
  );
}
