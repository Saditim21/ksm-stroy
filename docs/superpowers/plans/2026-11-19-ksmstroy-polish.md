# КСМ Строй v2 pre-review polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the user's 2026-11-19 changes on `redesign-v2`: the covers, the new Продажби and За нас, a light theme, a responsiveness pass.

**Architecture:** The light theme is a second set of the existing CSS custom properties under `:root[data-theme="light"]`, with `.dark` islands for what sits on photographs; Tailwind's palette colours become `var(--…)`. The two pages are rebuilt as route modules over the existing primitives (ResponsivePicture, RollingNumber, Seam, Button, Ways) and data hooks (`useBuildings`, `src/pages/works/works.js`), their first-viewport motion in CSS under the motion gate, scroll motion through `useMotion`.

**Tech Stack:** React 19, React Router 8 (prerendered), Tailwind 3, GSAP 3 (ScrollTrigger, SplitText), Lenis, Vitest + jsdom, sharp.

**Spec:** `docs/superpowers/specs/2026-11-19-ksmstroy-polish-design.md`

## Global Constraints
- First-load JS ≤ 160 KiB gzip per route, 512 B of room kept; `/` ≤ 158,566 B and GR ≤ 162,528 B (`npm run check:dist`).
- The prerendered HTML is the final state; the first viewport's motion is CSS under `:root.js` and `prefers-reduced-motion: no-preference`; nothing above the fold waits for JS.
- Copy: a no-break space after one-letter words; production's words wherever they exist; /about keeps „основана през месец септември 2008“ and /projects „Golden Residence“ and „Многофамилна“ (tests/contracts/site.jsx).
- Dark stays the default theme; the theme never changes the layout, only colours.
- Run vitest in the foreground with `--maxWorkers=2`.

## Review Focus
- A first visit with light saved: no dark flash before the stylesheet (head script + critical CSS both theme-aware).
- Golden Residence's data still loading or failed on Продажби: counts read „—“, nothing shifts, no filter shows a false 0.
- A phone in landscape (844 × 390) on the wall and the works track: no pin taller than the screen traps the page.
- Reduced motion: no pin, no scrub, the wall static, the works a column, the theme switch instant.
- Keyboard: the floor rows, the filters and the theme switch reachable and named; focus visible on both themes.

---

### Task 1: Light theme foundation
**Files:** `src/index.css`, `src/styles/palette.js`, `tailwind.config.js`, `src/root.jsx`, `src/utils/headScripts.js`, new `src/utils/themeScript.js`, new `src/shell/ThemeSwitch.jsx`, `src/shell/SiteHeader.jsx`, `src/shell/SiteMenu.jsx`, `src/styles/shell.css`, `src/styles/motion.css`, tests `src/styles/tokens.test.js`, new `src/shell/ThemeSwitch.test.jsx`, `src/utils/themeScript.test.js`.
**Interfaces — Produces:** `LIGHT_PALETTE` (palette.js, same keys as `PALETTE`); `THEME_SCRIPT` (string); `ThemeSwitch({ variant: 'bar' | 'menu' })`; `readTheme(): 'light' | 'dark'`, `applyTheme(theme)`; CSS class `.dark` (dark island); `data-theme="light"` on `<html>`.
- [ ] Tests first: tokens.test.js asserts the light values of the spec §5 and text contrast ≥ 4.5:1 (ivory, ivory-2, stone, brass-l on onyx/umber) and ≥ 3:1 (hair-ctl, statuses); themeScript test runs the script against a stubbed localStorage and expects `data-theme="light"` only for 'light'; ThemeSwitch test: named „Светла тема“, click sets `data-theme`, stores 'light', second click removes it, label flips to „Тъмна тема“.
- [ ] Implement; Tailwind colours `var(--name)` (the one `bg-onyx/85` becomes a class with `color-mix`); CRITICAL_CSS gains the light ground; theme-color meta follows; `useScrollLock` colour reads the token.
- [ ] `npx vitest run --maxWorkers=2 src/styles src/shell src/utils` green; commit.

### Task 2: Продажби „Две сгради“
**Files:** `src/routes/projects.jsx`; new `src/pages/projects/Gateway.jsx`, `FloorLedger.jsx`, `FreeList.jsx`, `freeUnits.js`; rewrite `projects.css` and the five projects tests; delete `SalesBoard.jsx`, `BuildingRows.jsx`.
**Interfaces — Consumes:** `useBuildings()` → `{ gr: { model, dated }, mn: { model, dated }, data }`; `BUILDINGS[i].unitHref(label)`; model `units[] { label, block, floor, type, totalArea, exposure, status }`, `floors Map('А-5' → { units, counts })`, `totals`. **Produces:** `freeUnits(models, { building, type, band }) → Unit&{building}[]`, `BANDS`.
- [ ] Tests first (projects.test.jsx): with data — GR shows its live free count, the floor ledger has 16 rows for GR and 18 for MN, a row's button opens its free apartments with links to `?unit=…`, filters narrow the list and show counts, „Покажи още“ adds the rest; without data — „—“ and no false zero. Prerender: one H1 „Продажби“, both names, both pictures, the ledger's rows present. Hydration: no errors at fine/coarse/reduced. CSS test: halves side by side from 901 px, stacked below.
- [ ] Implement per spec §3; `handle = { header: 'overlay' }`.
- [ ] Tests green; `npm run build && npm run check:dist` keeps /projects under budget; commit.

### Task 3: За нас „Стена“
**Files:** `src/routes/about.jsx`; new `src/pages/about/Wall.jsx`, `Origin.jsx`, `WorksTrack.jsx`; keep and restyle `Offer.jsx`, `Mission.jsx` (+ values), `Work.jsx`; delete `Lineage.jsx`, `Tradition.jsx`, `Team.jsx`, `Figures.jsx`, `Values.jsx`; `photos.js`; rewrite `about.css` and the five about tests; image sources for the wall tiles at 240/480.
**Interfaces — Consumes:** `WORKS`, `photoOf(id)` (src/pages/works/works.js); `useMotion`. **Produces:** `WALL` (35 entries, centre index 17).
- [ ] Tests first: prerender — H1 „Добрата работа – реклама за майстора“, 35 tiles (34 hidden from AT), the founding sentence, seven works with names, links to /blog and /contact; hydration clean; motion test — with motion the wall's ScrollTrigger pins, under reduced motion nothing pins.
- [ ] Implement per spec §4.
- [ ] Tests green; build + check:dist; commit.

### Task 4: The light sweep
**Files:** every stylesheet with colour literals (`git grep -nE "#[0-9A-Fa-f]{6}|rgba?\(" -- "src/**/*.css"`), the components that sit on photographs (add `.dark`).
- [ ] For each literal decide: photo scrim (stays dark), ground blend (`color-mix(in srgb, var(--onyx) N%, transparent)`), or token. Mark heroes, film bands, the works panel, the explorer facade and its dialogs' photo parts `.dark`.
- [ ] Screens of every route in light at 1440 and 390 reviewed; fixes; dark screens unchanged (compare with the M4 captures); commit.

### Task 5: Covers
**Files:** new `scripts/images/covers.mjs`; `src/assets/home/covers/*.jpg`; `scripts/images/sources.json` (`cover-*`, group home, widths 700/960/1400/1920); `src/pages/home/WorksSection.jsx`; `src/pages/home/works.test.jsx`.
- [ ] Test: each work's cover id is `cover-<work>`; build the masters (`node scripts/images/covers.mjs [--x4 <dir>]`), `npm run images`; commit.

### Task 6: Responsiveness sweep
**Files:** new `scripts/sweep/sweep.mjs` (routes × widths 320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1440, 1920, 2560 and 844×390 × themes; reports sideways overflow, text overflowing its box, header overlap; writes screens); fixes where found.
- [ ] Run, fix, re-run until clean; commit.

### Task 7: Verify
- [ ] `npx vitest run --maxWorkers=2`, `npm run build`, `npm run check:dist`, `npm run smoke`, `npm run perf -- / /projects /about` (Lighthouse phone: LCP ≤ 2.5 s, TBT ≤ 150 ms, CLS ≤ 0.1, a11y ≥ 98); results note; push `redesign-v2` for the preview only with the user's word.
