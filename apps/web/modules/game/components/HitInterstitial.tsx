'use client';

import { useRouter } from 'next/navigation';

export interface HitInterstitialProps {
  /** Chapter title shown beneath the headline. */
  title: string;
  /** The dilemma/problem statement, shown as a short question/description. */
  situation: string;
  /**
   * Called when the player commits to reading the chapter. If provided, it runs
   * before navigation and can cancel it by returning `false`.
   */
  onContinue?: () => void | boolean;
  /** Chapter id, forwarded as a query param so the chapter page can deep-link. */
  chapterId?: string;
}

const GOLD = 'var(--color-gold)';

/** Keyframes for the game-event entrance. Injected once via a <style> tag. */
const KEYFRAMES = `
@keyframes hit-shake-in {
  0%   { transform: translateX(-3px); }
  33%  { transform: translateX(3px); }
  66%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}
@keyframes hit-scale-in {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes hit-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes hit-glow-pulse {
  0%, 100% { text-shadow: 0 0 6px rgba(212, 175, 55, 0.45), 0 0 2px rgba(212, 175, 55, 0.6); }
  50%      { text-shadow: 0 0 18px rgba(212, 175, 55, 0.85), 0 0 6px rgba(212, 175, 55, 0.9); }
}
@keyframes hit-bolt-pulse {
  0%, 100% { transform: scale(1) rotate(-4deg); }
  25%      { transform: scale(1.18) rotate(4deg); }
  50%      { transform: scale(1.05) rotate(-2deg); }
  75%      { transform: scale(1.12) rotate(2deg); }
}
`;

/**
 * Full-screen game-event popup shown when the runner enters the `hit` phase.
 *
 * Reads less like a dialog box and more like a dramatic in-game event: the
 * background gives a quick screen-shake, the card scales in, an ⚡ pulses, and
 * an "OBSTACLE HIT!" headline glows. The mission title and situation are shown
 * as the challenge prompt, with a single call to action routing to the chapter
 * reader (`/chapter?from=game`).
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
        background: 'radial-gradient(circle at center, rgba(40, 30, 0, 0.55), rgba(0, 0, 0, 0.78))',
        backdropFilter: 'blur(3px)',
        zIndex: 20,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: '1.5rem',
        animation: 'hit-shake-in 0.3s ease-out, hit-fade-in 0.2s ease-out',
      }}
    >
      <style>{KEYFRAMES}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(180deg, #1c1c1c 0%, #121212 100%)',
          border: `1px solid ${GOLD}`,
          borderRadius: '0px',
          padding: '2.25rem 1.75rem 2rem',
          textAlign: 'center',
          boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.15), 0 24px 70px rgba(0, 0, 0, 0.6)',
          animation: 'hit-scale-in 0.3s ease-out both',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontSize: '3rem',
            lineHeight: 1,
            color: GOLD,
            display: 'inline-block',
            marginBottom: '0.5rem',
            animation: 'hit-bolt-pulse 0.9s ease-in-out infinite',
            filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
          }}
        >
          ⚡
        </div>

        <div
          style={{
            color: GOLD,
            fontSize: 'clamp(1.6rem, 5vw, 2.1rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.85rem',
            animation: 'hit-glow-pulse 1.6s ease-in-out infinite',
          }}
        >
          Obstacle Hit!
        </div>

        <h2
          id="hit-title"
          style={{
            margin: '0 0 0.5rem',
            color: 'var(--color-text)',
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '0 auto',
            maxWidth: '340px',
            color: 'var(--color-text-dim)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {situation}
        </p>

        <div
          style={{
            height: '1px',
            width: '100%',
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            margin: '1.5rem 0',
          }}
        />

        <button
          type="button"
          onClick={handleContinue}
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '0.9rem 1.25rem',
            background: GOLD,
            color: '#0D0D0D',
            border: 'none',
            borderRadius: '0px',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Accept the Challenge →
        </button>
      </div>
    </div>
  );
}
