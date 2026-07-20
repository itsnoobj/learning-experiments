import type { Metadata } from 'next';

import { loadChapter, listChapterIds, getContentMtime, resolveOgImage } from '@/lib/content';
import { worlds, getWorld, availableChapterIds } from '@/lib/hierarchy';
import { SITE_URL, SITE_NAME, PUBLISHER, truncateDescription } from '@/lib/seo';

import { MissionClient } from './MissionClient';
import { MissionLocked } from './MissionLocked';

/** Route params for the hierarchical mission (chapter) page. */
interface MissionPageProps {
  params: Promise<{ id: string; regionId: string; missionId: string }>;
}

/**
 * Generate per-mission metadata so each chapter page has a unique, search-
 * intent-driven title and description. The chapter titles are written as
 * questions people actually Google (e.g. "Why Do I Defend Decisions I Know Are
 * Wrong?") making them ideal meta titles.
 *
 * Locked (unauthored) pages get `noindex` so Google doesn't index placeholder
 * pages with duplicate thin content.
 */
export async function generateMetadata({ params }: MissionPageProps): Promise<Metadata> {
  const { id, regionId, missionId } = await params;
  const chapter = await loadChapter(missionId);

  if (!chapter) {
    return {
      title: `Coming Soon — ${SITE_NAME}`,
      description: 'This mission is not yet available. Check back soon.',
      robots: { index: false, follow: true },
    };
  }

  const description = chapter.sections.situation
    ? truncateDescription(chapter.sections.situation.content)
    : `A story about ${chapter.forces.join(' and ')} — and what to do about it.`;

  const url = `${SITE_URL}/worlds/${id}/region/${regionId}/mission/${missionId}`;
  const ogImage = await resolveOgImage(missionId);

  return {
    title: `${chapter.title} — ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: chapter.title,
      description,
      url,
      type: 'article',
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: chapter.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: chapter.title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Pre-render every mission page for static export.
 */
export async function generateStaticParams() {
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
 */
export default async function MissionPage({ params }: MissionPageProps) {
  const { id, regionId, missionId } = await params;
  const chapter = await loadChapter(missionId);

  if (!chapter) {
    return <MissionLocked worldId={id} regionId={regionId} missionId={missionId} />;
  }

  const mtime = await getContentMtime(missionId);
  const url = `${SITE_URL}/worlds/${id}/region/${regionId}/mission/${missionId}`;

  // Description for JSON-LD
  const description = chapter.sections.situation
    ? truncateDescription(chapter.sections.situation.content)
    : `A story about ${chapter.forces.join(' and ')}.`;

  // Look up world/region titles for breadcrumb
  const world = getWorld(id);
  const region = world?.regions.find((r) => r.id === regionId);

  // Determine next mission in this region
  const missionList = region?.missions ?? [];
  const currentIndex = missionList.indexOf(missionId);
  let nextMissionId: string | null =
    currentIndex >= 0 && currentIndex < missionList.length - 1
      ? missionList[currentIndex + 1]
      : null;

  // If this is the last mission in the region, look for the next region/world
  let nextMissionWorldId: string = id;
  let nextMissionRegionId: string = regionId;

  if (!nextMissionId && world && region) {
    const regionIndex = world.regions.indexOf(region);
    // Try next region in same world
    if (regionIndex >= 0 && regionIndex < world.regions.length - 1) {
      const nextRegion = world.regions[regionIndex + 1];
      if (nextRegion.missions.length > 0) {
        nextMissionId = nextRegion.missions[0];
        nextMissionRegionId = nextRegion.id;
      }
    }
    // If still null, try first region of next world
    if (!nextMissionId) {
      const nextWorld = worlds.find((w) => w.id === world.id + 1);
      if (nextWorld && nextWorld.regions.length > 0 && nextWorld.regions[0].missions.length > 0) {
        nextMissionId = nextWorld.regions[0].missions[0];
        nextMissionWorldId = String(nextWorld.id);
        nextMissionRegionId = nextWorld.regions[0].id;
      }
    }
  }

  // Only show next if the target mission actually has content available
  const nextMissionHref =
    nextMissionId && availableChapterIds.has(nextMissionId)
      ? `/worlds/${nextMissionWorldId}/region/${nextMissionRegionId}/mission/${nextMissionId}`
      : null;

  // Article JSON-LD with full recommended fields
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description,
    url,
    image: `${SITE_URL}/content/${chapter.visual.replace('.svg', '.png')}`,
    datePublished: mtime?.toISOString(),
    dateModified: mtime?.toISOString(),
    author: { '@type': 'Organization', name: 'Human Dynamics' },
    publisher: PUBLISHER,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: chapter.forces.join(', '),
  };

  // BreadcrumbList for structured navigation in search results
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: world?.title ?? 'World',
        item: `${SITE_URL}/worlds/${id}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: region?.title ?? 'Region',
        item: `${SITE_URL}/worlds/${id}/region/${regionId}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: chapter.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MissionClient
        chapter={chapter}
        worldId={id}
        regionId={regionId}
        missionId={missionId}
        nextMissionHref={nextMissionHref}
      />
    </>
  );
}
