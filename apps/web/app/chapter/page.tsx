import { ChapterVisual, AudioPlayer, StoryView } from '@/modules/story';
import { chapter31 as chapterData } from '@/lib/content';
import Link from 'next/link';

export default function ChapterPage() {
  return (
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <nav className="sticky top-0 z-10 flex items-center py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Link href="/map" className="text-sm text-[var(--color-text)]">
          ← Map
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
        href="/quiz"
        className="block w-full mt-8 py-3 text-center text-[var(--color-bg)] bg-[var(--color-text)] rounded-[var(--radius)] font-medium"
      >
        Test Your Understanding →
      </Link>
    </main>
  );
}
