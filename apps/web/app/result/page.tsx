'use client';

import { Suspense, useEffect } from 'react';
import { PrincipleReveal, ReflectionPrompt, ResultCTA } from '@/modules/result';
import { useRouter, useSearchParams } from 'next/navigation';
import { quiz31 as quizData, chapter31 as chapterData } from '@/lib/content';
import { useProgressStore } from '@/store/progressStore';

/** The chapter this result screen completes. */
const CURRENT_CHAPTER_ID = '31';

/**
 * The world this chapter belongs to. Hardcoded for now since only World 2 has
 * authored content; make this dynamic (from the store or URL) as more worlds
 * are filled in.
 */
const CURRENT_WORLD_ID = '2';

/**
 * The region within {@link CURRENT_WORLD_ID} that this chapter lives in.
 * Mission 31 sits in World 2, Region A. Hardcoded for now alongside the world
 * id; make dynamic as routing carries world/region through the flow.
 */
const CURRENT_REGION_ID = 'A';

/** Route back to the region map this mission was launched from. */
const MAP_HREF = `/worlds/${CURRENT_WORLD_ID}/region/${CURRENT_REGION_ID}`;

function ResultPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';
  const completeChapter = useProgressStore((state) => state.completeChapter);

  // Reaching the result screen means the quiz is complete: mark the chapter
  // done so the world map updates the node to 'done' on return.
  useEffect(() => {
    completeChapter(CURRENT_CHAPTER_ID);
  }, [completeChapter]);

  const handleContinue = () => {
    if (fromGame) {
      router.push('/game?resume=1');
    } else {
      // Signal the region map to celebrate the path that just opened up.
      localStorage.setItem('pathUnlocked', 'true');
      router.push(MAP_HREF);
    }
  };

  const handleGoToMap = () => {
    localStorage.setItem('pathUnlocked', 'true');
    router.push(MAP_HREF);
  };
  const handleGoToGame = () => router.push('/game');

  const totalCount = quizData.challenges.length;

  return (
    <main
      className="max-w-[480px] mx-auto px-6 py-16 text-center"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <PrincipleReveal
        text={quizData.principle.text}
        subtext={quizData.principle.subtext}
        correctCount={totalCount}
        totalCount={totalCount}
        readTime="~5 min read"
        chapterNumber={CURRENT_CHAPTER_ID}
        chapterTitle={chapterData.title}
      />
      <ReflectionPrompt question={quizData.reflection} />
      <ResultCTA
        onContinue={handleContinue}
        fromGame={fromGame}
        onGoToMap={handleGoToMap}
        onGoToGame={handleGoToGame}
      />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultPageInner />
    </Suspense>
  );
}
