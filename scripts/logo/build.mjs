// Builds the KSM Stroy vector logo set from the fitted emblem (params.json) and a
// fresh trace of the wordmark, then verifies it against the source bitmap.
//
//   npm install          (potrace, used for the wordmark trace)
//   node build.mjs [--out <dir>] [--no-shots]
//
// sharp and puppeteer come from the project's node_modules (see lib.mjs); set
// KSM_LOGO_SRC to point at another copy of logo.jpg (a PNG despite the name).
import fs from 'fs';
import path from 'path';
import { HERE, sharp, req, SRC, sourceAlpha, crop, rasterAlpha, binarize, dilate, iou, softIoU, overlayPNG, writeJSON } from './lib.mjs';
import { emblemStrokes, faviconStrokes, strokeToD, makeFmt, strokeLength } from './geom.mjs';
import { traceWordmark, transformPath, WORD_REGION } from './trace-wordmark.mjs';
import { cleanOutline } from './outline-fit.mjs';
import { centrelineResiduals } from './residuals.mjs';

// The functions handed to page.evaluate() run in the page, with its globals.
/* global document */

const args = process.argv.slice(2);
const OUT = path.resolve(HERE, args.includes('--out') ? args[args.indexOf('--out') + 1] : '.');
const CHECK = path.join(OUT, 'check');
const SHOTS = !args.includes('--no-shots');
fs.mkdirSync(CHECK, { recursive: true });

const COLORS = { ink: '#14202F', paper: '#F1F2EF', dusk: '#1F3A63', 'gold-ink': '#7A6336' };
const P = JSON.parse(fs.readFileSync(path.join(HERE, 'params.json'), 'utf8'));
const W = P.w; // emblem stroke, in source px (1 unit = 1 px of the 621x402 master)
const M = 0.5; // margin around the stroke bounds

// ---------- wordmark: trace + clean ----------
// K, M (first line) and T, Y (second line) are straight-edged; the M is mirrored from its left half.
const lineOnly = (b) => (b.cy < 300 ? b.cx < 274 || b.cx > 326 : (b.cx > 249 && b.cx < 285) || b.cx > 362);
const mirror = (b) => (b.cy < 300 && b.cx > 326 ? 'auto' : null);
const TRACE = { S: 8, kernel: 'cubic', blur: 0.45, threshold: 128, turdSize: 60, alphaMax: 1.0, optTolerance: 0.25 };
const CLEAN = { smooth: 1.2, curveTol: 0.18 };
const raw = await traceWordmark(TRACE);
const clean = cleanOutline(raw.d, { ...CLEAN, lineOnly, mirror });
const wordD = clean.d; // source coordinates
const wb = loopsBBox(clean.loops);

function loopsBBox(loops) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (p) => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); };
  for (const lp of loops) for (const s of lp.segs) {
    if (s.t === 'L') { take(s.p0); take(s.p1); continue; }
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, mt = 1 - t;
      take({ x: mt ** 3 * s.p0.x + 3 * mt * mt * t * s.c1.x + 3 * mt * t * t * s.c2.x + t ** 3 * s.p1.x, y: mt ** 3 * s.p0.y + 3 * mt * mt * t * s.c1.y + 3 * mt * t * t * s.c2.y + t ** 3 * s.p1.y });
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

// ---------- emblem ----------
const strokes = emblemStrokes(P);
const eb = { x0: P.ax - P.R - W / 2 - M, x1: P.ax + P.R + W / 2 + M, y0: P.yTop - W / 2 - M, y1: P.cy + P.R + W / 2 + M };
eb.w = eb.x1 - eb.x0; eb.h = eb.y1 - eb.y0;
const fE = makeFmt(-eb.x0, -eb.y0, 1, 2);
const n2 = fE.n;
const strokeAttrs = (w) => `fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
// one <path pathLength="1"> per element, in drawing order:
// ring -> tower (pyramid sides, then the block's sides) -> rungs bottom to top -> sun -> birds -> clouds and hill
function emblemPathTags(f, extra = () => '') {
  return strokes.map((s, i) => `<path class="${s.cls}" pathLength="1"${extra(s, i)} d="${strokeToD(s, f)}"/>`).join('\n  ');
}
function emblemGroup(f, extra) {
  return `<g ${strokeAttrs(W)}>\n  ${emblemPathTags(f, extra)}\n</g>`;
}
const svgOpen = (w, h, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}" role="img" aria-label="${label}">`;
const emblemSVG = `${svgOpen(eb.w, eb.h, 'KSM Stroy')}\n${emblemGroup(fE)}\n</svg>\n`;

// ---------- wordmark ----------
const fW = { x0: wb.x0 - M, y0: wb.y0 - M, w: wb.w + 2 * M, h: wb.h + 2 * M };
const wordPath = (fn) => `<path fill="currentColor" fill-rule="evenodd" d="${transformPath(wordD, fn, 2)}"/>`;
const wordmarkSVG = `${svgOpen(fW.w, fW.h, 'KSM Stroy')}\n${wordPath((x, y) => [x - fW.x0, y - fW.y0])}\n</svg>\n`;

// ---------- stacked: the original arrangement (both traced in the same frame) ----------
const st = { x0: Math.min(eb.x0, fW.x0), y0: eb.y0, x1: Math.max(eb.x1, fW.x0 + fW.w), y1: fW.y0 + fW.h };
st.w = st.x1 - st.x0; st.h = st.y1 - st.y0;
const fS = makeFmt(-st.x0, -st.y0, 1, 2);
const stackedSVG = `${svgOpen(st.w, st.h, 'KSM Stroy')}\n${emblemGroup(fS)}\n${wordPath((x, y) => [x - st.x0, y - st.y0])}\n</svg>\n`;

// ---------- horizontal: emblem left, wordmark right, centred on the ring ----------
const LOCK = { scale: 0.95, gap: 26 };
const ringCy = P.cy - eb.y0;
const hw = { s: LOCK.scale, x: eb.w + LOCK.gap };
hw.y = ringCy - (wb.h * hw.s) / 2; // wordmark (glyph bounds) centred on the ring's centre
const hz = { w: hw.x + wb.w * hw.s + M, h: eb.h };
const horizontalSVG = `${svgOpen(hz.w, hz.h, 'KSM Stroy')}\n${emblemGroup(fE)}\n${wordPath((x, y) => [hw.x + (x - wb.x0) * hw.s, hw.y + (y - wb.y0) * hw.s])}\n</svg>\n`;

// ---------- favicon: simplified emblem, heavier stroke ----------
const FAV = { w: 10, gx: 24, rungs: [0.58, 0.72, 0.86], g: 14, sunDx: -5, sunScale: 0.9, noStub: true, hill: false };
const favStrokes = faviconStrokes(P, FAV);
const favBox = (() => {
  const top = P.yTop - FAV.w / 2 - 1.5, bot = P.cy + P.R + FAV.w / 2 + 1.5, side = bot - top;
  return { x0: P.ax - side / 2, y0: top, side };
})();
const fF = makeFmt(-favBox.x0, -favBox.y0, 1, 2);
const topRung = favStrokes.filter((s) => s.cls === 'rung').at(-1);
const favPaths = favStrokes.map((s) => `<path class="${s.cls}${s === topRung ? ' top' : ''}" d="${strokeToD(s, fF)}"/>`).join('\n  ');
// currentColor throughout; the root sets gold-ink (paper in a dark browser UI) because a favicon inherits no colour.
// At 24 px and below (a 16 px tab icon) the stroke gets heavier and the shortest rung goes.
const FAV_SMALL = { w: 13 };
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(favBox.side)} ${n2(favBox.side)}">\n<style>svg{color:${COLORS['gold-ink']}}@media (prefers-color-scheme:dark){svg{color:${COLORS.paper}}}@media (max-width:24px){g{stroke-width:${FAV_SMALL.w}}.top{display:none}}</style>\n<g ${strokeAttrs(FAV.w)}>\n  ${favPaths}\n</g>\n</svg>\n`;

// ---------- write the SVGs ----------
const files = {
  'emblem.svg': emblemSVG,
  'wordmark.svg': wordmarkSVG,
  'logo-stacked.svg': stackedSVG,
  'logo-horizontal.svg': horizontalSVG,
  'favicon.svg': faviconSVG,
};
for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name), body);
// fixed-colour copies for <img>, og images and documents (currentColor would be black there)
fs.mkdirSync(path.join(OUT, 'color'), { recursive: true });
for (const base of ['emblem', 'logo-horizontal', 'logo-stacked', 'wordmark']) {
  for (const c of ['ink', 'gold-ink', 'paper']) {
    const body = files[`${base}.svg`].replace('<svg ', `<svg color="${COLORS[c]}" `);
    fs.writeFileSync(path.join(OUT, 'color', `${base}-${c}.svg`), body);
  }
}

// ---------- PNG icons ----------
const colored = (svg, color) => svg.replace('<svg ', `<svg color="${color}" `).replace(/<style>[^<]*<\/style>\n?/, '');
async function renderSVG(svg, w, h) {
  // render big then downsample (cleaner anti-aliasing than rasterising straight at 16-32 px)
  const big = await sharp(Buffer.from(svg), { density: 72 * 8 }).resize(w * 8, h * 8, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(big).resize(w, h, { kernel: 'lanczos3' }).png();
}
// 32: the simplified favicon in gold-ink on transparent
await (await renderSVG(colored(faviconSVG, COLORS['gold-ink']), 32, 32)).toFile(path.join(OUT, 'favicon-32.png'));
// 180 (apple-touch) and 512: the full emblem, centred on paper with room around it
async function iconOnPaper(size, fill, strokeW, file) {
  const s = (size * fill) / eb.h; // emblem height = fill * size
  const ew = eb.w * s, eh = eb.h * s;
  const fx = makeFmt(-eb.x0, -eb.y0, s, 2);
  const paths = strokes.map((st) => `<path d="${strokeToD(st, fx)}"/>`).join('');
  const ox = (size - ew) / 2, oy = (size - eh) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${COLORS.paper}"/><g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)})" fill="none" stroke="${COLORS['gold-ink']}" stroke-width="${(strokeW * s).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
  await sharp(Buffer.from(svg), { density: 72 * 4 }).resize(size, size).flatten({ background: COLORS.paper }).png({ palette: false }).toFile(path.join(OUT, file));
}
await iconOnPaper(180, 0.74, 3.3, 'apple-touch-icon.png');
await iconOnPaper(512, 0.70, 3.0, 'icon-512.png');

// ---------- verification ----------
const metrics = {};
const src = await sourceAlpha();
{
  // emblem vs the bitmap's alpha, at the bitmap's own scale
  const R = { x: 226, y: 46, w: 170, h: 176 };
  const target = crop(src, R.x, R.y, R.w, R.h);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${R.w}" height="${R.h}" viewBox="${R.x} ${R.y} ${R.w} ${R.h}"><g fill="none" stroke="#000" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round">${strokes.map((s) => `<path d="${strokeToD(s)}"/>`).join('')}</g></svg>`;
  const ren = await rasterAlpha(svg, R.w, R.h);
  const bt = binarize(target), br = binarize(ren);
  const res = await centrelineResiduals(P, { log: () => {} });
  metrics.emblem = {
    iou: +iou(bt, br).toFixed(4),
    iouDilated1px: +iou(dilate(bt, 1), dilate(br, 1)).toFixed(4),
    iouDilated2px: +iou(dilate(bt, 2), dilate(br, 2)).toFixed(4),
    softIoU: +softIoU(target, ren).toFixed(4),
    centrelineRmsPx: +res.rms.toFixed(3),
    centrelineSamples: res.n,
    strokeWidthPx: W,
    ringDiameterPx: +(2 * P.R).toFixed(2),
    strokeToDiameter: +(W / (2 * P.R)).toFixed(4),
    rungs: P.nRungs,
    rungSpacingPx: +P.dy.toFixed(3),
    paths: strokes.length,
    totalLengthPx: +strokes.reduce((a, s) => a + strokeLength(s), 0).toFixed(1),
  };
  await overlayPNG(target, ren, path.join(CHECK, 'emblem-overlay-5x.png'), 5);
  // side by side at 4x: source | vector | overlay
  const S = 4;
  const srcBig = await sharp(fs.readFileSync(SRC)).extract({ left: R.x, top: R.y, width: R.w, height: R.h }).resize(R.w * S, R.h * S, { kernel: 'lanczos3' }).flatten({ background: '#ffffff' }).png().toBuffer();
  const vec = await sharp(Buffer.from(svg.replace(`width="${R.w}" height="${R.h}"`, `width="${R.w * S}" height="${R.h * S}"`).replace('stroke="#000"', `stroke="${COLORS['gold-ink']}"`))).flatten({ background: '#ffffff' }).png().toBuffer();
  const ov = await sharp(path.join(CHECK, 'emblem-overlay-5x.png')).resize(R.w * S, R.h * S).png().toBuffer();
  await sharp({ create: { width: R.w * S * 3 + 20, height: R.h * S, channels: 3, background: '#9aa0a6' } })
    .composite([{ input: srcBig, left: 0, top: 0 }, { input: vec, left: R.w * S + 10, top: 0 }, { input: ov, left: 2 * (R.w * S + 10), top: 0 }]).png().toFile(path.join(CHECK, 'emblem-compare-4x.png'));
}
{
  const R = WORD_REGION;
  const target = crop(src, R.x, R.y, R.w, R.h);
  const svg = (d) => `<svg xmlns="http://www.w3.org/2000/svg" width="${R.w}" height="${R.h}" viewBox="${R.x} ${R.y} ${R.w} ${R.h}"><path fill="#000" fill-rule="evenodd" d="${d}"/></svg>`;
  const ren = await rasterAlpha(svg(wordD), R.w, R.h);
  const renRaw = await rasterAlpha(svg(raw.d), R.w, R.h);
  const bt = binarize(target);
  metrics.wordmark = {
    iou: +iou(bt, binarize(ren)).toFixed(4),
    softIoU: +softIoU(target, ren).toFixed(4),
    rawPotraceIoU: +iou(bt, binarize(renRaw)).toFixed(4),
    outlineDeviationPx: outlineDeviation(clean.loops, raw.d),
    segments: { curves: (wordD.match(/C/g) || []).length, lines: (wordD.match(/L/g) || []).length },
  };
  await overlayPNG(target, ren, path.join(CHECK, 'wordmark-overlay-4x.png'), 4);
  const S = 4;
  const srcBig = await sharp(fs.readFileSync(SRC)).extract({ left: R.x, top: R.y, width: R.w, height: R.h }).resize(R.w * S, R.h * S, { kernel: 'lanczos3' }).flatten({ background: '#ffffff' }).png().toBuffer();
  const vec = await sharp(Buffer.from(svg(wordD).replace(`width="${R.w}" height="${R.h}"`, `width="${R.w * S}" height="${R.h * S}"`).replace('fill="#000"', `fill="${COLORS['gold-ink']}"`))).flatten({ background: '#ffffff' }).png().toBuffer();
  await sharp({ create: { width: R.w * S * 2 + 10, height: R.h * S, channels: 3, background: '#9aa0a6' } })
    .composite([{ input: srcBig, left: 0, top: 0 }, { input: vec, left: R.w * S + 10, top: 0 }]).png().toFile(path.join(CHECK, 'wordmark-compare-4x.png'));
}

// distance from the cleaned outline to the raw trace (which follows the bitmap's 50 % edge)
function outlineDeviation(loops, rawD) {
  const pts = (d) => {
    const out = [];
    const toks = d.match(/[MLCZ]|-?\d*\.?\d+/g);
    let cmd = null, cur = null, start = null, nums = [];
    const flush = () => {
      if (cmd === 'M') { cur = { x: nums[0], y: nums[1] }; start = cur; }
      else if (cmd === 'L') for (let i = 0; i + 1 < nums.length; i += 2) { const p = { x: nums[i], y: nums[i + 1] }; seg(cur, p); cur = p; }
      else if (cmd === 'C') for (let i = 0; i + 5 < nums.length; i += 6) {
        const c1 = { x: nums[i], y: nums[i + 1] }, c2 = { x: nums[i + 2], y: nums[i + 3] }, p = { x: nums[i + 4], y: nums[i + 5] };
        for (let k = 1; k <= 30; k++) { const t = k / 30, mt = 1 - t; out.push({ x: mt ** 3 * cur.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t ** 3 * p.x, y: mt ** 3 * cur.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t ** 3 * p.y }); }
        cur = p;
      } else if (cmd === 'Z' && cur && start) seg(cur, start);
      nums = [];
    };
    const seg = (a, b) => { const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.1)); for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n }); };
    for (const t of toks) { if (/^[MLCZ]$/.test(t)) { if (cmd) flush(); cmd = t; if (t === 'Z') { flush(); cmd = null; } } else nums.push(+t); }
    if (cmd) flush();
    return out;
  };
  const a = pts(transformPath(wordD, (x, y) => [x, y], 4)), b = pts(rawD);
  const grid = new Map(), key = (x, y) => `${Math.floor(x)},${Math.floor(y)}`;
  for (const p of b) { const k = key(p.x, p.y); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(p); }
  const near = (p) => { let m = Infinity; const gx = Math.floor(p.x), gy = Math.floor(p.y); for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (const q of grid.get(`${gx + dx},${gy + dy}`) || []) m = Math.min(m, Math.hypot(p.x - q.x, p.y - q.y)); return m; };
  const ds = a.map(near).filter(Number.isFinite).sort((x, y) => x - y);
  return { mean: +(ds.reduce((s, v) => s + v, 0) / ds.length).toFixed(3), p95: +ds[Math.floor(ds.length * 0.95)].toFixed(3), max: +ds[ds.length - 1].toFixed(3) };
}

// ---------- demo page ----------
const T = { ring: [0, 0.5], tower: [0.22, 0.46], rung: [0.42, 0.2, 0.031], sun: [0.78, 0.36], bird: [0.92, 0.22, 0.06], cloud: [0.96, 0.3, 0.035] };
const counters = {};
const timing = (s) => {
  const i = (counters[s.cls] = (counters[s.cls] ?? -1) + 1);
  const [d0, dur, stagger = 0] = T[s.cls];
  return ` style="--d:${+(d0 + i * stagger).toFixed(3)}s;--t:${dur}s"`;
};
const fDemo = makeFmt(-eb.x0, -eb.y0, 1, 2);
const drawingSVG = `<svg class="draw" viewBox="0 0 ${n2(eb.w)} ${n2(eb.h)}" role="img" aria-label="KSM Stroy"><g ${strokeAttrs(W)}>\n  ${emblemPathTags(fDemo, timing)}\n</g></svg>`;
const totalDraw = Math.max(...Object.entries(T).map(([k, [d0, dur, stg = 0]]) => d0 + dur + stg * (strokes.filter((s) => s.cls === k).length - 1)));
const inline = (svg) => svg.replace(/<\?xml[^>]*>/, '').trim();
const demo = `<!doctype html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KSM logo check</title>
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>
  :root { --paper:${COLORS.paper}; --ink:${COLORS.ink}; --dusk:${COLORS.dusk}; --gold-ink:${COLORS['gold-ink']}; --graphite:#4A5462; --rule:#CBD0D4; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 system-ui, "Segoe UI", sans-serif; }
  main { max-width: 1040px; margin: 0 auto; padding: 40px 16px 64px; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 4px; }
  h2 { font-size: 15px; font-weight: 600; margin: 40px 0 12px; }
  p.note { color: var(--graphite); margin: 0 0 8px; max-width: 70ch; }
  .bar { display: flex; align-items: center; gap: 28px; height: 72px; padding: 0 24px; border-bottom: 1px solid var(--rule); }
  .bar svg { height: 48px; width: auto; display: block; }
  .bar nav { display: flex; gap: 22px; font-size: 14px; margin-left: auto; }
  .bar.ink { color: var(--ink); } .bar.gold { color: var(--gold-ink); }
  .bar.gold nav, .bar.ink nav { color: var(--ink); }
  .bar.dusk { background: var(--dusk); color: var(--paper); border-color: transparent; }
  .bar.dusk nav { color: var(--paper); }
  .bar .h44 { height: 44px; }
  .stage { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: center; }
  .card { background: #fff0; border: 1px solid var(--rule); padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .card.dusk { background: var(--dusk); color: var(--paper); border-color: var(--dusk); }
  svg.draw { height: 300px; width: auto; color: var(--gold-ink); }
  .card.dusk svg.draw { color: var(--paper); }
  svg.draw path { stroke-dasharray: 1 2; stroke-dashoffset: 1.002; animation: draw var(--t) cubic-bezier(.22,.61,.36,1) var(--d) forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) { svg.draw path { animation: none; stroke-dashoffset: 0; } }
  button { font: inherit; border: 1px solid var(--ink); background: transparent; color: inherit; padding: 6px 14px; border-radius: 2px; cursor: pointer; }
  .card.dusk button { border-color: var(--paper); }
  .row { display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end; }
  .row figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12.5px; color: var(--graphite); }
  .row figure.stacked { color: var(--gold-ink); } .stacked svg { height: 200px; width: auto; display: block; }
  .bar.optical svg g[stroke-width] { stroke-width: 3.45; }
  @media (max-width: 720px) { .stage { grid-template-columns: 1fr; } .bar nav { display: none; } }
</style>
</head>
<body>
<main>
  <h1>KSM Stroy: vector logo</h1>
  <p class="note">Emblem redrawn as ${strokes.length} stroked paths over the 621×402 bitmap; wordmark traced. Everything below is inline SVG in <code>currentColor</code>.</p>

  <h2>Header lockup, 48 px</h2>
  <div class="bar ink">${inline(horizontalSVG)}<nav><span>Начало</span><span>Продажби</span><span>Обекти</span><span>За нас</span><span>Контакти</span></nav></div>
  <div class="bar gold">${inline(horizontalSVG)}<nav><span>Начало</span><span>Продажби</span><span>Обекти</span><span>За нас</span><span>Контакти</span></nav></div>
  <div class="bar dusk">${inline(horizontalSVG)}<nav><span>Начало</span><span>Продажби</span><span>Обекти</span><span>За нас</span><span>Контакти</span></nav></div>
  <div class="bar gold">${inline(horizontalSVG).replace('<svg ', '<svg class="h44" ')}<nav><span>44 px</span></nav></div>
  <div class="bar gold optical">${inline(horizontalSVG)}<nav><span>option: CSS stroke-width 3.45 (about 1 CSS px at 48 px)</span></nav></div>

  <h2>The emblem draws itself (${totalDraw.toFixed(2)} s, ease-out)</h2>
  <p class="note">Order: ring, tower sides, rungs bottom to top, sun, birds, clouds and the hill. Each path has <code>pathLength="1"</code>; the page animates <code>stroke-dashoffset</code> from 1 to 0.</p>
  <div class="stage">
    <div class="card">${drawingSVG}<button type="button" data-replay>Replay</button></div>
    <div class="card dusk">${drawingSVG}<button type="button" data-replay>Replay</button></div>
  </div>

  <h2>Stacked and favicons</h2>
  <div class="row">
    <figure class="stacked">${inline(stackedSVG)}<figcaption>logo-stacked.svg</figcaption></figure>
    <figure><img src="favicon.svg" width="16" height="16" alt=""><figcaption>16</figcaption></figure>
    <figure><img src="favicon.svg" width="32" height="32" alt=""><figcaption>32</figcaption></figure>
    <figure><img src="favicon.svg" width="48" height="48" alt=""><figcaption>48</figcaption></figure>
    <figure><img src="favicon-32.png" width="32" height="32" alt=""><figcaption>favicon-32.png</figcaption></figure>
    <figure><img src="apple-touch-icon.png" width="90" height="90" alt=""><figcaption>apple-touch (180)</figcaption></figure>
  </div>
</main>
<script>
  for (const b of document.querySelectorAll('[data-replay]')) b.addEventListener('click', () => {
    const svg = b.parentElement.querySelector('svg.draw');
    const clone = svg.cloneNode(true);
    svg.replaceWith(clone);
  });
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'demo.html'), demo);

// ---------- screenshots ----------
if (SHOTS) {
  const puppeteer = req('puppeteer');
  const exe = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await puppeteer.launch({ headless: true, executablePath: fs.existsSync(exe) ? exe : undefined, args: ['--disable-gpu', '--no-first-run'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });
    const url = 'file:///' + path.join(OUT, 'demo.html').replace(/\\/g, '/');
    await page.goto(url, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, (totalDraw + 0.4) * 1000));
    await page.screenshot({ path: path.join(CHECK, 'demo-static.png'), fullPage: true });
    // header bars at 2x for a closer look
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 2 });
    const bars = await page.$$('.bar');
    const b0 = await bars[0].boundingBox(), b3 = await bars[bars.length - 1].boundingBox();
    await page.screenshot({ path: path.join(CHECK, 'demo-headers-2x.png'), clip: { x: 0, y: b0.y, width: 1100, height: b3.y + b3.height - b0.y } });
    // mid-animation: freeze every drawing animation at a few times
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });
    const stage = await page.$('.stage');
    for (const t of [0.35, 0.7, 1.05, 1.2]) {
      await page.evaluate((ms) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; } }, t * 1000);
      await stage.screenshot({ path: path.join(CHECK, `demo-mid-${String(t).replace('.', '_')}s.png`) });
    }
    // first frame: nothing may show before a path starts (no round-cap dots)
    await page.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 0; } });
    await stage.screenshot({ path: path.join(CHECK, 'demo-frame0.png') });
  } finally {
    await browser.close();
  }
}

// ---------- favicon sizes sheet ----------
{
  const tiles = [];
  for (const px of [16, 32, 48]) tiles.push(await (await renderSVG(colored(faviconSVG, COLORS['gold-ink']), px, px)).flatten({ background: COLORS.paper }).toBuffer());
  const big = await Promise.all(tiles.map((t, i) => sharp(t).resize([16, 32, 48][i] * 6, [16, 32, 48][i] * 6, { kernel: 'nearest' }).png().toBuffer()));
  const apple = await sharp(path.join(OUT, 'apple-touch-icon.png')).toBuffer();
  const comps = []; let x = 10;
  for (const b of big) { const m = await sharp(b).metadata(); comps.push({ input: b, left: x, top: 10 }); x += m.width + 16; }
  comps.push({ input: apple, left: x, top: 10 });
  await sharp({ create: { width: x + 190, height: 310, channels: 3, background: '#d9dcd6' } }).composite(comps).png().toFile(path.join(CHECK, 'favicons-6x.png'));
}

// ---------- sizes ----------
const sizes = {};
for (const f of [...Object.keys(files), 'favicon-32.png', 'apple-touch-icon.png', 'icon-512.png', 'demo.html']) sizes[f] = fs.statSync(path.join(OUT, f)).size;
metrics.sizes = sizes;
metrics.lockup = { horizontal: { viewBox: [+hz.w.toFixed(2), +hz.h.toFixed(2)], wordmarkScale: LOCK.scale, gap: LOCK.gap }, stacked: { viewBox: [+st.w.toFixed(2), +st.h.toFixed(2)] }, emblem: { viewBox: [+eb.w.toFixed(2), +eb.h.toFixed(2)] }, wordmark: { viewBox: [+fW.w.toFixed(2), +fW.h.toFixed(2)] } };
metrics.drawSeconds = +totalDraw.toFixed(2);
writeJSON(path.join(CHECK, 'metrics.json'), metrics);
console.log(JSON.stringify(metrics, null, 2));
