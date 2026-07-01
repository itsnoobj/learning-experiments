import type { Metadata } from 'next';

import { loadChapter, listChapterIds } from '@/lib/content';
import { worlds } from '@/lib/hierarchy';

import { MissionClient } from './MissionClient';
import { MissionLocked } from './MissionLocked';

/** Route params for the hierarchical mission (chapter) page. */
interface MissionPageProps {
  params: Promise<{ id: string; regionId: string; missionId: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://humandynamics.guide';

/**
 * Generate per-mission metadata so each chapter page has a unique, search-
 * intent-driven title and description. The chapter titles are written as
 * questions people actually Google (e.g. "Why Do I Defend Decisions I Know Are
 * Wrong?") making them ideal meta titles.
 */
export async function generateMetadata({ params }: MissionPageProps): Promise<Metadata> {
  const { id, regionId, missionId } = await params;
  const chapter = await loadChapter(missionId);

  if (!chapter) {
    return {
      title: 'Coming Soon — A Field Guide to Being Human',
      description: 'This mission is not yet available. Check back soon.',
    };
  }

  // Use the situation section (first-person relatable hook) as the meta
  // description — it's the most search-relevant snippet.
  const situationSection = chapter.sections.find((s) => s.type === 'situation');
  const description = situationSection
    ? situationSection.content.slice(0, 155).replace(/\n/g, ' ') + '…'
    : `A story about ${chapter.forces.join(' and ')} — and what to do about it.`;

  const url = `${SITE_URL}/worlds/${id}/region/${regionId}/mission/${missionId}`;

  return {
    title: `${chapter.title} — A Field Guide to Being Human`,
    description,
    openGraph: {
      title: chapter.title,
      description,
      url,
      type: 'article',
      siteName: 'A Field Guide to Being Human',
    },
    twitter: {
      card: 'summary_large_image',
      title: chapter.title,
      description,
    },
  };
}

/**
 * Pre-render every mission page for static export.
 *
 * Walks the world → region → mission hierarchy and emits one
 * `{id, regionId, missionId}` tuple per mission, so every navigable mission has
 * a concrete URL. Missions whose content isn't authored yet still render the
 * friendly {@link MissionLocked} "coming soon" state rather than a hard 404.
 *
 * Content ids that don't appear in any region can't be located in the
 * hierarchy, so they aren't reachable through this route — they remain
 * accessible via the backward-compatible `/chapter/{id}` redirect.
 */
export async function generateStaticParams() {
  // Touch the content index so a future authored-but-unlisted chapter surfaces
  // in build logs; the hierarchy drives the actual param set.
  await listChapterIds();

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
 * Hierarchical mission page:
 * `/worlds/{id}/region/{regionId}/mission/{missionId}`.
 *
 * A server component that loads the chapter JSON for `missionId` and hands it
 * to {@link MissionClient}. The world/region come from the URL path (not query
 * params), so back/quiz/result navigation is derived directly from the route.
 * Unauthored missions render {@link MissionLocked}.
 */
export default async function MissionPage({ params }: MissionPageProps) {
  const { id, regionId, missionId } = await params;
  const chapter = await loadChapter(missionId);

  if (!chapter) {
    return <MissionLocked worldId={id} regionId={regionId} missionId={missionId} />;
  }

  // JSON-LD structured data for rich search results. Uses Article schema so
  // Google can show headline + description in SERPs.
  const situationSection = chapter.sections.find((s) => s.type === 'situation');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description: situationSection
      ? situationSection.content.slice(0, 155).replace(/\n/g, ' ')
      : `A story about ${chapter.forces.join(' and ')}.`,
    url: `${SITE_URL}/worlds/${id}/region/${regionId}/mission/${missionId}`,
    author: { '@type': 'Organization', name: 'Human Dynamics' },
    publisher: {
      '@type': 'Organization',
      name: 'Human Dynamics',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/worlds/${id}/region/${regionId}/mission/${missionId}`,
    },
    keywords: chapter.forces.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MissionClient chapter={chapter} worldId={id} regionId={regionId} missionId={missionId} />
    </>
  );
}
