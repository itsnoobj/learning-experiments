import { notFound } from 'next/navigation';

import { loadChapter } from '@/lib/content';
import { ChapterClient } from './ChapterClient';

/** Route params for the dynamic chapter page. */
interface ChapterPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic chapter page: `/chapter/{id}`.
 *
 * A server component that loads the chapter JSON for `id` (scanning the
 * repo-root `content/chapters/part-*` directories) and hands the data to the
 * {@link ChapterClient} for rendering. Unknown ids render the 404 page.
 */
export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapter = await loadChapter(id);

  if (!chapter) {
    notFound();
  }

  return <ChapterClient chapter={chapter} />;
}
