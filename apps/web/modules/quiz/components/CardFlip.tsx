'use client';

import { useState } from 'react';

/** Props for {@link CardFlip}. */
export interface CardFlipProps {
  /** Text shown on the front of the card (the prompt). */
  front: string;
  /** Text shown on the back of the card (the principle). */
  back: string;
  /** Called when the learner acknowledges the principle and continues. */
  onCorrect: () => void;
}

const KEYFRAMES = `
@keyframes card-enter {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes tap-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
@keyframes card-glow {
  0%, 100% { box-shadow: 0 8px 32px rgba(224, 185, 74, 0.08); }
  50%      { box-shadow: 0 8px 32px rgba(224, 185, 74, 0.2); }
}
@keyframes reveal-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes next-btn-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

const FACE_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-lg)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--radius)',
  border: '2px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  textAlign: 'center',
};

/**
 * A flip card with tactile depth. The front shows a prompt with a tap icon
 * hint; clicking flips it (CSS rotateY) to reveal the principle on the back
 * with a gold glow, where a "Got it" button continues.
 */
export function CardFlip({ front, back, onCorrect }: CardFlipProps) {
  const [flipped, setFlipped] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        perspective: '1200px',
        animation: 'card-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <style>{KEYFRAMES}</style>
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Card back' : 'Flip card'}
        onClick={() => setFlipped(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped(true);
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '18rem',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: flipped ? 'default' : 'pointer',
        }}
      >
        {/* Front face */}
        <div
          style={{
            ...FACE_STYLE,
            boxShadow:
              hover && !flipped
                ? '0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(224, 185, 74, 0.3)'
                : '0 4px 16px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>{front}</p>

          {/* Tap icon hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-dim)',
              fontSize: '0.8rem',
              animation: 'tap-bounce 1.5s ease-in-out infinite',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 15V8.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M10 10a1.5 1.5 0 0 1 3 0v1" />
              <path d="M13 9.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M16 10.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5v-2" />
            </svg>
            <span>Tap to flip</span>
          </div>
        </div>

        {/* Back face */}
        <div
          style={{
            ...FACE_STYLE,
            transform: 'rotateY(180deg)',
            borderColor: 'var(--color-gold)',
            animation: flipped ? 'card-glow 3s ease-in-out infinite' : 'none',
          }}
        >
          <div style={{ animation: flipped ? 'reveal-in 0.4s ease-out 0.3s both' : 'none' }}>
            <p
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.6,
                color: 'var(--color-gold)',
                fontWeight: 600,
              }}
            >
              {back}
            </p>
          </div>
          {flipped && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCorrect();
              }}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: 'var(--radius)',
                border: '2px solid var(--color-gold)',
                background: 'var(--color-gold)',
                color: '#1A1A1A',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                animation: 'next-btn-in 0.3s ease-out 0.5s both',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(224, 185, 74, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Got it →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
