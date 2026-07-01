import type { Metadata } from 'next';
import Link from 'next/link';

import { loadChapter, listChapterIds } from '@/lib/content';
import { worlds, findChapterLocation } from '@/lib/hierarchy';
import { SITE_URL, SITE_NAME, PUBLISHER, truncateDescription } from '@/lib/seo';

export const metadata: Metadata = {
  title: `Situations — ${SITE_NAME}`,
  description:
    'Browse real workplace and life situations: dealing with credit-stealers, micromanagers, unfair promotions, hard conversations, and office politics. Story-driven lessons for each.',
  alternates: { canonical: `${SITE_URL}/situations` },
  openGraph: {
    title: 'What situation are you facing?',
    description:
      'Find your problem below. Each links to a story-driven lesson with a practical move you can try this week.',
    url: `${SITE_URL}/situations`,
    type: 'website',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Situations — ${SITE_NAME}`,
    description:
      'Find your problem below. Each links to a story-driven lesson with a practical move.',
  },
};

/** A chapter entry with its location in the hierarchy. */
interface SituationEntry {
  id: string;
  title: string;
  situation: string;
  forces: string[];
  worldId: number;
  regionId: string;
  regionTitle: string;
  worldTitle: string;
}

/**
 * Search-friendly section headings that describe what the group is about in
 * terms people actually search for, instead of internal jargon like
 * "Understanding Yourself → Identity".
 */
const SECTION_HEADINGS: Record<string, string> = {
  'Understanding Yourself → Identity': 'When you defend, compare, or people-please',
  'Understanding Yourself → Ego': 'When ego protects and destroys',
  'Understanding Yourself → Motivation': 'When you burn out, procrastinate, or lose drive',
  'Understanding Yourself → Emotions': 'When anger, fear, shame, or envy take over',
  'Understanding Other People → Incentives & Hidden Motives': "When people don't do what they say",
  'Understanding Other People → Trust': 'When trust breaks or needs to be rebuilt',
  'Understanding Other People → Status & Recognition':
    'When credit, titles, and recognition change people',
  'Understanding Other People → Difficult People':
    "When you're dealing with a narcissist, manipulator, or victim",
};

export default async function SituationsPage() {
  const chapterIds = await listChapterIds();

  // Load all authored chapters and build situation entries
  const entries: SituationEntry[] = [];
  for (const id of chapterIds) {
    const chapter = await loadChapter(id);
    if (!chapter) continue;

    const location = findChapterLocation(id);
    if (!location) continue;

    const world = worlds.find((w) => w.id === location.worldId);
    const region = world?.regions.find((r) => r.id === location.regionId);
    if (!world || !region) continue;

    const situationSection = chapter.sections.find((s) => s.type === 'situation');
    entries.push({
      id,
      title: chapter.title,
      situation: situationSection?.content ?? '',
      forces: chapter.forces,
      worldId: location.worldId,
      regionId: location.regionId,
      regionTitle: region.title,
      worldTitle: world.title,
    });
  }

  // Group by world → region
  const grouped = new Map<string, SituationEntry[]>();
  for (const entry of entries) {
    const key = `${entry.worldTitle} → ${entry.regionTitle}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  // JSON-LD CollectionPage schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'What situation are you facing?',
    description:
      'Browse real situations people face at work and in life. Each links to a story-driven lesson from history, mythology, and psychology.',
    url: `${SITE_URL}/situations`,
    publisher: PUBLISHER,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: entry.title,
        url: `${SITE_URL}/worlds/${entry.worldId}/region/${entry.regionId}/mission/${entry.id}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '2rem 1rem 4rem',
          fontFamily: 'var(--font-ibm-plex-sans)',
        }}
      >
        <nav style={{ marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-dim)',
              textDecoration: 'none',
            }}
          >
            ← Home
          </Link>
        </nav>

        <header style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            What situation are you facing?
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-dim)',
              lineHeight: 1.6,
            }}
          >
            Each of these is a real problem people search for help with. Behind every one is a
            recurring pattern — once you see it, you can navigate it. Click any to read the story
            and get a practical move.
          </p>
        </header>

        {[...grouped.entries()].map(([groupKey, items]) => (
          <section key={groupKey} style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '1rem',
                lineHeight: 1.3,
              }}
            >
              {SECTION_HEADINGS[groupKey] ?? groupKey}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((entry) => (
                <li key={entry.id} style={{ marginBottom: '1.25rem' }}>
                  <Link
                    href={`/worlds/${entry.worldId}/region/${entry.regionId}/mission/${entry.id}`}
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                        lineHeight: 1.4,
                        display: 'block',
                      }}
                    >
                      {entry.title}
                    </span>
                    {entry.situation && (
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-dim)',
                          lineHeight: 1.5,
                          display: 'block',
                          marginTop: '0.25rem',
                        }}
                      >
                        {truncateDescription(entry.situation, 140)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-dim)',
              lineHeight: 1.6,
            }}
          >
            These situations repeat across industries, cultures, and centuries. The names change —
            the dynamics don&apos;t. Each lesson uses a story from the Mahabharata, Roman history,
            or real life to reveal the pattern, then gives you a move to try this week.
          </p>
          <p style={{ marginTop: '1rem' }}>
            <Link
              href="/worlds"
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-gold)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Browse by theme instead →
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
