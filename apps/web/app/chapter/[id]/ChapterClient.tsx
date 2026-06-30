'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ChapterVisual, AudioPlayer, StoryView } from '@/modules/story';
import type { LoadedChapter } from '@/lib/content';

/** Props for {@link ChapterClient}. */
export interface ChapterClientProps {
  /** The chapter to render, loaded on the server by id. */
  chapter: LoadedChapter;
}

function ChapterClientInner({ chapter }: ChapterClientProps) {
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';
  const world = searchParams.get('world');
  const region = searchParams.get('region');

  // The quiz lives at the same id as the chapter; carry the game context
  // through so the quiz → result flow can route back into the game.
  const quizHref = fromGame ? `/quiz/${chapter.id}?from=game` : `/quiz/${chapter.id}`;
  const backHref = fromGame
    ? '/game?resume=1'
    : world && region
      ? `/worlds/${world}/region/${region}`
      : '/map';
  const backLabel = fromGame ? '← Game' : '← Map';

  return (
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <nav className="sticky top-0 z-10 flex items-center py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Link href={backHref} className="text-sm text-[var(--color-text)]">
          {backLabel}
        </Link>
        <span className="ml-auto text-xs text-[var(--color-text-dim)]">
          Chapter {chapter.id}
        </span>
      </nav>

      <section className="mt-6">
        <ChapterVisual src={`/content/${chapter.visual}`} alt="Chapter illustration" />
      </section>

      <section className="mt-4">
        <AudioPlayer src={`/content/${chapter.audio}`} />
      </section>

      <section className="mt-6">
        <StoryView title={chapter.title} sections={chapter.sections} />
      </section>

      <Link
        href={quizHref}
        className="block w-full mt-8 py-3 text-center font-bold uppercase tracking-wider"
        style={{
          color: 'var(--color-bg)',
          backgroundColor: 'var(--color-gold)',
          fontSize: '0.95rem',
          letterSpacing: '0.06em',
        }}
      >
        Test Your Understanding →
      </Link>
    </main>
  );
}

/**
 * Client shell for a chapter page. Receives server-loaded {@link LoadedChapter}
 * data as a prop and layers on the interactive bits (query-param-driven back
 * and quiz links). Wrapped in Suspense because it reads search params.
 */
export function ChapterClient({ chapter }: ChapterClientProps) {
  return (
    <Suspense fallback={null}>
      <ChapterClientInner chapter={chapter} />
    </Suspense>
  );
}
