import rough from 'roughjs';
import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = dom.window.document;

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', '800');
svg.setAttribute('height', '600');
svg.setAttribute('viewBox', '0 0 800 600');
svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
bg.setAttribute('width', '800');
bg.setAttribute('height', '600');
bg.setAttribute('fill', '#FFFFFF');
svg.appendChild(bg);

const rc = rough.svg(svg);
const ink = '#000000';
const accent = '#CC3333';

const line = (x1, y1, x2, y2, opts = {}) =>
  svg.appendChild(rc.line(x1, y1, x2, y2, { stroke: ink, strokeWidth: 2, roughness: 0.8, ...opts }));

const circle = (cx, cy, d, opts = {}) =>
  svg.appendChild(rc.circle(cx, cy, d, { stroke: ink, strokeWidth: 2, fill: 'none', roughness: 0.8, ...opts }));

// --- Ladder ---
line(370, 100, 370, 460);
line(430, 100, 430, 460);
for (let y = 140; y <= 440; y += 50) {
  line(370, y, 430, y);
}

// --- Goal (star at top of ladder) ---
// Simple 5-point star
const starPoints = [];
for (let i = 0; i < 5; i++) {
  const outerAngle = (i * 72 - 90) * Math.PI / 180;
  const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
  starPoints.push([400 + 18 * Math.cos(outerAngle), 75 + 18 * Math.sin(outerAngle)]);
  starPoints.push([400 + 8 * Math.cos(innerAngle), 75 + 8 * Math.sin(innerAngle)]);
}
starPoints.push(starPoints[0]); // close
svg.appendChild(rc.polygon(starPoints, { stroke: '#B8860B', strokeWidth: 2, fill: '#DAA520', fillStyle: 'solid', roughness: 0.8 }));

// --- Stick figure helper ---
function stickFigure(cx, cy, { arms = 'down', label = '' } = {}) {
  // Head
  circle(cx, cy - 55, 26);
  // Body
  line(cx, cy - 42, cx, cy);
  // Legs
  line(cx, cy, cx - 15, cy + 40);
  line(cx, cy, cx + 15, cy + 40);

  // Arms
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

  // Label
  if (label) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(cx));
    text.setAttribute('y', String(cy + 65));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('font-size', '12');
    text.setAttribute('fill', '#555');
    text.textContent = label;
    svg.appendChild(text);
  }
}

// Climber on ladder — arms reaching up toward banana
stickFigure(400, 230, { arms: 'up' });

// Ground level monkeys — reaching toward the climber
stickFigure(180, 400, { arms: 'reach-right' });
stickFigure(280, 410, { arms: 'reach-right' });
stickFigure(520, 410, { arms: 'reach-left' });
stickFigure(620, 400, { arms: 'reach-left' });

// Pull ropes — wavy, rope-like curves connecting hands to climber
const ropeOpts = { stroke: ink, strokeWidth: 1.8, roughness: 2.5 };
// Left side ropes
svg.appendChild(rc.curve([[230, 360], [290, 330], [340, 300], [385, 270]], ropeOpts));
svg.appendChild(rc.curve([[325, 385], [350, 350], [370, 320], [390, 270]], ropeOpts));
// Right side ropes
svg.appendChild(rc.curve([[475, 385], [450, 350], [430, 320], [410, 270]], ropeOpts));
svg.appendChild(rc.curve([[570, 360], [510, 330], [460, 300], [415, 270]], ropeOpts));

// --- Quote at bottom ---
const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
text.setAttribute('x', '400');
text.setAttribute('y', '545');
text.setAttribute('text-anchor', 'middle');
text.setAttribute('font-family', 'sans-serif');
text.setAttribute('font-size', '16');
text.setAttribute('fill', '#222');
text.setAttribute('font-style', 'italic');
text.textContent = '"That\'s how it\'s always been done here."';
svg.appendChild(text);

const svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg.outerHTML;
writeFileSync('../chapters/part-02-other-people/31-why-do-people-resist-change.svg', svgStr);
console.log('Generated: 31-why-do-people-resist-change.svg');
