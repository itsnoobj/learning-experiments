'use client';

import { Suspense } from 'react';
import { QuizShell } from '@/modules/quiz';
import { useRouter, useSearchParams } from 'next/navigation';
import { quiz31 as quizData } from '@/lib/content';

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
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <nav className="sticky top-0 z-10 flex items-center py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <button onClick={() => router.back()} className="text-sm text-[var(--color-text)]">
          ← Story
        </button>
        <span className="ml-auto text-xs text-[var(--color-text-dim)]">Challenge</span>
      </nav>

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
