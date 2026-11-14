// Traces the "KSM / STROY" wordmark from the bitmap's alpha with potrace.
// The alpha is upsampled (smooth kernel), lightly blurred and thresholded at 50 %,
// so the traced outline is the bitmap's sub-pixel 50 % iso-contour; potrace then
// fits Béziers. Coordinates come back in the source bitmap's pixel space.
import fs from 'fs';
import { sharp, req, SRC } from './lib.mjs';

const potrace = req('potrace');

export const WORD_REGION = { x: 212, y: 226, w: 196, h: 126 }; // holds both lines with margin

export async function traceWordmark(opt = {}) {
  const { S = 8, kernel = 'cubic', blur = 0.45, threshold = 128, turdSize = 60, alphaMax = 1.0, optTolerance = 0.25, digits = 2 } = opt;
  const R = WORD_REGION;
  // alpha -> grey (ink black on white)
  const { data, info } = await sharp(fs.readFileSync(SRC)).ensureAlpha().extract({ left: R.x, top: R.y, width: R.w, height: R.h }).raw().toBuffer({ resolveWithObject: true });
  const grey = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < grey.length; i++) grey[i] = 255 - data[i * 4 + 3];
  let img = sharp(grey, { raw: { width: info.width, height: info.height, channels: 1 } })
    .resize(R.w * S, R.h * S, { kernel, fit: 'fill' });
  // blur is given in source px
  if (blur > 0) img = sharp(await img.png().toBuffer()).blur(Math.max(0.3, blur * S));
  const up = await img.threshold(threshold).png().toBuffer();
  const tracer = new potrace.Potrace({ turdSize, alphaMax, optCurve: true, optTolerance, threshold: 128, blackOnWhite: true, turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY });
  await new Promise((res, rej) => tracer.loadImage(up, (err) => (err ? rej(err) : res())));
  const tag = tracer.getPathTag();
  const dRaw = tag.match(/ d="([^"]+)"/)[1];
  return { d: transformPath(dRaw, (x, y) => [R.x + x / S, R.y + y / S], digits), fillRule: /evenodd/.test(tag) ? 'evenodd' : 'nonzero' };
}

// potrace emits absolute M / L / C commands with x y pairs only
export function transformPath(d, fn, digits = 2) {
  const n = (v) => {
    let s = v.toFixed(digits);
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  };
  const tokens = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  let out = '', nums = [];
  const flush = () => {
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [x, y] = fn(nums[i], nums[i + 1]);
      out += (i === 0 ? '' : ' ') + n(x) + ' ' + n(y);
    }
    nums = [];
  };
  for (const t of tokens) {
    if (/^[MLCZmlcz]$/.test(t)) {
      flush();
      if (t !== t.toUpperCase()) throw new Error('relative command in potrace output: ' + t);
      out += t;
    } else nums.push(parseFloat(t));
  }
  flush();
  return out.replace(/ ?([MLCZ]) ?/g, '$1');
}
