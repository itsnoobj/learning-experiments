'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ROTATING_WORDS = [
  'manipulation',
  'difficult bosses',
  'team politics',
  'broken trust',
  'ego traps',
  'passive aggression',
  'resistance to change',
  'unfair promotions',
  'ethical dilemmas',
  'office politics',
];

const SAMPLE_MISSIONS = [
  'Why your manager hoards information',
  'Why nobody owns the problem',
  'How to handle someone who plays victim',
  'Why smart people stop learning',
  'When to stay vs. when to leave',
];

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [sampleIndex, setSampleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSampleIndex((i) => (i + 1) % SAMPLE_MISSIONS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '6vh',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        paddingBottom: '0',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-primary)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Background image */}
      <div className="landing-bg" />

      {/* Content */}
      <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--color-text)',
            marginBottom: '0.5rem',
          }}
        >
          Stories to navigate
        </h1>

        <div
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            minHeight: '1.3em',
            color: 'var(--color-gold)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {ROTATING_WORDS[wordIndex]}
        </div>

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--color-text-dim)',
          }}
        >
          Learn through stories from history, epics, and real life.
        </p>

        {/* CTAs — blended with background */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '2rem',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Map entry */}
          <Link
            href="/worlds"
            className="glimpse-card"
            style={{
              textDecoration: 'none',
              flex: '1',
              minWidth: '200px',
              border: 'none',
              overflow: 'visible',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              position: 'relative',
            }}
          >
            {/* Click indicator */}

            <svg
              className="blob-border"
              viewBox="0 0 200 120"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M20 8 C60 2, 100 5, 150 4 C175 3, 192 12, 195 30 C198 55, 196 80, 192 95 C188 108, 170 116, 140 117 C100 118, 60 119, 30 116 C12 114, 4 105, 3 90 C2 70, 1 45, 4 25 C7 12, 14 9, 20 8 Z"
                stroke="var(--color-text-dim)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>
            <svg
              className="click-hand"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-dim)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '22px',
                height: '22px',
                pointerEvents: 'none',
              }}
            >
              <path d="M7 15V8.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M10 10a1.5 1.5 0 0 1 3 0v1" />
              <path d="M13 9.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M16 10.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5v-2" />
            </svg>
            <svg viewBox="0 0 300 110" style={{ width: '100%', display: 'block' }}>
              <path
                d="M25 85 Q65 40 135 58 Q195 78 245 38 Q275 22 290 30"
                fill="none"
                stroke="#DAA520"
                strokeWidth="3"
                strokeDasharray="2 8"
                strokeLinecap="round"
              />
              <circle
                cx="25"
                cy="85"
                r="6"
                fill="#DAA520"
                stroke="var(--color-text-dim)"
                strokeWidth="1"
              />
              <circle
                cx="135"
                cy="58"
                r="6"
                fill="#DAA520"
                stroke="var(--color-text-dim)"
                strokeWidth="1"
              />
              <circle cx="245" cy="38" r="7" fill="none" stroke="#DAA520" strokeWidth="2">
                <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="1;0.6;1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="245" cy="38" r="4" fill="#FFF" />
              <text x="80" y="72" fontSize="11" opacity="0.5">
                🎪
              </text>
              <text x="190" y="52" fontSize="11" opacity="0.5">
                🤝
              </text>
            </svg>
            <div style={{ padding: '0.7rem 1rem', borderTop: 'none' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Explore the Map
              </div>
              <div
                style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}
              >
                Pick your problem. Read the story. Solve the challenge.
              </div>
            </div>
          </Link>

          {/* Game entry */}
          <Link
            href="/game"
            className="glimpse-card"
            style={{
              textDecoration: 'none',
              flex: '1',
              minWidth: '200px',
              border: 'none',
              overflow: 'visible',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              position: 'relative',
            }}
          >
            {/* Click indicator */}

            <svg
              className="blob-border"
              viewBox="0 0 200 120"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M20 8 C60 2, 100 5, 150 4 C175 3, 192 12, 195 30 C198 55, 196 80, 192 95 C188 108, 170 116, 140 117 C100 118, 60 119, 30 116 C12 114, 4 105, 3 90 C2 70, 1 45, 4 25 C7 12, 14 9, 20 8 Z"
                stroke="var(--color-text-dim)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>
            <svg
              className="click-hand"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-dim)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '22px',
                height: '22px',
                pointerEvents: 'none',
              }}
            >
              <path d="M7 15V8.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M10 10a1.5 1.5 0 0 1 3 0v1" />
              <path d="M13 9.5a1.5 1.5 0 0 1 3 0V13" />
              <path d="M16 10.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5v-2" />
            </svg>
            <svg viewBox="0 0 300 110" style={{ width: '100%', display: 'block' }}>
              <line x1="0" y1="95" x2="300" y2="95" stroke="var(--color-border)" strokeWidth="1" />
              {/* Stick figure with bobbing */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0;0,-3;0,0"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <circle
                  cx="55"
                  cy="55"
                  r="6"
                  fill="none"
                  stroke="var(--color-text-dim)"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="61"
                  x2="55"
                  y2="78"
                  stroke="var(--color-text-dim)"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="78"
                  x2="49"
                  y2="95"
                  stroke="var(--color-text-dim)"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="78"
                  x2="61"
                  y2="95"
                  stroke="var(--color-text-dim)"
                  strokeWidth="2"
                />
                <line
                  x1="55"
                  y1="68"
                  x2="63"
                  y2="64"
                  stroke="var(--color-text-dim)"
                  strokeWidth="2"
                />
              </g>
              {/* Obstacles */}
              <rect
                x="140"
                y="72"
                width="18"
                height="23"
                fill="none"
                stroke="var(--color-text-dim)"
                strokeWidth="1.5"
              />
              <rect
                x="210"
                y="60"
                width="14"
                height="35"
                fill="none"
                stroke="var(--color-text-dim)"
                strokeWidth="1.5"
              />
              <polygon
                points="270,95 277,62 284,95"
                fill="none"
                stroke="#DAA520"
                strokeWidth="1.5"
              />
              {/* Score */}
              <text x="12" y="18" fontSize="9" fill="#DAA520" fontWeight="600">
                ★ 3
              </text>
            </svg>
            <div style={{ padding: '0.7rem 1rem', borderTop: 'none' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Play the Game
              </div>
              <div
                style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}
              >
                Run. Hit obstacles. Lessons find you.
              </div>
            </div>
          </Link>
        </div>

        {/* Sample mission — below cards */}
        <div
          className="sample-mission"
          style={{
            marginTop: '5rem',
            padding: '0.6rem 0',
            border: 'none',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            fontStyle: 'italic',
            background: 'none',
            display: 'block',
            textAlign: 'center',
            maxWidth: '25ch',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span
            style={{ color: 'var(--color-text-dim)', fontStyle: 'normal', marginRight: '0.5rem' }}
          >
            e.g.
          </span>
          &ldquo;{SAMPLE_MISSIONS[sampleIndex]}&rdquo;
        </div>
      </div>

      <style>{`
        .landing-bg {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 40%;
          background-color: #FFFFFF;
          background-image: url('/assets/bg/landing-light.png');
          background-size: contain;
          background-position: bottom center;
          background-repeat: no-repeat;
          opacity: 0.5;
          pointer-events: none;
        }
        [data-theme="dark"] .landing-bg {
          background-color: #000000;
          background-image: url("/assets/bg/landing-dark.png");
          opacity: 0.6;
        }
        [data-theme="dark"] main {
          background: #000000 !important;
        }
        [data-theme="light"] main,
        :root:not([data-theme="dark"]) main {
          background: #FFFFFF !important;
        }
        .glimpse-card {
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          display: block;
        }
        @media (max-width: 600px) { .sample-mission { margin-top: 2rem !important; } .glimpse-card { min-width: 100% !important; } .glimpse-card svg { max-height: 55px !important; } .glimpse-card > div { padding: 0.4rem 0.6rem !important; } .click-hand { opacity: 0.6; width: 18px !important; height: 18px !important; top: -8px !important; right: -8px !important; }
         } .glimpse-card:hover {
          border-color: rgba(218, 165, 32, 0.4) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(218, 165, 32, 0.1);
        }
        .glimpse-card {
          position: relative;
        }
        .glimpse-card .blob-border {
          position: absolute;
          inset: -8px;
          width: calc(100% + 16px);
          height: calc(100% + 16px);
          pointer-events: none;
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .glimpse-card:hover .blob-border {
          opacity: 0.8;
        }
        .click-hand { opacity: 0.6;
          animation: clickShake 0.8s ease-in-out infinite;
        }
        @keyframes clickShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(4px) rotate(5deg); }
          30% { transform: translateX(-3px) rotate(-4deg); }
          45% { transform: translateX(3px) rotate(3deg); }
          60% { transform: translateX(-4px) rotate(-5deg); }
          75% { transform: translateX(2px) rotate(2deg); }
          90% { transform: translateX(-2px) rotate(-2deg); }
        }
      `}</style>
    </main>
  );
}
