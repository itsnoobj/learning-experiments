/**
 * Shared site configuration constants.
 *
 * Centralises values that multiple files need (SEO metadata, sitemaps, robots,
 * JSON-LD) so they stay in sync and edits happen in one place.
 */

/** Canonical site URL, used for meta tags, sitemaps, and structured data. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://humandynamics.guide';

/** Site name used in OG tags and JSON-LD publisher fields. */
export const SITE_NAME = 'A Field Guide to Being Human';

/** Publisher metadata for JSON-LD structured data. */
export const PUBLISHER = {
  '@type': 'Organization' as const,
  name: 'Human Dynamics',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject' as const,
    url: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
  },
};

/**
 * Truncate text at a word boundary, appending an ellipsis. Used for meta
 * descriptions and JSON-LD snippets to avoid mid-word cuts.
 *
 * @param text - The text to truncate.
 * @param maxLength - Maximum length before the ellipsis (default 155).
 */
export function truncateDescription(text: string, maxLength = 155): string {
  const cleaned = text.replace(/\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;

  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const boundary = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return truncated.slice(0, boundary) + '…';
}
