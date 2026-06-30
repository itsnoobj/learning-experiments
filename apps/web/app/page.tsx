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
      }}
    >
      <div style={{ maxWidth: '700px' }}>
        {/* Hero — rotating text IS the headline */}
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

        {/* Simplified subtext — one idea per line */}
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

        {/* Sample mission — social proof / curiosity hook */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.7rem 1.2rem',
            border: '1px solid var(--color-border)',
            display: 'inline-block',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            fontStyle: 'italic',
          }}
        >
          <span
            style={{ color: 'var(--color-text-dim)', fontStyle: 'normal', marginRight: '0.5rem' }}
          >
            e.g.
          </span>
          &ldquo;{SAMPLE_MISSIONS[sampleIndex]}&rdquo;
        </div>

        {/* CTAs with visual previews */}
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
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              <svg
                viewBox="0 0 300 120"
                style={{ width: '100%', display: 'block', background: '#1A1A1A' }}
              >
                <path
                  d="M30 95 Q70 50 130 70 Q190 90 240 45 Q270 30 285 35"
                  fill="none"
                  stroke="#DAA520"
                  strokeWidth="3"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
                <circle cx="30" cy="95" r="7" fill="#DAA520" stroke="#FFF" strokeWidth="1.5" />
                <circle cx="130" cy="70" r="7" fill="#DAA520" stroke="#FFF" strokeWidth="1.5" />
                <circle cx="240" cy="45" r="7" fill="#FFF" stroke="#DAA520" strokeWidth="2" />
                <path d="M80 35 l-5 10 h10 z" stroke="#555" strokeWidth="1" fill="none" />
                <path d="M190 25 l-4 8 h8 z" stroke="#555" strokeWidth="1" fill="none" />
                <text x="75" y="82" fontSize="11" opacity="0.5">
                  🎪
                </text>
                <text x="190" y="58" fontSize="11" opacity="0.5">
                  🤝
                </text>
              </svg>
              <div
                style={{
                  padding: '0.7rem 0.8rem',
                  background: 'var(--color-surface)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Explore the Map
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-dim)',
                    marginTop: '0.2rem',
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
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              <svg
                viewBox="0 0 300 120"
                style={{ width: '100%', display: 'block', background: '#0D0D0D' }}
              >
                <line x1="0" y1="105" x2="300" y2="105" stroke="#333" strokeWidth="1" />
                <circle cx="55" cy="76" r="5" fill="none" stroke="#FFF" strokeWidth="2" />
                <line x1="55" y1="81" x2="55" y2="93" stroke="#FFF" strokeWidth="2" />
                <line x1="55" y1="93" x2="50" y2="105" stroke="#FFF" strokeWidth="2" />
                <line x1="55" y1="93" x2="60" y2="105" stroke="#FFF" strokeWidth="2" />
                <line x1="55" y1="85" x2="62" y2="82" stroke="#FFF" strokeWidth="2" />
                <rect
                  x="130"
                  y="82"
                  width="18"
                  height="23"
                  fill="none"
                  stroke="#666"
                  strokeWidth="1.5"
                />
                <rect
                  x="200"
                  y="72"
                  width="14"
                  height="33"
                  fill="none"
                  stroke="#666"
                  strokeWidth="1.5"
                />
                <polygon
                  points="260,105 266,78 272,105"
                  fill="none"
                  stroke="#DAA520"
                  strokeWidth="1.5"
                />
                <ellipse cx="95" cy="25" rx="18" ry="7" fill="none" stroke="#333" strokeWidth="1" />
                <ellipse
                  cx="220"
                  cy="18"
                  rx="14"
                  ry="5"
                  fill="none"
                  stroke="#333"
                  strokeWidth="1"
                />
                <text x="10" y="15" fontSize="9" fill="#DAA520" fontWeight="600">
                  ★ 3
                </text>
              </svg>
              <div
                style={{
                  padding: '0.7rem 0.8rem',
                  background: 'var(--color-surface)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  Play the Game
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-dim)',
                    marginTop: '0.2rem',
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
        .glimpse-card:hover {
          border-color: var(--color-gold) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}
