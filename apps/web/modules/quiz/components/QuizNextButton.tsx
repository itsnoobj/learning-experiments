'use client';

import type { CSSProperties } from 'react';

/** Props for {@link QuizNextButton}. */
export interface QuizNextButtonProps {
  /** Invoked when the learner continues. */
  onClick: () => void;
  /** Button label. Defaults to "Next →". */
  label?: string;
  /** `align-self` within the parent flex container. Defaults to flex-end. */
  alignSelf?: CSSProperties['alignSelf'];
  /** Entrance animation delay in ms (e.g. CardFlip waits for its flip). */
  delayMs?: number;
  /** Stop click propagation (needed when nested in a clickable card). */
  stopPropagation?: boolean;
}

const KEYFRAMES = `
@keyframes quiz-next-btn-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * The gold "continue" button shared by every quiz challenge (Next →, Got it →).
 * Consolidates the identical markup, hover lift, and entrance animation that
 * used to be copied into each challenge component.
 */
export function QuizNextButton({
  onClick,
  label = 'Next →',
  alignSelf = 'flex-end',
  delayMs = 0,
  stopPropagation = false,
}: QuizNextButtonProps) {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <button
        type="button"
        className="quiz-next-btn"
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          onClick();
        }}
        style={{
          alignSelf,
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
          animation: delayMs
            ? `quiz-next-btn-in 0.3s ease-out ${delayMs / 1000}s both`
            : 'quiz-next-btn-in 0.3s ease-out',
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
        {label}
      </button>
    </>
  );
}
