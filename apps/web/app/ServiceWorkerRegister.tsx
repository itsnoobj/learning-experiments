'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker and handles chunk-load failures.
 *
 * After a new deployment, users with a stale HTML shell may hit 404s for old
 * chunk filenames. This component detects `ChunkLoadError` and triggers a
 * single hard reload to fetch the fresh HTML.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failure is non-fatal; app works without offline support.
      });
    }

    // Handle chunk load failures — auto-reload once to get fresh HTML
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('ChunkLoadError') ||
        event.message?.includes('Loading chunk')
      ) {
        // Prevent infinite reload loop: only reload once per session
        const key = 'hd-chunk-reload';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return null;
}
