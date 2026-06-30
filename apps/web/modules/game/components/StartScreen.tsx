'use client';

export interface StartScreenProps {
  /** Invoked when the player taps / presses space to start. */
  onStart: () => void;
}

/**
 * Transparent overlay on the game canvas showing just "TAP TO RUN" / "SPACE to
 * start". The game world (ground, clouds, hills, player) is fully visible
 * behind this — no separate screen, no blocking overlay.
 */
export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Tap to run"
      onClick={onStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStart();
        }
      }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: 'var(--color-text)',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        textAlign: 'center',
        cursor: 'pointer',
        zIndex: 10,
        padding: '1.5rem',
      }}
    >
      <span
        className="fg-game-pulse"
        style={{
          color: 'var(--color-gold)',
          fontSize: '1.6rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        Tap to Run
      </span>

      <span
        className="fg-game-space-hint"
        style={{
          marginTop: '0.5rem',
          color: 'var(--color-text-dim)',
          fontSize: '0.8rem',
          letterSpacing: '0.04em',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}
      >
        or <strong style={{ fontWeight: 600 }}>SPACE</strong> to start
      </span>

      <style>{`
        .fg-game-pulse {
          animation: fg-game-pulse 1.3s ease-in-out infinite;
        }
        @keyframes fg-game-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.04); }
        }
        .fg-game-space-hint {
          display: none;
        }
        @media (min-width: 1024px) {
          .fg-game-space-hint {
            display: block;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fg-game-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
