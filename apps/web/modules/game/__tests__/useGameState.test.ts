import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('useGameState', () => {
  it('starts in the idle phase with zeroed counters', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.phase).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.distance).toBe(0);
    expect(result.current.hitChapterId).toBeNull();
  });

  it('transitions to running on start()', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.start());
    expect(result.current.phase).toBe('running');
  });

  it('transitions to hit and records the chapter on hit()', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.start());
    act(() => result.current.hit('31'));
    expect(result.current.phase).toBe('hit');
    expect(result.current.hitChapterId).toBe('31');
    expect(result.current.currentChapterIndex).toBe(0);
  });

  it('ignores hit() unless running', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.hit('31'));
    expect(result.current.phase).toBe('idle');
    expect(result.current.hitChapterId).toBeNull();
  });

  it('accumulates score and distance only while running', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.addScore(2));
    expect(result.current.score).toBe(0); // idle: ignored

    act(() => result.current.start());
    act(() => result.current.addScore());
    act(() => result.current.addDistance(50));
    expect(result.current.score).toBe(1);
    expect(result.current.distance).toBe(50);
  });

  it('pauses and resumes', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.start());
    act(() => result.current.pause());
    expect(result.current.phase).toBe('paused');
    act(() => result.current.resume());
    expect(result.current.phase).toBe('running');
  });

  it('advances the chapter index across successive runs/hits', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.start());
    act(() => result.current.hit('31'));
    expect(result.current.currentChapterIndex).toBe(0);

    // A fresh run resets the chapter cursor.
    act(() => result.current.start());
    act(() => result.current.hit('12'));
    expect(result.current.currentChapterIndex).toBe(0);
    expect(result.current.hitChapterId).toBe('12');
  });

  it('reset() returns to idle and clears progress', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.start());
    act(() => result.current.addScore(3));
    act(() => result.current.reset());
    expect(result.current.phase).toBe('idle');
    expect(result.current.score).toBe(0);
  });
});
