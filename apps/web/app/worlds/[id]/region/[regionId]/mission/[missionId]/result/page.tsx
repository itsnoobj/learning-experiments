import type { Metadata } from 'next';

import { loadChapter, loadQuiz } from '@/lib/content';
import { worlds } from '@/lib/hierarchy';
import { SITE_NAME } from '@/lib/seo';

import { ResultClient, type ResultData } from './ResultClient';

/** Route params for the hierarchical result page. */
interface ResultPageProps {
  params: Promise<{ id: string; regionId: string; missionId: string }>;
}

/**
 * Result pages show quiz scores — app-only interactive state. Mark noindex
 * so Google doesn't index dozens of result pages with duplicate titles.
 */
export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { missionId } = await params;
  const chapter = await loadChapter(missionId);
  return {
    title: chapter ? `Result: ${chapter.title} — ${SITE_NAME}` : `Result — ${SITE_NAME}`,
    robots: { index: false, follow: true },
  };
}

/**
 * Pre-render a result page for every mission in the hierarchy, mirroring the
 * mission/quiz routes so `generateStaticParams` stays in lock-step.
 */
export function generateStaticParams() {
  const params: { id: string; regionId: string; missionId: string }[] = [];
  for (const world of worlds) {
    for (const region of world.regions) {
      for (const missionId of region.missions) {
        params.push({ id: String(world.id), regionId: region.id, missionId });
      }
    }
  }
  return params;
}

/**
 * Hierarchical result page:
 * `/worlds/{id}/region/{regionId}/mission/{missionId}/result`.
 *
 * A server component that loads the quiz/chapter for `missionId` at build time
 * and embeds the result data into the page. The world/region come from the URL
 * path, so the "continue"/"go to map" actions route back to the right region
 * map without any query params. Missions without a quiz render an empty state
 * via {@link ResultClient}.
 */
export default async function ResultPage({ params }: ResultPageProps) {
  const { id, regionId, missionId } = await params;
  const [quiz, chapter] = await Promise.all([loadQuiz(missionId), loadChapter(missionId)]);

  const mapHref = `/worlds/${id}/region/${regionId}`;

  const data: ResultData | null = quiz
    ? {
        chapterTitle: chapter?.title ?? `Chapter ${missionId}`,
        principleText: quiz.principle.text,
        principleSubtext: quiz.principle.subtext ?? '',
        reflection: quiz.reflection,
        totalCount: quiz.challenges.length,
        mapHref,
      }
    : null;

  return <ResultClient data={data} chapterId={missionId} mapHref={mapHref} />;
}
