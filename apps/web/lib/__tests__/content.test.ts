import { describe, it, expect } from 'vitest';

import { loadChapter, loadQuiz } from '../content';

// These tests exercise the real loaders against the actual authored content
// at the repo root (`content/chapters/part-XX/{id}.json`). Vitest runs with
// `process.cwd()` === `apps/web`, so the loader's first candidate root
// (`../../content/chapters`) resolves to the repo-root content directory.

describe('loadChapter', () => {
  it('returns a LoadedChapter with correct fields for an existing chapter', async () => {
    const chapter = await loadChapter('1');

    expect(chapter).not.toBeNull();
    expect(chapter!.id).toBe('1');
    expect(typeof chapter!.part).toBe('number');
    expect(typeof chapter!.section).toBe('string');
    expect(chapter!.title.length).toBeGreaterThan(0);
    expect(Array.isArray(chapter!.forces)).toBe(true);
    expect(chapter!.forces.length).toBeGreaterThan(0);
    expect(Array.isArray(chapter!.connections)).toBe(true);
    expect(Array.isArray(chapter!.sections)).toBe(true);
    expect(chapter!.sections.length).toBeGreaterThan(0);
    expect(chapter!.sections[0]).toHaveProperty('type');
    expect(chapter!.sections[0]).toHaveProperty('content');
  });

  it('returns null for an invalid id (path traversal)', async () => {
    expect(await loadChapter('../../etc/passwd')).toBeNull();
  });

  it('returns null for a non-existent id', async () => {
    expect(await loadChapter('9999999')).toBeNull();
  });

  it('overrides visual/audio with {id}.svg and {id}.mp3 regardless of JSON', async () => {
    const chapter = await loadChapter('1');

    expect(chapter).not.toBeNull();
    expect(chapter!.visual).toBe('1.svg');
    expect(chapter!.audio).toBe('1.mp3');
  });
});

describe('loadQuiz', () => {
  it('returns a LoadedQuiz with a challenges array for an existing quiz', async () => {
    const quiz = await loadQuiz('1');

    expect(quiz).not.toBeNull();
    expect(quiz!.chapterId).toBe('1');
    expect(Array.isArray(quiz!.challenges)).toBe(true);
    expect(quiz!.challenges.length).toBeGreaterThan(0);
    expect(quiz!.principle.text.length).toBeGreaterThan(0);
    expect(typeof quiz!.reflection).toBe('string');
  });

  it('returns null for a non-existent id', async () => {
    expect(await loadQuiz('9999999')).toBeNull();
  });

  it('returns null for a malicious id (path traversal)', async () => {
    expect(await loadQuiz('../../../etc/shadow')).toBeNull();
  });
});

describe('resolveOgImage', () => {
  it('returns per-mission OG image when the PNG exists', async () => {
    const { resolveOgImage } = await import('../content');
    const result = await resolveOgImage('1');
    expect(result).toBe('/og/mission-1.png');
  });

  it('returns default OG image for non-existent mission', async () => {
    const { resolveOgImage, DEFAULT_OG_IMAGE } = await import('../content');
    const result = await resolveOgImage('9999');
    expect(result).toBe(DEFAULT_OG_IMAGE);
  });

  it('returns default OG image for invalid id (path traversal)', async () => {
    const { resolveOgImage, DEFAULT_OG_IMAGE } = await import('../content');
    const result = await resolveOgImage('../../../etc/passwd');
    expect(result).toBe(DEFAULT_OG_IMAGE);
  });
});
