'use client';

/** Props for {@link QuizFeedback}. */
export interface QuizFeedbackProps {
  /** Explanatory text to show the learner. */
  text: string;
  /** Whether the feedback relates to a correct answer. */
  isCorrect: boolean;
}

const KEYFRAMES = `
@keyframes feedback-in {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;

/**
 * A feedback panel shown after an answer is chosen.
 * Slides in with animation, has a colored left border and subtle background
 * tint based on correctness. Correct answers get a gold accent instead of
 * green to match the overall gold theme language.
 */
export function QuizFeedback({ text, isCorrect }: QuizFeedbackProps) {
  const accentColor = isCorrect ? 'var(--color-gold)' : 'var(--color-wrong)';

  return (
    <div
      role="status"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        background: isCorrect ? 'rgba(224, 185, 74, 0.06)' : 'rgba(192, 57, 43, 0.05)',
        color: 'var(--color-text)',
        borderRadius: 'var(--radius)',
        padding: 'var(--spacing-md)',
        lineHeight: 1.6,
        animation: 'feedback-in 0.25s ease-out',
        position: 'relative',
      }}
    >
      <style>{KEYFRAMES}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: accentColor,
            flexShrink: 0,
            lineHeight: 1.6,
          }}
        >
          {isCorrect ? '✓' : '✗'}
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
}
