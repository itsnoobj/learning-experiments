'use client';

import { useState } from 'react';

/**
 * Small fixed button (next to theme toggle) that opens a popup
 * with "Have a story?" coming-soon message.
 */
export function ShareStoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share a story"
        title="Share a story"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '3.5rem',
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
          fontSize: '0.9rem',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ✍
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-story-title"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px',
              padding: '2rem',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                border: '1px solid var(--color-gold)',
                borderRadius: '999px',
                padding: '0.2rem 0.6rem',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Coming Soon
            </div>

            <h2
              id="share-story-title"
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 0.5rem',
              }}
            >
              Have a story?
            </h2>

            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--color-text-dim)',
                margin: '0 0 1.5rem',
              }}
            >
              Know a story from history, mythology, or real life that taught you
              something about human nature? We&rsquo;re building this together.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: '0.5rem 1.2rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-bg)',
                background: 'var(--color-gold)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
