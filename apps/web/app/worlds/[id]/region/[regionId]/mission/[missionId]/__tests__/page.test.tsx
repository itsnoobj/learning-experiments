import { describe, it, expect, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/content', () => ({
  loadChapter: vi.fn(async (id: string) => {
    if (id === '3') {
      return {
        id: '3',
        part: 1,
        section: 'A',
        title: 'Why Do I Compare?',
        forces: ['status'],
        connections: ['1', '2'],
        visual: '3.svg',
        audio: '3.mp3',
        sections: { situation: { content: 'The raise came through.' } },
      };
    }
    if (id === '5') {
      return {
        id: '5',
        part: 1,
        section: 'A',
        title: 'Why Do I Fear Looking Incompetent?',
        forces: ['fear'],
        connections: ['1', '4'],
        visual: '5.svg',
        audio: '5.mp3',
        sections: { situation: { content: 'There is a question in the meeting.' } },
      };
    }
    return null;
  }),
  listChapterIds: vi.fn(async () => ['1', '2', '3', '4', '5']),
  getContentMtime: vi.fn(async () => new Date('2025-01-01')),
  resolveOgImage: vi.fn(async (id: string) => `/og/mission-${id}.png`),
}));

vi.mock('@/lib/hierarchy', () => ({
  worlds: [
    {
      id: 1,
      title: 'Understanding Yourself',
      tagline: 'Know thyself',
      worldName: 'The Mirror',
      landscape: 'desert',
      accent: '#DAA520',
      regions: [
        {
          id: 'A',
          title: 'Identity',
          description: 'Who you think you are',
          emoji: '🪞',
          missions: ['1', '2', '3', '4', '5'],
        },
      ],
    },
  ],
  getWorld: (id: string) => ({
    id: 1,
    title: 'Understanding Yourself',
    regions: [
      {
        id: 'A',
        title: 'Identity',
        description: 'Who you think you are',
        emoji: '🪞',
        missions: ['1', '2', '3', '4', '5'],
      },
    ],
  }),
  availableChapterIds: new Set(['1', '2', '3', '4', '5']),
}));

vi.mock('@/lib/seo', () => ({
  SITE_URL: 'https://humandynamics.guide',
  SITE_NAME: 'Human Dynamics',
  PUBLISHER: { '@type': 'Organization', name: 'Human Dynamics' },
  truncateDescription: (s: string) => s.slice(0, 100),
}));

describe('MissionPage', () => {
  const params = Promise.resolve({ id: '1', regionId: 'A', missionId: '3' });

  describe('generateMetadata', () => {
    it('returns chapter-specific metadata for a valid mission', async () => {
      const { generateMetadata } = await import('../page');
      const meta = await generateMetadata({ params });

      expect(meta.title).toContain('Why Do I Compare?');
      expect(meta.openGraph?.images).toEqual(
        expect.arrayContaining([expect.objectContaining({ url: '/og/mission-3.png' })]),
      );
    });

    it('returns noindex metadata for a missing chapter', async () => {
      const { generateMetadata } = await import('../page');
      const meta = await generateMetadata({
        params: Promise.resolve({ id: '1', regionId: 'A', missionId: '99' }),
      });

      expect(meta.title).toContain('Coming Soon');
      expect(meta.robots).toEqual({ index: false, follow: true });
    });
  });

  describe('generateStaticParams', () => {
    it('returns params for all missions across worlds and regions', async () => {
      const { generateStaticParams } = await import('../page');
      const result = await generateStaticParams();

      expect(result).toEqual(expect.arrayContaining([{ id: '1', regionId: 'A', missionId: '3' }]));
      expect(result.length).toBe(5);
    });
  });

  describe('MissionPage component', () => {
    it('passes nextMissionHref to MissionClient when not the last mission', async () => {
      const { default: MissionPage } = await import('../page');
      const element = await MissionPage({ params });

      // The page renders JSON-LD scripts + MissionClient
      // MissionClient should get nextMissionHref for mission '4' since '3' is at index 2
      const rendered = element as any;
      // Find the MissionClient component in the tree
      const children = rendered.props.children;
      // Last child should be MissionClient
      const missionClient = Array.isArray(children)
        ? children.find((c: any) => c?.props?.nextMissionHref !== undefined)
        : children;

      expect(missionClient.props.nextMissionHref).toBe('/worlds/1/region/A/mission/4');
    });

    it('passes next region mission href for the last mission in a region', async () => {
      const { default: MissionPage } = await import('../page');
      const element = await MissionPage({
        params: Promise.resolve({ id: '1', regionId: 'A', missionId: '5' }),
      });

      const rendered = element as any;
      const children = rendered.props.children;
      const missionClient = Array.isArray(children)
        ? children.find((c: any) => c?.props?.nextMissionHref !== undefined)
        : children;

      // Should link to the first mission of the next region (B) if available
      // If not available, should be null
      const href = missionClient.props.nextMissionHref;
      if (href) {
        expect(href).toMatch(/^\/worlds\/1\/region\/B\/mission\//);
      } else {
        expect(href).toBeNull();
      }
    });
  });
});
