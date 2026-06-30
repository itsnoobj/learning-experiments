'use client';

import { useState } from 'react';
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

const GOLD = '#DAA520';
const WHITE = '#FFFFFF';
const GREY = '#CCCCCC';

/** Randomly picked obstacle scene illustration for the hit interstitial. */
function ObstacleIcon() {
  const icons = [StoneSvg, BoulderSvg, TreeSvg, PitSvg, CrackedWallSvg];
  const [Icon] = useState(() => icons[Math.floor(Math.random() * icons.length)]);
  return <Icon />;
}

const ICON_COLOR = WHITE;

function StoneSvg() {
  // Scene: scattered rocks and stones blocking the path
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="78" x2="160" y2="78" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Large stone center */}
      <path
        d="M60 75 C50 70, 48 55, 55 45 C62 35, 75 32, 85 34 C95 36, 102 44, 100 55 C98 65, 90 75, 80 76 C70 77, 63 76, 60 75 Z"
        fill="rgba(255, 255, 255, 0.06)"
        stroke={ICON_COLOR}
        strokeWidth="2"
      />
      <path
        d="M70 42 L75 52 L70 60"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      {/* Medium stone left */}
      <path
        d="M20 76 C15 72, 14 62, 18 56 C22 50, 30 48, 38 50 C44 52, 46 60, 44 68 C42 74, 35 77, 28 77 Z"
        fill="rgba(255, 255, 255, 0.05)"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
      />
      <path
        d="M28 54 L30 62"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* Medium stone right */}
      <path
        d="M115 76 C110 72, 112 60, 118 54 C124 48, 135 47, 140 52 C145 57, 144 68, 140 73 C136 77, 125 78, 115 76 Z"
        fill="rgba(255, 255, 255, 0.05)"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
      />
      <path
        d="M128 52 L126 62"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.5"
        strokeLinecap="round"
      />
      {/* Small stones scattered */}
      <ellipse
        cx="48"
        cy="74"
        rx="5"
        ry="4"
        stroke={ICON_COLOR}
        strokeWidth="1.2"
        fill="rgba(255,255,255,0.04)"
      />
      <ellipse
        cx="105"
        cy="74"
        rx="4"
        ry="3"
        stroke={ICON_COLOR}
        strokeWidth="1.2"
        fill="rgba(255,255,255,0.04)"
      />
      <ellipse
        cx="145"
        cy="75"
        rx="3"
        ry="2.5"
        stroke={ICON_COLOR}
        strokeWidth="1"
        fill="rgba(255,255,255,0.03)"
      />
      <ellipse
        cx="10"
        cy="75"
        rx="3.5"
        ry="2.5"
        stroke={ICON_COLOR}
        strokeWidth="1"
        fill="rgba(255,255,255,0.03)"
      />
    </svg>
  );
}

function BoulderSvg() {
  // Scene: multiple boulders piled up / scattered
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="80" x2="160" y2="80" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Large boulder back-center */}
      <ellipse
        cx="80"
        cy="48"
        rx="28"
        ry="24"
        fill="rgba(255, 255, 255, 0.04)"
        stroke={ICON_COLOR}
        strokeWidth="2.2"
      />
      <path
        d="M62 44 Q72 38, 82 42"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M80 34 Q90 30, 98 36"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* Medium boulder front-left */}
      <ellipse
        cx="42"
        cy="64"
        rx="20"
        ry="15"
        fill="rgba(255, 255, 255, 0.05)"
        stroke={ICON_COLOR}
        strokeWidth="2"
      />
      <path
        d="M32 60 Q38 56, 46 58"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* Medium boulder front-right */}
      <ellipse
        cx="118"
        cy="62"
        rx="18"
        ry="14"
        fill="rgba(255, 255, 255, 0.05)"
        stroke={ICON_COLOR}
        strokeWidth="2"
      />
      <path
        d="M108 58 Q115 55, 124 57"
        stroke={ICON_COLOR}
        strokeWidth="1"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* Small boulder top-left */}
      <ellipse
        cx="35"
        cy="40"
        rx="12"
        ry="10"
        fill="rgba(255, 255, 255, 0.04)"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
      />
      {/* Small boulder top-right */}
      <ellipse
        cx="125"
        cy="38"
        rx="11"
        ry="9"
        fill="rgba(255, 255, 255, 0.04)"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
      />
      {/* Tiny pebbles */}
      <circle
        cx="68"
        cy="76"
        r="3"
        stroke={ICON_COLOR}
        strokeWidth="1"
        fill="rgba(255,255,255,0.03)"
      />
      <circle
        cx="95"
        cy="77"
        r="2.5"
        stroke={ICON_COLOR}
        strokeWidth="1"
        fill="rgba(255,255,255,0.03)"
      />
      {/* Impact lines from pile */}
      <line
        x1="80"
        y1="18"
        x2="80"
        y2="10"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="52"
        y1="22"
        x2="46"
        y2="16"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="108"
        y1="22"
        x2="114"
        y2="16"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

function TreeSvg() {
  // Scene: cluster of trees / fallen trees blocking path
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="82" x2="160" y2="82" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Tree 1 - large center */}
      <rect
        x="75"
        y="55"
        width="10"
        height="26"
        rx="2"
        fill="rgba(255,255,255,0.06)"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
      />
      <path
        d="M80 10 C92 14, 105 22, 105 35 C105 45, 98 52, 90 55 C84 57, 76 57, 70 55 C62 52, 55 45, 55 35 C55 22, 68 14, 80 10 Z"
        fill="rgba(255,255,255,0.04)"
        stroke={ICON_COLOR}
        strokeWidth="2"
      />
      {/* Tree 2 - medium left */}
      <rect
        x="28"
        y="52"
        width="8"
        height="28"
        rx="1.5"
        fill="rgba(255,255,255,0.05)"
        stroke={ICON_COLOR}
        strokeWidth="1.2"
      />
      <path
        d="M32 18 C40 20, 50 28, 50 38 C50 45, 44 50, 38 52 C34 54, 30 54, 26 52 C20 50, 14 45, 14 38 C14 28, 24 20, 32 18 Z"
        fill="rgba(255,255,255,0.03)"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
      />
      {/* Tree 3 - medium right */}
      <rect
        x="125"
        y="50"
        width="8"
        height="30"
        rx="1.5"
        fill="rgba(255,255,255,0.05)"
        stroke={ICON_COLOR}
        strokeWidth="1.2"
      />
      <path
        d="M129 15 C138 18, 148 26, 148 36 C148 44, 142 49, 136 51 C132 53, 126 53, 122 51 C116 49, 110 44, 110 36 C110 26, 120 18, 129 15 Z"
        fill="rgba(255,255,255,0.03)"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
      />
      {/* Fallen branches / debris */}
      <line
        x1="48"
        y1="78"
        x2="66"
        y2="72"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        opacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="94"
        y1="76"
        x2="110"
        y2="72"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* Leaves / debris dots */}
      <circle cx="58" cy="80" r="2" fill={ICON_COLOR} opacity="0.25" />
      <circle cx="102" cy="80" r="2" fill={ICON_COLOR} opacity="0.2" />
      <circle cx="140" cy="82" r="1.5" fill={ICON_COLOR} opacity="0.2" />
      <circle cx="8" cy="80" r="1.5" fill={ICON_COLOR} opacity="0.15" />
    </svg>
  );
}

function PitSvg() {
  // Scene: ground with multiple pits / chasms
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {/* Ground surface segments */}
      <path d="M0 45 L20 45" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" />
      <path d="M55 45 L70 45" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" />
      <path d="M105 45 L120 45" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" />
      <path d="M150 45 L160 45" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" />
      {/* Pit 1 - large center */}
      <path
        d="M55 45 L58 52 L62 48 L68 56 L72 50 L76 58 L80 52 L84 48 L88 55 L92 49 L96 56 L100 50 L105 45"
        stroke={ICON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 52 L62 48 L68 56 L72 50 L76 58 L80 52 L84 48 L88 55 L92 49 L96 56 L100 50 L105 45 L105 75 Q80 85, 55 75 L55 45 Z"
        fill="rgba(0,0,0,0.55)"
        stroke="none"
      />
      {/* Pit 2 - small left */}
      <path
        d="M20 45 L24 50 L28 47 L32 53 L36 48 L40 52 L44 47 L48 51 L55 45"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 50 L28 47 L32 53 L36 48 L40 52 L44 47 L48 51 L55 45 L55 65 Q38 72, 20 65 L20 45 Z"
        fill="rgba(0,0,0,0.45)"
        stroke="none"
      />
      {/* Pit 3 - small right */}
      <path
        d="M120 45 L124 51 L128 47 L132 53 L136 49 L140 54 L144 48 L150 45"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M124 51 L128 47 L132 53 L136 49 L140 54 L144 48 L150 45 L150 65 Q135 72, 120 65 L120 45 Z"
        fill="rgba(0,0,0,0.45)"
        stroke="none"
      />
      {/* Danger lines */}
      <line
        x1="75"
        y1="32"
        x2="73"
        y2="24"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="80"
        y1="30"
        x2="80"
        y2="22"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="85"
        y1="32"
        x2="87"
        y2="24"
        stroke={ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function CrackedWallSvg() {
  // Scene: multiple wall segments / barricade
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
      {/* Ground line */}
      <line x1="0" y1="80" x2="160" y2="80" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Wall segment 1 - tall center */}
      <rect
        x="55"
        y="15"
        width="50"
        height="62"
        rx="2"
        fill="rgba(255,255,255,0.04)"
        stroke={ICON_COLOR}
        strokeWidth="2"
      />
      <line x1="55" y1="30" x2="105" y2="30" stroke={ICON_COLOR} strokeWidth="1" opacity="0.25" />
      <line x1="55" y1="45" x2="105" y2="45" stroke={ICON_COLOR} strokeWidth="1" opacity="0.25" />
      <line x1="55" y1="60" x2="105" y2="60" stroke={ICON_COLOR} strokeWidth="1" opacity="0.25" />
      <line x1="80" y1="15" x2="80" y2="30" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="68" y1="30" x2="68" y2="45" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="92" y1="45" x2="92" y2="60" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="80" y1="60" x2="80" y2="77" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Crack in center wall */}
      <path
        d="M76 15 L80 25 L74 30 L78 38 L72 45 L77 52 L70 60 L76 70 L72 77"
        stroke={ICON_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Wall segment 2 - shorter left */}
      <rect
        x="10"
        y="35"
        width="35"
        height="42"
        rx="2"
        fill="rgba(255,255,255,0.03)"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
      />
      <line x1="10" y1="50" x2="45" y2="50" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="10" y1="65" x2="45" y2="65" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="28" y1="35" x2="28" y2="50" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Wall segment 3 - shorter right */}
      <rect
        x="115"
        y="30"
        width="35"
        height="47"
        rx="2"
        fill="rgba(255,255,255,0.03)"
        stroke={ICON_COLOR}
        strokeWidth="1.8"
      />
      <line x1="115" y1="45" x2="150" y2="45" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="115" y1="60" x2="150" y2="60" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      <line x1="132" y1="30" x2="132" y2="45" stroke={ICON_COLOR} strokeWidth="1" opacity="0.2" />
      {/* Debris at base */}
      <rect
        x="48"
        y="80"
        width="4"
        height="4"
        fill={ICON_COLOR}
        opacity="0.3"
        transform="rotate(15 50 82)"
      />
      <rect
        x="108"
        y="80"
        width="3"
        height="3"
        fill={ICON_COLOR}
        opacity="0.25"
        transform="rotate(-10 109 81)"
      />
      <rect
        x="78"
        y="80"
        width="3.5"
        height="3.5"
        fill={ICON_COLOR}
        opacity="0.3"
        transform="rotate(20 79 81)"
      />
    </svg>
  );
}

const KEYFRAMES = `
@keyframes hit-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes hit-card-in {
  0%   { transform: scale(0.85) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes hit-slam-in {
  0%   { transform: scale(1.6); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes hit-rise-in {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes hit-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
@keyframes hit-pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
`;

/**
 * Transparent modal overlay shown when the runner hits an obstacle. The frozen
 * game world stays visible behind a semi-transparent backdrop. A floating card
 * with organic blob border (matching the landing page style) presents the
 * challenge with visual energy — impact icon, shake animation, gold accents.
 */
export function HitInterstitial({ title, situation, onContinue, chapterId }: HitInterstitialProps) {
  const router = useRouter();
  const [hover, setHover] = useState(false);

  const handleContinue = () => {
    const proceed = onContinue?.();
    if (proceed === false) return;

    const params = new URLSearchParams({ from: 'game' });
    const target = chapterId ? `/chapter/${chapterId}` : '/chapter';
    router.push(`${target}?${params.toString()}`);
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
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 20,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        textAlign: 'center',
        padding: '1.5rem',
        animation: 'hit-backdrop-in 0.25s ease-out',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Floating card with organic blob border */}
      <div
        style={{
          position: 'relative',
          maxWidth: '380px',
          width: '100%',
          padding: '2.5rem 2rem 2rem',
          animation: 'hit-card-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        {/* Blob border SVG — organic hand-drawn shape around the card */}
        <svg
          viewBox="0 0 380 320"
          fill="none"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: '-8px',
            width: 'calc(100% + 16px)',
            height: 'calc(100% + 16px)',
            pointerEvents: 'none',
          }}
        >
          <path
            d="M30 12 C90 4, 180 6, 270 5 C320 4, 360 14, 368 40 C376 80, 374 160, 372 240 C370 275, 350 308, 300 314 C220 320, 120 318, 60 315 C25 312, 10 295, 8 260 C5 200, 4 100, 8 50 C12 22, 20 13, 30 12 Z"
            stroke={GOLD}
            strokeWidth="2"
            strokeDasharray="5 4"
            opacity="0.7"
          />
        </svg>

        {/* Obstacle scene illustration */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            animation: 'hit-shake 0.4s ease-out',
          }}
        >
          <ObstacleIcon />
        </div>

        {/* Headline */}
        <div
          aria-hidden="true"
          style={{
            color: GOLD,
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '3px',
            animation: 'hit-slam-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
          }}
        >
          Obstacle Hit!
        </div>

        {/* Chapter title */}
        <h2
          id="hit-title"
          style={{
            margin: '1rem 0 0',
            color: WHITE,
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            animation: 'hit-rise-in 0.35s ease-out 0.12s both',
          }}
        >
          {title}
        </h2>

        {/* Situation text */}
        <p
          style={{
            margin: '0.75rem auto 0',
            maxWidth: '320px',
            color: GREY,
            fontSize: '0.9rem',
            lineHeight: 1.5,
            animation: 'hit-rise-in 0.35s ease-out 0.2s both',
          }}
        >
          {situation}
        </p>

        {/* Stick figure holding a question mark — visual energy */}
        <svg
          width="40"
          height="50"
          viewBox="0 0 40 50"
          fill="none"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '55px',
            right: '15px',
            opacity: 0.4,
          }}
          stroke={GREY}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {/* head */}
          <circle cx="20" cy="8" r="5" />
          {/* body */}
          <line x1="20" y1="13" x2="20" y2="30" />
          {/* arms up (confused/surprised) */}
          <line x1="20" y1="20" x2="12" y2="15" />
          <line x1="20" y1="20" x2="28" y2="15" />
          {/* legs */}
          <line x1="20" y1="30" x2="15" y2="42" />
          <line x1="20" y1="30" x2="25" y2="42" />
          {/* question mark above */}
          <text x="26" y="6" fontSize="8" fill={GOLD} stroke="none" fontWeight="bold">
            ?
          </text>
        </svg>

        {/* CTA button */}
        <button
          type="button"
          onClick={handleContinue}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          style={{
            marginTop: '1.75rem',
            padding: '0.75rem 1.5rem',
            background: hover ? GOLD : 'rgba(218, 165, 32, 0.12)',
            color: hover ? '#0D0D0D' : GOLD,
            border: `2px solid ${GOLD}`,
            borderRadius: '0px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.18s ease, color 0.18s ease',
            animation: 'hit-rise-in 0.35s ease-out 0.3s both',
          }}
        >
          Accept the Challenge →
        </button>
      </div>
    </div>
  );
}
