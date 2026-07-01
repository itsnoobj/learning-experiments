import type { MetadataRoute } from 'next';

import { listChapterIds } from '@/lib/content';
import { worlds } from '@/lib/hierarchy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://humandynamics.guide';

/** Required for `output: 'export'` — tells Next.js to pre-render this route. */
export const dynamic = 'force-static';

/**
 * Generate a sitemap for all publicly accessible pages.
 *
 * Only missions with authored content (present in a `part-*` directory) are
 * included — locked/coming-soon missions are omitted so crawlers don't index
 * placeholder pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chapterIds = await listChapterIds();
  const chapterIdSet = new Set(chapterIds);

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/why`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${SITE_URL}/worlds`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/situations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // World pages
  for (const world of worlds) {
    if (world.regions.length === 0) continue;
    entries.push({
      url: `${SITE_URL}/worlds/${world.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Region pages
    for (const region of world.regions) {
      entries.push({
        url: `${SITE_URL}/worlds/${world.id}/region/${region.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });

      // Mission pages (only authored ones)
      for (const missionId of region.missions) {
        if (!chapterIdSet.has(missionId)) continue;
        entries.push({
          url: `${SITE_URL}/worlds/${world.id}/region/${region.id}/mission/${missionId}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
