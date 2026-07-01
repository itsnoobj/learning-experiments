import type { Metadata } from 'next';
import Link from 'next/link';

import { loadChapter, listChapterIds } from '@/lib/content';
import { worlds, findChapterLocation } from '@/lib/hierarchy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://humandynamics.guide';

export const metadata: Metadata = {
  title: 'Situations — A Field Guide to Being Human',
  description:
    'Browse real workplace and life situations: dealing with credit-stealers, micromanagers, unfair promotions, office politics, and more. Each links to a story-driven lesson.',
  openGraph: {
    title: 'Situations — Every Human Dynamics Problem, Mapped',
    description:
      "Find the situation you're facing — and learn the pattern behind it through stories from history and epics.",
    url: `${SITE_URL}/situations`,
    type: 'website',
    siteName: 'A Field Guide to Being Human',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Situations — A Field Guide to Being Human',
    description: "Find the situation you're facing — and learn the pattern behind it.",
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

  // Group by world → region for structured browsing
  const grouped = new Map<string, SituationEntry[]>();
  for (const entry of entries) {
    const key = `${entry.worldTitle} → ${entry.regionTitle}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  // JSON-LD for the collection page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Situations — A Field Guide to Being Human',
    description:
      'Browse real situations people face at work and in life. Each links to a story-driven lesson from history, mythology, and psychology.',
    url: `${SITE_URL}/situations`,
    publisher: { '@type': 'Organization', name: 'Human Dynamics', url: SITE_URL },
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
            recurring pattern — once you see it, you can navigate it. Click any to read the
            story-driven breakdown.
          </p>
        </header>

        {[...grouped.entries()].map(([groupTitle, items]) => (
          <section key={groupTitle} style={{ marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-dim)',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.5rem',
              }}
            >
              {groupTitle}
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
                        {entry.situation.slice(0, 120).replace(/\n/g, ' ')}…
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-gold)',
                        marginTop: '0.3rem',
                        display: 'block',
                      }}
                    >
                      Forces: {entry.forces.join(', ')}
                    </span>
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
            the dynamics don't. Each lesson uses a story from the Mahabharata, Roman history, or
            real life to reveal the pattern, then gives you a move to try this week.
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
