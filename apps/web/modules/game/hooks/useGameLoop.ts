'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** A frame callback. `delta` is milliseconds since the previous frame. */
export type FrameCallback = (delta: number) => void;

export interface GameLoop {
  /** Begin (or restart) the loop. */
  start: () => void;
  /** Halt the loop and forget timing. */
  pause: () => void;
  /** Resume after a pause without a delta spike. */
  resume: () => void;
  /** Whether the loop is currently scheduling frames. */
  isRunning: boolean;
}

/**
 * Drive an animation loop with requestAnimationFrame.
 *
 * The supplied `onFrame` is invoked once per frame with the elapsed time since
 * the last frame. The callback is held in a ref so the loop never has to be
 * torn down when the callback identity changes — keeping the rAF chain stable
 * across React re-renders.
 *
 * @param onFrame invoked every frame with the millisecond delta.
 */
export function useGameLoop(onFrame: FrameCallback): GameLoop {
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const callbackRef = useRef(onFrame);

  // Always call the latest callback without restarting the loop.
  useEffect(() => {
    callbackRef.current = onFrame;
  }, [onFrame]);

  const tick = useCallback((time: number) => {
    if (!runningRef.current) return;

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
    }
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    callbackRef.current(delta);

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = null;
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = null; // avoid a huge delta after the pause
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { start, pause, resume, isRunning };
}
