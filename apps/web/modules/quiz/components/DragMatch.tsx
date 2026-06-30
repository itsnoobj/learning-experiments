'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/** A single orderable item. */
export interface DragMatchItem {
  /** Stable id used to check against the correct order. */
  id: string;
  /** Display text. */
  text: string;
}

/** Props for {@link DragMatch}. */
export interface DragMatchProps {
  /** Instruction telling the learner what to order (e.g. "Put these in order"). */
  instruction: string;
  /** Items to order; shown shuffled. */
  items: DragMatchItem[];
  /** The ids in their correct sequence. */
  correctOrder: string[];
  /** Called once the learner submits the correct order. */
  onCorrect: () => void;
}

const WRONG_FLASH_MS = 1200;

const KEYFRAMES = `
@keyframes item-enter {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes correct-burst {
  0%   { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(224, 185, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0); }
}
@keyframes wrong-shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-4px); }
  40%      { transform: translateX(4px); }
  60%      { transform: translateX(-3px); }
  80%      { transform: translateX(3px); }
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

/** Deterministic-free shuffle (Fisher–Yates) that never returns the input order. */
function shuffle<T>(input: T[]): T[] {
  if (input.length < 2) return [...input];
  let result = [...input];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    const changed = result.some((item, index) => item !== input[index]);
    if (changed) break;
  }
  return result;
}

/**
 * "Put these in the right order" challenge.
 * Items have hover lift, move animations, shake on wrong, gold burst on correct.
 */
export function DragMatch({ instruction, items, correctOrder, onCorrect }: DragMatchProps) {
  const [order, setOrder] = useState<DragMatchItem[]>(() => shuffle(items));
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const isCorrect = useMemo(
    () =>
      order.length === correctOrder.length &&
      order.every((item, index) => item.id === correctOrder[index]),
    [order, correctOrder],
  );

  const move = (index: number, direction: -1 | 1) => {
    if (status === 'correct') return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const nextOrder = [...prev];
      [nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
      return nextOrder;
    });
    setStatus('idle');
  };

  const handleCheck = () => {
    if (status === 'correct') return;
    if (isCorrect) {
      setStatus('correct');
    } else {
      setStatus('wrong');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus('idle'), WRONG_FLASH_MS);
    }
  };

  const rowBorder = (): string => {
    if (status === 'correct') return 'var(--color-gold)';
    if (status === 'wrong') return 'var(--color-wrong)';
    return 'var(--color-border)';
  };

  return (
    <div className="flex flex-col gap-4" style={{ color: 'var(--color-text)' }}>
      <style>{KEYFRAMES}</style>

      <p style={{ fontSize: '1.125rem', lineHeight: 1.7 }}>{instruction}</p>

      <ol
        className="flex flex-col gap-3"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          animation: status === 'wrong' ? 'wrong-shake 0.4s ease-out' : 'none',
        }}
      >
        {order.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-3"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius)',
              border: `2px solid ${rowBorder()}`,
              background:
                status === 'correct' ? 'rgba(224, 185, 74, 0.06)' : 'var(--color-surface)',
              transition:
                'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease',
              transform:
                hoveredIndex === index && status !== 'correct'
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              boxShadow:
                hoveredIndex === index && status !== 'correct'
                  ? '0 3px 10px rgba(0,0,0,0.06)'
                  : 'none',
              animation:
                status === 'correct'
                  ? `correct-burst 0.5s ease-out ${index * 0.08}s`
                  : `item-enter 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                minWidth: '1.75rem',
                height: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: status === 'correct' ? '#1A1A1A' : 'var(--color-gold)',
                background: status === 'correct' ? 'var(--color-gold)' : 'transparent',
                border: status === 'correct' ? 'none' : '1.5px solid var(--color-gold)',
                borderRadius: '9999px',
                transition: 'all 0.3s ease',
              }}
            >
              {status === 'correct' ? '✓' : index + 1}
            </span>

            <span style={{ flex: 1 }}>{item.text}</span>

            <span className="flex flex-col gap-1">
              <button
                type="button"
                aria-label={`Move "${item.text}" up`}
                onClick={() => move(index, -1)}
                disabled={index === 0 || status === 'correct'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text)',
                  cursor: index === 0 || status === 'correct' ? 'default' : 'pointer',
                  opacity: index === 0 ? 0.3 : 1,
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (index > 0) e.currentTarget.style.transform = 'scale(1.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ▲
              </button>
              <button
                type="button"
                aria-label={`Move "${item.text}" down`}
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1 || status === 'correct'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text)',
                  cursor:
                    index === order.length - 1 || status === 'correct' ? 'default' : 'pointer',
                  opacity: index === order.length - 1 ? 0.3 : 1,
                  fontSize: '1rem',
                  lineHeight: 1,
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (index < order.length - 1) e.currentTarget.style.transform = 'scale(1.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ▼
              </button>
            </span>
          </li>
        ))}
      </ol>

      {status === 'wrong' && (
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
          Not quite — try again
        </p>
      )}
      {status === 'correct' && (
        <p
          role="status"
          style={{
            color: 'var(--color-gold)',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            animation: 'check-pop 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          ✓ Correct!
        </p>
      )}

      {status === 'correct' ? (
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
      ) : (
        <button
          type="button"
          onClick={handleCheck}
          style={{
            alignSelf: 'flex-end',
            padding: '0.7rem 1.5rem',
            borderRadius: 'var(--radius)',
            border: '2px solid var(--color-gold)',
            background: 'transparent',
            color: 'var(--color-gold)',
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition:
              'transform 0.15s ease, box-shadow 0.2s ease, background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'var(--color-gold)';
            e.currentTarget.style.color = '#1A1A1A';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(224, 185, 74, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-gold)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Check Order
        </button>
      )}
    </div>
  );
}
