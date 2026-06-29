'use client';

import Link from 'next/link';

export interface StartScreenProps {
  /** Big title. */
  title?: string;
  /** Supporting line under the title. */
  subtitle?: string;
  /** Invoked when the player taps to start. */
  onStart: () => void;
}

const GOLD = '#DAA520';

/**
 * The idle-phase landing overlay. Tapping anywhere starts the run; a secondary
 * link routes to the chapter map for players who'd rather browse.
 */
export function StartScreen({
  title = 'The Run',
  subtitle = 'Jump the obstacles. Each one is a problem worth solving.',
  onStart,
}: StartScreenProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Tap to start the game"
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
        background: '#0D0D0D',
        color: '#FFFFFF',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        textAlign: 'center',
        cursor: 'pointer',
        zIndex: 10,
        padding: '1.5rem',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: '0.75rem 0 2.5rem',
          maxWidth: '420px',
          color: '#a8a8a8',
          fontSize: '1.05rem',
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>

      <span
        className="fg-game-pulse"
        style={{
          color: GOLD,
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Tap to Start
      </span>

      <Link
        href="/map"
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: '1.5rem',
          color: '#8c8c8c',
          fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        or Go to Map →
      </Link>

      <style>{`
        .fg-game-pulse {
          animation: fg-game-pulse 1.4s ease-in-out infinite;
        }
        @keyframes fg-game-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fg-game-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
