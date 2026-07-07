'use client';

import { useEffect, useState } from 'react';

interface AudioToggleProps {
  muted: boolean;
  onToggle: () => void;
}

/**
 * Minimal mute/unmute button for the game HUD.
 * Uses simple unicode icons to avoid asset dependencies.
 * Only renders after mount to avoid SSR hydration mismatch (muted state comes
 * from localStorage which isn't available server-side).
 */
export function AudioToggle({ muted, onToggle }: AudioToggleProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        zIndex: 20,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        background: 'var(--color-surface, rgba(0,0,0,0.4))',
        color: 'var(--color-text)',
        fontSize: '1rem',
        lineHeight: 1,
        cursor: 'pointer',
        opacity: 0.7,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.opacity = '0.7';
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
