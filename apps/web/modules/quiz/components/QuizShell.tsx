'use client';

import { useEffect, useState } from 'react';
import type { QuizChallenge } from '@field-guide/shared-types';
import { useQuizState } from '../hooks/useQuizState';
import { ScenarioChoice } from './ScenarioChoice';
import { SpotTheForce } from './SpotTheForce';
import { CardFlip } from './CardFlip';
import { DragMatch } from './DragMatch';
import { BeforeAfter } from './BeforeAfter';

/** Props for {@link QuizShell}. */
export interface QuizShellProps {
  /** Ordered challenges to present. */
  challenges: QuizChallenge[];
  /** Called with the final score once every challenge is complete. */
  onComplete: (score: number) => void;
}

const CHALLENGE_LABELS: Record<string, { icon: string; label: string }> = {
  'scenario-choice': { icon: '🎯', label: 'Choose Wisely' },
  'spot-the-force': { icon: '⚡', label: 'Spot the Force' },
  'card-flip': { icon: '🃏', label: 'Flip to Learn' },
  'drag-match': { icon: '🔀', label: 'Put in Order' },
  'before-after': { icon: '⚖️', label: 'Who Got It Right?' },
};

const KEYFRAMES = `
@keyframes quiz-dot-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.5); }
  100% { transform: scale(1); }
}
@keyframes quiz-dot-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(224, 185, 74, 0); }
  50%      { box-shadow: 0 0 8px 3px rgba(224, 185, 74, 0.4); }
}
@keyframes quiz-challenge-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes quiz-challenge-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-20px); }
}
@keyframes quiz-header-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes quiz-complete-burst {
  0%   { transform: scale(0.8); opacity: 0; }
  50%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`;

/**
 * Drives a sequence of quiz challenges.
 * Shows animated progress dots, a challenge type header, renders the template
 * for the current challenge with entrance/exit transitions, and reports the
 * final score via onComplete after the last challenge.
 */
export function QuizShell({ challenges, onComplete }: QuizShellProps) {
  const { currentIndex, score, answer, next, isComplete } = useQuizState(challenges.length);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  useEffect(() => {
    if (challenges.length > 0 && currentIndex >= challenges.length) {
      onComplete(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, challenges.length]);

  const handleCorrect = () => {
    setJustCompleted(currentIndex);
    answer(true);
    next();
  };

  const current = challenges[currentIndex];
  const challengeInfo = current ? CHALLENGE_LABELS[current.type] : null;

  const renderChallenge = (challenge: QuizChallenge) => {
    switch (challenge.type) {
      case 'scenario-choice':
        return (
          <ScenarioChoice
            situation={challenge.situation}
            options={challenge.options}
            onCorrect={handleCorrect}
          />
        );
      case 'spot-the-force':
        return (
          <SpotTheForce
            situation={challenge.situation}
            question={challenge.question}
            options={challenge.options}
            onCorrect={handleCorrect}
          />
        );
      case 'card-flip':
        return <CardFlip front={challenge.front} back={challenge.back} onCorrect={handleCorrect} />;
      case 'drag-match':
        return (
          <DragMatch
            instruction={challenge.instruction}
            items={challenge.items}
            correctOrder={challenge.correctOrder}
            onCorrect={handleCorrect}
          />
        );
      case 'before-after':
        return (
          <BeforeAfter
            context={challenge.context}
            scenarioA={challenge.scenarioA}
            scenarioB={challenge.scenarioB}
            correctScenario={challenge.correctScenario}
            explanation={challenge.explanation}
            onCorrect={handleCorrect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      <style>{KEYFRAMES}</style>

      {/* Progress dots — larger, animated */}
      <div
        className="flex items-center justify-center gap-3"
        role="list"
        aria-label="Quiz progress"
      >
        {challenges.map((_, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isJustDone = justCompleted === index;

          return (
            <span
              key={index}
              role="listitem"
              aria-current={isCurrent}
              style={{
                width: isCurrent ? '0.875rem' : '0.75rem',
                height: isCurrent ? '0.875rem' : '0.75rem',
                borderRadius: '9999px',
                background: isDone ? 'var(--color-gold)' : 'transparent',
                border: isDone
                  ? '2px solid var(--color-gold)'
                  : isCurrent
                    ? '2.5px solid var(--color-gold)'
                    : '2px solid var(--color-border)',
                boxSizing: 'border-box',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isJustDone
                  ? 'quiz-dot-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  : isCurrent
                    ? 'quiz-dot-glow 2s ease-in-out infinite'
                    : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Challenge type header */}
      {challengeInfo && !isComplete() && (
        <div
          key={`header-${currentIndex}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            animation: 'quiz-header-in 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{challengeInfo.icon}</span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-gold)',
            }}
          >
            {challengeInfo.label}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-dim)',
              marginLeft: '0.25rem',
            }}
          >
            {currentIndex + 1}/{challenges.length}
          </span>
        </div>
      )}

      {/* Challenge content with entrance animation */}
      {!isComplete() && current ? (
        <div
          key={`challenge-${currentIndex}`}
          style={{
            animation: 'quiz-challenge-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {renderChallenge(current)}
        </div>
      ) : null}
    </div>
  );
}
