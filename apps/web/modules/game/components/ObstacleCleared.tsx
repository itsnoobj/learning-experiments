'use client';

import { useEffect } from 'react';

export interface ObstacleClearedProps {
  /** Title of the chapter the player just completed. */
  chapterTitle: string;
  /** Called when the animation finishes (auto-dismiss) or the player taps. */
  onDone: () => void;
}

const GOLD = 'var(--color-gold)';

/** How long the celebration stays on screen before auto-dismissing. */
const AUTO_DISMISS_MS = 2500;

/**
 * Celebratory full-screen overlay shown when the player returns to the runner
 * after solving a chapter (`/game?resume=1`).
 *
 * A gold checkmark bounces in, "OBSTACLE CLEARED" and the completed chapter
 * title fade beneath it, and a muted line confirms the path forward is open.
 * Dismisses automatically after {@link AUTO_DISMISS_MS} or on tap/click, at
 * which point {@link ObstacleClearedProps.onDone} fires so the game loop can
 * start. Positioning and backdrop mirror {@link HitInterstitial}.
 */
export function ObstacleCleared({ chapterTitle, onDone }: ObstacleClearedProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="obstacle-cleared-title"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDone();
        }
      }}
      tabIndex={0}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 30,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        textAlign: 'center',
        cursor: 'pointer',
        padding: '1.5rem',
      }}
    >
      <span
        className="fg-cleared-check"
        aria-hidden="true"
        style={{
          fontSize: '4.5rem',
          lineHeight: 1,
          color: GOLD,
          fontWeight: 700,
        }}
      >
        ✓
      </span>

      <p
        id="obstacle-cleared-title"
        className="fg-cleared-text"
        style={{
          margin: '1.25rem 0 0',
          color: GOLD,
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
        }}
      >
        Obstacle Cleared
      </p>

      <p
        className="fg-cleared-text"
        style={{
          margin: '0.75rem 0 0',
          color: '#FFFFFF',
          fontSize: '1.1rem',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {chapterTitle}
      </p>

      <p
        className="fg-cleared-text"
        style={{
          margin: '0.5rem 0 0',
          color: 'var(--color-text-dim)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
        }}
      >
        Path forward is open
      </p>

      <style>{`
        .fg-cleared-check {
          display: inline-block;
          animation: fg-cleared-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .fg-cleared-text {
          animation: fg-cleared-fade 0.5s ease-out 0.3s both;
        }
        @keyframes fg-cleared-pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes fg-cleared-fade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
