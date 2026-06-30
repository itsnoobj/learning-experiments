'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ROTATING_WORDS = [
  'manipulation',
  'difficult bosses',
  'team politics',
  'career crossroads',
  'broken trust',
  'ethical dilemmas',
  'ego traps',
  'unfair promotions',
  'passive aggression',
  'resistance to change',
];

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
      {/* Hero — the rotating text IS the headline */}
      <div style={{ maxWidth: '700px' }}>
        <p
          style={{
            fontSize: '0.85rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--color-text-dim)',
            marginBottom: '1.5rem',
          }}
        >
          A Field Guide to Being Human
        </p>

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
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: 'var(--color-text-dim)',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Ancient wisdom meets real-world dilemmas. Learn through stories from the Mahabharata,
          Lincoln, Mandela — then test yourself with interactive challenges.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '3rem',
            maxWidth: '320px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Link
            href="/worlds"
            className="cta-primary"
            style={{
              display: 'block',
              padding: '0.9rem 1.5rem',
              background: 'var(--color-gold)',
              color: '#1A1A1A',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              textAlign: 'center',
              borderRadius: 'var(--radius)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            Begin Your Journey →
          </Link>
          <Link
            href="/game"
            className="cta-secondary"
            style={{
              display: 'block',
              padding: '0.9rem 1.5rem',
              background: 'transparent',
              color: 'var(--color-text)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
              borderRadius: 'var(--radius)',
              transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
          >
            Jump Straight In →
          </Link>
        </div>
      </div>

      <style>{`
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(212, 175, 55, 0.35);
        }
        .cta-secondary:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }
      `}</style>
    </main>
  );
}
