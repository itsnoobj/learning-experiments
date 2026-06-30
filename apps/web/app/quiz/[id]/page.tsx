import { notFound } from 'next/navigation';

import { loadChapter, loadQuiz } from '@/lib/content';
import { QuizClient } from './QuizClient';

/** Route params for the dynamic quiz page. */
interface QuizPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic quiz page: `/quiz/{id}`.
 *
 * A server component that loads the quiz JSON for `id` (and the chapter, for
 * its title) by scanning the repo-root `content/chapters/part-*` directories,
 * then hands the data to the {@link QuizClient}. Unknown ids render the 404
 * page.
 */
export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const [quiz, chapter] = await Promise.all([loadQuiz(id), loadChapter(id)]);

  if (!quiz) {
    notFound();
  }

  return (
    <QuizClient
      chapterId={quiz.chapterId ?? id}
      chapterTitle={chapter?.title ?? `Chapter ${id}`}
      challenges={quiz.challenges}
    />
  );
}
