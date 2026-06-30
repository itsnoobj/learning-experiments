'use client';

import { Suspense } from 'react';
import { ChapterVisual, AudioPlayer, StoryView } from '@/modules/story';
import { chapter31 as chapterData } from '@/lib/content';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ChapterPageInner() {
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';

  const quizHref = fromGame ? '/quiz?from=game' : '/quiz';
  const backHref = fromGame ? '/game?resume=1' : '/map';
  const backLabel = fromGame ? '← Game' : '← Map';

  return (
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <nav className="sticky top-0 z-10 flex items-center py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Link href={backHref} className="text-sm text-[var(--color-text)]">
          {backLabel}
        </Link>
        <span className="ml-auto text-xs text-[var(--color-text-dim)]">
          Chapter {chapterData.id}
        </span>
      </nav>

      <section className="mt-6">
        <ChapterVisual src={`/content/${chapterData.visual}`} alt="Chapter illustration" />
      </section>

      <section className="mt-4">
        <AudioPlayer src={`/content/${chapterData.audio}`} />
      </section>

      <section className="mt-6">
        <StoryView title={chapterData.title} sections={chapterData.sections} />
      </section>

      <Link
        href={quizHref}
        className="block w-full mt-8 py-3 text-center text-[var(--color-bg)] bg-[var(--color-text)] font-medium"
      >
        Test Your Understanding →
      </Link>
    </main>
  );
}

export default function ChapterPage() {
  return (
    <Suspense fallback={null}>
      <ChapterPageInner />
    </Suspense>
  );
}
