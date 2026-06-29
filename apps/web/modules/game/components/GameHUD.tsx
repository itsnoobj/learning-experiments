'use client';

export interface GameHUDProps {
  /** Number of stars collected. */
  score: number;
  /** World distance travelled, in px. Rendered in metres (optional). */
  distance?: number;
  /** Show the distance readout in the top-right. */
  showDistance?: boolean;
}

const GOLD = '#DAA520';

/**
 * Heads-up display overlaid on the canvas: a gold star count top-left and an
 * optional distance readout top-right. Pointer events pass through so the HUD
 * never intercepts jump taps.
 */
export function GameHUD({ score, distance = 0, showDistance = true }: GameHUDProps) {
  const metres = Math.floor(distance / 10);

  return (
    <div
      aria-hidden={false}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: '1rem 1.25rem',
      }}
    >
      <div
        role="status"
        aria-label={`Score: ${score} stars`}
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1.25rem',
          color: GOLD,
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        <span aria-hidden="true">★</span> {score}
      </div>

      {showDistance && (
        <div
          aria-label={`Distance: ${metres} metres`}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.25rem',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 500,
            opacity: 0.7,
          }}
        >
          {metres}m
        </div>
      )}
    </div>
  );
}
