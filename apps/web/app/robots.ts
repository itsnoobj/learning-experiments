import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

/** Required for `output: 'export'` — tells Next.js to pre-render this route. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dev/', '/game/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
