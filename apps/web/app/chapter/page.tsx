import { redirect } from 'next/navigation';

/** Default chapter for the legacy `/chapter` route. */
const DEFAULT_CHAPTER_ID = '31';

interface LegacyChapterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Legacy `/chapter` route, kept for backwards compatibility.
 *
 * The chapter page is now dynamic at `/chapter/{id}`. This route redirects to a
 * concrete id: the `chapter` query param when present (older links such as the
 * in-game interstitial used `?chapter={id}`), otherwise the default chapter.
 * Any remaining query params (e.g. `from`, `world`, `region`) are preserved so
 * the back/quiz navigation continues to work.
 */
export default async function LegacyChapterPage({ searchParams }: LegacyChapterPageProps) {
  const params = await searchParams;

  const rawId = params.chapter;
  const id = (Array.isArray(rawId) ? rawId[0] : rawId) || DEFAULT_CHAPTER_ID;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'chapter' || value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else {
      query.set(key, value);
    }
  }

  const qs = query.toString();
  redirect(qs ? `/chapter/${id}?${qs}` : `/chapter/${id}`);
}
