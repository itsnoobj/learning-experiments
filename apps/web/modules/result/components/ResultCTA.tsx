'use client';

export interface ResultCTAProps {
  /** Invoked when the learner clicks the primary call-to-action. */
  onContinue: () => void;
  /** Whether the result was reached from the game (vs. the map). */
  fromGame: boolean;
  /**
   * Invoked when the learner clicks "Share this principle". Optional — sharing
   * is not wired up yet, so this defaults to a no-op.
   */
  onShare?: () => void;
}

/**
 * Stacked call-to-action shown at the end of a result screen.
 *
 * A solid, full-width primary button returns the learner to the game
 * ("Continue Running →") or the chapter map ("Back to Map ★"), with an outline
 * "Share this principle" secondary button beneath it.
 */
export function ResultCTA({ onContinue, fromGame, onShare }: ResultCTAProps) {
  const label = fromGame ? 'Continue Running →' : 'Back to Map ★';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        marginTop: 'var(--spacing-lg)',
      }}
    >
      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: 'none',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--color-text)',
          color: 'var(--color-bg)',
          fontFamily: 'var(--font-primary)',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>

      <button
        type="button"
        onClick={onShare}
        style={{
          width: '100%',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'transparent',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-primary)',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Share this principle
      </button>
    </div>
  );
}

export default ResultCTA;
