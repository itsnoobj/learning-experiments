'use client';

import { Suspense } from 'react';
import { QuizShell } from '@/modules/quiz';
import { useRouter, useSearchParams } from 'next/navigation';
import { quiz31 as quizData, chapter31 as chapterData } from '@/lib/content';

const KEYFRAMES = `
@keyframes quiz-page-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes quiz-title-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';

  const handleComplete = (score: number) => {
    const params = new URLSearchParams();
    if (fromGame) params.set('from', 'game');
    params.set('score', String(score));
    router.push(`/result?${params.toString()}`);
  };

  return (
    <main
      className="max-w-[620px] mx-auto px-4 pb-12"
      style={{ animation: 'quiz-page-in 0.3s ease-out' }}
    >
      <style>{KEYFRAMES}</style>

      {/* Nav bar */}
      <nav className="sticky top-0 z-10 flex items-center py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
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
          Chapter {chapterData.id}
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
          {chapterData.title}
        </h1>
      </div>

      {/* Quiz content */}
      <section className="mt-6">
        <QuizShell challenges={quizData.challenges} onComplete={handleComplete} />
      </section>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizPageInner />
    </Suspense>
  );
}
