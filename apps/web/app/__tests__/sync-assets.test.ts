import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');

describe('sync-assets output', () => {
  it('generates content PNGs for each mission', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '31'];
    for (const id of ids) {
      const path = join(PUBLIC_DIR, 'content', `${id}.png`);
      expect(existsSync(path), `Missing: content/${id}.png`).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(1000);
    }
  });

  it('generates OG images (1200x630) for each mission', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '31'];
    for (const id of ids) {
      const path = join(PUBLIC_DIR, 'og', `mission-${id}.png`);
      expect(existsSync(path), `Missing: og/mission-${id}.png`).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(1000);
    }
  });

  it('does not serve SVGs in public/content', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '31'];
    for (const id of ids) {
      const path = join(PUBLIC_DIR, 'content', `${id}.svg`);
      expect(existsSync(path), `SVG should not exist: content/${id}.svg`).toBe(false);
    }
  });
});
