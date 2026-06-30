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

const KEYFRAMES = `
@keyframes card-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes correct-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0.5); }
  70%  { box-shadow: 0 0 0 10px rgba(224, 185, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0); }
}
@keyframes badge-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes explanation-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes next-btn-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/**
 * "Which one got it right?" challenge.
 * Cards have hover lift, correct one gets gold pulse and badge animation,
 * explanation slides in, styled Next button.
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
  const [hoveredCard, setHoveredCard] = useState<'A' | 'B' | null>(null);

  const solved = selected !== null && selected === correctScenario;

  const handleSelect = (choice: 'A' | 'B') => {
    if (solved) return;
    setSelected(choice);
  };

  const renderCard = (choice: 'A' | 'B', scenario: BeforeAfterScenario, delay: string) => {
    const isSelected = selected === choice;
    const isCorrectPick = isSelected && choice === correctScenario;
    const isWrongPick = isSelected && choice !== correctScenario;
    const isHovered = hoveredCard === choice && !solved;

    const borderColor = isCorrectPick
      ? 'var(--color-gold)'
      : isWrongPick
        ? 'var(--color-wrong)'
        : isHovered
          ? 'var(--color-gold)'
          : 'var(--color-border)';

    return (
      <button
        type="button"
        onClick={() => handleSelect(choice)}
        onMouseEnter={() => setHoveredCard(choice)}
        onMouseLeave={() => setHoveredCard(null)}
        disabled={solved}
        style={{
          flex: 1,
          minWidth: '14rem',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md) calc(var(--spacing-md) + 0.25rem)',
          borderRadius: 'var(--radius)',
          border: `2px solid ${borderColor}`,
          background: isCorrectPick ? 'rgba(224, 185, 74, 0.06)' : 'var(--color-surface)',
          color: 'var(--color-text)',
          cursor: solved ? 'default' : 'pointer',
          transition:
            'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 6px 20px rgba(0,0,0,0.08)'
            : isCorrectPick
              ? '0 0 0 0 transparent'
              : 'none',
          animation: isCorrectPick
            ? 'correct-pulse 0.6s ease-out'
            : `card-enter 0.35s ease-out ${delay} both`,
        }}
      >
        <span className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span
            style={{
              fontWeight: 700,
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '0.8rem',
            }}
          >
            {scenario.label}
          </span>
          {isCorrectPick && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#1A1A1A',
                background: 'var(--color-gold)',
                borderRadius: '2px',
                padding: '0.15rem 0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                animation: 'badge-pop 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              ✓ Correct
            </span>
          )}
          {isWrongPick && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--color-wrong)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Not quite
            </span>
          )}
        </span>
        <span style={{ lineHeight: 1.7 }}>{scenario.text}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <style>{KEYFRAMES}</style>

      <p style={{ fontSize: '1.125rem', lineHeight: 1.7 }}>{context}</p>

      <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
        {renderCard('A', scenarioA, '0s')}
        {renderCard('B', scenarioB, '0.08s')}
      </div>

      {selected !== null && (
        <div
          role="status"
          style={{
            borderLeft: `4px solid ${solved ? 'var(--color-gold)' : 'var(--color-wrong)'}`,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: 'var(--radius)',
            padding: 'var(--spacing-md)',
            animation: 'explanation-in 0.3s ease-out',
            lineHeight: 1.6,
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
