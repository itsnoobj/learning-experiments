'use client';

import { useCallback, useRef, useState } from 'react';

/** The runner's lifecycle phases. */
export type GamePhase = 'idle' | 'running' | 'hit' | 'paused';

export interface GameStateSnapshot {
  /** Current lifecycle phase. */
  phase: GamePhase;
  /** Stars collected (one per cleared obstacle). */
  score: number;
  /** World distance travelled, in px. */
  distance: number;
  /** Index into the chapter list that the current/last hit maps to. */
  currentChapterIndex: number;
  /** Chapter id of the obstacle the player most recently hit, if any. */
  hitChapterId: string | null;
}

export interface GameState extends GameStateSnapshot {
  /** Begin a fresh run from idle/hit/paused. Resets score and distance. */
  start: () => void;
  /** Record a collision with the given chapter and enter the `hit` phase. */
  hit: (chapterId: string) => void;
  /** Add a star (clearing an obstacle). */
  addScore: (amount?: number) => void;
  /** Advance the distance counter. */
  addDistance: (amount: number) => void;
  /** Suspend a running game. */
  pause: () => void;
  /** Resume a paused game back to running. */
  resume: () => void;
  /** Return to idle and clear all progress. */
  reset: () => void;
}

const INITIAL: GameStateSnapshot = {
  phase: 'idle',
  score: 0,
  distance: 0,
  currentChapterIndex: 0,
  hitChapterId: null,
};

/**
 * State machine for the runner.
 *
 * Transitions:
 *   idle    --start-->  running
 *   running --hit-->    hit        (also bumps chapter index + records id)
 *   running --pause-->  paused
 *   paused  --resume--> running
 *   *       --reset-->  idle
 *
 * Score and distance are also tracked here so the canvas and the HUD share a
 * single source of truth.
 */
export function useGameState(): GameState {
  const [state, setState] = useState<GameStateSnapshot>(INITIAL);
  // Monotonic counter so successive hits cycle through chapters predictably.
  const hitCountRef = useRef(0);

  const start = useCallback(() => {
    hitCountRef.current = 0;
    setState({ ...INITIAL, phase: 'running' });
  }, []);

  const hit = useCallback((chapterId: string) => {
    setState((prev) => {
      if (prev.phase !== 'running') return prev;
      const index = hitCountRef.current;
      hitCountRef.current += 1;
      return {
        ...prev,
        phase: 'hit',
        hitChapterId: chapterId,
        currentChapterIndex: index,
      };
    });
  }, []);

  const addScore = useCallback((amount = 1) => {
    setState((prev) => (prev.phase === 'running' ? { ...prev, score: prev.score + amount } : prev));
  }, []);

  const addDistance = useCallback((amount: number) => {
    setState((prev) =>
      prev.phase === 'running' ? { ...prev, distance: prev.distance + amount } : prev,
    );
  }, []);

  const pause = useCallback(() => {
    setState((prev) => (prev.phase === 'running' ? { ...prev, phase: 'paused' } : prev));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => (prev.phase === 'paused' ? { ...prev, phase: 'running' } : prev));
  }, []);

  const reset = useCallback(() => {
    hitCountRef.current = 0;
    setState(INITIAL);
  }, []);

  return { ...state, start, hit, addScore, addDistance, pause, resume, reset };
}
