'use client';

import { useEffect, useState } from 'react';

export interface PrincipleRevealProps {
  /** The core principle the chapter reinforces. */
  text: string;
  /** Supporting explanation shown beneath the principle. */
  subtext: string;
  /** Number of challenges answered correctly (drives the "n/n correct" badge). */
  correctCount?: number;
  /** Total number of challenges in the chapter. */
  totalCount?: number;
  /** Static, human-friendly read-time label shown as a stat pill. */
  readTime?: string;
}

/**
 * A small pill-shaped stat badge used in the achievement stats row.
 */
function StatBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35em',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--color-text-dim)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/**
 * Reveals a chapter's principle as a certificate-style achievement card.
 *
 * The card frames a glowing gold star that scales in on mount, an "PRINCIPLE
 * UNLOCKED" label, the principle itself, and supporting subtext. A diamond
 * divider separates the reveal from a stats row that celebrates what the
 * learner accomplished.
 */
export function PrincipleReveal({
  text,
  subtext,
  correctCount,
  totalCount,
  readTime = '~5 min read',
}: PrincipleRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer to the next frame so the transition has an initial (scale 0) state
    // to animate away from.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hasScore =
    typeof correctCount === 'number' && typeof totalCount === 'number' && totalCount > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--spacing-lg)',
      }}
    >
      {/* Achievement badge card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          width: '100%',
          padding: 'var(--spacing-lg)',
          border: '1px solid var(--color-gold)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <span
          role="img"
          aria-label="gold star"
          style={{
            fontSize: '3.5rem',
            lineHeight: 1,
            color: 'var(--color-gold)',
            display: 'inline-block',
            textShadow: '0 0 20px rgba(218,165,32,0.3)',
            transform: mounted ? 'scale(1)' : 'scale(0)',
            transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          ★
        </span>

        <span
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--color-gold)',
          }}
        >
          Principle Unlocked
        </span>

        <p
          style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            lineHeight: 1.3,
            margin: 0,
            maxWidth: '24ch',
            color: 'var(--color-text)',
          }}
        >
          {text}
        </p>

        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.5,
            margin: 0,
            color: 'var(--color-text-dim)',
            maxWidth: '40ch',
          }}
        >
          {subtext}
        </p>
      </div>

      {/* Diamond divider */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          width: '100%',
          color: 'var(--color-gold)',
        }}
      >
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        <span style={{ fontSize: '0.7rem', lineHeight: 1 }}>◆</span>
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--spacing-sm)',
        }}
      >
        <StatBadge>
          <span style={{ color: 'var(--color-correct)' }}>✓</span>
          {hasScore ? `${correctCount}/${totalCount} correct` : 'Chapter Complete'}
        </StatBadge>
        <StatBadge>
          <span aria-hidden="true">◷</span>
          {readTime}
        </StatBadge>
      </div>
    </div>
  );
}

export default PrincipleReveal;
