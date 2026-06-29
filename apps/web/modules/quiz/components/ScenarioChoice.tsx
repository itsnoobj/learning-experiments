'use client';

import { useState } from 'react';
import type { ChallengeOption } from '@field-guide/shared-types';
import { QuizFeedback } from './QuizFeedback';

/** Props for {@link ScenarioChoice}. */
export interface ScenarioChoiceProps {
  /** The workplace situation to respond to. */
  situation: string;
  /** Selectable options; exactly one should be marked correct. */
  options: ChallengeOption[];
  /** Called once the learner selects the correct option and continues. */
  onCorrect: () => void;
}

/**
 * "Pick the best response" challenge.
 * A wrong answer reveals feedback that stays visible until the learner picks
 * again, so there is time to read it. The correct answer reveals a Next button
 * that advances the quiz.
 */
export function ScenarioChoice({ situation, options, onCorrect }: ScenarioChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleSelect = (index: number) => {
    if (solved) return;
    const option = options[index];
    setSelected(index);

    if (option.correct) {
      setSolved(true);
    }
  };

  const borderColor = (index: number): string => {
    if (selected === index) {
      return options[index].correct ? 'var(--color-correct)' : 'var(--color-wrong)';
    }
    // Highlight the correct option whenever an answer is being shown.
    if (selected !== null && options[index].correct) {
      return 'var(--color-correct)';
    }
    return 'var(--color-border)';
  };

  const selectedOption = selected !== null ? options[selected] : null;

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>{situation}</p>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={solved}
            style={{
              textAlign: 'left',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius)',
              border: `2px solid ${borderColor(index)}`,
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: solved ? 'default' : 'pointer',
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
