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
 * A flip card. The front shows a prompt; clicking flips it (CSS rotateY)
 * to reveal the principle on the back, where a "Got it" button continues.
 */
export function CardFlip({ front, back, onCorrect }: CardFlipProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Card back' : 'Flip card'}
        onClick={() => setFlipped(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFlipped(true);
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '16rem',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          cursor: flipped ? 'default' : 'pointer',
        }}
      >
        <div style={FACE_STYLE}>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>{front}</p>
          <span style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>Tap to flip</span>
        </div>

        <div style={{ ...FACE_STYLE, transform: 'rotateY(180deg)' }}>
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
          {flipped && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCorrect();
              }}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: 'var(--color-gold)',
                color: '#1A1A1A',
                fontWeight: 600,
                cursor: 'pointer',
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
