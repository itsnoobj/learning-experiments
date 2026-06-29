'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChallengeOption } from '@field-guide/shared-types';
import { QuizFeedback } from './QuizFeedback';

/** Props for {@link SpotTheForce}. */
export interface SpotTheForceProps {
  /** The situation describing some behavior. */
  situation: string;
  /** The question prompting which force is at play. */
  question: string;
  /** Selectable options; exactly one should be marked correct. */
  options: ChallengeOption[];
  /** Called once the learner selects the correct option and continues. */
  onCorrect: () => void;
}

const RETRY_DELAY_MS = 1500;

/**
 * "Identify the driving force" challenge.
 * Adds a question label between the situation and options; otherwise mirrors
 * the select / feedback / retry-or-next interaction of ScenarioChoice.
 */
export function SpotTheForce({ situation, question, options, onCorrect }: SpotTheForceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleSelect = (index: number) => {
    if (locked || solved) return;
    const option = options[index];
    setSelected(index);

    if (option.correct) {
      setSolved(true);
    } else {
      setLocked(true);
      timer.current = setTimeout(() => {
        setSelected(null);
        setLocked(false);
      }, RETRY_DELAY_MS);
    }
  };

  const borderColor = (index: number): string => {
    if (selected === index) {
      return options[index].correct ? 'var(--color-correct)' : 'var(--color-wrong)';
    }
    if (selected !== null && options[index].correct) {
      return 'var(--color-correct)';
    }
    return 'var(--color-border)';
  };

  const selectedOption = selected !== null ? options[selected] : null;

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>{situation}</p>

      <p
        style={{
          fontWeight: 600,
          color: 'var(--color-gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.875rem',
        }}
      >
        {question}
      </p>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={locked || solved}
            style={{
              textAlign: 'left',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius)',
              border: `2px solid ${borderColor(index)}`,
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: locked || solved ? 'default' : 'pointer',
              transition: 'border-color 0.2s ease',
            }}
          >
            {option.text}
          </button>
        ))}
      </div>

      {selectedOption && (
        <QuizFeedback text={selectedOption.feedback} isCorrect={selectedOption.correct} />
      )}

      {solved && (
        <button
          type="button"
          onClick={onCorrect}
          style={{
            alignSelf: 'flex-end',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            borderRadius: 'var(--radius)',
            border: 'none',
            background: 'var(--color-gold)',
            color: '#1A1A1A',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
