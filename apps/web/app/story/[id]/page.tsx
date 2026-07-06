import { Metadata } from 'next';

import { loadChapter, listChapterIds, resolveOgImage } from '@/lib/content';
import { findChapterLocation } from '@/lib/hierarchy';
import { SITE_URL, SITE_NAME, truncateDescription } from '@/lib/seo';

import { ChapterRedirect } from '../../chapter/[id]/ChapterRedirect';

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

function missionUrlFor(id: string): string {
  const location = findChapterLocation(id);
  return location
    ? `${SITE_URL}/worlds/${location.worldId}/region/${location.regionId}/mission/${id}`
    : `${SITE_URL}/story/${id}`;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const chapter = await loadChapter(id);

  if (!chapter) {
    return {
      title: `Story — ${SITE_NAME}`,
      description: 'A story about navigating human dynamics.',
      robots: { index: false, follow: true },
    };
  }

  const situationSection = chapter.sections.find((s: { type: string }) => s.type === 'situation');
  const description = situationSection
    ? truncateDescription(situationSection.content)
    : `A story about ${chapter.forces.join(' and ')} — and what to do about it.`;

  const canonical = missionUrlFor(id);
  const ogImage = await resolveOgImage(id);

  return {
    title: `${chapter.title} — ${SITE_NAME}`,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      title: chapter.title,
      description,
      url: canonical,
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

export async function generateStaticParams() {
  const ids = await listChapterIds();
  return ids.map((id: string) => ({ id }));
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const target = missionUrlFor(id);

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <ChapterRedirect id={id} />
    </>
  );
}
