'use client';

import { useEffect } from 'react';

export interface PathUnlockedProps {
  /** Title of the node the player just completed. */
  fromNode: string;
  /** Title of the node that just became reachable. */
  toNode: string;
  /** Called when the animation finishes (auto-dismiss) or the player taps. */
  onDone: () => void;
}

const GOLD = '#DAA520';

/** How long the celebration stays on screen before auto-dismissing. */
const AUTO_DISMISS_MS = 2500;

/**
 * Celebratory overlay shown on the world map when the player returns after
 * solving a chapter, announcing the path that just opened up.
 *
 * A gold key scales in and the "PATH UNLOCKED" label plus the
 * `{from} → {to}` route fade in shortly after. Dismisses automatically after
 * {@link AUTO_DISMISS_MS} or on tap. Unlike {@link ObstacleCleared} this sits
 * within the map container rather than the full viewport, so it is positioned
 * absolutely against its (relative) parent.
 */
export function PathUnlocked({ fromNode, toNode, onDone }: PathUnlockedProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="path-unlocked-title"
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
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
        zIndex: 20,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        textAlign: 'center',
        cursor: 'pointer',
        padding: '1.5rem',
      }}
    >
      <span className="fg-unlocked-key" aria-hidden="true" style={{ display: 'inline-block' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="18" cy="18" r="10" stroke={GOLD} strokeWidth="2.5" fill="none" />
          <line x1="26" y1="22" x2="42" y2="22" stroke={GOLD} strokeWidth="2.5" />
          <line x1="36" y1="22" x2="36" y2="28" stroke={GOLD} strokeWidth="2.5" />
          <line x1="40" y1="22" x2="40" y2="26" stroke={GOLD} strokeWidth="2.5" />
        </svg>
      </span>

      <p
        id="path-unlocked-title"
        className="fg-unlocked-text"
        style={{
          margin: '1rem 0 0',
          color: GOLD,
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
        }}
      >
        Path Unlocked
      </p>

      <p
        className="fg-unlocked-text"
        style={{
          margin: '0.6rem 0 0',
          color: '#CCCCCC',
          fontSize: '0.95rem',
          lineHeight: 1.4,
        }}
      >
        {fromNode} → {toNode}
      </p>

      <style>{`
        .fg-unlocked-key {
          animation: fg-unlocked-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .fg-unlocked-text {
          animation: fg-unlocked-fade 0.5s ease-out 0.3s both;
        }
        @keyframes fg-unlocked-pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes fg-unlocked-fade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
