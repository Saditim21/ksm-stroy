// Parametric geometry of the KSM emblem, in the source bitmap's pixel space
// (src/assets/images/logo.jpg, 621x402). Every element is a stroke centreline.
// Shared by fit-emblem.mjs (fits the numbers against the bitmap) and build.mjs.

const TAU = Math.PI * 2;

// ---------- small geometry helpers ----------
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const nearest = (pts, near) => pts.slice().sort((p, q) => dist(p, near) - dist(q, near))[0];
export function circleCircle(a, b, near) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  const l = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(a.r * a.r - l * l, 0));
  const mx = a.x + (dx * l) / d, my = a.y + (dy * l) / d;
  return nearest([{ x: mx - (h * dy) / d, y: my + (h * dx) / d }, { x: mx + (h * dy) / d, y: my - (h * dx) / d }], near);
}
export function circleVLine(c, x, near) {
  const h = Math.sqrt(Math.max(c.r * c.r - (x - c.x) ** 2, 0));
  return nearest([{ x, y: c.y - h }, { x, y: c.y + h }], near);
}
export function circleHLine(c, y, near) {
  const h = Math.sqrt(Math.max(c.r * c.r - (y - c.y) ** 2, 0));
  return nearest([{ x: c.x - h, y }, { x: c.x + h, y }], near);
}
// line x = x0 + s*(y - y0) against a circle
export function circleSlantLine(c, x0, y0, s, near) {
  const a = s * s + 1, ex = x0 - s * y0 - c.x;
  const b = 2 * (s * ex - c.y), cc = ex * ex + c.y * c.y - c.r * c.r;
  const disc = Math.sqrt(Math.max(b * b - 4 * a * cc, 0));
  return nearest([(-b - disc) / (2 * a), (-b + disc) / (2 * a)].map((y) => ({ x: x0 + s * (y - y0), y })), near);
}
// circle against the infinite line through p and q
export function circleLine(c, p, q, near) {
  const dx = q.x - p.x, dy = q.y - p.y, fx = p.x - c.x, fy = p.y - c.y;
  const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), cc = fx * fx + fy * fy - c.r * c.r;
  const disc = Math.sqrt(Math.max(b * b - 4 * a * cc, 0));
  return nearest([(-b - disc) / (2 * a), (-b + disc) / (2 * a)].map((t) => ({ x: p.x + t * dx, y: p.y + t * dy })), near);
}
const ang = (c, p) => Math.atan2(p.y - c.y, p.x - c.x);
const onCircle = (c, a) => ({ x: c.x + c.r * Math.cos(a), y: c.y + c.r * Math.sin(a) });
// sweep (radians, >= 0) from a0 to a1 going in direction dir (+1 = clockwise on screen)
function sweepOf(a0, a1, dir) {
  let s = (a1 - a0) * dir;
  while (s < 0) s += TAU;
  while (s >= TAU) s -= TAU;
  return s;
}

// ---------- primitives ----------
// arc(c, from, to, dir), line(p0, p1), quad(p0, c, p1); a "stroke" is a list of
// segments that join end to start (a new subpath where they do not).
const arc = (c, p0, p1, dir) => ({ t: 'A', c, p0, p1, dir, sw: sweepOf(ang(c, p0), ang(c, p1), dir) });
const line = (p0, p1) => ({ t: 'L', p0, p1 });
const quad = (p0, c, p1) => ({ t: 'Q', p0, c, p1 });
const cubic = (p0, c1, c2, p1) => ({ t: 'C', p0, c1, c2, p1 });
export function cubicAt(s, t) {
  const mt = 1 - t, a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
  return { x: a * s.p0.x + b * s.c1.x + c * s.c2.x + d * s.p1.x, y: a * s.p0.y + b * s.c1.y + c * s.c2.y + d * s.p1.y };
}
function cubicD(s, t) {
  const mt = 1 - t;
  return {
    x: 3 * mt * mt * (s.c1.x - s.p0.x) + 6 * mt * t * (s.c2.x - s.c1.x) + 3 * t * t * (s.p1.x - s.c2.x),
    y: 3 * mt * mt * (s.c1.y - s.p0.y) + 6 * mt * t * (s.c2.y - s.c1.y) + 3 * t * t * (s.p1.y - s.c2.y),
  };
}
// first t in [0,1] where fn(point) changes sign, refined by bisection
function cubicRoot(s, fn) {
  const N = 400;
  let pt = 0, pv = fn(cubicAt(s, 0));
  for (let i = 1; i <= N; i++) {
    const t = i / N, v = fn(cubicAt(s, t));
    if ((pv <= 0) !== (v <= 0)) {
      let lo = pt, hi = t, lv = pv;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, mv = fn(cubicAt(s, m)); if ((lv <= 0) === (mv <= 0)) { lo = m; lv = mv; } else hi = m; }
      return (lo + hi) / 2;
    }
    pt = t; pv = v;
  }
  return null;
}

export function emblemStrokes(P) {
  const C = { x: P.ax, y: P.cy, r: P.R };
  const S = { x: P.sx, y: P.sy, r: P.sr };
  const L1 = { x: P.l1x, y: P.l1y, r: P.l1r };
  const L2 = { x: P.l2x, y: P.l2y, r: P.l2r };
  const R1 = { x: P.r1x, y: P.r1y, r: P.r1r };
  const R2 = { x: P.r2x, y: P.r2y, r: P.r2r };
  const half = (y) => P.wTop + P.k * (y - P.yTop); // pyramid side offset from the axis at height y
  const out = [];

  // the hill: a cubic from the ring (bottom left) to the ring (right), ends given as ring angles
  const ha = { x: P.ax + P.R * Math.cos(P.hta), y: P.cy + P.R * Math.sin(P.hta) };
  const hb = { x: P.ax + P.R * Math.cos(P.htb), y: P.cy + P.R * Math.sin(P.htb) };
  const hill = cubic(ha, { x: ha.x + P.h1x, y: ha.y + P.h1y }, { x: hb.x + P.h2x, y: hb.y + P.h2y }, hb);

  // 1. the ring: a short arc from the tower to the sun, then the long sweep behind the sun, round to the tower
  const topL = { x: P.ax - P.gx, y: P.cy - Math.sqrt(P.R * P.R - P.gx * P.gx) };
  const topR = { x: P.ax + P.gx, y: topL.y };
  const sunUp = circleCircle(C, S, { x: 290, y: 76 });
  const sunLo = circleCircle(C, S, { x: 252, y: 107 });
  out.push({ cls: 'ring', segs: [arc(C, topL, sunUp, -1), arc(C, sunLo, topR, -1)] });

  // 2. the tower: pyramid sides rise to the apex; the block behind rises to its shoulders
  const apexL = { x: P.ax - P.wTop, y: P.yTop }, apexR = { x: P.ax + P.wTop, y: P.yTop }, apex = { x: P.ax, y: P.yTop };
  const leftBottom = circleSlantLine(C, apexL.x, P.yTop, -P.k, { x: 281, y: 210 });
  const tR = cubicRoot(hill, (p) => p.x - (apexR.x + P.k * (p.y - P.yTop)));
  const rightBottom = tR == null ? { x: apexR.x + P.k * (186 - P.yTop), y: 186 } : cubicAt(hill, tR);
  out.push({ cls: 'tower', segs: [line(leftBottom, apexL), line(apexL, apex)] });
  out.push({ cls: 'tower', segs: [line(rightBottom, apexR), line(apexR, apex)] });
  const yCross = P.yTop + (P.bw - P.wTop) / P.k;
  // the shoulders rise slightly towards the pyramid (sp = drop per px outwards)
  const cornerY = P.yB + (P.sp || 0) * (P.bw - half(P.yB));
  for (const s of [-1, 1]) {
    const a = { x: P.ax + s * P.bw, y: yCross }, b = { x: P.ax + s * P.bw, y: cornerY }, c = { x: P.ax + s * half(P.yB), y: P.yB };
    out.push({ cls: 'tower', segs: [line(a, b), line(b, c)] });
  }

  // 3. rungs, bottom to top; the hill hides the right-hand part of the lowest ones
  for (let i = P.nRungs - 1; i >= 0; i--) {
    const y = P.y1 + i * P.dy, hw = half(y) - P.g;
    const x0 = P.ax - hw;
    let x1 = P.ax + hw;
    const th = cubicRoot(hill, (p) => p.y - y);
    if (th != null) x1 = Math.min(x1, cubicAt(hill, th).x);
    if (x1 > x0 + 0.3) out.push({ cls: 'rung', segs: [line({ x: x0, y }, { x: x1, y })] });
  }

  // 4. the sun, minus the arc hidden behind the block
  const sunA = circleVLine(S, P.ax - P.bw, { x: 0, y: S.y + S.r });
  const sunB = circleLine(S, { x: P.ax - P.bw, y: cornerY }, { x: P.ax - half(P.yB), y: P.yB }, { x: S.x + S.r, y: P.yB });
  out.push({ cls: 'sun', segs: [arc(S, sunA, sunB, +1)] });

  // 5. birds: one shape in three places
  for (const [x, y] of [[P.b1x, P.b1y], [P.b2x, P.b2y], [P.b3x, P.b3y]]) {
    const t0 = { x: x - P.bhw, y: y - P.bdp }, t1 = { x: x + P.bhw, y: y - P.bdp }, v = { x, y };
    out.push({ cls: 'bird', segs: [quad(t0, { x: x - P.bhw * P.bc, y: y - P.bdp }, v), quad(v, { x: x + P.bhw * P.bc, y: y - P.bdp }, t1)] });
  }

  // 6. clouds and the hill
  const l1a = circleCircle(L1, C, { x: 241, y: 161 });
  const cusL = circleCircle(L1, L2, { x: 259.5, y: 165.5 });
  out.push({ cls: 'cloud', segs: [arc(L1, l1a, cusL, +1)] });
  out.push({ cls: 'cloud', segs: [arc(L2, onCircle(L2, P.l2a0), onCircle(L2, P.l2a1), +1)] });
  const r2a = circleCircle(R2, C, { x: 379, y: 149 });
  const cusR = circleCircle(R2, R1, { x: 362, y: 154 });
  out.push({ cls: 'cloud', segs: [arc(R2, r2a, cusR, -1)] });
  out.push({ cls: 'cloud', segs: [arc(R1, onCircle(R1, P.r1a1), onCircle(R1, P.r1a0), -1)] });
  if (P.h2ta != null) {
    const q0 = { x: P.ax + P.R * Math.cos(P.h2ta), y: P.cy + P.R * Math.sin(P.h2ta) };
    const q3 = { x: apexR.x + P.k * (P.h2ey - P.yTop), y: P.h2ey };
    const hill2 = cubic(q0, { x: q0.x + P.k1x, y: q0.y + P.k1y }, { x: q3.x + P.k2x, y: q3.y + P.k2y }, q3);
    out.push({ cls: 'cloud', segs: [hill, hill2] });
  } else out.push({ cls: 'cloud', segs: [hill] });
  return out;
}

// ---------- output ----------
export function makeFmt(tx = 0, ty = 0, scale = 1, digits = 2) {
  const n = (v) => {
    let s = (Math.round(v * 10 ** digits) / 10 ** digits).toFixed(digits);
    if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s;
  };
  return { n, X: (x) => n((x + tx) * scale), Y: (y) => n((y + ty) * scale), L: (v) => n(v * scale) };
}

export function strokeToD(st, f = makeFmt()) {
  let d = '', cur = null;
  const P = (p) => `${f.X(p.x)} ${f.Y(p.y)}`;
  for (const s of st.segs) {
    if (!cur || Math.hypot(cur.x - s.p0.x, cur.y - s.p0.y) > 1e-6) d += `M${P(s.p0)}`;
    if (s.t === 'L') {
      if (Math.abs(s.p0.y - s.p1.y) < 1e-9) d += `H${f.X(s.p1.x)}`;
      else if (Math.abs(s.p0.x - s.p1.x) < 1e-9) d += `V${f.Y(s.p1.y)}`;
      else d += `L${P(s.p1)}`;
    } else if (s.t === 'Q') d += `Q${P(s.c)} ${P(s.p1)}`;
    else if (s.t === 'C') d += `C${P(s.c1)} ${P(s.c2)} ${P(s.p1)}`;
    else if (s.t === 'A') d += `A${f.L(s.c.r)} ${f.L(s.c.r)} 0 ${s.sw > Math.PI ? 1 : 0} ${s.dir > 0 ? 1 : 0} ${P(s.p1)}`;
    cur = s.p1;
  }
  return d;
}

export function emblemPaths(P, f = makeFmt()) {
  return emblemStrokes(P).map((st) => ({ cls: st.cls, d: strokeToD(st, f) }));
}

// centreline samples with unit normals, every `step` px
export function sampleStroke(st, step = 0.5) {
  const pts = [];
  st.segs.forEach((s, si) => {
    const base = pts.length;
    if (s.t === 'L') {
      const L = Math.hypot(s.p1.x - s.p0.x, s.p1.y - s.p0.y), n = Math.max(1, Math.ceil(L / step));
      const tx = (s.p1.x - s.p0.x) / L, ty = (s.p1.y - s.p0.y) / L;
      for (let i = 0; i <= n; i++) pts.push({ x: s.p0.x + (s.p1.x - s.p0.x) * (i / n), y: s.p0.y + (s.p1.y - s.p0.y) * (i / n), nx: -ty, ny: tx, u: i / n });
    } else if (s.t === 'A') {
      const a0 = ang(s.c, s.p0), L = s.sw * s.c.r, n = Math.max(1, Math.ceil(L / step));
      for (let i = 0; i <= n; i++) {
        const a = a0 + s.dir * s.sw * (i / n);
        pts.push({ x: s.c.x + s.c.r * Math.cos(a), y: s.c.y + s.c.r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a), u: i / n });
      }
    } else if (s.t === 'Q') {
      const n = 40;
      for (let i = 0; i <= n; i++) {
        const t = i / n, mt = 1 - t;
        const x = mt * mt * s.p0.x + 2 * mt * t * s.c.x + t * t * s.p1.x, y = mt * mt * s.p0.y + 2 * mt * t * s.c.y + t * t * s.p1.y;
        const dx = 2 * mt * (s.c.x - s.p0.x) + 2 * t * (s.p1.x - s.c.x), dy = 2 * mt * (s.c.y - s.p0.y) + 2 * t * (s.p1.y - s.c.y);
        const l = Math.hypot(dx, dy) || 1;
        pts.push({ x, y, nx: -dy / l, ny: dx / l, u: t });
      }
    } else if (s.t === 'C') {
      const n = 120;
      for (let i = 0; i <= n; i++) {
        const t = i / n, p = cubicAt(s, t), d = cubicD(s, t), l = Math.hypot(d.x, d.y) || 1;
        pts.push({ x: p.x, y: p.y, nx: -d.y / l, ny: d.x / l, u: t });
      }
    }
    for (let i = base; i < pts.length; i++) pts[i].seg = si;
  });
  // global arc-length fraction along the whole stroke
  let L = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i && pts[i].seg === pts[i - 1].seg) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    pts[i].s = L;
  }
  for (const p of pts) p.u = L ? p.s / L : 0;
  return pts;
}

// centreline length of a stroke
export function strokeLength(st) {
  let L = 0;
  for (const s of st.segs) {
    if (s.t === 'L') L += Math.hypot(s.p1.x - s.p0.x, s.p1.y - s.p0.y);
    else if (s.t === 'A') L += s.sw * s.c.r;
    else { const pts = sampleStroke({ segs: [s] }); for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); }
  }
  return L;
}

// stroke bounding box of the emblem (ring + apex), centreline extremes +- half stroke
export function emblemBBox(P, w = P.w) {
  return { x0: P.ax - P.R - w / 2, x1: P.ax + P.R + w / 2, y0: P.yTop - w / 2, y1: P.cy + P.R + w / 2 };
}

// ---------- the favicon: the emblem simplified for 16-48 px ----------
// Same ring, pyramid and hill as the emblem; a heavier stroke F.w; wider gaps where
// the heavy strokes would otherwise merge; the block, birds and side clouds dropped;
// F.rungs (fractions of the pyramid height, 0 = apex, 1 = ring bottom) instead of 12.
export function faviconStrokes(P, F) {
  const C = { x: P.ax, y: P.cy, r: P.R };
  const S = { x: P.sx + (F.sunDx || 0), y: P.sy + (F.sunDy || 0), r: P.sr * (F.sunScale || 1) };
  const wTop = F.wTop ?? P.wTop;
  const half = (y) => wTop + P.k * (y - P.yTop);
  const out = [];
  const ha = { x: P.ax + P.R * Math.cos(P.hta), y: P.cy + P.R * Math.sin(P.hta) };
  const hb = { x: P.ax + P.R * Math.cos(P.htb), y: P.cy + P.R * Math.sin(P.htb) };
  const hill = cubic(ha, { x: ha.x + P.h1x, y: ha.y + P.h1y }, { x: hb.x + P.h2x, y: hb.y + P.h2y }, hb);
  const topL = { x: P.ax - F.gx, y: P.cy - Math.sqrt(P.R * P.R - F.gx * F.gx) };
  const topR = { x: P.ax + F.gx, y: topL.y };
  const sunUp = circleCircle(C, S, { x: 290, y: 76 });
  const sunLo = circleCircle(C, S, { x: 252, y: 107 });
  out.push({ cls: 'ring', segs: F.noStub ? [arc(C, sunLo, topR, -1)] : [arc(C, topL, sunUp, -1), arc(C, sunLo, topR, -1)] });
  const apexL = { x: P.ax - wTop, y: P.yTop }, apexR = { x: P.ax + wTop, y: P.yTop }, apex = { x: P.ax, y: P.yTop };
  const leftBottom = circleSlantLine(C, apexL.x, P.yTop, -P.k, { x: 281, y: 210 });
  const tR = F.hill ? cubicRoot(hill, (p) => p.x - (apexR.x + P.k * (p.y - P.yTop))) : null;
  const rightBottom = tR != null ? cubicAt(hill, tR) : circleSlantLine(C, apexR.x, P.yTop, P.k, { x: 338, y: 210 });
  out.push({ cls: 'tower', segs: [line(leftBottom, apexL), line(apexL, apex)] });
  out.push({ cls: 'tower', segs: [line(rightBottom, apexR), line(apexR, apex)] });
  const yBottom = P.cy + P.R;
  for (const f of [...F.rungs].sort((a, b) => b - a)) {
    const y = P.yTop + f * (yBottom - P.yTop), hw = half(y) - F.g;
    let x1 = P.ax + hw;
    if (F.hill) { const th = cubicRoot(hill, (p) => p.y - y); if (th != null) x1 = Math.min(x1, cubicAt(hill, th).x); }
    if (x1 > P.ax - hw + 0.3) out.push({ cls: 'rung', segs: [line({ x: P.ax - hw, y }, { x: x1, y })] });
  }
  // full sun (no block to hide behind)
  const s0 = { x: S.x - S.r, y: S.y }, s1 = { x: S.x + S.r, y: S.y };
  out.push({ cls: 'sun', segs: [arc(S, s0, s1, +1), arc(S, s1, s0, +1)] });
  if (F.hill) out.push({ cls: 'cloud', segs: [hill] });
  return out;
}
