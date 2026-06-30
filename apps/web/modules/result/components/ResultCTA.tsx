'use client';

import { useState } from 'react';

export interface ResultCTAProps {
  onContinue: () => void;
  fromGame: boolean;
  onGoToMap?: () => void;
  onGoToGame?: () => void;
  onShare?: () => void;
}

const KEYFRAMES = `
@keyframes cta-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cta-secondary-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

export function ResultCTA({
  onContinue,
  fromGame,
  onGoToMap,
  onGoToGame,
  onShare,
}: ResultCTAProps) {
  const [primaryHover, setPrimaryHover] = useState(false);
  const [secondaryHover, setSecondaryHover] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        marginTop: 'var(--spacing-lg)',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Primary CTA — gold, celebratory */}
      <button
        type="button"
        onClick={onContinue}
        onMouseEnter={() => setPrimaryHover(true)}
        onMouseLeave={() => setPrimaryHover(false)}
        style={{
          width: '100%',
          padding: '1rem var(--spacing-lg)',
          border: '2px solid var(--color-gold)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--color-gold)',
          color: '#1A1A1A',
          fontFamily: 'var(--font-primary)',
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          transform: primaryHover ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: primaryHover
            ? '0 6px 24px rgba(218, 165, 32, 0.3)'
            : '0 2px 8px rgba(218, 165, 32, 0.15)',
          animation: 'cta-in 0.4s ease-out 1.3s both',
        }}
      >
        {fromGame ? 'Continue Running →' : 'Back to Map →'}
      </button>

      {fromGame && (
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            color: 'var(--color-text-dim)',
            animation: 'cta-secondary-in 0.3s ease-out 1.5s both',
          }}
        >
          Obstacle cleared — next one awaits
        </p>
      )}

      {!fromGame && (
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            color: 'var(--color-text-dim)',
            animation: 'cta-secondary-in 0.3s ease-out 1.5s both',
          }}
        >
          Next chapter unlocked on the map
        </p>
      )}

      {/* Secondary: the OTHER option */}
      <button
        type="button"
        onClick={fromGame ? onGoToMap : onGoToGame}
        onMouseEnter={() => setSecondaryHover(true)}
        onMouseLeave={() => setSecondaryHover(false)}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: `1.5px solid ${secondaryHover ? 'var(--color-gold)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius)',
          backgroundColor: 'transparent',
          color: secondaryHover ? 'var(--color-gold)' : 'var(--color-text)',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, color 0.2s ease, transform 0.15s ease',
          transform: secondaryHover ? 'translateY(-1px)' : 'translateY(0)',
          animation: 'cta-secondary-in 0.3s ease-out 1.6s both',
        }}
      >
        {fromGame ? 'Or explore the Map' : 'Or play the Game →'}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={onShare}
        style={{
          width: '100%',
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          border: 'none',
          borderRadius: 'var(--radius)',
          backgroundColor: 'transparent',
          color: 'var(--color-text-dim)',
          fontFamily: 'var(--font-primary)',
          fontSize: '0.8rem',
          fontWeight: 400,
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          animation: 'cta-secondary-in 0.3s ease-out 1.8s both',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-dim)';
        }}
      >
        Share this principle
      </button>
    </div>
  );
}

export default ResultCTA;
