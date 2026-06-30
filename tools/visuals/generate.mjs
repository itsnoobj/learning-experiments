#!/usr/bin/env node
/**
 * Visual Generator — Single entry point for all chapter illustrations.
 *
 * Usage:
 *   node tools/visuals/generate.mjs 1          # Generate one chapter's SVG
 *   node tools/visuals/generate.mjs 1 2 3 4 5  # Generate multiple
 *   node tools/visuals/generate.mjs --all      # Generate all registered scenes
 *
 * Each chapter's scene is a function that receives the rough.js canvas and
 * drawing helpers, and draws the story moment. The boilerplate (SVG creation,
 * background, quote, file writing) is handled once by the wrapper.
 *
 * To add a new chapter's visual:
 *   1. Add a scene function to the SCENES map below
 *   2. Run: node tools/visuals/generate.mjs <ID>
 *   3. Output lands in content/chapters/part-{NN}/{ID}.svg
 */

import rough from 'roughjs';
import { JSDOM } from 'jsdom';
import { writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = resolve(__dirname, '../../content/chapters');

// ─── Drawing helpers (passed to each scene function) ─────────────────────────

function createCanvas() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const document = dom.window.document;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // White background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '800');
  bg.setAttribute('height', '600');
  bg.setAttribute('fill', '#FFFFFF');
  svg.appendChild(bg);

  const rc = rough.svg(svg);
  const ink = '#000000';

  // Helper functions
  const line = (x1, y1, x2, y2, opts = {}) =>
    svg.appendChild(rc.line(x1, y1, x2, y2, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const circle = (cx, cy, d, opts = {}) =>
    svg.appendChild(rc.circle(cx, cy, d, { stroke: ink, strokeWidth: 2, fill: 'none', roughness: 1.0, ...opts }));

  const rect = (x, y, w, h, opts = {}) =>
    svg.appendChild(rc.rectangle(x, y, w, h, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const poly = (points, opts = {}) =>
    svg.appendChild(rc.polygon(points, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const curve = (points, opts = {}) =>
    svg.appendChild(rc.curve(points, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const path = (d, opts = {}) =>
    svg.appendChild(rc.path(d, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const ellipse = (cx, cy, w, h, opts = {}) =>
    svg.appendChild(rc.ellipse(cx, cy, w, h, { stroke: ink, strokeWidth: 2, roughness: 1.0, ...opts }));

  const text = (content, x, y, opts = {}) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', String(x));
    el.setAttribute('y', String(y));
    el.setAttribute('text-anchor', opts.anchor || 'middle');
    el.setAttribute('font-family', opts.font || 'sans-serif');
    el.setAttribute('font-size', String(opts.size || 14));
    el.setAttribute('fill', opts.fill || '#555');
    if (opts.italic) el.setAttribute('font-style', 'italic');
    if (opts.bold) el.setAttribute('font-weight', 'bold');
    el.textContent = content;
    svg.appendChild(el);
  };

  return { svg, rc, document, line, circle, rect, poly, curve, path, ellipse, text, ink };
}

function addQuote(ctx, quote) {
  ctx.text(quote, 400, 560, { size: 16, fill: '#222', italic: true });
}

function serialize(ctx) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + ctx.svg.outerHTML;
}

// ─── Accent color palette ────────────────────────────────────────────────────

const COLORS = {
  gold: '#DAA520',
  red: '#CC3333',
  blue: '#4A90D9',
  green: '#5B8C5A',
};

// ─── Scene definitions ───────────────────────────────────────────────────────
// Each scene: { part, quote, draw(ctx) }
// ctx provides: line, circle, rect, poly, curve, path, ellipse, text, rc, svg, ink

const SCENES = {
  '1': {
    part: '01',
    quote: '"You don\u2019t defend the decision \u2014 you defend the self that made it."',
    draw(ctx) {
      const { line, circle, path, rc, svg, ink } = ctx;
      const gold = COLORS.gold;

      // Small soldiers for armies
      function soldier(cx, cy, dir = 1) {
        circle(cx, cy, 14, { strokeWidth: 1.6 });
        line(cx, cy + 7, cx, cy + 34, { strokeWidth: 1.6 });
        line(cx, cy + 34, cx - 8, cy + 50, { strokeWidth: 1.6 });
        line(cx, cy + 34, cx + 8, cy + 50, { strokeWidth: 1.6 });
        line(cx + 12 * dir, cy - 18, cx + 6 * dir, cy + 30, { strokeWidth: 1.4 });
      }

      // Two armies
      for (const cx of [55, 100, 145]) {
        soldier(cx, 150, 1); soldier(cx, 230, 1); soldier(cx, 310, 1);
      }
      for (const cx of [655, 700, 745]) {
        soldier(cx, 150, -1); soldier(cx, 230, -1); soldier(cx, 310, -1);
      }

      // Arjuna center — slumped
      const ax = 400, ay = 430;
      circle(ax, ay - 70, 34);
      line(ax, ay - 53, ax + 6, ay);
      line(ax + 6, ay, ax - 12, ay + 55);
      line(ax + 6, ay, ax + 22, ay + 55);
      line(ax, ay - 40, ax - 24, ay - 2);
      line(ax + 2, ay - 40, ax + 40, ay - 6);

      // Gold bow falling
      const bx = 470, by = 470;
      path(`M ${bx} ${by - 55} Q ${bx + 46} ${by - 10} ${bx + 4} ${by + 48}`,
        { stroke: gold, strokeWidth: 3, roughness: 1.1 });
      line(bx + 1, by - 53, bx + 2, by + 46, { stroke: gold, strokeWidth: 1.6 });
      line(bx - 14, by - 40, bx - 22, by - 30, { stroke: '#999', strokeWidth: 1.2 });
      line(bx - 12, by - 18, bx - 22, by - 10, { stroke: '#999', strokeWidth: 1.2 });

      line(330, 500, 540, 500, { strokeWidth: 1.6, roughness: 1.4 });
    },
  },

  '2': {
    part: '01',
    quote: '"Ego protects you from the feeling \u2014 not the mistake."',
    draw(ctx) {
      const { line, circle, rect, text } = ctx;
      const red = COLORS.red;

      // Desk
      rect(250, 380, 360, 18);
      line(280, 398, 280, 500, { strokeWidth: 2 });
      line(580, 398, 580, 500, { strokeWidth: 2 });

      // Lincoln seated, leaning back
      const hx = 330, hy = 300;
      circle(hx, hy, 34);
      line(hx, hy + 17, hx + 6, hy + 78);
      line(hx + 6, hy + 78, hx + 46, hy + 84);
      line(hx + 46, hy + 84, hx + 50, hy + 120);
      line(hx + 4, hy + 30, hx + 70, hy + 70);
      line(hx + 70, hy + 70, hx + 120, hy + 72);

      // Hot letter (red accent)
      const lx = 450, ly = 330;
      rect(lx, ly, 90, 60, { stroke: red, strokeWidth: 2.4, fill: '#F7D9D9', fillStyle: 'solid' });
      for (let i = 0; i < 5; i++) {
        line(lx + 10, ly + 12 + i * 9, lx + 80, ly + 12 + i * 9, { stroke: red, strokeWidth: 1.3, roughness: 2.2 });
      }
      text('never sent', lx + 45, ly + 78, { size: 13, italic: true });
    },
  },

  '3': {
    part: '01',
    quote: '"Comparison is the thief of joy."',
    draw(ctx) {
      const { line, circle, rect, poly, rc, svg } = ctx;
      const gold = COLORS.gold;

      // Pedestals
      rect(150, 430, 150, 90);
      rect(500, 300, 150, 220);

      // Left figure — lower, looking up, slumped
      const Lx = 225, Lhip = 400;
      circle(Lx + 6, Lhip - 62, 30);
      line(Lx, Lhip - 47, Lx, Lhip);
      line(Lx, Lhip, Lx - 15, Lhip + 30);
      line(Lx, Lhip, Lx + 15, Lhip + 30);
      line(Lx, Lhip - 35, Lx - 30, Lhip - 5);
      circle(Lx - 36, Lhip + 2, 14, { strokeWidth: 1.6 });
      line(Lx, Lhip - 35, Lx + 22, Lhip - 8);
      line(Lx + 18, Lhip - 70, Lx + 250, Lhip - 150, { stroke: '#aaa', strokeWidth: 1.2, roughness: 1.8 });

      // Right figure — higher, arms raised
      const Rx = 575, Rhip = 270;
      circle(Rx, Rhip - 60, 30);
      line(Rx, Rhip - 45, Rx, Rhip);
      line(Rx, Rhip, Rx - 16, Rhip + 30);
      line(Rx, Rhip, Rx + 16, Rhip + 30);
      line(Rx, Rhip - 33, Rx - 26, Rhip - 66);
      line(Rx, Rhip - 33, Rx + 26, Rhip - 66);

      // Gold star prize
      const px = Rx, py = Rhip - 86;
      const starPoints = [];
      for (let i = 0; i < 5; i++) {
        const oa = (i * 72 - 90) * Math.PI / 180;
        const ia = ((i * 72) + 36 - 90) * Math.PI / 180;
        starPoints.push([px + 22 * Math.cos(oa), py + 22 * Math.sin(oa)]);
        starPoints.push([px + 9 * Math.cos(ia), py + 9 * Math.sin(ia)]);
      }
      starPoints.push(starPoints[0]);
      poly(starPoints, { stroke: '#B8860B', strokeWidth: 2, fill: gold, fillStyle: 'solid' });
    },
  },

  '4': {
    part: '01',
    quote: '"Praise is a fine reward and a terrible master."',
    draw(ctx) {
      const { line, circle, path, rc, svg } = ctx;
      const gold = COLORS.gold;

      // Tree trunk + branch
      line(110, 150, 110, 470, { strokeWidth: 4, roughness: 1.2 });
      path('M 110 230 Q 200 215 290 245', { strokeWidth: 3, roughness: 1.1 });

      // Water waves
      for (let i = 0; i < 4; i++) {
        path(`M 0 ${470 + i * 16} q 60 -12 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`,
          { stroke: '#7799bb', strokeWidth: 1.6, roughness: 1.3 });
      }

      // Monkey reaching for fruit
      const mx = 250, my = 280;
      circle(mx, my, 26);
      line(mx, my + 13, mx - 6, my + 55);
      line(mx - 6, my + 55, mx - 22, my + 80);
      line(mx - 6, my + 55, mx + 8, my + 84);
      line(mx - 4, my + 24, mx - 30, my + 6);
      line(mx + 2, my + 24, mx + 70, my - 6);
      path(`M ${mx - 6} ${my + 55} q -40 30 -20 60 t 30 10`, { strokeWidth: 1.8, roughness: 1.2 });

      // Gold fruit
      const fx = 380, fy = 268;
      circle(fx, fy, 30, { stroke: '#B8860B', strokeWidth: 2, fill: gold, fillStyle: 'solid', roughness: 0.9 });
      line(fx, fy - 15, fx - 4, fy - 30, { strokeWidth: 2 });
      line(mx + 72, my - 8, fx - 18, fy + 2, { stroke: '#bbb', strokeWidth: 1.2, roughness: 1.8 });

      // Crocodile
      const cx = 370, cy = 500;
      path(`M ${cx - 120} ${cy} q 80 24 220 0`, { stroke: '#444', strokeWidth: 3, roughness: 1.2 });
      path(`M ${cx - 120} ${cy + 18} q 80 22 220 0`, { stroke: '#444', strokeWidth: 3, roughness: 1.2 });
      line(cx + 92, cy - 2, cx + 140, cy - 26, { stroke: '#444', strokeWidth: 2.4 });
      line(cx + 92, cy + 10, cx + 142, cy + 4, { stroke: '#444', strokeWidth: 2.4 });
      for (let i = 0; i < 4; i++) {
        line(cx + 100 + i * 10, cy - 4 - i * 4, cx + 104 + i * 10, cy + 6 - i * 2, { stroke: '#444', strokeWidth: 1.2 });
      }
      circle(cx + 70, cy - 8, 8, { stroke: '#444', strokeWidth: 1.6 });
    },
  },

  '5': {
    part: '01',
    quote: '"The fear of being exposed is not evidence that you are."',
    draw(ctx) {
      const { line, circle, poly, ellipse } = ctx;
      const gold = COLORS.gold;

      // Spotlight cone (gold accent)
      const lampX = 400, lampY = 70;
      poly(
        [[lampX - 14, lampY], [lampX + 14, lampY], [565, 470], [235, 470]],
        { stroke: gold, strokeWidth: 1.6, fill: '#FBEFC9', fillStyle: 'solid', roughness: 1.1 }
      );
      ctx.rect(lampX - 20, lampY - 26, 40, 26,
        { stroke: ctx.ink, strokeWidth: 2, fill: gold, fillStyle: 'solid', roughness: 0.9 });

      // Stage floor
      line(120, 470, 680, 470, { strokeWidth: 2.4, roughness: 1.2 });

      // Hunched figure under spotlight
      const fx = 400, fhip = 430;
      circle(fx, fhip - 50, 26);
      line(fx, fhip - 37, fx, fhip);
      line(fx, fhip, fx - 14, fhip + 30);
      line(fx, fhip, fx + 14, fhip + 30);
      line(fx, fhip - 28, fx - 18, fhip - 6);
      line(fx - 18, fhip - 6, fx - 2, fhip + 4);
      line(fx, fhip - 28, fx + 18, fhip - 6);
      line(fx + 18, fhip - 6, fx + 2, fhip + 4);

      // Shadow pool
      ellipse(fx, fhip + 34, 70, 16, { stroke: '#caa', strokeWidth: 1, fill: '#EFE3BE', fillStyle: 'solid', roughness: 1.2 });
    },
  },

  '31': {
    part: '02',
    quote: '"That\'s how it\'s always been done here."',
    draw(ctx) {
      const { line, circle, rc, svg, curve } = ctx;
      const ink = ctx.ink;

      // Ladder
      line(370, 100, 370, 460);
      line(430, 100, 430, 460);
      for (let y = 140; y <= 440; y += 50) line(370, y, 430, y);

      // Gold star at top
      const starPoints = [];
      for (let i = 0; i < 5; i++) {
        const oa = (i * 72 - 90) * Math.PI / 180;
        const ia = ((i * 72) + 36 - 90) * Math.PI / 180;
        starPoints.push([400 + 18 * Math.cos(oa), 75 + 18 * Math.sin(oa)]);
        starPoints.push([400 + 8 * Math.cos(ia), 75 + 8 * Math.sin(ia)]);
      }
      starPoints.push(starPoints[0]);
      ctx.poly(starPoints, { stroke: '#B8860B', strokeWidth: 2, fill: COLORS.gold, fillStyle: 'solid', roughness: 0.8 });

      // Stick figure helper
      function stickFigure(cx, cy, arms = 'down') {
        circle(cx, cy - 55, 26);
        line(cx, cy - 42, cx, cy);
        line(cx, cy, cx - 15, cy + 40);
        line(cx, cy, cx + 15, cy + 40);
        if (arms === 'up') {
          line(cx, cy - 25, cx - 18, cy - 60);
          line(cx, cy - 25, cx + 18, cy - 60);
        } else if (arms === 'reach-right') {
          line(cx, cy - 25, cx + 50, cy - 40);
          line(cx, cy - 20, cx + 45, cy - 25);
        } else if (arms === 'reach-left') {
          line(cx, cy - 25, cx - 50, cy - 40);
          line(cx, cy - 20, cx - 45, cy - 25);
        } else {
          line(cx, cy - 25, cx - 25, cy + 5);
          line(cx, cy - 25, cx + 25, cy + 5);
        }
      }

      stickFigure(400, 230, 'up');
      stickFigure(180, 400, 'reach-right');
      stickFigure(280, 410, 'reach-right');
      stickFigure(520, 410, 'reach-left');
      stickFigure(620, 400, 'reach-left');

      // Pull ropes
      const ropeOpts = { stroke: ink, strokeWidth: 1.8, roughness: 2.5 };
      curve([[230, 360], [290, 330], [340, 300], [385, 270]], ropeOpts);
      curve([[325, 385], [350, 350], [370, 320], [390, 270]], ropeOpts);
      curve([[475, 385], [450, 350], [430, 320], [410, 270]], ropeOpts);
      curve([[570, 360], [510, 330], [460, 300], [415, 270]], ropeOpts);
    },
  },
};

// ─── Find output path for a chapter ID ───────────────────────────────────────

function findOutputPath(id) {
  const scene = SCENES[id];
  if (!scene) return null;
  const partDir = `part-${scene.part}`;
  const dir = resolve(CONTENT_ROOT, partDir);
  return resolve(dir, `${id}.svg`);
}

// ─── Generate one chapter's SVG ──────────────────────────────────────────────

function generate(id) {
  const scene = SCENES[id];
  if (!scene) {
    console.error(`✗ No scene registered for chapter ${id}`);
    return false;
  }

  const ctx = createCanvas();
  scene.draw(ctx);
  addQuote(ctx, scene.quote);

  const outPath = findOutputPath(id);
  writeFileSync(outPath, serialize(ctx));
  console.log(`✓ Generated: ${outPath}`);
  return true;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Visual Generator — Hand-drawn SVG illustrations for chapters

Usage:
  node tools/visuals/generate.mjs <id> [id...]   Generate specific chapters
  node tools/visuals/generate.mjs --all           Generate all registered scenes

Registered scenes: ${Object.keys(SCENES).join(', ')}

To add a new scene:
  1. Add an entry to the SCENES map in this file
  2. Run: node tools/visuals/generate.mjs <id>
  3. Copy to public: cp content/chapters/part-XX/<id>.svg apps/web/public/content/
     (or let prebuild auto-sync handle it)
`);
  process.exit(0);
}

const ids = args[0] === '--all' ? Object.keys(SCENES) : args;
let success = 0;

for (const id of ids) {
  if (generate(id)) success++;
}

console.log(`\nDone: ${success}/${ids.length} generated.`);
