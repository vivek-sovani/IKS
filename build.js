#!/usr/bin/env node
/**
 * build.js — IKS Article Builder
 * Converts articles/NN/content.json → articles/NN/index.html
 *
 * Usage:
 *   node build.js 05        — build single article
 *   node build.js all       — rebuild every article that has content.json
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = __dirname;

// ── Entry ─────────────────────────────────────────────────────────────────────
function main() {
  const arg = process.argv[2];
  if (!arg) { console.error('Usage: node build.js <id|all>'); process.exit(1); }

  if (arg === 'all') {
    const artDir = path.join(ROOT, 'articles');
    fs.readdirSync(artDir)
      .filter(d => fs.existsSync(path.join(artDir, d, 'content.json')))
      .sort()
      .forEach(buildArticle);
  } else {
    buildArticle(arg);
  }
}

function buildArticle(id) {
  const src = path.join(ROOT, 'articles', id, 'content.json');
  if (!fs.existsSync(src)) { console.error(`Missing: ${src}`); return; }
  const c    = JSON.parse(fs.readFileSync(src, 'utf8'));
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
  const sec  = site.sections.find(s => s.id === c.section) || {};
  const html = page(c, sec, id);
  const out  = path.join(ROOT, 'articles', id, 'index.html');
  fs.writeFileSync(out, html, 'utf8');
  console.log(`✓  articles/${id}/index.html`);
}

// ── Shared helpers ────────────────────────────────────────────────────────────
const FF = {
  mr: `'Noto Sans Devanagari',sans-serif`,
  en: `'Crimson Pro',Georgia,serif`,
};

/** Convert Arabic numeral to Devanagari digit string */
function toDevanagari(n) {
  return String(n).replace(/\d/g, d => '०१२३४५६७८९'[d]);
}

/** Convert **text** to <strong>text</strong> */
function md(text) {
  return (text || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Bilingual <p> pair */
function biP(mr, en) {
  return `      <p data-lang="mr">\n        ${md(mr)}\n      </p>\n      <p data-lang="en" style="display:none;">\n        ${md(en)}\n      </p>`;
}

// ── Block renderers ───────────────────────────────────────────────────────────

function renderSection(b) {
  const paras   = (b.paragraphs || []).map(p => biP(p.mr, p.en)).join('\n\n');
  const insight = b.insight ? `\n      <div class="insight-block">\n${biP(b.insight.mr, b.insight.en)}\n      </div>` : '';
  return `
    <div class="content-sec">
      <h2 data-lang="mr">${b.headMr}<span class="en-h">${b.headEn}</span></h2>
      <h2 data-lang="en" style="display:none;">${b.headEn}</h2>
${paras}${insight}
    </div>`;
}

function renderTermBox(b) {
  return `
    <div class="term-box">
      <div class="term-word">${b.word} <span class="term-roman">${b.roman}</span></div>
      <div class="term-def" data-lang="mr">${b.defMr}</div>
      <div class="term-def" data-lang="en" style="display:none;">${b.defEn}</div>
    </div>`;
}

function renderConcepts(b) {
  const cards = (b.items || []).map(c => `
        <div class="concept-card">
          <div class="c-term">${c.term}</div>
          <div class="c-roman">${c.roman}</div>
          <div class="c-def" data-lang="mr">${c.defMr}</div>
          <div class="c-def" data-lang="en" style="display:none;">${c.defEn}</div>
        </div>`).join('');
  return `
    <div class="content-sec">
      <h2 data-lang="mr">मुख्य संकल्पना<span class="en-h">Key Concepts</span></h2>
      <h2 data-lang="en" style="display:none;">Key Concepts</h2>
      <div class="concepts-grid">${cards}
      </div>
    </div>`;
}

function renderCuriosity(b) {
  return `
    <div class="curiosity-box">
      <div class="box-label" data-lang="mr">जिज्ञासा</div>
      <div class="box-label" data-lang="en" style="display:none;">Curiosity</div>
${biP(b.mr, b.en)}
    </div>`;
}

function renderActivity(b) {
  const li = arr => arr.map(i => `        <li>${md(i)}</li>`).join('\n');
  return `
    <div class="activity-box">
      <div class="box-label" data-lang="mr">कृती — स्वतः अनुभवा</div>
      <div class="box-label" data-lang="en" style="display:none;">Activity — Experience It Yourself</div>
      <ol data-lang="mr">
${li(b.mr)}
      </ol>
      <ol data-lang="en" style="display:none;">
${li(b.en)}
      </ol>
    </div>`;
}

function renderPhase2(b) {
  return `
    <div class="phase2-teaser">
      <div class="phase2-icon">📖</div>
      <div>
        <div class="phase2-label" data-lang="mr">सखोल अध्ययन — लवकरच येणार</div>
        <div class="phase2-label" data-lang="en" style="display:none;">Advanced Reading — Coming Soon</div>
        <div class="phase2-desc" data-lang="mr">${md(b.mr)}</div>
        <div class="phase2-desc" data-lang="en" style="display:none;">${md(b.en)}</div>
      </div>
    </div>`;
}

// ── SVG: Flow diagram ────────────────────────────────────────────────────────
// steps[]: { mr:[], en:[], roman?, subMr:[], subEn:[], highlight?:true }
// examples?: { headMr, headEn, mr:[], en:[] }
function svgFlow(inf) {
  const steps = inf.steps || [];
  const n = steps.length;
  const boxW = Math.floor((660 - (n - 1) * 12) / n);
  const hiIdx = steps.findIndex(s => s.highlight) !== -1
    ? steps.findIndex(s => s.highlight)
    : Math.max(n - 2, 0);

  const HI_PALETTE  = { fill: '#D4500A', stroke: '#B03A06' };
  const STD_PALETTE = [
    { fill: '#EDF0F4', stroke: '#E2E6EC' },
    { fill: '#E2E8F0', stroke: '#A8B8CC' },
    { fill: '#EEF2F7', stroke: '#D4500A' },
    { fill: '#F3F5F9', stroke: '#B8860B' },
  ];

  const boxes = steps.map((s, i) => {
    const x = 20 + i * (boxW + 12);
    return { x, cx: x + boxW / 2, w: boxW, y: i === hiIdx ? 30 : 44, h: i === hiIdx ? 128 : 100, hi: i === hiIdx };
  });

  const rects = boxes.map((b, i) => {
    const col = b.hi ? HI_PALETTE : STD_PALETTE[i % STD_PALETTE.length];
    return `        <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" fill="${col.fill}" stroke="${col.stroke}" stroke-width="${b.hi ? 2 : 1}"/>`;
  }).join('\n');

  const arrows = steps.slice(0, -1).map((_, i) => {
    const x1 = boxes[i].x + boxes[i].w, x2 = boxes[i + 1].x;
    const col = i >= hiIdx ? '#B8860B' : '#D4500A';
    const sw  = i === hiIdx - 1 ? '2' : '1.5';
    return `        <line x1="${x1}" y1="94" x2="${x2}" y2="94" stroke="${col}" stroke-width="${sw}" marker-end="url(#arrF)"/>`;
  }).join('\n');

  const exRect = inf.examples
    ? `        <rect x="20" y="170" width="660" height="80" rx="8" fill="#EDF0F4" stroke="#E2E6EC" stroke-width="1"/>`
    : '';

  function layer(lang) {
    const isMr = lang === 'mr';
    const ff = isMr ? FF.mr : FF.en;
    const out = [];
    out.push(`          <text font-family="${ff}" font-size="15" fill="#6B7A8D" text-anchor="middle" x="350" y="22">${isMr ? inf.titleMr : inf.titleEn}</text>`);

    boxes.forEach((b, i) => {
      const s = steps[i];
      const labels = isMr ? s.mr : s.en;
      const subs   = isMr ? (s.subMr || []) : (s.subEn || []);
      const tFill  = b.hi ? '#FFFFFF' : '#1C2535';
      const sFill  = b.hi ? '#D4B896' : '#6B7A8D';
      const smFill = b.hi ? '#A8B4C4' : '#3D4F63';
      const fs     = b.hi ? 17 : 13;

      labels.forEach((line, li) => {
        out.push(`          <text font-family="${ff}" font-size="${fs}" font-weight="600" fill="${tFill}" text-anchor="middle" x="${b.cx}" y="${b.y + 26 + li * 18}">${line}</text>`);
      });
      if (s.roman) {
        out.push(`          <text font-family="${FF.en}" font-size="12" font-style="italic" fill="${sFill}" text-anchor="middle" x="${b.cx}" y="${b.y + 26 + labels.length * 18 + 2}">${s.roman}</text>`);
      }
      const subBase = b.y + 26 + labels.length * 18 + (s.roman ? 20 : 4);
      subs.forEach((sub, si) => {
        out.push(`          <text font-family="${ff}" font-size="11" fill="${smFill}" text-anchor="middle" x="${b.cx}" y="${subBase + si * 15}">${sub}</text>`);
      });
    });

    if (inf.examples) {
      const head  = isMr ? inf.examples.headMr : inf.examples.headEn;
      const items = isMr ? inf.examples.mr     : inf.examples.en;
      out.push(`          <text font-family="${ff}" font-size="13" font-weight="600" fill="#1C2535" x="36" y="192">${head}</text>`);
      items.forEach((ex, i) => {
        out.push(`          <text font-family="${ff}" font-size="12" fill="#3D4F63" x="36" y="${212 + i * 17}">${ex}</text>`);
      });
    }
    out.push(`          <text font-family="${ff}" font-size="12" fill="#6B7A8D" text-anchor="middle" x="350" y="305" font-style="italic">${isMr ? inf.captionMr : inf.captionEn}</text>`);
    return out.join('\n');
  }

  return `      <svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img">
        <title>${inf.titleMr}</title>
        <defs>
          <marker id="arrF" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#D4500A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect width="700" height="320" fill="#FAF7F3"/>
${rects}
${arrows}
${exRect}
        <g data-lang="mr">
${layer('mr')}
        </g>
        <g data-lang="en" style="display:none">
${layer('en')}
        </g>
      </svg>`;
}

// ── SVG: Wheel / radial diagram ───────────────────────────────────────────────
// center: { mr, en, roman, subMr, subEn }
// quadrants[]: { position:'top-left'|'top-right'|'bottom-left'|'bottom-right',
//                color:'green'|'gold'|'purple'|'saffron',
//                headMr, headEn, subMr, subEn, itemsMr:[], itemsEn:[] }
function svgWheel(inf) {
  const Q_COL = {
    green:   { fill: '#E1F5EE', stroke: '#2A9D6B', head: '#0F6E56', sub: '#5a9a7a', line: '#2A9D6B' },
    gold:    { fill: '#FAEEDA', stroke: '#B8860B', head: '#8B6400', sub: '#c4956a', line: '#B8860B' },
    purple:  { fill: '#EEEDFF', stroke: '#7B68CC', head: '#534AB7', sub: '#8a80cc', line: '#7B68CC' },
    saffron: { fill: '#FDF1EA', stroke: '#D4500A', head: '#8B4010', sub: '#c4956a', line: '#D4500A' },
    gray:    { fill: '#F1EFE8', stroke: '#888780', head: '#5F5E5A', sub: '#888780', line: '#888780' },
  };
  const Q_POS = {
    'top-left':     { x:20,  y:32,  w:220, h:90,  lx1:240, ly1:77,  lx2:298, ly2:130 },
    'top-right':    { x:460, y:32,  w:222, h:90,  lx1:460, ly1:77,  lx2:402, ly2:130 },
    'bottom-left':  { x:20,  y:228, w:220, h:96,  lx1:240, ly1:224, lx2:298, ly2:194 },
    'bottom-right': { x:460, y:228, w:222, h:96,  lx1:460, ly1:224, lx2:402, ly2:194 },
  };

  const quads = inf.quadrants || [];
  const structure = quads.map(q => {
    const p = Q_POS[q.position]; const c = Q_COL[q.color] || Q_COL.gold;
    return `        <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1"/>`;
  }).join('\n');
  const lines = quads.map(q => {
    const p = Q_POS[q.position]; const c = Q_COL[q.color] || Q_COL.gold;
    return `        <line x1="${p.lx1}" y1="${p.ly1}" x2="${p.lx2}" y2="${p.ly2}" stroke="${c.line}" stroke-width="1" stroke-dasharray="4 3"/>`;
  }).join('\n');

  function layer(lang) {
    const isMr = lang === 'mr';
    const ff = isMr ? FF.mr : FF.en;
    const out = [];
    out.push(`          <text font-family="${ff}" font-size="14" fill="#6B7A8D" text-anchor="middle" x="350" y="20">${isMr ? inf.titleMr : inf.titleEn}</text>`);
    const ctr = inf.center;
    out.push(`          <text font-family="${ff}" font-size="20" font-weight="600" fill="#FFFFFF" text-anchor="middle" x="350" y="156">${isMr ? ctr.mr : ctr.en}</text>`);
    out.push(`          <text font-family="${FF.en}" font-size="13" font-style="italic" fill="#D4B896" text-anchor="middle" x="350" y="173">${ctr.roman}</text>`);
    out.push(`          <text font-family="${ff}" font-size="11" fill="#A8B4C4" text-anchor="middle" x="350" y="189">${isMr ? ctr.subMr : ctr.subEn}</text>`);
    quads.forEach(q => {
      const p = Q_POS[q.position]; const c = Q_COL[q.color] || Q_COL.gold;
      const tx = p.x + 16;
      const items = isMr ? q.itemsMr : q.itemsEn;
      out.push(`          <text font-family="${ff}" font-size="12" font-weight="600" fill="${c.head}" x="${tx}" y="${p.y + 20}">${isMr ? q.headMr : q.headEn}</text>`);
      out.push(`          <text font-family="${FF.en}" font-size="11" font-style="italic" fill="${c.sub}" x="${tx}" y="${p.y + 34}">${isMr ? q.subMr : q.subEn}</text>`);
      items.forEach((item, i) => {
        out.push(`          <text font-family="${ff}" font-size="12" fill="#1C2535" x="${tx}" y="${p.y + 52 + i * 17}">${item}</text>`);
      });
    });
    out.push(`          <text font-family="${ff}" font-size="12" fill="#6B7A8D" text-anchor="middle" x="350" y="336" font-style="italic">${isMr ? inf.captionMr : inf.captionEn}</text>`);
    return out.join('\n');
  }

  return `      <svg viewBox="0 0 700 348" xmlns="http://www.w3.org/2000/svg" role="img">
        <title>${inf.titleMr}</title>
        <rect width="700" height="348" fill="#FAF7F3"/>
        <circle cx="350" cy="162" r="52" fill="#D4500A" stroke="#B03A06" stroke-width="1.5"/>
${structure}
${lines}
        <g data-lang="mr">
${layer('mr')}
        </g>
        <g data-lang="en" style="display:none">
${layer('en')}
        </g>
      </svg>`;
}

// ── SVG: Bars / state comparison ──────────────────────────────────────────────
// states[]: { mr, en, roman?, subMr?, subEn?, sub2Mr?, sub2En?, highlight?:true, barWidth? }
// callout?: { mr:[], en:[], mrRight?:[], enRight?:[] }
// barLabelMr, barLabelEn, showInfinity?
function svgBars(inf) {
  const states = inf.states || [];
  const n = states.length;
  const boxW = Math.floor((640 - (n - 1) * 10) / n);
  const startX = 30;
  const STATE_COL = [
    { fill: '#EDF0F4', stroke: '#E2E6EC' },
    { fill: '#E2E8F0', stroke: '#A8B8CC' },
    { fill: '#EEF2F7', stroke: '#D4500A' },
    { fill: '#D4500A', stroke: '#B03A06' },
  ];
  const BAR_COL = ['#7A8FA0', '#A8B8CC', '#F4874B', '#D4500A'];

  const stateRects = states.map((s, i) => {
    const x = startX + i * (boxW + 10);
    const hi = s.highlight;
    const col = hi ? STATE_COL[3] : STATE_COL[Math.min(i, STATE_COL.length - 2)];
    return `        <rect x="${x}" y="${hi ? 34 : 44}" width="${boxW}" height="${hi ? 92 : 72}" rx="8" fill="${hi ? '#D4500A' : col.fill}" stroke="${hi ? '#B03A06' : col.stroke}" stroke-width="${hi ? 1.5 : 1}"/>`;
  }).join('\n');

  const barRects = states.map((s, i) => {
    const x = startX + i * (boxW + 10);
    const hi = s.highlight;
    const bw = hi ? boxW : (s.barWidth || Math.round(boxW * (i + 1) / (n + 0.5)));
    const bc = hi ? '#D4500A' : (BAR_COL[Math.min(i, BAR_COL.length - 1)]);
    return `        <rect x="${x}" y="168" width="${boxW}" height="18" rx="4" fill="#D8DFE8"/>\n        <rect x="${x}" y="168" width="${bw}" height="18" rx="4" fill="${bc}"/>`;
  }).join('\n');

  const arrows = states.slice(0, -1).map((_, i) => {
    const x1 = startX + i * (boxW + 10) + boxW;
    const x2 = startX + (i + 1) * (boxW + 10);
    return `        <line x1="${x1}" y1="80" x2="${x2}" y2="80" stroke="#D4500A" stroke-width="${i === n - 2 ? 2 : 1.5}" marker-end="url(#arrB)"/>`;
  }).join('\n');

  const callRect = inf.callout
    ? `        <rect x="30" y="210" width="640" height="64" rx="8" fill="#F3F5F9" stroke="#B8860B" stroke-width="1"/>`
    : '';

  function layer(lang) {
    const isMr = lang === 'mr';
    const ff = isMr ? FF.mr : FF.en;
    const out = [];
    out.push(`          <text font-family="${ff}" font-size="15" fill="#6B7A8D" text-anchor="middle" x="350" y="22">${isMr ? inf.titleMr : inf.titleEn}</text>`);
    states.forEach((s, i) => {
      const x  = startX + i * (boxW + 10);
      const cx = x + boxW / 2;
      const hi = s.highlight;
      const y0 = hi ? 34 : 44;
      const tF = hi ? '#FFFFFF' : (i === 2 ? '#D4500A' : '#1C2535');
      const sF = hi ? '#D4B896' : '#6B7A8D';
      const smF= hi ? '#A8B4C4' : '#3D4F63';
      const name = isMr ? s.mr : s.en;
      out.push(`          <text font-family="${ff}" font-size="16" font-weight="600" fill="${tF}" text-anchor="middle" x="${cx}" y="${y0 + 26}">${name}</text>`);
      if (s.roman) out.push(`          <text font-family="${FF.en}" font-size="13" font-style="italic" fill="${sF}" text-anchor="middle" x="${cx}" y="${y0 + 45}">${s.roman}</text>`);
      const sub  = isMr ? s.subMr  : s.subEn;
      const sub2 = isMr ? s.sub2Mr : s.sub2En;
      if (sub)  out.push(`          <text font-family="${ff}" font-size="12" fill="${smF}" text-anchor="middle" x="${cx}" y="${y0 + (s.roman ? 64 : 50)}">${sub}</text>`);
      if (sub2) out.push(`          <text font-family="${ff}" font-size="12" fill="${smF}" text-anchor="middle" x="${cx}" y="${y0 + (s.roman ? 79 : 65)}">${sub2}</text>`);
    });
    out.push(`          <text font-family="${ff}" font-size="13" fill="#6B7A8D" x="30" y="150">${isMr ? inf.barLabelMr : inf.barLabelEn}</text>`);
    if (inf.showInfinity) out.push(`          <text font-family="${FF.en}" font-size="15" font-weight="600" fill="#D4500A" x="675" y="183">&#x221e;</text>`);
    if (inf.callout) {
      const lines = isMr ? inf.callout.mr : inf.callout.en;
      out.push(`          <text font-family="${ff}" font-size="14" font-weight="600" fill="#B8860B" x="50" y="231">${lines[0]}</text>`);
      lines.slice(1).forEach((line, li) => {
        out.push(`          <text font-family="${ff}" font-size="13" fill="${li === 0 ? '#1C2535' : '#3D4F63'}" x="50" y="${250 + li * 17}">${line}</text>`);
      });
      const right = isMr ? inf.callout.mrRight : inf.callout.enRight;
      if (right) right.forEach((line, li) => {
        out.push(`          <text font-family="${li === 0 ? FF.en : ff}" font-size="${li === 0 ? 14 : 13}" font-weight="${li === 0 ? 600 : 'normal'}" fill="${li === 0 ? '#D4500A' : '#3D4F63'}" x="390" y="${250 + li * 17}">${line}</text>`);
      });
    }
    out.push(`          <text font-family="${ff}" font-size="12" fill="#6B7A8D" text-anchor="middle" x="350" y="307" font-style="italic">${isMr ? inf.captionMr : inf.captionEn}</text>`);
    return out.join('\n');
  }

  return `      <svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img">
        <title>${inf.titleMr}</title>
        <defs>
          <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#D4500A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect width="700" height="320" fill="#FAF7F3"/>
${stateRects}
${arrows}
${barRects}
${callRect}
        <g data-lang="mr">
${layer('mr')}
        </g>
        <g data-lang="en" style="display:none">
${layer('en')}
        </g>
      </svg>`;
}

// ── Slide viewer block ────────────────────────────────────────────────────────
function renderSlides(b, id) {
  return `
    <div class="slide-viewer" id="slides-${id}"
         data-pdf-mr="${b.srcMr || ''}"
         data-pdf-en="${b.srcEn || ''}">
      <div class="slide-header">
        <div class="slide-label">
          <span data-lang="mr">सादरीकरण</span>
          <span data-lang="en" style="display:none;">Presentation</span>
        </div>
        <div class="slide-controls">
          <div class="zoom-bar">
            <button class="zoom-btn" onclick="IKS.zoomSlides(this,-0.25)">−</button>
            <span class="zoom-pct">100%</span>
            <button class="zoom-btn" onclick="IKS.zoomSlides(this,+0.25)">+</button>
            <button class="zoom-btn open-pdf-btn" title="नवीन टॅबमध्ये उघडा / Open in new tab" onclick="IKS.openSlidesPdf(this)"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M8 1h4v4M12 1 6.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
      </div>
      <div class="slide-track">
        <div class="slide-inner"></div>
      </div>
    </div>`;
}

// ── Infographic dispatcher ────────────────────────────────────────────────────
function renderInfographic(b) {
  let svg = '';
  switch (b.svgType) {
    case 'flow':  svg = svgFlow(b);  break;
    case 'wheel': svg = svgWheel(b); break;
    case 'bars':  svg = svgBars(b);  break;
    default:      svg = b.svgContent || ''; break;
  }
  return `
    <figure class="art-image">
${svg}
      <figcaption data-lang="mr">${b.captionMr}</figcaption>
      <figcaption data-lang="en" style="display:none;">${b.captionEn}</figcaption>
    </figure>`;
}

// ── Block dispatcher ──────────────────────────────────────────────────────────
function renderBlock(b, id) {
  switch (b.type) {
    case 'section':     return renderSection(b);
    case 'termBox':     return renderTermBox(b);
    case 'infographic': return renderInfographic(b);
    case 'concepts':    return renderConcepts(b);
    case 'curiosity':   return renderCuriosity(b);
    case 'activity':    return renderActivity(b);
    case 'phase2':      return renderPhase2(b);
    case 'slides':      return renderSlides(b, id);
    default:            return `\n    <!-- unknown block: ${b.type} -->`;
  }
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function renderNav(nav) {
  if (!nav) return '';
  let html = '\n  <div class="art-nav">\n';
  if (nav.prev) {
    const { id, titleMr, titleEn } = nav.prev;
    html += `    <a class="nav-btn" href="/IKS/articles/${id}/">
      <span class="nav-dir" data-lang="mr">← मागील</span>
      <span class="nav-dir" data-lang="en" style="display:none;">← Previous</span>
      <span class="nav-art-title" data-lang="mr">${toDevanagari(+id)}. ${titleMr}</span>
      <span class="nav-art-title" data-lang="en" style="display:none;">${+id}. ${titleEn}</span>
    </a>\n`;
  } else if (nav.next) {
    html += `    <div></div>\n`;
  }
  if (nav.next) {
    const { id, titleMr, titleEn } = nav.next;
    html += `    <a class="nav-btn right" href="/IKS/articles/${id}/">
      <span class="nav-dir" data-lang="mr">पुढील →</span>
      <span class="nav-dir" data-lang="en" style="display:none;">Next →</span>
      <span class="nav-art-title" data-lang="mr">${toDevanagari(+id)}. ${titleMr}</span>
      <span class="nav-art-title" data-lang="en" style="display:none;">${+id}. ${titleEn}</span>
    </a>\n`;
  }
  html += '  </div>\n';
  html += `\n  <footer class="art-footer-band">
    <span class="footer-note">भारतीय ज्ञानप्रणाली व वारसा — Elements of Indian Knowledge Systems</span>
    <a class="footer-home" href="/IKS/">← मुखपृष्ठ / Home</a>
  </footer>\n`;
  return html;
}

// ── Full page ─────────────────────────────────────────────────────────────────
function page(c, sec, id) {
  const body      = (c.body || []).map(b => renderBlock(b, id)).join('\n');
  const hasSlides = (c.body || []).some(b => b.type === 'slides');
  const desc = c.metaDesc || (c.summary && c.summary.mr ? c.summary.mr.slice(0, 160) : '');

  // Article / Appendix badge
  const artNum    = parseInt(id, 10);
  const isAppendix = (c.appendix === true || c.section === 'c4');
  const seqNum    = c.section === 'c4' ? artNum - 56 : (c.appendix ? artNum - 53 : artNum);
  const badgeMr   = isAppendix ? `परिशिष्ट ${toDevanagari(seqNum)}` : `अध्याय ${toDevanagari(seqNum)}`;
  const badgeEn   = isAppendix ? `Appendix ${seqNum}` : `Chapter ${seqNum}`;

  return `<!DOCTYPE html>
<html lang="mr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.titleMr} | ${c.titleEn} — भारतीय ज्ञानप्रणाली</title>
<meta name="description" content="${desc}">
<link rel="stylesheet" href="/IKS/assets/css/fonts.css">
<link rel="stylesheet" href="/IKS/assets/css/main.css">
<link rel="stylesheet" href="/IKS/assets/css/article.css">
${hasSlides ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>' : ''}
</head>
<body>

<!-- TOP BAR -->
<header class="topbar">
  <div class="topbar-left">
    <button class="hamburger" id="hamburger" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <a class="topbar-title" href="/IKS/">
      <span class="mr">भारतीय ज्ञानप्रणाली व वारसा</span>
      <span class="en">Elements of Indian Knowledge Systems</span>
    </a>
  </div>
  <div class="topbar-right">
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang-btn="mr" onclick="IKS.setLang('mr')">मराठी</button>
      <button class="lang-btn" data-lang-btn="en" onclick="IKS.setLang('en')">English</button>
    </div>
  </div>
</header>

<!-- SIDEBAR OVERLAY -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- SIDEBAR -->
<nav class="sidebar" id="sidebar" aria-label="Article navigation"></nav>

<!-- MAIN -->
<main class="main">

  <!-- ARTICLE TOPBAR — breadcrumb + font size -->
  <div class="art-topbar">
    <div class="breadcrumb">
      <a href="/IKS/">मुखपृष्ठ / Home</a>
      <span>›</span>
      <span data-lang="mr">चक्र ${sec.numMr || ''} — ${sec.nameMr || ''}</span>
      <span data-lang="en" style="display:none;">Chapter ${sec.numMr || ''} — ${sec.nameEn || ''}</span>
    </div>
    <div class="fs-toggle">
      <button class="fs-btn active" data-fs-btn="md" onclick="IKS.setFontSize('md')" title="Default text">A</button>
      <button class="fs-btn" data-fs-btn="lg" onclick="IKS.setFontSize('lg')" title="Larger text">A+</button>
      <button class="fs-btn" data-fs-btn="xl" onclick="IKS.setFontSize('xl')" title="Largest text">A++</button>
    </div>
  </div>

  <!-- ARTICLE HEADER — title band -->
  <div class="art-header">
    <div class="art-num-badge">
      <span data-lang="mr">${badgeMr}</span>
      <span data-lang="en" style="display:none;">${badgeEn}</span>
    </div>
    <h1 data-lang="mr">${c.titleMr}</h1>
    <h1 data-lang="en" style="display:none;">${c.titleEn}</h1>
    <div class="en-title" data-lang="mr">${c.titleEn}</div>
  </div>

  <!-- ARTICLE BODY -->
  <div class="art-body">

    <!-- SUMMARY -->
    <div class="summary-box">
      <div class="box-label" data-lang="mr">सारांश</div>
      <div class="box-label" data-lang="en" style="display:none;">Summary</div>
${biP(c.summary.mr, c.summary.en)}
    </div>
${body}

  </div><!-- end art-body -->
${renderNav(c.nav)}
</main>

<script src="/IKS/assets/js/nav.js"></script>
${hasSlides ? '<script src="/IKS/assets/js/slides.js"></script>' : ''}
<script>
  fetch('/IKS/shared/sidebar.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('sidebar').innerHTML = html;
      IKS.init();
      IKS.setActiveArticle('${id}');
      ${hasSlides ? 'if (IKS.initSlides) IKS.initSlides();' : ''}
    });
</script>
</body>
</html>`;
}

main();
