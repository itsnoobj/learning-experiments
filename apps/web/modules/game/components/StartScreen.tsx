'use client';

import Link from 'next/link';

export interface StartScreenProps {
  /** Big title. */
  title?: string;
  /** Emotional hook shown under the title (italic, medium). */
  hook?: string;
  /** Plain-language description of the experience (smaller, muted). */
  description?: string;
  /** Invoked when the player taps / presses space to start. */
  onStart: () => void;
}

/**
 * The idle-phase landing overlay. Tapping anywhere — or pressing space/enter —
 * starts the run; a secondary link routes to the chapter map for players who'd
 * rather browse.
 *
 * Colors are theme-aware via CSS variables so the screen reads well in both
 * light and dark modes. Typography follows a clear hierarchy: a large title,
 * a medium italic hook, a smaller muted description, then a gold pulsing CTA.
 */
export function StartScreen({
  title = 'A Field Guide to Being Human',
  hook = 'Every obstacle is a lesson. Every lesson makes you wiser.',
  description = 'Run through real workplace dilemmas. Learn through stories.',
  onStart,
}: StartScreenProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Tap or press space to begin"
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
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
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
          maxWidth: '640px',
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: '1.25rem 0 0',
          maxWidth: '480px',
          fontSize: '1.25rem',
          fontStyle: 'italic',
          fontWeight: 500,
          lineHeight: 1.45,
          color: 'var(--color-text)',
        }}
      >
        {hook}
      </p>

      <p
        style={{
          margin: '0.75rem 0 2.75rem',
          maxWidth: '420px',
          color: 'var(--color-text-dim)',
          fontSize: '1rem',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      <span
        className="fg-game-pulse"
        style={{
          color: 'var(--color-gold)',
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Tap or Press Space to Begin
      </span>

      <Link
        href="/map"
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: '1.5rem',
          color: 'var(--color-text-dim)',
          fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        or explore the Map →
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
