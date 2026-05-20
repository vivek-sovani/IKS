#!/usr/bin/env node
/**
 * Generate PWA icon and splash screen PNGs.
 *
 * Outputs (relative to project root):
 *   assets/images/icon-192.png   — 192×192 maskable app icon
 *   assets/images/icon-512.png   — 512×512 maskable app icon
 *   assets/images/splash.png     — 853×1844 PWA install screenshot
 *
 * Run from project root:
 *   node scripts/gen_pwa_assets.js
 *
 * Requires: sharp   (npm install sharp, or use /tmp/node_modules)
 */

'use strict';
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('/tmp/node_modules/sharp'); }

const path = require('path');
const fs   = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'assets', 'images');

// ── Palette ──────────────────────────────────────────
const BG     = '#F2E9D5';   // parchment
const BG2    = '#EAE0C6';   // parchment-2
const ACCENT = '#B14820';   // saffron
const GOLD   = '#9C7A2A';   // gold
const RULE   = '#C9B996';   // border rule
const INK    = '#1E1812';   // ink

// ── Bird glyph (iks-icon.svg, colors explicit) ───────
// Original viewBox: -32 -32 64 64  (64 units wide, centred at origin)
function birdGlyph(color = ACCENT) {
  return `
  <g fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="0" cy="0" r="29"/>
    <circle cx="0" cy="0" r="27" stroke-width="0.6"/>
  </g>
  <g fill="${color}" stroke="none">
    <circle cx="0"     cy="-30.5" r="0.9"/>
    <circle cx="11.7"  cy="-28.2" r="0.9"/>
    <circle cx="21.6"  cy="-21.6" r="0.9"/>
    <circle cx="28.2"  cy="-11.7" r="0.9"/>
    <circle cx="30.5"  cy="0"     r="0.9"/>
    <circle cx="28.2"  cy="11.7"  r="0.9"/>
    <circle cx="21.6"  cy="21.6"  r="0.9"/>
    <circle cx="11.7"  cy="28.2"  r="0.9"/>
    <circle cx="0"     cy="30.5"  r="0.9"/>
    <circle cx="-11.7" cy="28.2"  r="0.9"/>
    <circle cx="-21.6" cy="21.6"  r="0.9"/>
    <circle cx="-28.2" cy="11.7"  r="0.9"/>
    <circle cx="-30.5" cy="0"     r="0.9"/>
    <circle cx="-28.2" cy="-11.7" r="0.9"/>
    <circle cx="-21.6" cy="-21.6" r="0.9"/>
    <circle cx="-11.7" cy="-28.2" r="0.9"/>
  </g>
  <g fill="${color}" stroke="${color}" stroke-width="0.4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="-7.5" cy="-13" rx="3.4" ry="2.8" transform="rotate(-12 -7.5 -13)"/>
    <path d="M -10.6 -13.4 L -14.5 -12.2 L -12 -11 Z"/>
    <circle cx="-9"   cy="-18"   r="1.2"/>
    <circle cx="-5.5" cy="-18.5" r="1"/>
    <ellipse cx="7.5"  cy="-13" rx="3.4" ry="2.8" transform="rotate(12 7.5 -13)"/>
    <path d="M 10.6 -13.4 L 14.5 -12.2 L 12 -11 Z"/>
    <circle cx="9"   cy="-18"   r="1.2"/>
    <circle cx="5.5" cy="-18.5" r="1"/>
    <path d="M -5 -11 C -3 -7 -1.5 -5 0 -4 C 1.5 -5 3 -7 5 -11 C 4 -8 2.5 -7 0 -7 C -2.5 -7 -4 -8 -5 -11 Z"/>
    <path d="M -5 -5 C -10 -5 -14 -2 -14 4 C -13 7 -10 8 -7 6 C -5 4 -4 1 -4 -2 Z"/>
    <path d="M  5 -5 C 10 -5 14 -2 14 4 C 13 7 10 8  7 6 C  5 4  4 1  4 -2 Z"/>
    <path d="M 0 -6 C -4.5 -5 -6 -2 -6 2 C -6 7 -3 12 0 14 C 3 12 6 7 6 2 C 6 -2 4.5 -5 0 -6 Z"/>
    <path d="M 0 13 L -8 22 L -4 19 Z"/>
    <path d="M 0 13 L -4 23 L -1 20 Z"/>
    <path d="M 0 13 L  0 24 L  2 21 L 1 20 Z"/>
    <path d="M 0 13 L  4 23 L  1 20 Z"/>
    <path d="M 0 13 L  8 22 L  4 19 Z"/>
  </g>
  <g fill="none" stroke="${color}" stroke-width="0.5">
    <path d="M -2 2 q 2 -2 4 0"/>
    <path d="M -2 5 q 2 -2 4 0"/>
    <path d="M -2 8 q 2 -2 4 0"/>
  </g>`;
}

function birdAt(cx, cy, scale, color = ACCENT) {
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">${birdGlyph(color)}</g>`;
}

// ── Icon SVG (square, maskable) ───────────────────────
function makeIconSVG(size) {
  // 64-unit wide bird; scale so it takes ~72% of size (safe-zone friendly)
  const scale = (size / 64) * 0.72;
  const cx = size / 2, cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  ${birdAt(cx, cy, scale)}
</svg>`;
}

// ── Splash screen SVG (853 × 1844) ───────────────────
function makeSplashSVG(w = 853, h = 1844) {
  const birdScale = (w / 64) * 0.54;
  const birdCx    = w / 2;
  const birdCy    = h * 0.365;

  const ruleY1    = h * 0.635;
  const ruleY2    = h * 0.788;
  const titleMrY  = h * 0.674;
  const titleEnY  = h * 0.736;
  const subY      = h * 0.800;
  const footY     = h * 0.940;

  const fsMain  = (w * 0.068).toFixed(1);   // Marathi title font-size
  const fsEn    = (w * 0.048).toFixed(1);   // English title
  const fsSub   = (w * 0.034).toFixed(1);   // sub
  const fsFoot  = (w * 0.026).toFixed(1);   // footer

  return `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect x="0" y="0" width="${w}" height="${h * 0.53}" fill="${BG2}" opacity="0.4"/>
  <rect x="0" y="${h * 0.91}" width="${w}" height="${h * 0.09}" fill="${BG2}" opacity="0.55"/>

  ${birdAt(birdCx, birdCy, birdScale)}

  <!-- horizontal rules -->
  <line x1="${w*0.10}" y1="${ruleY1}" x2="${w*0.90}" y2="${ruleY1}"
        stroke="${RULE}" stroke-width="1.6"/>
  <line x1="${w*0.10}" y1="${ruleY2}" x2="${w*0.90}" y2="${ruleY2}"
        stroke="${RULE}" stroke-width="1"/>

  <!-- diamond ornament -->
  <polygon points="${w/2},${ruleY1-10} ${w/2+10},${ruleY1} ${w/2},${ruleY1+10} ${w/2-10},${ruleY1}"
           fill="${GOLD}" opacity="0.65"/>

  <!-- Marathi main title (uses system Devanagari font) -->
  <text x="${w/2}" y="${titleMrY}"
        font-family="'Noto Sans Devanagari', 'Kohinoor Devanagari', 'Devanagari MT', sans-serif"
        font-size="${fsMain}" font-weight="600"
        fill="${INK}" text-anchor="middle">भारतीय ज्ञानप्रणाली व वारसा</text>

  <!-- English title -->
  <text x="${w/2}" y="${titleEnY}"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${fsEn}" font-style="italic"
        fill="${ACCENT}" text-anchor="middle">Elements of Indian Knowledge Systems</text>

  <!-- sub-title -->
  <text x="${w/2}" y="${subY}"
        font-family="Georgia, serif"
        font-size="${fsSub}" font-style="italic"
        fill="${GOLD}" text-anchor="middle" letter-spacing="2">A bilingual heritage edition</text>

  <!-- footer URL -->
  <text x="${w/2}" y="${footY}"
        font-family="Georgia, serif"
        font-size="${fsFoot}"
        fill="${RULE}" text-anchor="middle">vivek-sovani.github.io / IKS</text>
</svg>`;
}

// ── Render ────────────────────────────────────────────
async function render(svgString, outFile, w, h) {
  const buf = Buffer.from(svgString, 'utf8');
  await sharp(buf)
    .resize(w, h)
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log(`  ✓  ${path.relative(ROOT, outFile)}  (${w}×${h})`);
}

(async () => {
  console.log('Generating PWA assets…');
  await render(makeIconSVG(512),   path.join(OUT, 'icon-512.png'),  512,  512);
  await render(makeIconSVG(192),   path.join(OUT, 'icon-192.png'),  192,  192);
  await render(makeSplashSVG(),    path.join(OUT, 'splash.png'),    853, 1844);
  console.log('Done.');
})();
