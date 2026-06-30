import { describe, it, expect } from 'vitest';
import { generateMapLayout, type LayoutRegion } from '../data/mapNodes';

const REGIONS: LayoutRegion[] = [
  { id: 'A', title: 'Incentives', terrain: 'market-stalls', missions: ['26', '27', '28'] },
  { id: 'B', title: 'Trust', terrain: 'bridge', missions: ['34', '35'] },
];

describe('generateMapLayout', () => {
  it('creates one node per mission across all regions', () => {
    const { nodes } = generateMapLayout(REGIONS, []);
    expect(nodes.map((n) => n.id)).toEqual(['26', '27', '28', '34', '35']);
  });

  it('marks completed missions done, the first remaining recommended, the rest available', () => {
    const { nodes } = generateMapLayout(REGIONS, ['26', '27']);
    const statusById = Object.fromEntries(nodes.map((n) => [n.id, n.status]));
    expect(statusById).toEqual({
      '26': 'done',
      '27': 'done',
      '28': 'recommended',
      '34': 'available',
      '35': 'available',
    });
  });

  it('never marks any node locked', () => {
    const { nodes } = generateMapLayout(REGIONS, []);
    expect(nodes.some((n) => (n.status as string) === 'locked')).toBe(false);
  });

  it('connects sequential missions within a region and gates between regions', () => {
    const { edges } = generateMapLayout(REGIONS, []);
    // 2 in-region edges (A) + 1 in-region edge (B) + 1 gate edge = 4.
    expect(edges).toHaveLength(4);
    const gate = edges.find((e) => e.isGate);
    expect(gate).toBeDefined();
    // The gate bridges the last mission of A (28) to the first of B (34).
    expect(gate?.key).toBe('28-34');
  });

  it('places each region on its own horizontal band', () => {
    const { nodes } = generateMapLayout(REGIONS, []);
    const regionAY = nodes.find((n) => n.id === '26')!.y;
    const regionBY = nodes.find((n) => n.id === '34')!.y;
    expect(regionBY).toBeGreaterThan(regionAY);
    // Missions within a region share the same y.
    expect(nodes.find((n) => n.id === '27')!.y).toBe(regionAY);
  });

  it('exposes one terrain-carrying region area per region', () => {
    const { regionAreas } = generateMapLayout(REGIONS, []);
    expect(regionAreas.map((a) => a.id)).toEqual(['A', 'B']);
    expect(regionAreas.map((a) => a.terrain)).toEqual(['market-stalls', 'bridge']);
  });

  it('handles an empty world without throwing', () => {
    const layout = generateMapLayout([], []);
    expect(layout.nodes).toHaveLength(0);
    expect(layout.edges).toHaveLength(0);
    expect(layout.regionAreas).toHaveLength(0);
    expect(layout.width).toBeGreaterThan(0);
  });
});

describe('generateMapLayout — single region (serpentine)', () => {
  const SINGLE: LayoutRegion[] = [
    {
      id: 'A',
      title: 'Incentives',
      emoji: '🎪',
      terrain: 'market-stalls',
      missions: ['26', '27', '28', '29', '30', '31'],
    },
  ];

  it('creates one node per mission', () => {
    const { nodes } = generateMapLayout(SINGLE, []);
    expect(nodes.map((n) => n.id)).toEqual(['26', '27', '28', '29', '30', '31']);
  });

  it('connects every mission sequentially with no gate edges', () => {
    const { edges } = generateMapLayout(SINGLE, []);
    expect(edges).toHaveLength(5);
    expect(edges.every((e) => !e.isGate)).toBe(true);
  });

  it('snakes across multiple rows (not a single horizontal band)', () => {
    const { nodes } = generateMapLayout(SINGLE, []);
    const distinctRows = new Set(nodes.map((n) => n.y));
    // 6 missions at 4 columns => 2 rows.
    expect(distinctRows.size).toBe(2);
  });

  it('reverses x direction on alternating rows (boustrophedon)', () => {
    const { nodes } = generateMapLayout(SINGLE, []);
    // Row 0 (first 4) runs left → right; the 5th node (row 1) starts from the
    // right, so its x should match the 4th node's x (rightmost column).
    expect(nodes[4].x).toBe(nodes[3].x);
    // And the 6th node sits left of the 5th as the row snakes back.
    expect(nodes[5].x).toBeLessThan(nodes[4].x);
  });

  it('exposes a single full-canvas region area carrying terrain and emoji', () => {
    const { regionAreas, width } = generateMapLayout(SINGLE, []);
    expect(regionAreas).toHaveLength(1);
    expect(regionAreas[0].terrain).toBe('market-stalls');
    expect(regionAreas[0].emoji).toBe('🎪');
    expect(regionAreas[0].width).toBe(width);
  });

  it('derives status the same way (done / recommended / available)', () => {
    const { nodes } = generateMapLayout(SINGLE, ['26', '27']);
    const statusById = Object.fromEntries(nodes.map((n) => [n.id, n.status]));
    expect(statusById['26']).toBe('done');
    expect(statusById['27']).toBe('done');
    expect(statusById['28']).toBe('recommended');
    expect(statusById['29']).toBe('available');
  });

  it('generates more nodes when more missions are added', () => {
    // Adding missions to a region (as you would in hierarchy.json) must extend
    // the map automatically: one node per mission, no hard-coded cap.
    const missions = Array.from({ length: 10 }, (_, i) => String(100 + i));
    const region: LayoutRegion = {
      id: 'A',
      title: 'Big Region',
      emoji: '🗺️',
      terrain: 'plains',
      missions,
    };

    const { nodes } = generateMapLayout([region], []);
    expect(nodes).toHaveLength(10);
    expect(nodes.map((n) => n.id)).toEqual(missions);

    // And growing the region produces strictly more nodes than a smaller one,
    // proving the layout scales with the data rather than a fixed shape.
    const smaller = generateMapLayout([{ ...region, missions: missions.slice(0, 3) }], []);
    expect(smaller.nodes).toHaveLength(3);
    expect(nodes.length).toBeGreaterThan(smaller.nodes.length);
  });
});
