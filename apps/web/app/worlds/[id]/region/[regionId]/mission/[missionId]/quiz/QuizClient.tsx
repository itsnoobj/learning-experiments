'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { QuizShell } from '@/modules/quiz';
import type { QuizChallenge } from '@field-guide/shared-types';

/** Props for {@link QuizClient}. */
export interface QuizClientProps {
  /** Chapter title shown as the challenge context header. */
  chapterTitle: string;
  /** The quiz challenges to present. */
  challenges: QuizChallenge[];
  /** Owning world id (route param). */
  worldId: string;
  /** Owning region id (route param). */
  regionId: string;
  /** Mission id (route param) — same value as the chapter/quiz id. */
  missionId: string;
}

function QuizClientInner({
  chapterTitle,
  challenges,
  worldId,
  regionId,
  missionId,
}: QuizClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';

  const handleComplete = (score: number) => {
    const base = `/worlds/${worldId}/region/${regionId}/mission/${missionId}/result`;
    const params = new URLSearchParams();
    params.set('score', String(score));
    if (fromGame) params.set('from', 'game');
    router.push(`${base}?${params.toString()}`);
  };

  return (
    <main
      className="max-w-[620px] mx-auto px-4 pb-12"
      style={{ animation: 'quiz-page-in 0.3s ease-out' }}
    >
      {/* Nav bar */}
      <nav className="sticky top-0 z-10 flex items-center gap-3 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Link href="/" className="text-sm no-underline" style={{ color: 'var(--color-text)' }}>
          🏠
        </Link>
        <button
          onClick={() => router.back()}
          className="text-sm"
          style={{
            color: 'var(--color-text)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Story
        </button>
        <span className="ml-auto text-xs" style={{ color: 'var(--color-text-dim)' }}>
          Chapter {missionId}
        </span>
      </nav>

      {/* Challenge context header */}
      <div
        style={{
          marginTop: '1.5rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
          animation: 'quiz-title-in 0.4s ease-out 0.1s both',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-gold)',
            marginBottom: '0.3rem',
          }}
        >
          ⚡ Challenge
        </div>
        <h1
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {chapterTitle}
        </h1>
      </div>

      {/* Quiz content */}
      <section className="mt-6">
        <QuizShell challenges={challenges} onComplete={handleComplete} />
      </section>
    </main>
  );
}

/**
 * Client shell for a quiz page. Receives server-loaded quiz data plus the
 * world/region/mission ids from the route, and handles the interactive
 * completion flow (routing to the sibling `result` page). Wrapped in Suspense
 * because it reads the `from` search param.
 */
export function QuizClient(props: QuizClientProps) {
  return (
    <Suspense fallback={null}>
      <QuizClientInner {...props} />
    </Suspense>
  );
}
