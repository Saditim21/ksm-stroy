// Shared helpers: sharp loading, bitmap alpha, SVG rasterising, metrics.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
// sharp/puppeteer are borrowed read-only from the production checkout unless the
// caller's own node_modules has them (inside the repo later: plain imports work).
const candidates = [process.env.KSM_NODE_MODULES_FROM, path.join(HERE, 'package.json'), 'C:/ksm-stroy/ksm-stroy/package.json'].filter(Boolean);
export function req(name) {
  for (const c of candidates) {
    try { return createRequire(c)(name); } catch {}
  }
  throw new Error(`cannot resolve ${name}`);
}
export const sharp = req('sharp');
sharp.concurrency(1);
sharp.cache(false);

export const SRC = process.env.KSM_LOGO_SRC || 'C:/ksm-stroy/ksm-stroy/src/assets/images/logo.jpg';

let _src;
export async function sourceAlpha() {
  if (_src) return _src;
  const { data, info } = await sharp(fs.readFileSync(SRC)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const a = new Float32Array(info.width * info.height);
  for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3] / 255;
  _src = { a, w: info.width, h: info.height, rgba: data };
  return _src;
}

export function crop(img, x0, y0, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[y * w + x] = img.a[(y + y0) * img.w + (x + x0)];
  return { a: out, w, h };
}

// rasterise an SVG string to an alpha array (coverage 0..1)
export async function rasterAlpha(svg, w, h) {
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .resize(w, h, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const a = new Float32Array(info.width * info.height);
  for (let i = 0; i < a.length; i++) a[i] = data[i * 4 + 3] / 255;
  return { a, w: info.width, h: info.height };
}

export function l2(a, b) {
  let s = 0;
  for (let i = 0; i < a.a.length; i++) { const d = a.a[i] - b.a[i]; s += d * d; }
  return s;
}

export function binarize(img, t = 0.5) {
  const out = new Uint8Array(img.a.length);
  for (let i = 0; i < out.length; i++) out[i] = img.a[i] >= t ? 1 : 0;
  return { m: out, w: img.w, h: img.h };
}
export function dilate(b, r = 1) {
  const { w, h } = b; const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!b.m[y * w + x]) continue;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r + 0.5) continue;
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) out[yy * w + xx] = 1;
    }
  }
  return { m: out, w, h };
}
export function iou(a, b) {
  let i = 0, u = 0;
  for (let k = 0; k < a.m.length; k++) { if (a.m[k] && b.m[k]) i++; if (a.m[k] || b.m[k]) u++; }
  return u ? i / u : 1;
}
export function softIoU(a, b) {
  let i = 0, u = 0;
  for (let k = 0; k < a.a.length; k++) { i += Math.min(a.a[k], b.a[k]); u += Math.max(a.a[k], b.a[k]); }
  return u ? i / u : 1;
}
// fraction of pixels of `a` (binary) farther than r px from any pixel of `b`
export function strayFraction(a, b, r) {
  const bd = dilate(b, r);
  let n = 0, s = 0;
  for (let k = 0; k < a.m.length; k++) if (a.m[k]) { n++; if (!bd.m[k]) s++; }
  return n ? s / n : 0;
}

// overlay: source in one colour, render in another; overlap dark
export async function overlayPNG(src, ren, file, scale = 4) {
  const { w, h } = src;
  const buf = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const s = src.a[i], r = ren.a[i];
    // white background; source only -> red; render only -> blue; both -> near black
    const R = 255 * (1 - r) * 1 + 0;
    const both = Math.min(s, r);
    const sOnly = Math.max(s - both, 0), rOnly = Math.max(r - both, 0);
    let cr = 255, cg = 255, cb = 255;
    // mix
    cr = 255 - 255 * rOnly - 230 * both - 20 * sOnly;
    cg = 255 - 200 * sOnly - 140 * rOnly - 230 * both;
    cb = 255 - 230 * sOnly - 20 * rOnly - 200 * both;
    buf[i * 3] = Math.max(0, Math.min(255, cr));
    buf[i * 3 + 1] = Math.max(0, Math.min(255, cg));
    buf[i * 3 + 2] = Math.max(0, Math.min(255, cb));
    void R;
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).resize(w * scale, h * scale, { kernel: 'nearest' }).png().toFile(file);
}

export function writeJSON(file, obj) { fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n'); }
