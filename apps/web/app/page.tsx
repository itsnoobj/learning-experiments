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
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-primary)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image — switches with theme */}
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
            marginTop: '2rem',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: 'var(--color-text-dim)',
            maxWidth: '460px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Why do people resist change? Why does ego destroy teams?
          <br />
          Learn through stories from history, epics, and real life.
        </p>

        {/* Sample mission — curiosity hook */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.7rem 1.2rem',
            border: '1px solid var(--color-border)',
            display: 'inline-block',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            fontStyle: 'italic',
            background: 'var(--color-bg)',
          }}
        >
          <span
            style={{ color: 'var(--color-text-dim)', fontStyle: 'normal', marginRight: '0.5rem' }}
          >
            e.g.
          </span>
          &ldquo;{SAMPLE_MISSIONS[sampleIndex]}&rdquo;
        </div>

        {/* CTAs with previews */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '3rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Map entry */}
          <Link href="/worlds" style={{ textDecoration: 'none', flex: '1', minWidth: '250px' }}>
            <div
              className="glimpse-card"
              style={{
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <svg
                viewBox="0 0 300 100"
                style={{ width: '100%', display: 'block', background: 'var(--color-surface)' }}
              >
                <path
                  d="M30 80 Q70 40 130 55 Q190 75 240 35 Q270 22 285 28"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="3"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
                <circle
                  cx="30"
                  cy="80"
                  r="6"
                  fill="var(--color-gold)"
                  stroke="var(--color-text)"
                  strokeWidth="1"
                />
                <circle
                  cx="130"
                  cy="55"
                  r="6"
                  fill="var(--color-gold)"
                  stroke="var(--color-text)"
                  strokeWidth="1"
                />
                <circle
                  cx="240"
                  cy="35"
                  r="6"
                  fill="var(--color-text)"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                />
                <text x="75" y="68" fontSize="10" opacity="0.5">
                  🎪
                </text>
                <text x="185" y="48" fontSize="10" opacity="0.5">
                  🤝
                </text>
              </svg>
              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'var(--color-surface)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Explore the Map
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-dim)',
                    marginTop: '0.15rem',
                  }}
                >
                  Pick your problem. Read the story. Solve the challenge.
                </div>
              </div>
            </div>
          </Link>

          {/* Game entry */}
          <Link href="/game" style={{ textDecoration: 'none', flex: '1', minWidth: '250px' }}>
            <div
              className="glimpse-card"
              style={{
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <svg
                viewBox="0 0 300 100"
                style={{ width: '100%', display: 'block', background: 'var(--color-surface)' }}
              >
                <line
                  x1="0"
                  y1="85"
                  x2="300"
                  y2="85"
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="60"
                  r="5"
                  fill="none"
                  stroke="var(--color-text)"
                  strokeWidth="1.8"
                />
                <line
                  x1="50"
                  y1="65"
                  x2="50"
                  y2="77"
                  stroke="var(--color-text)"
                  strokeWidth="1.8"
                />
                <line
                  x1="50"
                  y1="77"
                  x2="45"
                  y2="85"
                  stroke="var(--color-text)"
                  strokeWidth="1.8"
                />
                <line
                  x1="50"
                  y1="77"
                  x2="55"
                  y2="85"
                  stroke="var(--color-text)"
                  strokeWidth="1.8"
                />
                <line
                  x1="50"
                  y1="69"
                  x2="57"
                  y2="66"
                  stroke="var(--color-text)"
                  strokeWidth="1.8"
                />
                <rect
                  x="130"
                  y="65"
                  width="16"
                  height="20"
                  fill="none"
                  stroke="var(--color-text-dim)"
                  strokeWidth="1.5"
                />
                <rect
                  x="200"
                  y="55"
                  width="12"
                  height="30"
                  fill="none"
                  stroke="var(--color-text-dim)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="260,85 266,60 272,85"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                />
                <text x="10" y="14" fontSize="8" fill="var(--color-gold)" fontWeight="600">
                  ★ 3
                </text>
              </svg>
              <div
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'var(--color-surface)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Play the Game
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-dim)',
                    marginTop: '0.15rem',
                  }}
                >
                  Run. Hit obstacles. Lessons find you.
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        .landing-bg {
          position: absolute;
          inset: 0;
          background-image: url('/assets/bg/landing-light.png');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          opacity: 0.15;
          pointer-events: none;
        }
        [data-theme="dark"] .landing-bg {
          background-image: url('/assets/bg/landing-dark.png');
          opacity: 0.3;
        }
        .glimpse-card {
          transition: border-color 0.2s, transform 0.2s;
        }
        .glimpse-card:hover {
          border-color: var(--color-gold) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}
