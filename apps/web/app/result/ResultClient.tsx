'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { PrincipleReveal, ReflectionPrompt, ResultCTA } from '@/modules/result';
import { useProgressStore } from '@/store/progressStore';

/** Props for {@link ResultClient}, supplied by the server component. */
export interface ResultClientProps {
  /** Chapter id this result screen completes (drives progress + header). */
  chapterId: string;
  /** Chapter title shown alongside the achievement. */
  chapterTitle: string;
  /** The core principle text revealed on completion. */
  principleText: string;
  /** Supporting explanation beneath the principle. */
  principleSubtext: string;
  /** The reflection prompt for this chapter. */
  reflection: string;
  /** Total challenge count, used for the "n/n correct" badge. */
  totalCount: number;
  /** Region map route to return to (derived from the chapter's hierarchy). */
  mapHref: string;
}

function ResultClientInner({
  chapterId,
  chapterTitle,
  principleText,
  principleSubtext,
  reflection,
  totalCount,
  mapHref,
}: ResultClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';
  const completeChapter = useProgressStore((state) => state.completeChapter);

  // Reaching the result screen means the quiz is complete: mark the chapter
  // done so the world map updates the node to 'done' on return.
  useEffect(() => {
    completeChapter(chapterId);
  }, [completeChapter, chapterId]);

  const handleContinue = () => {
    if (fromGame) {
      router.push('/game?resume=1');
    } else {
      // Signal the region map to celebrate the path that just opened up.
      localStorage.setItem('pathUnlocked', 'true');
      router.push(mapHref);
    }
  };

  const handleGoToMap = () => {
    localStorage.setItem('pathUnlocked', 'true');
    router.push(mapHref);
  };
  const handleGoToGame = () => router.push('/game');

  return (
    <main
      className="max-w-[480px] mx-auto px-6 py-16 text-center"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <PrincipleReveal
        text={principleText}
        subtext={principleSubtext}
        correctCount={totalCount}
        totalCount={totalCount}
        readTime="~5 min read"
        chapterNumber={chapterId}
        chapterTitle={chapterTitle}
      />
      <ReflectionPrompt question={reflection} />
      <ResultCTA
        onContinue={handleContinue}
        fromGame={fromGame}
        onGoToMap={handleGoToMap}
        onGoToGame={handleGoToGame}
      />
    </main>
  );
}

/**
 * Client shell for the result screen. Receives server-loaded quiz data as
 * props and handles the interactive completion flow (progress store + routing).
 * Wrapped in Suspense because it reads search params (`from`).
 */
export function ResultClient(props: ResultClientProps) {
  return (
    <Suspense fallback={null}>
      <ResultClientInner {...props} />
    </Suspense>
  );
}
