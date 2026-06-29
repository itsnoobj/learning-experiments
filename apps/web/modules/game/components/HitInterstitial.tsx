'use client';

import { useRouter } from 'next/navigation';

export interface HitInterstitialProps {
  /** Chapter title shown next to the ⚡ icon. */
  title: string;
  /** The dilemma/problem statement. */
  situation: string;
  /**
   * Called when the player commits to reading the chapter. If provided, it runs
   * before navigation and can cancel it by returning `false`.
   */
  onContinue?: () => void | boolean;
  /** Chapter id, forwarded as a query param so the chapter page can deep-link. */
  chapterId?: string;
}

const GOLD = '#DAA520';

/**
 * Full-screen overlay shown when the runner enters the `hit` phase.
 *
 * Presents the chapter the player collided with — an ⚡ icon, the title, the
 * situation — and a single call to action that routes to the chapter reader
 * (`/chapter?from=game`). The reader can use the `from=game` flag to offer a
 * "back to game" affordance.
 */
export function HitInterstitial({ title, situation, onContinue, chapterId }: HitInterstitialProps) {
  const router = useRouter();

  const handleContinue = () => {
    const proceed = onContinue?.();
    if (proceed === false) return;

    const params = new URLSearchParams({ from: 'game' });
    if (chapterId) params.set('chapter', chapterId);
    router.push(`/chapter?${params.toString()}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hit-title"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(13, 13, 13, 0.88)',
        backdropFilter: 'blur(2px)',
        zIndex: 20,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderRadius: '0.75rem',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.5rem', color: GOLD }}>
            ⚡
          </span>
          <h2
            id="hit-title"
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
        </div>

        <p
          style={{
            margin: '0 0 1.75rem',
            color: '#cfcfcf',
            fontSize: '1rem',
            lineHeight: 1.55,
          }}
        >
          {situation}
        </p>

        <button
          type="button"
          onClick={handleContinue}
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '0.85rem 1.25rem',
            background: GOLD,
            color: '#0D0D0D',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Read &amp; Solve →
        </button>
      </div>
    </div>
  );
}
