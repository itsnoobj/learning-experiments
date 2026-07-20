import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MissionClient } from '../MissionClient';
import type { LoadedChapter } from '@/lib/content';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const chapter: LoadedChapter = {
  id: '3',
  part: 1,
  section: 'A',
  title: 'Why Do I Compare?',
  forces: ['status'],
  connections: ['1', '2'],
  visual: '3.svg',
  audio: '3.mp3',
  sections: {
    situation: { content: 'The raise came through.' },
    story: { content: 'A story about comparison.' },
    principle: { content: 'Comparison steals joy.' },
  },
};

const baseProps = {
  chapter,
  worldId: '1',
  regionId: 'A',
  missionId: '3',
  nextMissionHref: '/worlds/1/region/A/mission/4',
};

describe('MissionClient', () => {
  it('renders the chapter title', () => {
    render(<MissionClient {...baseProps} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Why Do I Compare?' }),
    ).toBeInTheDocument();
  });

  it('renders the quiz link', () => {
    render(<MissionClient {...baseProps} />);
    const quizLink = screen.getByRole('link', { name: /test your understanding/i });
    expect(quizLink).toBeInTheDocument();
    expect(quizLink).toHaveAttribute('href', '/worlds/1/region/A/mission/3/quiz');
  });

  it('renders the next story link when nextMissionHref is provided', () => {
    render(<MissionClient {...baseProps} />);
    const nextLink = screen.getByRole('link', { name: /next story/i });
    expect(nextLink).toBeInTheDocument();
    expect(nextLink).toHaveAttribute('href', '/worlds/1/region/A/mission/4');
  });

  it('does not render next story link when nextMissionHref is null', () => {
    render(<MissionClient {...baseProps} nextMissionHref={null} />);
    expect(screen.queryByRole('link', { name: /next story/i })).not.toBeInTheDocument();
  });

  it('renders the mission map link', () => {
    render(<MissionClient {...baseProps} />);
    const mapLink = screen.getByRole('link', { name: /mission map/i });
    expect(mapLink).toBeInTheDocument();
    expect(mapLink).toHaveAttribute('href', '/worlds/1/region/A');
  });

  it('renders the back nav link to map', () => {
    render(<MissionClient {...baseProps} />);
    const backLink = screen.getByRole('link', { name: '← Map' });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/worlds/1/region/A');
  });

  it('shows chapter number in nav', () => {
    render(<MissionClient {...baseProps} />);
    expect(screen.getByText('Chapter 3')).toBeInTheDocument();
  });
});

describe('MissionClient (from=game)', () => {
  // Testing game-context routing requires a different mock setup for
  // useSearchParams. Covered by integration/e2e tests.
  it.todo('shows game-back link and passes from=game to quiz/next hrefs');
});
