import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/content', () => ({
  loadChapter: vi.fn(async (id: string) => {
    if (id === '1') {
      return {
        id: '1',
        title: 'Why Do I Defend Decisions I Know Are Wrong?',
        forces: ['identity', 'ego'],
        sections: { situation: { content: 'Three months ago the vendor was chosen.' } },
        visual: '1.svg',
      };
    }
    return null;
  }),
  listChapterIds: vi.fn(async () => ['1', '2', '3']),
  resolveOgImage: vi.fn(async (id: string) => `/og/mission-${id}.png`),
}));

vi.mock('@/lib/hierarchy', () => ({
  findChapterLocation: (id: string) => (id === '1' ? { worldId: 1, regionId: 'A' } : null),
}));

vi.mock('@/lib/seo', () => ({
  SITE_URL: 'https://humandynamics.guide',
  SITE_NAME: 'Human Dynamics',
  truncateDescription: (s: string) => s.slice(0, 100),
}));

describe('/story/[id]', () => {
  describe('generateMetadata', () => {
    it('returns story-specific OG metadata for a valid mission', async () => {
      const { generateMetadata } = await import('../story/[id]/page');
      const meta = await generateMetadata({ params: Promise.resolve({ id: '1' }) });

      expect(meta.title).toContain('Why Do I Defend Decisions');
      expect(meta.openGraph?.images).toEqual(
        expect.arrayContaining([expect.objectContaining({ url: '/og/mission-1.png' })]),
      );
      expect(meta.robots).toEqual({ index: false, follow: true });
      expect(meta.alternates?.canonical).toContain('/worlds/1/region/A/mission/1');
    });

    it('returns fallback metadata for unknown mission', async () => {
      const { generateMetadata } = await import('../story/[id]/page');
      const meta = await generateMetadata({ params: Promise.resolve({ id: '999' }) });

      expect(meta.title).toContain('Story');
      expect(meta.robots).toEqual({ index: false, follow: true });
    });
  });

  describe('generateStaticParams', () => {
    it('returns params for all available chapters', async () => {
      const { generateStaticParams } = await import('../story/[id]/page');
      const params = await generateStaticParams();

      expect(params).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
    });
  });

  describe('StoryPage component', () => {
    it('returns JSX with meta refresh pointing to the mission URL', async () => {
      const { default: StoryPage } = await import('../story/[id]/page');
      const element = await StoryPage({ params: Promise.resolve({ id: '1' }) });

      // The component returns a fragment with meta refresh + ChapterRedirect
      expect(element).toBeDefined();
      expect(element.props.children).toHaveLength(2);

      const metaTag = element.props.children[0];
      expect(metaTag.props.httpEquiv).toBe('refresh');
      expect(metaTag.props.content).toContain('/worlds/1/region/A/mission/1');
    });
  });
});
