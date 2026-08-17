import { describe, it, expect } from 'vitest';
import { getMissionTitle } from '../data/missionTitles';
import chapter1 from '../../../../../content/chapters/part-02/1/1.json';
import chapter18 from '../../../../../content/chapters/part-01/18/18.json';

/**
 * Regression guard: the label the map shows under a mission node must be the
 * SAME string the story page shows — i.e. the chapter's own `title`. A stale
 * hand-maintained lookup here once drifted after missions were renumbered, so
 * the map called mission 1 "Why do I defend decisions I know are wrong?" (which
 * is actually chapter 18) while the story page called it "Why Does Cooperation
 * Collapse…". These assertions fail if that drift ever returns.
 */
describe('map mission titles match chapter titles', () => {
  it('mission 1 is the cooperation title, not the (renumbered) ego title', () => {
    expect(getMissionTitle('1')).toBe(chapter1.title);
    expect(getMissionTitle('1')).toBe('Why Does Cooperation Collapse Even When Everyone Benefits?');
  });

  it('the "defend decisions" title now belongs to mission 18', () => {
    expect(getMissionTitle('18')).toBe(chapter18.title);
    expect(getMissionTitle('18')).toBe('Why Do I Defend Decisions I Know Are Wrong?');
  });

  it('falls back gracefully for an unknown mission id', () => {
    expect(getMissionTitle('99999')).toBe('Mission 99999');
  });
});
