// Per-stroke residuals. For samples along each fitted centreline, a probe along the
// normal measures the ink centroid and the ink width, in the source bitmap and in a
// rendering of the stroke alone; the table shows source minus render (px).
// Samples whose probe touches another stroke of the model are skipped (junctions).
// Usage: node residuals.mjs params.json [bins] [label-to-dump]
import fs from 'fs';
import path from 'path';
import { HERE, sourceAlpha, rasterAlpha } from './lib.mjs';
import { emblemStrokes, strokeToD, sampleStroke } from './geom.mjs';

export async function centrelineResiduals(P, { bins = 8, dump = null, log = console.log } = {}) {
const src = await sourceAlpha();
const W = src.w, Hh = src.h;
const bil = (img, x, y) => {
  x -= 0.5; y -= 0.5; // pixel (i,j) has its centre at (i+.5, j+.5)
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const g = (i, j) => (i < 0 || j < 0 || i >= W || j >= Hh ? 0 : img[j * W + i]);
  return g(x0, y0) * (1 - fx) * (1 - fy) + g(x0 + 1, y0) * fx * (1 - fy) + g(x0, y0 + 1) * (1 - fx) * fy + g(x0 + 1, y0 + 1) * fx * fy;
};
const svgOf = (ds) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}"><g fill="none" stroke="#000" stroke-width="${P.w}" stroke-linecap="round" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
const probe = (img, p, R = 3.5) => {
  let m = 0, s = 0;
  for (let t = -R; t <= R; t += 0.25) { const a = bil(img, p.x + p.nx * t, p.y + p.ny * t); m += a * t; s += a; }
  return { off: s ? m / s : 0, wid: s * 0.25 };
};
const strokes = emblemStrokes(P);
const ds = strokes.map((s) => strokeToD(s));
const names = {};
const summary = [];
for (let si = 0; si < strokes.length; si++) {
  const st = strokes[si];
  names[st.cls] = (names[st.cls] || 0) + 1;
  const label = `${st.cls}${names[st.cls]}`;
  const oth = await rasterAlpha(svgOf(ds.filter((_, j) => j !== si)), W, Hh);
  const self = await rasterAlpha(svgOf([ds[si]]), W, Hh);
  const rows = [];
  for (const p of sampleStroke(st, 0.5)) {
    let blocked = false;
    for (let t = -3.5; t <= 3.5; t += 0.25) if (bil(oth.a, p.x + p.nx * t, p.y + p.ny * t) > 0.04) { blocked = true; break; }
    const a = probe(src.a, p), b = probe(self.a, p);
    if (dump === label && Math.round(p.u * 400) % 8 === 0) log(`  u ${p.u.toFixed(3)} (${p.x.toFixed(1)}, ${p.y.toFixed(1)}) d-off ${(a.off - b.off).toFixed(2)} wid src ${a.wid.toFixed(2)} ren ${b.wid.toFixed(2)}${blocked ? ' blocked' : ''}`);
    if (blocked || a.wid < 0.5) continue;
    rows.push({ u: p.u, off: a.off - b.off, wid: a.wid, rwid: b.wid });
  }
  if (!rows.length) { log(label.padEnd(8), 'no clean samples'); continue; }
  const mean = rows.reduce((q, r) => q + r.off, 0) / rows.length;
  const rms = Math.sqrt(rows.reduce((q, r) => q + r.off * r.off, 0) / rows.length);
  const wid = rows.reduce((q, r) => q + r.wid, 0) / rows.length, rwid = rows.reduce((q, r) => q + r.rwid, 0) / rows.length;
  const prof = [];
  for (let b = 0; b < bins; b++) {
    const rr = rows.filter((r) => r.u >= b / bins && (r.u < (b + 1) / bins || (b === bins - 1 && r.u <= 1)));
    prof.push(rr.length ? (rr.reduce((q, r) => q + r.off, 0) / rr.length).toFixed(2).padStart(6) : '     .');
  }
  summary.push({ label, n: rows.length, mean, rms, wid, rwid });
  log(label.padEnd(8), `n=${String(rows.length).padStart(4)} mean ${mean.toFixed(2).padStart(6)} rms ${rms.toFixed(2)} width src ${wid.toFixed(2)} ren ${rwid.toFixed(2)} | ${prof.join(' ')}`);
}
const all = summary.reduce((q, s) => q + s.rms * s.rms * s.n, 0), n = summary.reduce((q, s) => q + s.n, 0);
const rmsAll = Math.sqrt(all / n);
log(`overall centreline rms ${rmsAll.toFixed(3)} px over ${n} clean samples`);
return { rms: rmsAll, n, perStroke: summary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(path.join(HERE, 'residuals.mjs'))) {
  const P = JSON.parse(fs.readFileSync(path.resolve(HERE, process.argv[2] || 'params.json'), 'utf8'));
  await centrelineResiduals(P, { bins: +(process.argv[3] || 8), dump: process.argv[4] || null });
}
