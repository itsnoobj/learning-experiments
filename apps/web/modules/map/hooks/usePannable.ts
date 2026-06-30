'use client';

import { useCallback, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';

/** A 2D translation offset applied to the panned content. */
export interface PanOffset {
  x: number;
  y: number;
}

/** Pointer event handlers wired up by {@link usePannable}. */
export interface PannableHandlers {
  onMouseDown: (event: ReactMouseEvent) => void;
  onMouseMove: (event: ReactMouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (event: ReactTouchEvent) => void;
  onTouchMove: (event: ReactTouchEvent) => void;
  onTouchEnd: () => void;
}

/** Return shape of {@link usePannable}. */
export interface UsePannableResult<T extends HTMLElement = HTMLDivElement> {
  /** Ref to attach to the scroll/overflow container. */
  containerRef: React.RefObject<T | null>;
  /** Pointer handlers to spread onto the container. */
  handlers: PannableHandlers;
  /** Current pan offset, applied as a CSS translate on the panned child. */
  offset: PanOffset;
  /** Whether a drag is currently in progress (for cursor styling). */
  isDragging: boolean;
}

/** Movement (in px) beyond which a press is treated as a drag, not a click. */
const DRAG_THRESHOLD = 5;

/**
 * Drag-to-pan behaviour for an overflow container.
 *
 * Tracks mouse and touch drags and accumulates a translation `offset` that the
 * caller applies as a CSS `translate(...)` on the panned element. A press only
 * becomes a drag once the pointer moves more than {@link DRAG_THRESHOLD}px, so
 * small movements still register as clicks on child nodes.
 *
 * @returns refs, handlers, the current offset, and a dragging flag.
 */
export function usePannable<T extends HTMLElement = HTMLDivElement>(): UsePannableResult<T> {
  const containerRef = useRef<T | null>(null);
  const [offset, setOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Mutable drag state kept in a ref so handlers stay referentially stable and
  // don't trigger re-renders mid-drag.
  const state = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const begin = useCallback(
    (clientX: number, clientY: number) => {
      state.current.active = true;
      state.current.moved = false;
      state.current.startX = clientX;
      state.current.startY = clientY;
      state.current.originX = offset.x;
      state.current.originY = offset.y;
    },
    [offset.x, offset.y],
  );

  const move = useCallback((clientX: number, clientY: number) => {
    const s = state.current;
    if (!s.active) return;

    const dx = clientX - s.startX;
    const dy = clientY - s.startY;

    if (!s.moved && Math.hypot(dx, dy) <= DRAG_THRESHOLD) {
      // Below the threshold: still potentially a click, don't pan yet.
      return;
    }

    if (!s.moved) {
      s.moved = true;
      setIsDragging(true);
    }

    setOffset({ x: s.originX + dx, y: s.originY + dy });
  }, []);

  const end = useCallback(() => {
    state.current.active = false;
    state.current.moved = false;
    setIsDragging(false);
  }, []);

  const handlers: PannableHandlers = {
    onMouseDown: (event) => begin(event.clientX, event.clientY),
    onMouseMove: (event) => move(event.clientX, event.clientY),
    onMouseUp: end,
    onMouseLeave: end,
    onTouchStart: (event) => {
      const touch = event.touches[0];
      if (touch) begin(touch.clientX, touch.clientY);
    },
    onTouchMove: (event) => {
      const touch = event.touches[0];
      if (touch) move(touch.clientX, touch.clientY);
    },
    onTouchEnd: end,
  };

  return { containerRef, handlers, offset, isDragging };
}

export default usePannable;
