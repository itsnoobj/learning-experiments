'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ChapterVisual, AudioPlayer, StoryView } from '@/modules/story';
import type { LoadedChapter } from '@/lib/content';

/** Props for {@link MissionClient}. */
export interface MissionClientProps {
  /** The chapter to render, loaded on the server by mission id. */
  chapter: LoadedChapter;
  /** Owning world id (route param). */
  worldId: string;
  /** Owning region id (route param). */
  regionId: string;
  /** Mission id (route param) — same value as the chapter/quiz id. */
  missionId: string;
  /** Next mission href, or null if there is no next mission available. */
  nextMissionHref: string | null;
}

function MissionClientInner({
  chapter,
  worldId,
  regionId,
  missionId,
  nextMissionHref,
}: MissionClientProps) {
  const searchParams = useSearchParams();
  const fromGame = searchParams.get('from') === 'game';

  const base = `/worlds/${worldId}/region/${regionId}/mission/${missionId}`;

  // The quiz lives directly under the mission; carry the game context through
  // so the quiz → result flow can route back into the game.
  const quizHref = fromGame ? `${base}/quiz?from=game` : `${base}/quiz`;
  const mapHref = fromGame ? '/game?resume=1' : `/worlds/${worldId}/region/${regionId}`;
  const nextHref = nextMissionHref ? `${nextMissionHref}${fromGame ? '?from=game' : ''}` : null;

  return (
    <main className="max-w-[620px] mx-auto px-4 pb-12">
      <nav className="sticky top-0 z-10 flex items-center gap-3 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Link href="/" className="text-sm text-[var(--color-text)] no-underline">
          🏠
        </Link>
        <Link href={mapHref} className="text-sm text-[var(--color-text)]">
          {fromGame ? '← Game' : '← Map'}
        </Link>
        <span className="ml-auto text-xs text-[var(--color-text-dim)]">Chapter {chapter.id}</span>
      </nav>

      <section className="mt-6">
        <ChapterVisual
          src={`/content/${chapter.visual.replace('.svg', '.png')}`}
          alt="Chapter illustration"
        />
      </section>

      <section className="mt-4">
        <AudioPlayer src={`/content/${chapter.audio}`} />
      </section>

      <section className="mt-6">
        <StoryView title={chapter.title} sections={chapter.sections} />
      </section>

      <nav className="mt-8 flex flex-col gap-3" aria-label="What to do next">
        <Link
          href={quizHref}
          className="block w-full py-3 text-center font-bold uppercase tracking-wider"
          style={{
            color: 'var(--color-bg)',
            backgroundColor: 'var(--color-gold)',
            fontSize: '0.95rem',
            letterSpacing: '0.06em',
            borderRadius: 'var(--radius, 0)',
          }}
        >
          Test Your Understanding →
        </Link>

        <div className="flex gap-3">
          {nextHref && (
            <Link
              href={nextHref}
              className="flex-1 block py-2.5 text-center text-sm font-semibold uppercase tracking-wider"
              style={{
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius, 0)',
                letterSpacing: '0.04em',
              }}
            >
              Next Story →
            </Link>
          )}
          <Link
            href={mapHref}
            className="flex-1 block py-2.5 text-center text-sm font-semibold uppercase tracking-wider"
            style={{
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius, 0)',
              letterSpacing: '0.04em',
            }}
          >
            {fromGame ? '🎮 Back to Game' : '🗺️ Mission Map'}
          </Link>
        </div>
      </nav>
    </main>
  );
}

/**
 * Client shell for a mission page. Receives server-loaded {@link LoadedChapter}
 * data plus the world/region/mission ids from the route, and layers on the
 * interactive bits (game-aware back link, quiz link). Wrapped in Suspense
 * because it reads the `from` search param.
 */
export function MissionClient(props: MissionClientProps) {
  return (
    <Suspense fallback={null}>
      <MissionClientInner {...props} />
    </Suspense>
  );
}
