import type { MetadataRoute } from 'next';

import { listChapterIds, getContentMtime } from '@/lib/content';
import { worlds } from '@/lib/hierarchy';
import { SITE_URL } from '@/lib/seo';

/** Required for `output: 'export'` — tells Next.js to pre-render this route. */
export const dynamic = 'force-static';

/**
 * Generate a sitemap for all publicly accessible pages.
 *
 * Only missions with authored content are included — locked/coming-soon
 * missions are omitted. Uses content file mtime for lastModified so Google
 * knows which pages actually changed (instead of `new Date()` which makes
 * the signal useless).
 *
 * Note: `priority` and `changeFrequency` are intentionally omitted — Google
 * officially ignores both fields.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chapterIds = await listChapterIds();
  const chapterIdSet = new Set(chapterIds);

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/why`, lastModified: new Date() },
    { url: `${SITE_URL}/worlds`, lastModified: new Date() },
    { url: `${SITE_URL}/situations`, lastModified: new Date() },
  ];

  // World and region pages
  for (const world of worlds) {
    if (world.regions.length === 0) continue;
    entries.push({
      url: `${SITE_URL}/worlds/${world.id}`,
      lastModified: new Date(),
    });

    for (const region of world.regions) {
      entries.push({
        url: `${SITE_URL}/worlds/${world.id}/region/${region.id}`,
        lastModified: new Date(),
      });

      // Mission pages — use content file mtime
      for (const missionId of region.missions) {
        if (!chapterIdSet.has(missionId)) continue;
        const mtime = await getContentMtime(missionId);
        entries.push({
          url: `${SITE_URL}/worlds/${world.id}/region/${region.id}/mission/${missionId}`,
          lastModified: mtime ?? new Date(),
        });
      }
    }
  }

  return entries;
}
