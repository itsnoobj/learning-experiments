'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { MatchingPair } from '@field-guide/shared-types';

/** Props for {@link Matching}. */
export interface MatchingProps {
  /** Optional prompt shown above the columns. */
  instruction?: string;
  /** Concept/description pairs; index i is the correct match for pair i. */
  pairs: MatchingPair[];
  /** Called once every pair is matched and the learner continues. */
  onCorrect: () => void;
}

const WRONG_FLASH_MS = 700;

const KEYFRAMES = `
@keyframes match-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes match-correct-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0.6); }
  70%  { box-shadow: 0 0 0 10px rgba(224, 185, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0); }
}
@keyframes match-wrong-shake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-4px); }
  75%      { transform: translateX(4px); }
}
@keyframes match-next-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/** Fisher–Yates shuffle that avoids returning the input order. */
function shuffle<T>(input: T[]): T[] {
  if (input.length < 2) return [...input];
  let result = [...input];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    if (result.some((value, index) => value !== input[index])) break;
  }
  return result;
}

/**
 * "Match each concept to its description" challenge.
 * Tap a concept on the left, then tap its description on the right. A correct
 * pairing locks in gold; a wrong one flashes red and clears. Once every pair is
 * matched, a Next button appears and calls {@link MatchingProps.onCorrect}.
 */
export function Matching({ instruction, pairs, onCorrect }: MatchingProps) {
  // Right column shown shuffled; each entry carries its original pair index.
  const rightOrder = useMemo(() => shuffle(pairs.map((_, index) => index)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [solved, setSolved] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const allSolved = solved.size === pairs.length;

  const selectLeft = (index: number) => {
    if (solved.has(index) || allSolved) return;
    setWrong(null);
    setSelectedLeft(index);
  };

  const selectRight = (pairIndex: number) => {
    if (solved.has(pairIndex) || allSolved) return;
    if (selectedLeft === null) return;

    if (pairIndex === selectedLeft) {
      setSolved((prev) => new Set(prev).add(pairIndex));
      setSelectedLeft(null);
      setWrong(null);
    } else {
      setWrong({ left: selectedLeft, right: pairIndex });
      const clearedLeft = selectedLeft;
      setSelectedLeft(null);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setWrong((current) =>
          current && current.left === clearedLeft && current.right === pairIndex ? null : current,
        );
      }, WRONG_FLASH_MS);
    }
  };

  const leftBorder = (index: number): string => {
    if (solved.has(index)) return 'var(--color-gold)';
    if (wrong?.left === index) return 'var(--color-wrong)';
    if (selectedLeft === index) return 'var(--color-gold)';
    return 'var(--color-border)';
  };

  const rightBorder = (pairIndex: number): string => {
    if (solved.has(pairIndex)) return 'var(--color-gold)';
    if (wrong?.right === pairIndex) return 'var(--color-wrong)';
    return 'var(--color-border)';
  };

  const cellStyle = (borderColor: string, isSolved: boolean, disabled: boolean) => ({
    textAlign: 'left' as const,
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius)',
    border: `2px solid ${borderColor}`,
    background: isSolved ? 'rgba(224, 185, 74, 0.08)' : 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    lineHeight: 1.4,
  });

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <style>{KEYFRAMES}</style>

      <p style={{ fontSize: '1.125rem', lineHeight: 1.7 }}>
        {instruction ?? 'Match each concept to its description.'}
      </p>

      <div
        className="flex gap-3"
        style={{ animation: wrong ? 'match-wrong-shake 0.35s ease-out' : 'none' }}
      >
        {/* Concepts */}
        <div className="flex flex-col gap-3" style={{ flex: 1 }}>
          {pairs.map((pair, index) => {
            const isSolved = solved.has(index);
            return (
              <button
                key={`left-${index}`}
                type="button"
                aria-pressed={selectedLeft === index}
                disabled={isSolved || allSolved}
                onClick={() => selectLeft(index)}
                style={{
                  ...cellStyle(leftBorder(index), isSolved, isSolved || allSolved),
                  animation: isSolved
                    ? 'match-correct-pulse 0.6s ease-out'
                    : `match-enter 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <span style={{ flex: 1 }}>{pair.left}</span>
                {isSolved && <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Descriptions (shuffled) */}
        <div className="flex flex-col gap-3" style={{ flex: 1 }}>
          {rightOrder.map((pairIndex, position) => {
            const isSolved = solved.has(pairIndex);
            return (
              <button
                key={`right-${pairIndex}`}
                type="button"
                disabled={isSolved || allSolved}
                onClick={() => selectRight(pairIndex)}
                style={{
                  ...cellStyle(rightBorder(pairIndex), isSolved, isSolved || allSolved),
                  animation: isSolved
                    ? 'match-correct-pulse 0.6s ease-out'
                    : `match-enter 0.3s ease-out ${position * 0.05}s both`,
                }}
              >
                <span style={{ flex: 1 }}>{pairs[pairIndex].right}</span>
                {isSolved && <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {wrong && (
        <p
          role="status"
          style={{
            color: 'var(--color-wrong)',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Not a match — try again
        </p>
      )}

      {allSolved && (
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
            animation: 'match-next-in 0.3s ease-out',
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
