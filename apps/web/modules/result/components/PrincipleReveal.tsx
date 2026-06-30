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
  /** Chapter number, shown as muted context beneath the book icon (e.g. "Chapter 31"). */
  chapterNumber?: string | number;
  /** Chapter title, used as an accessible/context label for the achievement. */
  chapterTitle?: string;
}

const KEYFRAMES = `
@keyframes result-card-in {
  0%   { opacity: 0; transform: translateY(20px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes result-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(218, 165, 32, 0.1), inset 0 0 0 0 rgba(218, 165, 32, 0); }
  50%      { box-shadow: 0 0 40px 4px rgba(218, 165, 32, 0.12), inset 0 0 30px 0 rgba(218, 165, 32, 0.03); }
}
@keyframes result-divider-in {
  from { opacity: 0; transform: scaleX(0); }
  to   { opacity: 1; transform: scaleX(1); }
}
@keyframes result-stats-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes result-badge-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes result-text-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes motivational-fade {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.8; }
}
`;

/**
 * A small pill-shaped stat badge used in the achievement stats row.
 */
function StatBadge({ children, delay = '0s' }: { children: React.ReactNode; delay?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35em',
        padding: '0.4rem 0.85rem',
        borderRadius: '0px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--color-text-dim)',
        whiteSpace: 'nowrap',
        animation: `result-badge-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${delay} both`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Reveals a chapter's principle as a certificate-style achievement card.
 *
 * Upgraded with: entrance animation, subtle gold glow pulse on the card,
 * staggered text reveal, animated divider, and badge pop-in for stats.
 */
export function PrincipleReveal({
  text,
  subtext,
  correctCount,
  totalCount,
  readTime = '~5 min read',
  chapterNumber,
  chapterTitle,
}: PrincipleRevealProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
      <style>{KEYFRAMES}</style>

      {/* Achievement badge card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          width: '100%',
          padding: 'var(--spacing-lg) var(--spacing-lg) calc(var(--spacing-lg) + 0.5rem)',
          border: '1.5px solid var(--color-gold)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--color-surface)',
          animation:
            'result-card-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both, result-glow 4s ease-in-out 1s infinite',
        }}
      >
        <span
          role="img"
          aria-label={chapterTitle ? `open book — ${chapterTitle}` : 'open book'}
          style={{
            display: 'inline-block',
            lineHeight: 0,
            filter: 'drop-shadow(0 0 28px rgba(218,165,32,0.45))',
            transform: mounted ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-25deg)',
            opacity: mounted ? 1 : 0,
            transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease-out',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M32 12V52" stroke="#DAA520" strokeWidth="2" />
            <path
              d="M32 12C32 12 26 8 16 8C10 8 6 10 6 10V50C6 50 10 48 16 48C26 48 32 52 32 52"
              stroke="#DAA520"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M32 12C32 12 38 8 48 8C54 8 58 10 58 10V50C58 50 54 48 48 48C38 48 32 52 32 52"
              stroke="#DAA520"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
        </span>

        {chapterNumber != null && (
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'var(--color-text-dim)',
              animation: 'result-text-in 0.3s ease-out 0.2s both',
            }}
          >
            {`Chapter ${chapterNumber}`}
          </span>
        )}

        <span
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--color-gold)',
            animation: 'result-text-in 0.3s ease-out 0.3s both',
          }}
        >
          Obstacle Cleared
        </span>

        <p
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
            maxWidth: '24ch',
            color: 'var(--color-text)',
            animation: 'result-text-in 0.4s ease-out 0.4s both',
          }}
        >
          {text}
        </p>

        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            margin: 0,
            color: 'var(--color-text-dim)',
            maxWidth: '40ch',
            animation: 'result-text-in 0.4s ease-out 0.55s both',
          }}
        >
          {subtext}
        </p>

        <p
          style={{
            fontSize: '0.8rem',
            fontStyle: 'italic',
            lineHeight: 1.5,
            margin: 0,
            color: 'var(--color-text-dim)',
            animation:
              'result-text-in 0.4s ease-out 0.7s both, motivational-fade 4s ease-in-out 2s infinite',
          }}
        >
          One step closer. Keep moving.
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
          animation: 'result-divider-in 0.5s ease-out 0.8s both',
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
          animation: 'result-stats-in 0.4s ease-out 0.9s both',
        }}
      >
        <StatBadge delay="0.9s">
          <span style={{ color: 'var(--color-gold)' }}>✓</span>
          {hasScore ? `${correctCount}/${totalCount} correct` : 'Chapter Complete'}
        </StatBadge>
        <StatBadge delay="1s">
          <span aria-hidden="true">◷</span>
          {readTime}
        </StatBadge>
      </div>
    </div>
  );
}

export default PrincipleReveal;
