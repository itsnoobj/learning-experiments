'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

/**
 * Fixed top-right circular button that flips between light and dark themes.
 *
 * Uses the persisted theme store, which both writes `data-theme` on
 * <html> (via ThemeProvider) and saves the choice to localStorage. Shows a
 * sun (☀) in dark mode and a moon (☾) in light mode.
 */
export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);

  // Avoid a hydration mismatch: the persisted theme is only known on the
  // client, so render a stable placeholder icon until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';
  const icon = !mounted ? '' : isDark ? '☀' : '☾';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 50,
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border)',
        borderRadius: '9999px',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: '1rem',
        lineHeight: 1,
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}

export default ThemeToggle;
