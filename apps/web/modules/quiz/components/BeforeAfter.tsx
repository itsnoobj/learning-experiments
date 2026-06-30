'use client';

import { useState } from 'react';

/** One of the two scenarios the learner chooses between. */
export interface BeforeAfterScenario {
  /** Short label shown above the text (e.g. "Manager A"). */
  label: string;
  /** The scenario description. */
  text: string;
}

/** Props for {@link BeforeAfter}. */
export interface BeforeAfterProps {
  /** Brief setup describing the shared situation. */
  context: string;
  /** The first scenario. */
  scenarioA: BeforeAfterScenario;
  /** The second scenario. */
  scenarioB: BeforeAfterScenario;
  /** Which scenario applied the principle correctly. */
  correctScenario: 'A' | 'B';
  /** Explanation revealed after a choice is made. */
  explanation: string;
  /** Called once the learner picks the correct scenario and continues. */
  onCorrect: () => void;
}

/**
 * "Which one got it right?" challenge.
 * Shows a shared context, then two scenario cards. Picking the correct one
 * marks it with a gold border and a "Correct" badge, reveals the explanation,
 * and shows a Next button. Picking the wrong one flags it red with "Not quite"
 * and reveals the explanation so the learner can retry.
 */
export function BeforeAfter({
  context,
  scenarioA,
  scenarioB,
  correctScenario,
  explanation,
  onCorrect,
}: BeforeAfterProps) {
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);

  const solved = selected !== null && selected === correctScenario;

  const handleSelect = (choice: 'A' | 'B') => {
    if (solved) return;
    setSelected(choice);
  };

  const cardBorder = (choice: 'A' | 'B'): string => {
    if (selected !== choice) return 'var(--color-border)';
    return choice === correctScenario ? 'var(--color-gold)' : 'var(--color-wrong)';
  };

  const renderCard = (choice: 'A' | 'B', scenario: BeforeAfterScenario) => {
    const isSelected = selected === choice;
    const isCorrectPick = isSelected && choice === correctScenario;
    const isWrongPick = isSelected && choice !== correctScenario;

    return (
      <button
        type="button"
        onClick={() => handleSelect(choice)}
        disabled={solved}
        style={{
          flex: 1,
          minWidth: '14rem',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius)',
          border: `2px solid ${cardBorder(choice)}`,
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          cursor: solved ? 'default' : 'pointer',
          transition: 'border-color 0.2s ease',
        }}
      >
        <span className="flex items-center gap-2">
          <span
            style={{
              fontWeight: 700,
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.875rem',
            }}
          >
            {scenario.label}
          </span>
          {isCorrectPick && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1A1A1A',
                background: 'var(--color-gold)',
                borderRadius: 'var(--radius)',
                padding: '0.125rem 0.5rem',
              }}
            >
              Correct
            </span>
          )}
          {isWrongPick && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-wrong)',
              }}
            >
              Not quite
            </span>
          )}
        </span>
        <span style={{ lineHeight: 1.6 }}>{scenario.text}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>{context}</p>

      <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
        {renderCard('A', scenarioA)}
        {renderCard('B', scenarioB)}
      </div>

      {selected !== null && (
        <div
          role="status"
          style={{
            borderLeft: `4px solid ${solved ? 'var(--color-correct)' : 'var(--color-wrong)'}`,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius)',
            padding: 'var(--spacing-md)',
          }}
        >
          {explanation}
        </div>
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
