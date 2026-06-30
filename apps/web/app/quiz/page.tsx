import { redirect } from 'next/navigation';

/** Default chapter for the legacy `/quiz` route. */
const DEFAULT_CHAPTER_ID = '31';

interface LegacyQuizPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Legacy `/quiz` route, kept for backwards compatibility.
 *
 * The quiz page is now dynamic at `/quiz/{id}`. This route redirects to a
 * concrete id: the `chapter` query param when present, otherwise the default
 * chapter. Remaining query params (e.g. `from`) are preserved so the quiz →
 * result flow keeps working.
 */
export default async function LegacyQuizPage({ searchParams }: LegacyQuizPageProps) {
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
  redirect(qs ? `/quiz/${id}?${qs}` : `/quiz/${id}`);
}
