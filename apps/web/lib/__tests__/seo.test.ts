import { describe, it, expect } from 'vitest';
import { truncateDescription, SITE_NAME, SITE_URL, PUBLISHER } from '../seo';

describe('truncateDescription', () => {
  it('returns short text unchanged', () => {
    expect(truncateDescription('Hello world')).toBe('Hello world');
  });

  it('collapses newlines and trims', () => {
    expect(truncateDescription('  line one\nline two  ')).toBe('line one line two');
  });

  it('truncates at a word boundary with an ellipsis', () => {
    const text = 'one two three four five six seven eight nine ten';
    const out = truncateDescription(text, 20);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(21); // 20 + ellipsis
    // Cut on a space, so no partial word before the ellipsis.
    expect(out.slice(0, -1).endsWith(' ')).toBe(false);
    expect(text.startsWith(out.slice(0, -1))).toBe(true);
  });

  it('hard-cuts when the only space is very early (before 60% of maxLength)', () => {
    // A long unbroken token after an early space forces a mid-string cut.
    const text = 'ab ' + 'x'.repeat(50);
    const out = truncateDescription(text, 20);
    expect(out).toBe(text.slice(0, 20) + '…');
  });

  it('respects a custom maxLength', () => {
    const out = truncateDescription('a'.repeat(300), 10);
    expect(out).toBe('a'.repeat(10) + '…');
  });
});

describe('seo constants', () => {
  it('exposes a site name and a URL', () => {
    expect(SITE_NAME).toMatch(/Field Guide/);
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });

  it('builds the publisher logo url from SITE_URL', () => {
    expect(PUBLISHER.logo.url).toBe(`${SITE_URL}/icon-512.png`);
    expect(PUBLISHER['@type']).toBe('Organization');
  });
});
