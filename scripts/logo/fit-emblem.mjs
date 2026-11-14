// Fits the parametric emblem (geom.mjs) to the source bitmap's alpha by
// coordinate descent on the pixel L2 error, rasterising with sharp/librsvg.
// Usage: node fit-emblem.mjs [--from params.json] [--iters n] [--blur s] [--only k1,k2] [--skip k1,k2]
//                            [--rungs-from-centroids] [--out params.json]
// How params.json was made: DEFAULTS (hand measurements of the bitmap, +0.5 px for pixel
// centres) -> --blur 0.8 --iters 10 -> --iters 40 -> hill as a cubic, shoulder pitch and the
// second hill stroke added -> --rungs-from-centroids -> w fixed at 2.9 -> --iters 40 --skip w,y1,dy.
// With no --from it refines params.json.
import fs from 'fs';
import path from 'path';
import { HERE, sourceAlpha, crop, rasterAlpha, l2, binarize, dilate, iou, softIoU, overlayPNG, writeJSON } from './lib.mjs';
import { emblemPaths } from './geom.mjs';
import { centrelineResiduals } from './residuals.mjs';

const deg = Math.PI / 180;
export const DEFAULTS = {
  w: 2.85,
  ax: 309.4, cy: 144.4, R: 70.6, gx: 12.35,
  sx: 269.8, sy: 89.0, sr: 23.5,
  yTop: 53.5, wTop: 3.55, k: 0.161,
  bw: 22.9, yB: 98.4,
  nRungs: 12, y1: 109.6, dy: 8.88, g: 5.5,
  bhw: 7.75, bdp: 3.1, bc: 0.35,
  b1x: 264.1, b1y: 142.9, b2x: 347.5, b2y: 116.0, b3x: 359.2, b3y: 131.5,
  l1x: 243, l1y: 194.5, l1r: 33.2,
  l2x: 278.75, l2y: 184.4, l2r: 25.4, l2a0: 203.5 * deg, l2a1: 275.1 * deg,
  r1x: 338.5, r1y: 180.3, r1r: 33.7, r1a0: -89.15 * deg, r1a1: -19.7 * deg,
  r2x: 377, r2y: 180.2, r2r: 30.6,
  // the hill as a cubic, converted from the first circular-arc fit (centre 360.3,255.1, r 71.3)
  hta: 1.6934, htb: 0.5885, h1x: 14.92, h1y: -22.07, h2x: -26.46, h2y: -3.1,
};
const STEP = (k) => {
  if (k === 'nRungs') return 0;
  if (/a[01]$/.test(k)) return 0.02;
  if (k === 'k') return 0.003;
  if (k === 'hta' || k === 'htb' || k === 'h2ta') return 0.006;
  if (k === 'sp') return 0.02;
  if (k === 'bc') return 0.05;
  if (k === 'w') return 0.08;
  if (k === 'dy') return 0.05;
  return 0.4;
};

// region of the source that holds the emblem
export const REG = { x: 226, y: 46, w: 170, h: 176 };

export function emblemSVG(P, reg = REG, color = '#000') {
  const paths = emblemPaths(P).map((p) => `<path d="${p.d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${reg.w}" height="${reg.h}" viewBox="${reg.x} ${reg.y} ${reg.w} ${reg.h}"><g fill="none" stroke="${color}" stroke-width="${P.w}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
}

function blurArr(img, s) {
  if (!s) return img;
  // separable gaussian
  const r = Math.ceil(s * 3), ker = [];
  let sum = 0; for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * s * s)); ker.push(v); sum += v; }
  for (let i = 0; i < ker.length; i++) ker[i] /= sum;
  const { w, h } = img; const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let i = -r; i <= r; i++) { const xx = Math.min(w - 1, Math.max(0, x + i)); v += img.a[y * w + xx] * ker[i + r]; } tmp[y * w + x] = v; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let i = -r; i <= r; i++) { const yy = Math.min(h - 1, Math.max(0, y + i)); v += tmp[yy * w + x] * ker[i + r]; } out[y * w + x] = v; }
  return { a: out, w, h };
}

export async function evaluate(P) {
  const src = await sourceAlpha();
  const target = crop(src, REG.x, REG.y, REG.w, REG.h);
  const ren = await rasterAlpha(emblemSVG(P), REG.w, REG.h);
  const bt = binarize(target), br = binarize(ren);
  return {
    l2: l2(target, ren),
    iou: iou(bt, br),
    iouDil1: iou(dilate(bt, 1), dilate(br, 1)),
    soft: softIoU(target, ren),
    target, ren,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const from = opt('--from', fs.existsSync(path.join(HERE, 'params.json')) ? 'params.json' : null);
  let P = { ...DEFAULTS, ...(from ? JSON.parse(fs.readFileSync(path.resolve(HERE, from), 'utf8')) : {}) };
  const only = opt('--only') ? opt('--only').split(',') : null;
  const skip = opt('--skip') ? opt('--skip').split(',') : [];
  const blur = +opt('--blur', 0);
  const iters = +opt('--iters', 0);
  const out = opt('--out');
  const tag = opt('--tag', 'fit');

  const src = await sourceAlpha();
  const targetRaw = crop(src, REG.x, REG.y, REG.w, REG.h);
  const target = blurArr(targetRaw, blur);
  const loss = async (Q) => l2(target, blurArr(await rasterAlpha(emblemSVG(Q), REG.w, REG.h), blur));

  let best = await loss(P);
  console.log('initial loss', best.toFixed(2));
  const keys = Object.keys(P).filter((k) => STEP(k) > 0 && (!only || only.includes(k)) && !skip.includes(k));
  const step = Object.fromEntries(keys.map((k) => [k, STEP(k)]));
  let evals = 0;
  for (let it = 0; it < iters; it++) {
    let improved = false;
    for (const k of keys) {
      if (step[k] < STEP(k) / 64) continue;
      for (const dir of [1, -1]) {
        const Q = { ...P, [k]: P[k] + dir * step[k] };
        let l;
        try { l = await loss(Q); } catch { continue; }
        evals++;
        if (Number.isFinite(l) && l < best - 1e-6) {
          best = l; P = Q; improved = true;
          // keep going in the same direction while it helps
          for (let n = 0; n < 6; n++) {
            const Q2 = { ...P, [k]: P[k] + dir * step[k] };
            const l2v = await loss(Q2); evals++;
            if (Number.isFinite(l2v) && l2v < best - 1e-6) { best = l2v; P = Q2; } else break;
          }
          break;
        }
        if (dir === -1) step[k] /= 2;
      }
    }
    console.log(`iter ${it} loss ${best.toFixed(3)} evals ${evals}`);
    if (!improved && keys.every((k) => step[k] < STEP(k) / 64)) break;
  }
  if (args.includes('--rungs-from-centroids')) {
    // rung heights from the ink centroids (L2 is nearly flat for a thin line inside a thicker bar),
    // kept evenly spaced by a least-squares line through them
    const res = await centrelineResiduals(P, { log: () => {} });
    const rows = res.perStroke.filter((s) => /^rung\d+$/.test(s.label)).map((s) => {
      const k = +s.label.slice(4), i = P.nRungs - k; // rung1 is the bottom one
      return { i, y: P.y1 + i * P.dy + s.mean };
    });
    const mi = rows.reduce((a, r) => a + r.i, 0) / rows.length, my = rows.reduce((a, r) => a + r.y, 0) / rows.length;
    const b = rows.reduce((a, r) => a + (r.i - mi) * (r.y - my), 0) / rows.reduce((a, r) => a + (r.i - mi) ** 2, 0);
    P = { ...P, y1: my - b * mi, dy: b };
    console.log(`rungs from centroids: y1 ${P.y1.toFixed(3)} dy ${P.dy.toFixed(4)}`);
  }
  const ev = await evaluate(P);
  console.log(`L2 ${ev.l2.toFixed(2)}  IoU ${ev.iou.toFixed(4)}  IoU(dil1) ${ev.iouDil1.toFixed(4)}  soft ${ev.soft.toFixed(4)}`);
  if (out) writeJSON(path.resolve(HERE, out), P);
  fs.mkdirSync(path.join(HERE, '_work'), { recursive: true });
  await overlayPNG(ev.target, ev.ren, path.join(HERE, '_work', `overlay-${tag}.png`), 5);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(path.join(HERE, 'fit-emblem.mjs'))) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
