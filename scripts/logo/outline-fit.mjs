// Cleans a traced outline (potrace output, absolute M/L/C/Z) into a smooth one:
// dense resampling -> corner detection -> straight runs become lines, curved runs
// are refitted with cubic Béziers (Schneider's algorithm) within a tolerance ->
// corners rebuilt as intersections of the neighbouring segments -> near-axis lines
// snapped, and horizontal edges that share a height aligned.
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a, s) => ({ x: a.x * s, y: a.y * s });
const dot = (a, b) => a.x * b.x + a.y * b.y;
const len = (a) => Math.hypot(a.x, a.y);
const norm = (a) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function parsePath(d) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const subs = [];
  let cur = null, pos = null, cmd = null, nums = [];
  const take = () => {
    if (cmd === 'M') { pos = { x: nums[0], y: nums[1] }; cur = { start: pos, segs: [] }; subs.push(cur); for (let i = 2; i + 1 < nums.length; i += 2) { const p = { x: nums[i], y: nums[i + 1] }; cur.segs.push({ t: 'L', p0: pos, p1: p }); pos = p; } }
    else if (cmd === 'L') for (let i = 0; i + 1 < nums.length; i += 2) { const p = { x: nums[i], y: nums[i + 1] }; cur.segs.push({ t: 'L', p0: pos, p1: p }); pos = p; }
    else if (cmd === 'C') for (let i = 0; i + 5 < nums.length; i += 6) { const c1 = { x: nums[i], y: nums[i + 1] }, c2 = { x: nums[i + 2], y: nums[i + 3] }, p = { x: nums[i + 4], y: nums[i + 5] }; cur.segs.push({ t: 'C', p0: pos, c1, c2, p1: p }); pos = p; }
    nums = [];
  };
  for (const t of tokens) {
    if (/^[MLCZ]$/.test(t)) { if (cmd) take(); cmd = t; if (t === 'Z') { if (pos && cur && dist(pos, cur.start) > 1e-9) cur.segs.push({ t: 'L', p0: pos, p1: cur.start }); cmd = null; } }
    else nums.push(parseFloat(t));
  }
  if (cmd) take();
  return subs;
}

const bez = (p0, c1, c2, p1, t) => {
  const mt = 1 - t;
  return { x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p1.x, y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p1.y };
};

// closed polyline, resampled uniformly by arc length (step h)
function resampleLoop(sp, h) {
  const dense = [];
  for (const s of sp.segs) {
    const n = s.t === 'L' ? Math.max(1, Math.ceil(dist(s.p0, s.p1) / 0.02)) : 200;
    for (let i = 0; i < n; i++) dense.push(s.t === 'L' ? add(s.p0, mul(sub(s.p1, s.p0), i / n)) : bez(s.p0, s.c1, s.c2, s.p1, i / n));
  }
  const cum = [0];
  for (let i = 1; i <= dense.length; i++) cum.push(cum[i - 1] + dist(dense[i - 1], dense[i % dense.length]));
  const L = cum[dense.length], n = Math.max(8, Math.round(L / h)), out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (i * L) / n;
    while (cum[j + 1] < s) j++;
    const a = dense[j], b = dense[(j + 1) % dense.length], f = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push(add(a, mul(sub(b, a), f)));
  }
  return { pts: out, step: L / n, L };
}

// ---------- Schneider: fit a run of points with cubic Béziers ----------
function chordParam(pts) {
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + dist(pts[i], pts[i - 1]));
  const L = u[u.length - 1] || 1;
  return u.map((v) => v / L);
}
function generateBezier(pts, u, t1, t2) {
  const p0 = pts[0], p3 = pts[pts.length - 1];
  let C00 = 0, C01 = 0, C11 = 0, X0 = 0, X1 = 0;
  for (let i = 0; i < pts.length; i++) {
    const t = u[i], mt = 1 - t, b0 = mt * mt * mt, b1 = 3 * mt * mt * t, b2 = 3 * mt * t * t, b3 = t * t * t;
    const A1 = mul(t1, b1), A2 = mul(t2, b2);
    C00 += dot(A1, A1); C01 += dot(A1, A2); C11 += dot(A2, A2);
    const tmp = sub(pts[i], add(mul(p0, b0 + b1), mul(p3, b2 + b3)));
    X0 += dot(A1, tmp); X1 += dot(A2, tmp);
  }
  const det = C00 * C11 - C01 * C01;
  let a1 = det ? (X0 * C11 - X1 * C01) / det : 0, a2 = det ? (C00 * X1 - C01 * X0) / det : 0;
  const segLen = dist(p0, p3), eps = 1e-6 * segLen;
  if (a1 < eps || a2 < eps) { a1 = a2 = segLen / 3; }
  return { p0, c1: add(p0, mul(t1, a1)), c2: add(p3, mul(t2, a2)), p1: p3 };
}
function maxError(pts, b, u) {
  let m = 0, at = Math.floor(pts.length / 2);
  for (let i = 1; i < pts.length - 1; i++) { const d = dist(bez(b.p0, b.c1, b.c2, b.p1, u[i]), pts[i]); if (d > m) { m = d; at = i; } }
  return { m, at };
}
function reparam(pts, b, u) {
  return u.map((t, i) => {
    const q = bez(b.p0, b.c1, b.c2, b.p1, t);
    const mt = 1 - t;
    const d1 = add(add(mul(sub(b.c1, b.p0), 3 * mt * mt), mul(sub(b.c2, b.c1), 6 * mt * t)), mul(sub(b.p1, b.c2), 3 * t * t));
    const d2 = add(mul(add(sub(b.c2, mul(b.c1, 2)), b.p0), 6 * mt), mul(add(sub(b.p1, mul(b.c2, 2)), b.c1), 6 * t));
    const diff = sub(q, pts[i]);
    const den = dot(d1, d1) + dot(diff, d2);
    return den ? Math.min(1, Math.max(0, t - dot(diff, d1) / den)) : t;
  });
}
export function fitCubic(pts, t1, t2, err, depth = 0) {
  if (pts.length === 2) { const d = dist(pts[0], pts[1]) / 3; return [{ p0: pts[0], c1: add(pts[0], mul(t1, d)), c2: add(pts[1], mul(t2, d)), p1: pts[1] }]; }
  let u = chordParam(pts);
  let b = generateBezier(pts, u, t1, t2);
  let { m, at } = maxError(pts, b, u);
  if (m < err) return [b];
  if (m < err * 6) {
    for (let k = 0; k < 20; k++) {
      u = reparam(pts, b, u);
      b = generateBezier(pts, u, t1, t2);
      ({ m, at } = maxError(pts, b, u));
      if (m < err) return [b];
    }
  }
  if (depth > 12 || pts.length < 6) return [b];
  at = Math.max(2, Math.min(pts.length - 3, at));
  const tc = norm(sub(pts[at - 1], pts[at + 1]));
  return [...fitCubic(pts.slice(0, at + 1), t1, tc, err, depth + 1), ...fitCubic(pts.slice(at), mul(tc, -1), t2, err, depth + 1)];
}

function lineFit(pts) {
  let mx = 0, my = 0;
  for (const p of pts) { mx += p.x; my += p.y; }
  mx /= pts.length; my /= pts.length;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) { const dx = p.x - mx, dy = p.y - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const dir = { x: Math.cos(th), y: Math.sin(th) };
  let maxd = 0;
  for (const p of pts) maxd = Math.max(maxd, Math.abs(-(p.x - mx) * dir.y + (p.y - my) * dir.x));
  return { c: { x: mx, y: my }, dir, maxd };
}
function intersect(p, d, q, e) {
  const den = d.x * e.y - d.y * e.x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((q.x - p.x) * e.y - (q.y - p.y) * e.x) / den;
  return add(p, mul(d, t));
}

export function cleanOutline(d, opt = {}) {
  const { mirror = () => null, h = 0.1, cornerWin = 3.0, cornerDeg = 30, cornerRatio = 0.72, trim = 0.7, lineTol = 0.22, curveTol = 0.12, smooth = 0.7, snapDeg = 2.5, alignTol = 0.5, digits = 2, debug = null, lineOnly = () => false, dpTol = 0.45, minEdge = 1.6, polyTrim = 1.0 } = opt;
  const subs = parsePath(d);
  const loops = [];
  for (const sp of subs) {
    const { pts, step } = resampleLoop(sp, h);
    let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
    for (const p of pts) { bx0 = Math.min(bx0, p.x); bx1 = Math.max(bx1, p.x); by0 = Math.min(by0, p.y); by1 = Math.max(by1, p.y); }
    if (lineOnly({ x0: bx0, x1: bx1, y0: by0, y1: by1, cx: (bx0 + bx1) / 2, cy: (by0 + by1) / 2 })) {
      const lp = polygonLoop(pts, step, { dpTol, trim: polyTrim, minEdge, debug });
      const axis = mirror({ x0: bx0, x1: bx1, y0: by0, y1: by1, cx: (bx0 + bx1) / 2, cy: (by0 + by1) / 2 });
      loops.push(axis == null ? lp : mirrorLoop(lp, axis === 'auto' ? (bx0 + bx1) / 2 : axis));
      continue;
    }
    const n = pts.length, k = Math.max(2, Math.round(cornerWin / step)), k1 = Math.max(1, Math.round(k / 2));
    const turnK = (kk) => pts.map((p, i) => {
      const a = norm(sub(p, pts[(i - kk + n) % n])), b = norm(sub(pts[(i + kk) % n], p));
      return Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
    });
    const turn = turnK(k), turnHalf = turnK(k1);
    // corners: the turn is concentrated (half window sees most of it), above threshold, local maximum
    const corners = [];
    for (let i = 0; i < n; i++) {
      if (turn[i] * 180 / Math.PI < cornerDeg || turnHalf[i] < cornerRatio * turn[i]) continue;
      let isMax = true;
      for (let j = -k; j <= k; j++) if (j && turn[(i + j + n) % n] > turn[i] + 1e-12) { isMax = false; break; }
      if (isMax && !corners.some((c) => Math.min(Math.abs(c - i), n - Math.abs(c - i)) <= k)) corners.push(i);
    }
    corners.sort((a, b) => a - b);
    if (debug) debug.push({ corners: corners.map((i) => pts[i]) });
    const tr = Math.max(1, Math.round(trim / step));
    const segs = [];
    if (!corners.length) {
      // smooth closed contour: start at the topmost point, horizontal tangent
      if (smooth > 0) {
        const sg = smooth / step, r = Math.ceil(sg * 2.5), src = pts.map((p) => ({ ...p }));
        for (let i = 0; i < n; i++) { let sx = 0, sy = 0, sw = 0; for (let j = -r; j <= r; j++) { const w = Math.exp(-(j * j) / (2 * sg * sg)), q = src[(i + j + n) % n]; sx += q.x * w; sy += q.y * w; sw += w; } pts[i] = { x: sx / sw, y: sy / sw }; }
      }
      let top = 0; for (let i = 1; i < n; i++) if (pts[i].y < pts[top].y) top = i;
      const run = []; for (let i = 0; i <= n; i++) run.push(pts[(top + i) % n]);
      const t = norm(sub(pts[(top + 3) % n], pts[(top - 3 + n) % n]));
      const bs = fitCubic(run, t, mul(t, -1), curveTol);
      for (const b of bs) segs.push({ t: 'C', ...b });
      loops.push({ segs, corners: [] });
      continue;
    }
    // runs between corners
    const runs = [];
    for (let c = 0; c < corners.length; c++) {
      const i0 = corners[c], i1 = corners[(c + 1) % corners.length] + (c + 1 === corners.length ? n : 0);
      const all = []; for (let i = i0; i <= i1; i++) all.push(pts[i % n]);
      runs.push(all);
    }
    const fitted = runs.map((all) => {
      const inner = all.length > 2 * tr + 3 ? all.slice(tr, all.length - tr) : all.slice(1, -1).length >= 2 ? all.slice(1, -1) : all;
      const lf = lineFit(inner);
      const L = dist(all[0], all[all.length - 1]);
      if (lf.maxd < lineTol || inner.length < 4) {
        // orient the direction from start to end
        let dir = lf.dir; if (dot(dir, sub(all[all.length - 1], all[0])) < 0) dir = mul(dir, -1);
        return { kind: 'L', c: lf.c, dir, L };
      }
      const m = Math.max(3, Math.round(0.8 / h));
      const s0 = lineFit(inner.slice(0, m)), s1 = lineFit(inner.slice(-m));
      if (smooth > 0) {
        const sg = smooth / h, r = Math.ceil(sg * 2.5), src = inner.map((p) => ({ ...p }));
        for (let i = 1; i < inner.length - 1; i++) {
          const rr = Math.min(r, i, inner.length - 1 - i); // shrink the window at the ends
          let sx = 0, sy = 0, sw = 0;
          for (let j = -rr; j <= rr; j++) { const w = Math.exp(-(j * j) / (2 * sg * sg)); sx += src[i + j].x * w; sy += src[i + j].y * w; sw += w; }
          inner[i] = { x: sx / sw, y: sy / sw };
        }
      }
      let t1 = s0.dir; if (dot(t1, sub(inner[m - 1], inner[0])) < 0) t1 = mul(t1, -1);
      let t2 = s1.dir; if (dot(t2, sub(inner[inner.length - m], inner[inner.length - 1])) < 0) t2 = mul(t2, -1);
      return { kind: 'C', inner, t1, t2 };
    });
    // corner points: intersection of neighbouring end tangents
    const cpts = corners.map((ci, c) => {
      const A = fitted[(c - 1 + fitted.length) % fitted.length], B = fitted[c];
      const endA = A.kind === 'L' ? { p: A.c, d: A.dir } : { p: A.inner[A.inner.length - 1], d: mul(A.t2, -1) };
      const startB = B.kind === 'L' ? { p: B.c, d: B.dir } : { p: B.inner[0], d: B.t1 };
      const X = intersect(endA.p, endA.d, startB.p, startB.d);
      return X && dist(X, pts[ci]) < 2.0 ? X : { ...pts[ci] };
    });
    for (let c = 0; c < fitted.length; c++) {
      const F = fitted[c], P0 = cpts[c], P1 = cpts[(c + 1) % cpts.length];
      if (F.kind === 'L') segs.push({ t: 'L', p0: P0, p1: P1 });
      else {
        const run = [P0, ...F.inner, P1];
        const bs = fitCubic(run, norm(sub(F.inner[0], P0)), norm(sub(F.inner[F.inner.length - 1], P1)), curveTol);
        bs[0].p0 = P0; bs[bs.length - 1].p1 = P1;
        for (const b of bs) segs.push({ t: 'C', ...b });
      }
    }
    loops.push({ segs, corners: cpts });
  }
  // snap near-vertical / near-horizontal lines (move the shared corner points)
  const tanS = Math.tan((snapDeg * Math.PI) / 180);
  const hLines = [];
  for (const lp of loops) for (const s of lp.segs) {
    if (s.t !== 'L') continue;
    const dx = s.p1.x - s.p0.x, dy = s.p1.y - s.p0.y;
    if (Math.abs(dx) > 0.5 && Math.abs(dy) <= Math.abs(dx) * tanS) { const y = (s.p0.y + s.p1.y) / 2; moveCorner(lp, s.p0, { x: s.p0.x, y }); moveCorner(lp, s.p1, { x: s.p1.x, y }); hLines.push(s); }
    else if (Math.abs(dy) > 0.5 && Math.abs(dx) <= Math.abs(dy) * tanS) { const x = (s.p0.x + s.p1.x) / 2; moveCorner(lp, s.p0, { x, y: s.p0.y }); moveCorner(lp, s.p1, { x, y: s.p1.y }); }
  }
  // align horizontal edges that sit at (nearly) the same height
  const ys = hLines.map((s) => s.p0.y).sort((a, b) => a - b);
  const groups = [];
  for (const y of ys) { const g = groups.find((g) => Math.abs(g.mean - y) < alignTol); if (g) { g.v.push(y); g.mean = g.v.reduce((a, b) => a + b) / g.v.length; } else groups.push({ v: [y], mean: y }); }
  for (const s of hLines) {
    const g = groups.find((g) => Math.abs(g.mean - s.p0.y) < alignTol);
    if (g && g.v.length > 1) for (const lp of loops) if (lp.segs.includes(s)) { moveCorner(lp, s.p0, { x: s.p0.x, y: g.mean }); moveCorner(lp, s.p1, { x: s.p1.x, y: g.mean }); }
  }
  // write
  const f = (v) => { let s = v.toFixed(digits); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
  const P = (p) => `${f(p.x)} ${f(p.y)}`;
  let out = '';
  for (const lp of loops) {
    out += `M${P(lp.segs[0].p0)}`;
    lp.segs.forEach((s, i) => {
      const last = i === lp.segs.length - 1;
      if (s.t === 'L') { if (!last) out += `L${P(s.p1)}`; }
      else out += `C${P(s.c1)} ${P(s.c2)} ${P(s.p1)}`;
    });
    out += 'Z';
  }
  return { d: out.replace(/ -/g, '-'), loops };
}

// straight-edged contour: Douglas-Peucker vertices, edges refitted by least squares, corners = intersections
function dp(pts, i0, i1, tol, out) {
  let m = 0, at = -1;
  const a = pts[i0], b = pts[i1], d = norm(sub(b, a));
  for (let i = i0 + 1; i < i1; i++) { const v = sub(pts[i], a), e = Math.abs(v.x * d.y - v.y * d.x); if (e > m) { m = e; at = i; } }
  if (m > tol) { dp(pts, i0, at, tol, out); out.push(at); dp(pts, at, i1, tol, out); }
}
function polygonLoop(pts, step, { dpTol, trim, minEdge, debug, chamferMax = 3.5, collinearDeg = 6 }) {
  const n = pts.length;
  // split the loop at the farthest pair of points, Douglas-Peucker both halves
  let far = 0, fd = 0; for (let i = 0; i < n; i++) { const d = dist(pts[i], pts[0]); if (d > fd) { fd = d; far = i; } }
  let i2 = 0; fd = 0; for (let i = 0; i < n; i++) { const d = dist(pts[i], pts[far]); if (d > fd) { fd = d; i2 = i; } }
  const ring = []; for (let i = 0; i < n; i++) ring.push(pts[(far + i) % n]); ring.push(pts[far]);
  const j2 = (i2 - far + n) % n;
  let vs = [0]; dp(ring, 0, j2, dpTol, vs); vs.push(j2); dp(ring, j2, n, dpTol, vs);
  vs = [...new Set(vs.filter((v) => v !== n))].sort((a, b) => a - b);
  const tr = Math.max(1, Math.round(trim / step));
  const fitLines = () => vs.map((a, i) => {
    const b = vs[(i + 1) % vs.length], cnt = (b - a + n) % n;
    const run = []; for (let j = 0; j <= cnt; j++) run.push(ring[(a + j) % n]);
    const inner = run.length > 2 * tr + 3 ? run.slice(tr, run.length - tr) : run;
    const lf = lineFit(inner);
    let dir = lf.dir; if (dot(dir, sub(run[run.length - 1], run[0])) < 0) dir = mul(dir, -1);
    return { c: lf.c, dir, a, b, len: cnt * step };
  });
  const cornersOf = (lines) => lines.map((L, i) => {
    const P = lines[(i - 1 + lines.length) % lines.length];
    const X = intersect(P.c, P.dir, L.c, L.dir);
    return X && dist(X, ring[L.a]) < chamferMax + 1 ? X : { ...ring[L.a] };
  });
  let lines = fitLines(), corners = cornersOf(lines);
  for (let guard = 0; guard < 200 && vs.length > 3; guard++) {
    const m = vs.length;
    // 1. nearly collinear neighbours: drop the vertex between them
    let bi = -1, bAng = Infinity;
    for (let i = 0; i < m; i++) {
      const P = lines[(i - 1 + m) % m], L = lines[i];
      const a = Math.acos(Math.max(-1, Math.min(1, dot(P.dir, L.dir)))) * 180 / Math.PI;
      if (a < collinearDeg && a < bAng) { bAng = a; bi = i; }
    }
    if (bi >= 0) { vs.splice(bi, 1); lines = fitLines(); corners = cornersOf(lines); continue; }
    // 2. an edge shorter than minEdge: merge its two vertices into one
    bi = -1; let bL = Infinity;
    for (let i = 0; i < m; i++) if (lines[i].len < minEdge && lines[i].len < bL) { bL = lines[i].len; bi = i; }
    if (bi >= 0) {
      const a = vs[bi], b = vs[(bi + 1) % m], mid = (a + Math.round(((b - a + n) % n) / 2)) % n;
      vs.splice(bi, 1); vs[(bi) % vs.length] = mid; vs.sort((x, y) => x - y);
      vs = [...new Set(vs)];
      lines = fitLines(); corners = cornersOf(lines); continue;
    }
    // 3. a short edge between two long ones whose extensions meet nearby: the raster's rounding of a sharp tip
    bi = -1; bL = Infinity;
    for (let i = 0; i < m; i++) {
      const L = dist(corners[i], corners[(i + 1) % m]);
      const Lp = dist(corners[(i - 1 + m) % m], corners[i]), Ln = dist(corners[(i + 1) % m], corners[(i + 2) % m]);
      if (L < chamferMax && Lp > 2 * L && Ln > 2 * L && L < bL) {
        const P = lines[(i - 1 + m) % m], N = lines[(i + 1) % m];
        const X = intersect(P.c, P.dir, N.c, N.dir);
        if (X && dist(X, mul(add(corners[i], corners[(i + 1) % m]), 0.5)) < chamferMax) { bi = i; bL = L; }
      }
    }
    if (bi >= 0) {
      // keep the vertex at the start of the short edge as the tip, drop the one at its end;
      // the trimmed line fits ignore the rounded points either way
      vs.splice((bi + 1) % m, 1);
      lines = fitLines();
      // the merged edge now spans the rounded tip: refit the two neighbours without it
      corners = cornersOf(lines);
      continue;
    }
    break;
  }
  if (debug) debug.push({ corners });
  const segs = corners.map((c, i) => ({ t: 'L', p0: c, p1: corners[(i + 1) % corners.length] }));
  return { segs, corners };
}

// rebuild a straight-edged loop from its left half mirrored about x = ax
function mirrorLoop(lp, ax) {
  const c = lp.corners;
  const n = c.length;
  // walk the loop starting from the bottom-most vertex on the axis side ordering: collect the left-half chain
  // between the two points where the outline crosses the axis
  const cross = [];
  for (let i = 0; i < n; i++) {
    const a = c[i], b = c[(i + 1) % n];
    if ((a.x - ax) * (b.x - ax) < 0 || a.x === ax) {
      const t = a.x === ax ? 0 : (ax - a.x) / (b.x - a.x);
      cross.push({ i, p: { x: ax, y: a.y + t * (b.y - a.y) } });
    }
  }
  if (cross.length !== 2) return lp; // not a simple symmetric outline
  // the chain of vertices with x < ax, from one crossing to the other
  let [A, B] = cross;
  let chain = [];
  for (let k = (A.i + 1) % n; ; k = (k + 1) % n) { chain.push(c[k]); if (k === B.i) break; }
  if (chain.some((p) => p.x > ax + 1e-9)) {
    [A, B] = [B, A];
    chain = [];
    for (let k = (A.i + 1) % n; ; k = (k + 1) % n) { chain.push(c[k]); if (k === B.i) break; }
  }
  if (chain.some((p) => p.x > ax + 1e-9)) return lp;
  const left = [A.p, ...chain, B.p];
  const right = left.slice(1, -1).reverse().map((p) => ({ x: 2 * ax - p.x, y: p.y }));
  const pts = [...left, ...right];
  // drop the axis points when the outline is horizontal there (they are not corners)
  const out = pts.filter((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
    const cr = (p.x - a.x) * (b.y - p.y) - (p.y - a.y) * (b.x - p.x);
    return Math.abs(cr) > 1e-6;
  });
  return { segs: out.map((p, i) => ({ t: 'L', p0: p, p1: out[(i + 1) % out.length] })), corners: out };
}

// move a corner point shared by two segments, carrying adjacent Bézier handles along
function moveCorner(lp, p, q) {
  const dx = q.x - p.x, dy = q.y - p.y;
  if (!dx && !dy) return;
  for (const s of lp.segs) {
    if (s.t === 'C') {
      if (s.p0 === p) { s.c1 = { x: s.c1.x + dx, y: s.c1.y + dy }; }
      if (s.p1 === p) { s.c2 = { x: s.c2.x + dx, y: s.c2.y + dy }; }
    }
  }
  p.x = q.x; p.y = q.y;
}
