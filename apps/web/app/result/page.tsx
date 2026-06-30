import { notFound } from 'next/navigation';

import { loadChapter, loadQuiz } from '@/lib/content';
import { findChapterLocation } from '@/lib/hierarchy';

import { ResultClient } from './ResultClient';

/** Query params for the result screen. */
interface ResultPageProps {
  searchParams: Promise<{ chapter?: string; from?: string; score?: string }>;
}

/**
 * Result screen: `/result?chapter={id}`.
 *
 * A server component that loads the quiz (for the principle/reflection) and
 * chapter (for its title) matching the `chapter` query param, derives the
 * region map to return to from the chapter's place in the hierarchy, then hands
 * everything to the interactive {@link ResultClient}. A missing or unknown
 * chapter renders the 404 page.
 */
export default async function ResultPage({ searchParams }: ResultPageProps) {
  const { chapter } = await searchParams;

  if (!chapter) {
    notFound();
  }

  const chapterId = chapter;

  const [quiz, chapterData] = await Promise.all([loadQuiz(chapterId), loadChapter(chapterId)]);

  if (!quiz) {
    notFound();
  }

  // Derive the world/region this chapter lives in so "continue"/"go to map"
  // returns to the right region map. Fall back to the worlds overview if the
  // chapter isn't listed in any region's missions.
  const location = findChapterLocation(chapterId);
  const mapHref = location
    ? `/worlds/${location.worldId}/region/${location.regionId}`
    : '/worlds';

  return (
    <ResultClient
      chapterId={chapterId}
      chapterTitle={chapterData?.title ?? `Chapter ${chapter}`}
      principleText={quiz.principle.text}
      principleSubtext={quiz.principle.subtext ?? ''}
      reflection={quiz.reflection}
      totalCount={quiz.challenges.length}
      mapHref={mapHref}
    />
  );
}
