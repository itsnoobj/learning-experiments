'use client';

import { useEffect } from 'react';
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

/**
 * Drives a sequence of quiz challenges.
 * Shows progress dots, renders the template for the current challenge, and
 * reports the final score via onComplete after the last challenge.
 */
export function QuizShell({ challenges, onComplete }: QuizShellProps) {
  const { currentIndex, score, answer, next, isComplete } = useQuizState(challenges.length);

  useEffect(() => {
    if (challenges.length > 0 && currentIndex >= challenges.length) {
      onComplete(score);
    }
    // Fire once the index passes the end; score is settled by then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, challenges.length]);

  const handleCorrect = () => {
    answer(true);
    next();
  };

  const dotColor = (index: number): string => {
    if (index < currentIndex) return 'var(--color-gold)';
    if (index === currentIndex) return 'var(--color-text)';
    return 'var(--color-border)';
  };

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

  const current = challenges[currentIndex];

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      <div className="flex items-center gap-2" role="list" aria-label="Quiz progress">
        {challenges.map((_, index) => (
          <span
            key={index}
            role="listitem"
            aria-current={index === currentIndex}
            style={{
              width: '0.625rem',
              height: '0.625rem',
              borderRadius: '9999px',
              border: `2px solid ${index >= currentIndex ? dotColor(index) : 'transparent'}`,
              background: index < currentIndex ? 'var(--color-gold)' : 'transparent',
              boxSizing: 'border-box',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
          />
        ))}
      </div>

      {!isComplete() && current ? renderChallenge(current) : null}
    </div>
  );
}
