'use client';

import { useMemo, useState } from 'react';
import type { ChallengeOption } from '@field-guide/shared-types';
import { QuizFeedback } from './QuizFeedback';

/** Fisher-Yates shuffle, returns a new array. */
function shuffleOptions<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Props for {@link ScenarioChoice}. */
export interface ScenarioChoiceProps {
  /** The workplace situation to respond to. */
  situation: string;
  /** Selectable options; exactly one should be marked correct. */
  options: ChallengeOption[];
  /** Called once the learner selects the correct option and continues. */
  onCorrect: () => void;
}

const KEYFRAMES = `
@keyframes option-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes correct-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0.6); }
  70%  { box-shadow: 0 0 0 10px rgba(224, 185, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0); }
}
@keyframes check-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes next-btn-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * "Pick the best response" challenge.
 * Options have hover lift, correct answer gets a gold pulse and checkmark,
 * wrong answer shows red border. Feedback panel stays visible.
 */
export function ScenarioChoice({ situation, options, onCorrect }: ScenarioChoiceProps) {
  const shuffled = useMemo(() => shuffleOptions(options), [options]);
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (solved) return;
    const option = shuffled[index];
    setSelected(index);

    if (option.correct) {
      setSolved(true);
    }
  };

  const borderColor = (index: number): string => {
    if (selected === index) {
      return shuffled[index].correct ? 'var(--color-gold)' : 'var(--color-wrong)';
    }
    if (selected !== null && shuffled[index].correct) {
      return 'var(--color-gold)';
    }
    if (hoveredIndex === index && !solved) {
      return 'var(--color-gold)';
    }
    return 'var(--color-border)';
  };

  const selectedOption = selected !== null ? shuffled[selected] : null;

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <style>{KEYFRAMES}</style>

      <p style={{ fontSize: '1.125rem', lineHeight: 1.7, fontWeight: 400 }}>{situation}</p>

      <div className="flex flex-col gap-3">
        {shuffled.map((option, index) => {
          const isCorrectSelected = selected === index && option.correct;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={solved}
              style={{
                textAlign: 'left',
                padding: 'var(--spacing-md) calc(var(--spacing-md) + 0.25rem)',
                borderRadius: 'var(--radius)',
                border: `2px solid ${borderColor(index)}`,
                background: isCorrectSelected ? 'rgba(224, 185, 74, 0.08)' : 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: solved ? 'default' : 'pointer',
                transition:
                  'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
                transform: hoveredIndex === index && !solved ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow:
                  hoveredIndex === index && !solved ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                animation: isCorrectSelected
                  ? 'correct-pulse 0.6s ease-out'
                  : `option-enter 0.3s ease-out ${index * 0.06}s both`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ flex: 1 }}>{option.text}</span>
              {isCorrectSelected && (
                <span
                  style={{
                    animation: 'check-pop 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: 'var(--color-gold)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <QuizFeedback text={selectedOption.feedback} isCorrect={selectedOption.correct} />
      )}

      {solved && (
        <button
          type="button"
          onClick={onCorrect}
          className="quiz-next-btn"
          style={{
            alignSelf: 'flex-end',
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
            animation: 'next-btn-in 0.3s ease-out',
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
          Next →
        </button>
      )}
    </div>
  );
}
