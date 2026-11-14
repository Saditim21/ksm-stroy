# ksmstroy.com v2: M2 Diptych Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the M1 platform in the Diptych black-and-gold system, then rebuild Home, the Golden Residence page and its explorer, with the block routes deep-linking into it. The preview then shows the design the user chose: Home first, then Golden Residence.

**Architecture:**
- **Design system.** Colours come from one palette module, which feeds Tailwind and `:root` variables. Each component's stylesheet is ported from the concept's CSS, keeping its class names.
- **Motion.**
  - The first viewport moves only through CSS keyed to `html.js`, a class an inline head script sets before first paint.
  - Everything after load is GSAP through the existing `useMotion`.
  - Page changes are React `<ViewTransition>` doors drawn in CSS.
- **Data.** Pages read live counts from the M1 availability store through a small unit model.
- **Explorer.** One set of components (facade, edge panel, plan renderer, plan stage, unit panel, list) serves the Golden Residence page, its block routes and the Home teaser.

**Tech Stack:**
- React 19.3.1; React Router 8.5.1 (framework mode, prerender);
- Vite 7; Tailwind 3.4;
- GSAP 3.15.1 (ScrollTrigger, SplitText, Flip); Lenis 1.3.27;
- Vitest 4 with Testing Library and jsdom; the puppeteer-core smoke run;
- sharp (image pipeline); fontTools 4.68 (font build);
- Node 24.x; Vercel.

**Spec:** `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md` (the "spec"). Read it, and the concept extraction `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-extract.md` (the "extract"), before any task.
- The platform rules still bind: v2 spec §6, §9, §10 and §12 (`docs/superpowers/specs/2026-11-13-ksmstroy-redesign-v2-design.md`).
- The platform map is `docs/superpowers/notes/2026-11-14-m2-platform-map.md`.
- `<scratch>` below means `C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad`.
- **Visual reference:** `C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/`. To see it, serve the folder with `node <scratch>/serve-dir.mjs 5184 C:/ksm-stroy/design/2026-11-14-concepts` and open `http://127.0.0.1:5184/c2-diptych/`. Its screenshots are in `../shots/`.

## Global Constraints

**Where to work**
- Work only in `C:/ksm-stroy/ksm-stroy-v2`, on branch `redesign-v2`.
- Never touch `C:/ksm-stroy/ksm-stroy` or `C:/ksm-stroy/golden-residence`. Read the concept folder `C:/ksm-stroy/design/2026-11-14-concepts/` but never write to it.
- Never push. The orchestrator pushes `redesign-v2` for the user's preview checks after every task from Task 3 on (3, 4, 5, 6, 7 and 8). With each push it sends the user that task's **Preview** line, which says what the preview now shows and what is still legacy or temporary.
- Never modify `api/odoo-lead.js`; a teammate owns it. Never print `.env` values or the sheet and Odoo URLs.

**Commits**
- Conventional messages, with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Stage explicit paths.
- `npm test` and `npm run build` pass at every commit.

**Toolchain**
- Node `engines` `"24.x"`; React and React DOM `^19.3.1`; React Router `^8.5.1`.
- No new runtime dependency: Flip ships inside `gsap`.
- If a package must be added, use `--legacy-peer-deps` and then a plain `npm install`. Never delete `package-lock.json`.
- React Router stays at 8.5.1. Any upgrade re-checks the `caseSensitive` patch (`scripts/client-routes-case.mjs`).

**Contract tests**
- `tests/contracts/` stay green at every commit. They pin:
  - Блокиран;
  - the EU line on every page, and Home's poster section with `BG16RFPR001-1.012-1485-C01` and `/eu/plakat-ksm-stroy-a3.pdf`;
  - the Contact payload `{name, email, phone, projectType, budget, message}`;
  - every URL, and `/projects/1` → `/projects`.
- Change them only where a task says so. Only Task 7 does, for one regex.

**Final state in HTML** (M1, verbatim)
- Prerendered HTML is the final visual state. Never render `opacity: 0`, `initial` motion states or "visible after onLoad" classes into markup.
- Browser-only values (matchMedia, sessionStorage, the query string, pointer type) never change the first client render (v2 spec §6.2).
- Query-string views render after `useHydrated()`. Layout chosen by media is chosen by CSS media queries.
- Sizes that set page length use `var(--screen-h)`, never `vh` or `svh`.
- Hidden starting states of CSS motion exist only under `:root.js` (spec §5.5).

**GSAP and Lenis**
- `gsap`, `gsap/*` (including `gsap/Flip`) and `lenis` are imported only inside `src/motion/`. Other code reaches GSAP through `useMotion`, `useMotionNow` or `loadFlip`.
- First-load JS per route ≤ 160 KiB gzip, enforced on every route without legacy code; the motion chunk ≤ 60 KiB gzip; Flip ≤ 10 KiB gzip and lazy (spec §12).

**Tokens** (spec §2.1, exact)

| Token | Value | Token | Value |
|---|---|---|---|
| `onyx` | `#0E0D0B` | `hair` | `rgba(155, 148, 136, 0.3)` |
| `umber` | `#1A1714` | `hair-2` | `rgba(155, 148, 136, 0.16)` |
| `umber-2` | `#211D19` | `hair-ctl` | `rgba(155, 148, 136, 0.62)` |
| `ivory` | `#EFE9DD` | `brass` | `#B8954A` |
| `ivory-2` | `rgba(239, 233, 221, 0.82)` | `brass-l` | `#D8BD7A` |
| `ivory-3` | `rgba(239, 233, 221, 0.62)` | `status-free` | `#4FBF85` |
| `stone` | `#9B9488` | `status-reserved` | `#E9953F` |
| `status-sold` | `#D4574E` | `status-blocked` | `#8A867D` |

- **Type:** `KSM Display` is Cormorant Garamond (normal: `wght` 500–600 variable; italic: static 500). `KSM Text` is Manrope (`wght` 400–600). Three woff2 files, ≤ 90 KiB together.
- **Eases:**
  - `--e-out: cubic-bezier(.16, 1, .3, 1)` (expo.out);
  - `--e-soft: cubic-bezier(.33, 1, .68, 1)` (power2.out);
  - `--e-io: cubic-bezier(.87, 0, .13, 1)` (expo.inOut);
  - `--e-in: cubic-bezier(.7, 0, .84, 0)` (expo.in).
- **Breakpoint:** halves sit side by side from 901 px (Tailwind screen `split`).

**Copy rules**
- Copy comes from production: the legacy pages and `src/assets/*/content.txt`. Each section's source is in spec §8.
- New lines are exactly those the spec quotes: the user-approved „Строим, ремонтираме, завършваме.“ and the interface microcopy.
- Bulgarian quotes „…“, a spaced en dash for ranges.
- A non-breaking space goes after one-letter words and „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“.
- Sentence case; no eyebrow labels; one italic word per heading (`em`).
- Names: „Golden Residence“ (Latin), „КСМ Строй“ in text, „КСМ СТРОЙ ООД“ as the legal name, „Многофамилна сграда“ as the short form.

**Site facts** (unchanged from M1)
- Phones: `+359 887 886 166` (primary) and `+359 885 762 224`.
- Email: `ksm_str@abv.bg`.
- Offices: `гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38` and `гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1`.
- Hours: `Пн–Пт 8:00–18:00`, `Сб 9:00–14:00`, `Нд почивен ден`.
- Facebook: `https://www.facebook.com/ksm.stroi/`.

**Matching the concept.** Where a step says "match", compare at 1440×900 and 390×844 against the concept page and the named screenshot. Port its CSS from the named `diptych.css` lines, keeping its class names, with these substitutions:
- token variables for colours;
- `--screen-h` for `vh`/`svh`;
- the spec's fixes (§3.3, §6).

## Review Focus

1. **The availability source fails or is slow** (API 503 or timeout, sheets down, only the built-in data loads). Counts must show `—` and then numbers, with the spec §9 notice when the origin is `built-in`. Never a 0, never a spinner forever, and the explorer stays usable. *Pinned in Task 6 (`ExplorerSection shows the notice when a slot is built-in`).*
2. **Deep links with bad or stale parameters** (`?floor=9`, `?floor=Б-0`, `?floor=B-5` with a Latin letter, `?unit=А%20999`, an encoded space, a URL hand-edited mid-session). These are ignored or normalised: never a crash, a blank dialog or a hydration error. *Pinned in Task 7 (`parseFloorParam` cases; `an unknown unit opens its floor only`).*
3. **Touch at desktop widths** (tablets, touch laptops, a mouse and touch on one device). The first tap previews and the second opens; hover never sticks; the widening and the services reveal never trigger from a tap. *Pinned in Task 6 (`a touch tap at desktop width previews first`), Task 3 (`home.css.test.js`: the widening sits inside `(hover: hover) and (pointer: fine)`) and Task 4 (the same for the services' flex rules). `hoverOnlyWhenSupported` gates only Tailwind's `hover:` utilities, not hand-written CSS.*
4. **Navigation interrupted.** For example: Back pressed during the 0.8 s hero move, reduced motion switched on mid-session, a bfcache restore, or the doors' view transition that never settles. Then no navigation fires late, `vt-cut` never sticks, the intro never replays and focus is not lost. *Pinned in Task 1 (`clears vt-cut when no transition runs`, `Back gives data-arrive="pop"`, `a popstate cuts the doors`), Task 3 (`home.css.test.js`: `the intro doors never show under [data-arrive]`) and Task 5 (`the hero move is cancelled by unmount`).*
5. **Inquiry input the proxy would reject silently:**
   - an email with a Cyrillic domain (`ivan@пример.бг`);
   - an empty or very short message;
   - phone numbers with spaces or `+359`;
   - names with leading or trailing spaces.

   The visitor sees a clear error, or the lead is made valid. The CRM never drops it without a trace. *Pinned in Task 4 (`buildLead` cases and the Cyrillic-domain error).*

---

### Task 0: Diptych tokens, type, actions and focus rings

The re-skin foundation. After this task the platform pages (`/eu-proekt`, `/404`) and the M1 shell show onyx grounds, ivory text and the new fonts. The legacy pages keep production's light look inside a `legacy-ground` wrapper.

**Carry items from M1, and where each goes** (ledger sections "Carry into M2 Task 0", "Carry into M2 (from the mockup verification)" and "Final whole-branch review"):

| Item | Disposition |
|---|---|
| Focus ring in the ground's text colour | Kept; re-derived for the dark default (this task) |
| `hoverOnlyWhenSupported` | Kept (this task) |
| Android metric-matched fallbacks (Roboto, Noto Serif) | Kept (this task) |
| Button decision B (48 px fills, `#27323F` hover, static arrow…), one fill per view, hero data rule D7, rulings D1–D7 | **Dropped**: they belong to the void design (A2/A3). Replaced by the Diptych actions. |
| `html.js` gate; HeroTitle and the route transition on it | Kept (Task 1) |
| check-dist decides legacy by framer-motion/swiper fingerprint | Kept (Task 1) |
| Focus or announce on route change | Kept (Task 1) |
| `scroll-padding-top` | Kept (Task 2) |
| `min-h-screen` → `--screen-h` in the shell | Kept (Task 2) |
| Phone EU line as one 36 px row | Kept (Task 2) |
| Phone menu focus loop and Escape | Kept (Task 2) |
| Header text spacing at 1024–1100 | Kept (Task 2) |
| EU line at 640–645 px with classic scrollbars | **Superseded** (Task 2): the Diptych EU row is one row at every width, and its text follows its own box through container queries, so no 640 px switch remains |
| devApi `ODOO_URL` copy (with [ТЕСТ]) | **Deferred** to M4: it affects only the dev server after `.env` changes, and Task 4's client-side „[ТЕСТ]“ marks any lead the dev server forwards |
| Smoke stubs the sheets | Kept as an `/api/availability` fixture (Task 2) |
| Fail on more than one H1 | Kept (Task 3) |
| `og:image` 1200×630 | Kept (Task 3) |
| `ApartmentProvider` as a legacy wrapper | Moved in Task 3; its last use in the app goes in Task 7. The module stays until M4, because `/projects` still imports `GoldenResidenceFloorMap`, which calls `useApartments` |
| `[ТЕСТ]` lead tagging | Kept, client-side (Task 4) |
| Hero heights in pure CSS | Kept (Tasks 3 and 5) |
| `matchesFilter` reads legacy fields | Replaced by `filterUnits` on the unit model (Task 8) |
| One match-or-404 helper for the block routes | Kept (Task 7) |
| No `overflow: hidden` over a focusable | Kept (every task); 44 px targets kept (spec §11) |
| Text spacing at 320–360 px | Kept (Task 9) |
| Rise close in the Tab order; sticky bar blockers; band order of sacrifice | **Dropped**: there is no Rise, sticky bar or band in Diptych |
| `useScrollLock` counted save and restore; apartment-tab header check | **Already done** in M1 (`useScrollLock.js`, `sheetsCore.readTab`) |
| The NotFound chunk in block routes; one config for prerender, explorer and sitemap; `X-Robots-Tag` for the review host | **Deferred**: M3, M3 and launch setup respectively |

**Files:**
- Create:
  - `src/styles/palette.js`;
  - `src/styles/diptych.css` (type roles, `em`, actions, `.on-light`, `.legacy-ground`);
  - `src/utils/fontLinks.js`;
  - `public/fonts/ksm-display-italic.woff2`, `public/fonts/OFL-Cormorant.txt`, `public/fonts/OFL-Manrope.txt`.
- Modify:
  - `tailwind.config.js`, `src/index.css`;
  - `scripts/fonts/build-fonts.py`, `scripts/fonts/REPORT.md`;
  - `src/styles/fonts.css` (regenerated), `public/fonts/ksm-display.woff2` and `public/fonts/ksm-text.woff2` (rebuilt);
  - `src/root.jsx` (links, `CRITICAL_CSS`, `theme-color`, legacy wrapper on `<main>`), `public/site.webmanifest`;
  - `src/components/ui/Button.jsx`, `src/shell/handle.js`;
  - the handles of the legacy routes: `src/pages/{Home,About,Blog,Contact,Projects}.jsx`, `src/components/{GoldenResidence,Mnogofamilna}BlockSelection.jsx`, `src/routes/{golden-residence,mnogofamilna}-block.jsx`;
  - the users of retired tokens: `src/shell/{SiteHeader,MobileMenu,SiteFooter,EuLine,TitleBlock}.jsx` (only what the build and the tests need: Task 2 deletes `MobileMenu` and `TitleBlock` and rewrites the other three), `src/components/ui/{DimensionLine,StatusChip,VideoBand,ElevationMark}.jsx`, `src/pages/dev/UiGallery.jsx`, `src/routes/{eu-proekt,not-found}.jsx`;
  - `scripts/smoke/smoke.mjs` (ring colours).
- Delete: `public/fonts/OFL-Playfair.txt`, `public/fonts/OFL-Geologica.txt`.
- Test:
  - `src/styles/tokens.test.js`, `src/styles/focus-ring.test.js`, `src/styles/fonts.test.js`;
  - `src/components/ui/Button.test.jsx`, `src/root.test.jsx`, `src/shell/shell.test.jsx` (the handle case);
  - the tests that pin retired literals: `src/hooks/useScrollLock.test.js`, `src/components/ui/{ResponsivePicture,StatusChip,DimensionLine}.test.jsx`.

**Interfaces:**
- Consumes: M1 `tailwind.config.js`, `src/index.css`, `Button` callers, the route `handle` contract (`src/shell/handle.js`).
- Produces:
  - `PALETTE` (frozen; the Global Constraints values; keys are the Tailwind colour names) from `src/styles/palette.js`.
  - Tailwind:
    - every `PALETTE` key as a colour, except `ivory`, which becomes `{ DEFAULT: '#EFE9DD', 50: '#f8f8f6', 100: '#f3f3f1', 200: '#e8e8e4' }`;
    - `theme.screens = { sm: '640px', md: '768px', split: '901px', lg: '1024px', xl: '1280px', '2xl': '1536px' }`;
    - `future.hoverOnlyWhenSupported: true`;
    - `fontFamily.display = ['"KSM Display"', '"KSM Display Fallback Georgia"', '"KSM Display Fallback Times"', '"KSM Display Fallback Noto"', 'serif']`;
    - `fontFamily.text = ['"KSM Text"', '"KSM Text Fallback Segoe"', '"KSM Text Fallback Arial"', '"KSM Text Fallback Roboto"', 'sans-serif']`;
    - `fontSize`: `body ['16px', { lineHeight: '1.6' }]`, `small ['13px', { lineHeight: '1.5' }]`, `label ['13px', { lineHeight: '1.3', letterSpacing: '0.02em' }]`, `h3 ['clamp(30px, 2.6vw, 44px)', { lineHeight: '1.05' }]`, `h2 ['clamp(40px, 4.6vw, 76px)', { lineHeight: '1' }]`, `count ['clamp(40px, 3.6vw, 60px)', { lineHeight: '0.9' }]`. The legacy `display`, `hero` and `display-*` stay: `.hero-title` applies `text-display` (`src/index.css:106`), so removing `display` breaks the build.
  - `:root` variables in `src/index.css`:
    - `--<key>` for every `PALETTE` key;
    - `--gut: clamp(20px, 3.6vw, 60px)`, `--e-out`, `--e-soft`, `--e-io`, `--e-in`;
    - `--serif: "KSM Display", …`, `--sans: "KSM Text", …`;
    - `--fs-slogan: clamp(46px, 5.7vw, 98px)`, `--fs-title: clamp(54px, 8.6vw, 148px)`, `--fs-h2: clamp(40px, 4.6vw, 76px)`, `--fs-h3: clamp(30px, 2.6vw, 44px)`, `--fs-motto: clamp(48px, 6vw, 104px)`, `--fs-lead: clamp(16px, 1.16vw, 18px)`.
  - CSS classes (`src/styles/diptych.css`): `.serif .h2 .h3 .lead .small .num .tab`, the `em` rule, `.btn .btn--solid .btn--sm .link .arr`, `.on-light`, `.legacy-ground`.
  - `Button({ to, href, type = 'button', variant = 'outline', size = 'md', arrow = false, className, children, ...rest })`:
    - `variant` is `'outline' | 'solid' | 'link'`, and an unknown value falls back to `outline`; `size` is `'md' | 'sm'`;
    - it renders a router `Link` for `to`, an `a` for `href` and a `button` otherwise, carrying `data-variant` and `data-size`.
    - The `tone` prop is gone.
  - The route handle gains `legacy?: true`. `App` adds `on-light legacy-ground` to `<main id="main">` for such routes.
  - `DISPLAY_FONT_PRELOADS` (frozen array of two link descriptors) from `src/utils/fontLinks.js`.

- [ ] **Step 1: Write the failing tests.** `src/styles/tokens.test.js` (rewrite):

```js
import config from '../../tailwind.config.js'
import { PALETTE } from './palette.js'
// contrast(a, b) as today; blend(rgba, underHex) composites an rgba() over a hex and returns a hex.
const c = config.theme.extend.colors
it('carries the Diptych palette', () => {
  expect(PALETTE).toEqual({
    onyx: '#0E0D0B', umber: '#1A1714', 'umber-2': '#211D19', ivory: '#EFE9DD',
    'ivory-2': 'rgba(239, 233, 221, 0.82)', 'ivory-3': 'rgba(239, 233, 221, 0.62)', stone: '#9B9488',
    hair: 'rgba(155, 148, 136, 0.3)', 'hair-2': 'rgba(155, 148, 136, 0.16)', 'hair-ctl': 'rgba(155, 148, 136, 0.62)',
    brass: '#B8954A', 'brass-l': '#D8BD7A', 'status-free': '#4FBF85', 'status-reserved': '#E9953F',
    'status-sold': '#D4574E', 'status-blocked': '#8A867D',
  })
  expect(c.onyx).toBe('#0E0D0B')
  expect(c.ivory).toMatchObject({ DEFAULT: '#EFE9DD', 50: '#f8f8f6' })
  for (const gone of ['paper', 'ink', 'dusk', 'light', 'gold-ink', 'graphite', 'rule', 'bronze-ink', 'status-free-deep'])
    expect(c[gone]).toBeUndefined()
})
it('writes every palette value as a :root custom property', () => {
  for (const [key, value] of Object.entries(PALETTE)) expect(indexCss).toContain(`--${key}: ${value};`)
})
it('meets the contrast floors', () => {
  const { onyx, umber, ivory, stone, brass } = PALETTE
  expect(contrast(ivory, onyx)).toBeGreaterThanOrEqual(12)
  expect(contrast(blend(PALETTE['ivory-3'], onyx), onyx)).toBeGreaterThanOrEqual(4.5)
  for (const ground of [onyx, umber]) {
    expect(contrast(stone, ground)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(blend(PALETTE['hair-ctl'], ground), ground)).toBeGreaterThanOrEqual(3)
    for (const s of ['status-free', 'status-reserved', 'status-sold', 'status-blocked'])
      expect(contrast(PALETTE[s], ground)).toBeGreaterThanOrEqual(3)
  }
  expect(contrast(brass, onyx)).toBeGreaterThanOrEqual(4.5)
})
it('sets the split breakpoint, hover gating and the type stacks', () => {
  expect(Object.entries(config.theme.screens)).toEqual([['sm', '640px'], ['md', '768px'], ['split', '901px'], ['lg', '1024px'], ['xl', '1280px'], ['2xl', '1536px']])
  expect(config.future.hoverOnlyWhenSupported).toBe(true)
  const t = config.theme.extend
  expect(t.fontFamily.display).toEqual(['"KSM Display"', '"KSM Display Fallback Georgia"', '"KSM Display Fallback Times"', '"KSM Display Fallback Noto"', 'serif'])
  expect(t.fontFamily.text).toEqual(['"KSM Text"', '"KSM Text Fallback Segoe"', '"KSM Text Fallback Arial"', '"KSM Text Fallback Roboto"', 'sans-serif'])
  expect(t.fontSize.body).toEqual(['16px', { lineHeight: '1.6' }])
  expect(t.fontSize.h2[0]).toBe('clamp(40px, 4.6vw, 76px)')
  expect(t.fontSize.count[0]).toBe('clamp(40px, 3.6vw, 60px)')
})
```

  - `src/styles/focus-ring.test.js` (rewrite; same `rule()` helper):
    - `rule(':focus-visible')` matches `/outline:\s*2px solid var\(--ivory\);/` and `/outline-offset:\s*3px;/`, and not `currentColor`;
    - `rule('.on-light :focus-visible')` matches `/outline-color:\s*var\(--onyx\);/`;
    - `rule('.on-light .on-dusk :focus-visible')` matches `/outline-color:\s*var\(--ivory\);/`;
    - the forced-colours block still sets `Highlight`.
  - `src/styles/fonts.test.js` (rewrite):

```js
it('ships the three faces within 90 KiB', () => {
  expect(woff2Files().sort()).toEqual(['ksm-display-italic.woff2', 'ksm-display.woff2', 'ksm-text.woff2'])
  expect(totalBytes()).toBeLessThanOrEqual(90 * 1024)
})
it('declares each face with swap', () => {
  expect(face('KSM Display', 'normal')).toMatch(/font-weight: 500 600;[\s\S]*font-display: swap/)
  expect(face('KSM Display', 'italic')).toMatch(/ksm-display-italic\.woff2[\s\S]*font-weight: 500;[\s\S]*font-display: swap/)
  expect(face('KSM Text', 'normal')).toMatch(/font-weight: 400 600;[\s\S]*font-display: swap/)
})
it('metric-matches every fallback family', () => {
  for (const f of ['Georgia', 'Times', 'Noto']) {
    expect(face(`KSM Display Fallback ${f}`, 'normal')).toBeTruthy()
    expect(face(`KSM Display Fallback ${f}`, 'italic')).toBeTruthy()
  }
  for (const f of ['Segoe', 'Arial', 'Roboto']) expect(face(`KSM Text Fallback ${f}`, 'normal')).toBeTruthy()
  for (const f of fallbackFaces())
    for (const p of ['size-adjust:', 'ascent-override:', 'descent-override:', 'line-gap-override:']) expect(f).toContain(p)
})
it('preloads the text face from the root and the display faces from route links', () => {
  expect(links()).toContainEqual({ rel: 'preload', href: '/fonts/ksm-text.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  expect(links().some((l) => l.href?.includes('ksm-display'))).toBe(false)
  expect(DISPLAY_FONT_PRELOADS.map((l) => l.href)).toEqual(['/fonts/ksm-display.woff2', '/fonts/ksm-display-italic.woff2'])
})
```

  - `src/components/ui/Button.test.jsx` (rewrite):
    - `<Button to="/contact">Запитване</Button>` is a link to `/contact` named „Запитване“, with `data-variant="outline"` and `data-size="md"`;
    - `href="/eu/plakat-ksm-stroy-a3.pdf"` gives an anchor; with neither, a `button` with `type="button"`;
    - `variant="solid" size="sm"` sets those attributes;
    - `variant="nope"` falls back to `outline`;
    - `arrow` adds an `svg[aria-hidden="true"]` and leaves the name unchanged.
  - `src/root.test.jsx`: the `theme-color` meta is `#0E0D0B`, and the critical style contains `background-color:#0E0D0B`.
  - `src/shell/shell.test.jsx` (handle case): on `/about` the `main#main` has the classes `on-light` and `legacy-ground`; on `/eu-proekt` it has neither.

- [ ] **Step 2: Run them.** Run `npx vitest run src/styles src/components/ui/Button.test.jsx src/root.test.jsx src/shell/shell.test.jsx`. Expected: FAIL (`./palette.js` missing, old values).

- [ ] **Step 3: Implement the palette, grounds and actions.**
  - **`palette.js` and Tailwind:** write `palette.js`, then import it into `tailwind.config.js` for the colours, screens, `future` and type values above.
  - **`src/index.css`:**
    - `body { background: var(--onyx); color: var(--ivory); font-family: var(--sans) }` and `::selection { background: rgba(184,149,74,.35) }`;
    - the ring rules exactly as tested, under forced colours `Highlight`;
    - `.legacy-ground { background: #fafafa; color: #1a1a1a }`;
    - delete `#root { background-color: #fafafa }`;
    - keep the reduced-motion clamp;
    - `@import './styles/diptych.css'` after `fonts.css`.
  - **`diptych.css`:** port the type rules and actions from `diptych.css:59-94`, with spec §3.3's `em` rule and spec §6.1's values.
  - **`Button`:** it renders those classes.
  - **Root literals:** `CRITICAL_CSS = 'html,body{margin:0;padding:0}body{background-color:#0E0D0B;color:#EFE9DD}'`; `theme-color` `#0E0D0B`; the manifest's `theme_color` and `background_color` `#0E0D0B`.
  - **Legacy handles:** add `legacy: true` to the nine legacy route handles listed under Files, and in `App` set the `main` classes from `useRouteHandle().legacy`.
  - **Retired tokens:** migrate every user in the Files list by this map, and remove `.on-dusk` from v2 components (dark is the default):

    | Old | New |
    |---|---|
    | `paper`, as a ground | `onyx` |
    | `ink`, as text | `ivory` |
    | `paper`, as text on dark | `ivory` |
    | `dusk` | `umber` |
    | `gold-ink` | `brass` |
    | `graphite` | `stone` |
    | `rule` | `hair-2` |
    | `light` | `brass-l` |

  - **Tests pinning old literals:** update their expected values (`#1F3A63` → `#0E0D0B` in `useScrollLock.test.js`; paper/dusk hexes in `ResponsivePicture.test.jsx`; the `ring-paper/70` and `bg-gold-ink` assertions).

- [ ] **Step 4: Rebuild the fonts.** In `scripts/fonts/build-fonts.py`:
  - **Sources.** Replace the Playfair and Geologica sources with these google/fonts masters, pinned to one commit, with each sha256 recorded the way the existing entries do:
    - `ofl/cormorantgaramond/CormorantGaramond[wght].ttf`, `CormorantGaramond-Italic[wght].ttf` and `OFL.txt`;
    - `ofl/manrope/Manrope[wght].ttf` and `OFL.txt`;
    - for measuring fallbacks only (never shipped): Noto Serif (normal and italic) and Roboto, at their google/fonts paths for that commit.
  - **Limits:** Cormorant normal `wght (500, 600)`, variable; Cormorant italic `wght 500`, pinned; Manrope `wght (400, 600)`.
  - **Freeze `lnum`** into both Cormorant cmaps, with the existing `freeze_feature`.
  - **Fallback bands:**
    - Display normal 500–549 (tuned at 500) and 550–600 (tuned at 600);
    - Display italic 500;
    - Text 400–449 (tuned at 400) and 450–600 (tuned at 500);
    - over Georgia, Times New Roman and Noto Serif for Display, and Segoe UI, Arial and Roboto for Text.
  - **Outputs:** `ksm-display.woff2`, `ksm-display-italic.woff2`, `ksm-text.woff2` and a `fonts.css` with the family names the test expects.
  - **Run:** `python -I -X utf8 scripts/fonts/build-fonts.py --pylib <scratch>/assets/_py --fetch --out <scratch>/fonts-m2`. That `_py` holds fontTools 4.68 and brotli.
  - **Install:** copy the three files and the OFL texts into `public/fonts/`, and `fonts.css` into `src/styles/`. Rewrite `scripts/fonts/REPORT.md` with the sizes and checks.
  - **Over 90 KiB:** `--copy` only reports which characters of the copy the subset lacks (`copy_coverage`, `build-fonts.py:632`); it never makes the subset smaller. Add an option `--subset-from <dir>` that builds each subset from the Bulgarian alphabet, the digits, „“–—№²×−, the no-break space and every other character found in that folder's text, and rebuild with `--subset-from src`. Never raise the budget.
  - **Preloads.** In `root.jsx`, `links()` preloads `/fonts/ksm-text.woff2` instead of the display file. `DISPLAY_FONT_PRELOADS` holds the two display descriptors (`as: 'font'`, `type: 'font/woff2'`, `crossOrigin: 'anonymous'`).

- [ ] **Step 5: Run and look.**
  - Run `npm test`, then `npm run build`, then `npm run check:dist`. Expected: PASS, with the font file sizes printed by the font test.
  - Serve with `node scripts/smoke/static-server.mjs build/client 4190`. Check by eye:
    - `/eu-proekt`: onyx ground, ivory text, a Cormorant H1, Bulgarian forms (д, л, т in the Bulgarian shapes);
    - `/about`: production's light page, readable, with an onyx focus ring.

- [ ] **Step 6: Update the smoke ring colours** for the legacy Home that is still in place.
  - In `scripts/smoke/smoke.mjs` `FOCUS_RING.stops`, „Свържи се с нас“ expects `rgb(239, 233, 221)` (a dark region inside the light ground) and „Виж проектите в продажба“ expects `rgb(14, 13, 11)`.
  - Run `npm run smoke -- --focus-ring`. Expected: PASS.

- [ ] **Step 7: Commit.** Two commits:
  - `feat(design): Diptych palette, grounds, focus rings and actions` (Steps 3 and 6, with their tests);
  - `feat(design): Cormorant Garamond and Manrope with Bulgarian forms` (Step 4).

### Task 1: The seam, the motion gate and the doors

**Files:**
- Create:
  - `src/utils/motionGate.js`, `src/utils/viewTransition.js`;
  - `src/components/ui/Seam.jsx`;
  - `src/motion/useReveals.js`, `src/motion/useMotionNow.js`, `src/motion/flip.js`;
  - `src/styles/motion.css`.
- Modify:
  - `src/utils/headScripts.js` (re-export the gate script; its header comment now says the gate's class is the one attribute a script writes on `<html>`);
  - `src/root.jsx` (`<html lang="bg" suppressHydrationWarning>`; the gate script after the screen-height script; the keyed frame's `data-arrive`; `cutOnPop`; focus to `#main`);
  - `src/styles/diptych.css` (`.seam`, `.hinge`, `.split`, line masks);
  - `src/index.css` (import `motion.css`; move the `site-header` transition rules into it; delete the 260 ms crossfade and the reduced-motion transition kill);
  - `tailwind.config.js` (the `js` variant);
  - `src/components/ui/HeroTitle.jsx`;
  - `src/utils/smoothScroll.js`, `src/utils/scroll.js` (`glideToHash`), `src/utils/motion.js` (`EXPO_IN_OUT`);
  - `src/components/ui/Button.jsx` (an `href` that starts with `#` glides);
  - `src/motion/LenisScrollSync.jsx`;
  - `scripts/check-dist.mjs`.
- Test:
  - `src/utils/motionGate.test.js`, `src/utils/viewTransition.test.js`, `src/components/ui/Seam.test.jsx`;
  - `src/motion/useReveals.test.jsx`, `src/motion/flip.test.js`, `src/styles/motion.test.js`;
  - `src/root.test.jsx`, `src/motion/LenisScrollSync.test.jsx`, `src/utils/smoothScroll.test.js`, `src/utils/scroll.test.js`, `src/utils/headScripts.test.js`, `src/components/ui/Button.test.jsx`, `src/components/ui/HeroTitle.test.jsx`.

**Interfaces:**
- Consumes:
  - from M1: `useMotion(scopeRef, setup, deps)`, `loadMotion()`, `getMotion()`, `useMotionAllowed()`, `getLenis()`, `scrollToId(id, { reveal })`;
  - from Task 0: the CSS variables.
- Produces:
  - `MOTION_GATE_SCRIPT: string` (also exported from `headScripts.js`).
  - The Tailwind variant `js`, which is `:root.js &`.
  - `LENIS_OPTIONS = { lerp: 0.1, wheelMultiplier: 1, syncTouch: false, allowNestedScroll: true, autoRaf: false }`.
  - `EXPO_IN_OUT(t: number): number`. `scrollToId` glides with `{ duration: 1.5, easing: EXPO_IN_OUT }`.
  - `<Seam draw?: boolean, className?: string />`, rendering `<span class="seam" aria-hidden="true" data-draw?>`.
  - CSS `.seam`, `.hinge`, `.split`, `.line-mask`.
  - `useReveals(scopeRef): void`, for `[data-split]`, `[data-fade]` and `[data-draw]` inside the scope.
  - `useMotionNow(): () => Motion | null`, which gives the engine only while `useMotionAllowed()` is true.
  - `loadFlip(): Promise<Flip>` (memoised).
  - `VT_CUT = 'vt-cut'`, `cutNextTransition(): void`, `clearTransitionCut(): void`, and `cutOnPop(): () => void`, which makes every `popstate` call `cutNextTransition()` and returns the remover.
  - On the keyed page wrapper: `data-arrive` is `undefined` on the first page the app renders, `'pop'` on a page mounted by Back or Forward, `'hero'` when `location.state?.arrive === 'hero'`, and `'doors'` otherwise.
  - `--arrive`: `0s`; `.95s` under `:root.intro`; `.52s` under `[data-arrive="doors"]`; `0s` under `[data-arrive="hero"]` and `[data-arrive="pop"]`.
  - `glideToHash(event): void`, from `src/utils/scroll.js`. For a plain left click (no modifier key) on a link to `#id` on this page, it calls `event.preventDefault()`, then `scrollToId(id)`, and focuses the target with `{ preventScroll: true }`, giving it `tabindex="-1"` if it has none. The router's location does not change. `Button` attaches it to every `href` that starts with `#`.
  - `TRANSITION_MAX_MS = 1400`.

- [ ] **Step 1: Write the failing tests.** `src/utils/motionGate.test.js`:

```js
// run(): installs window.matchMedia (or deletes it), navigator.connection, the path and sessionStorage,
// clears <html class>, evaluates MOTION_GATE_SCRIPT with new Function, returns documentElement.className.
it('marks motion as allowed', () => expect(run({ path: '/about' })).toBe('js'))
it('stays off under reduced motion, with Save-Data, or without matchMedia', () => {
  expect(run({ reduce: true })).toBe('')
  expect(run({ saveData: true })).toBe('')
  expect(run({ matchMedia: false })).toBe('')
})
it('plays the intro on the first Home load of the session only', () => {
  expect(run({ path: '/' })).toBe('js intro')
  expect(sessionStorage.getItem('ksm-intro')).toBe('1')
  expect(run({ path: '/' })).toBe('js')
  sessionStorage.clear()
  expect(run({ path: '/about' })).toBe('js')
})
it('survives a sessionStorage that throws', () => expect(run({ path: '/', storageThrows: true })).toBe('js'))
```

  - `src/styles/motion.test.js`. It reads `src/styles/motion.css` and checks:
    - `:root.js::view-transition-old(.page-out)` runs `door-close 400ms`;
    - `:root.js::view-transition-new(.page-in)` runs `door-open 600ms` with a `520ms` delay;
    - `::view-transition-image-pair(.page-in)` runs `door-seam 1120ms`;
    - `@keyframes door-close` goes from `inset(0 0 0 0)` to `inset(0 50% 0 50%)`, and `door-open` goes back;
    - `door-seam` contains `#D8BD7A` and `rgba(216,189,122,.7)`;
    - the `:root.vt-cut` rules set `animation: none`;
    - the plain rule gives `::view-transition-old(.page-out), ::view-transition-new(.page-in)`, the menu's old snapshot and both root snapshots `animation-duration: 200ms`;
    - the doors sit inside `@media (prefers-reduced-motion: no-preference)`;
    - the `--arrive` rules are as in the interface;
    - `:root.js:not(.vt-cut)::view-transition-old(root)` and `:root.js:not(.vt-cut)::view-transition-old(site-menu)` run `door-close 400ms`, and `:root.js:not(.vt-cut)::view-transition-new(root)` runs `door-open 600ms` with a `520ms` delay;
    - `:root.js::view-transition` sets `background: var(--onyx)`;
    - no rule outside a `:root.js` selector or a `@keyframes` block sets `opacity: 0`.
  - `src/utils/viewTransition.test.js`: `cutNextTransition()` adds `vt-cut` to `<html>`, and `clearTransitionCut()` removes it. **`a popstate cuts the doors`**: after `cutOnPop()`, a `popstate` event adds `vt-cut`; after its remover runs, another `popstate` does not.
  - `src/motion/LenisScrollSync.test.jsx`:
    - the timing pin becomes 1400 ms;
    - new case `clears vt-cut when no transition runs`: set `vt-cut`, change the location key, advance fake timers 1400 ms, and expect the class gone.
  - `src/root.test.jsx` (arrival and focus). `renderSiteAt`'s memory router ignores `window.history`, so these cases build the router themselves and keep it (`createMemoryRouter` under `App`, as `src/shell/prerender.test.jsx` does):
    - at `/eu-proekt`: the keyed wrapper (`main#main > div`) has no `data-arrive`;
    - click the footer link „За нас“: the new wrapper has `data-arrive="doors"`, and `document.activeElement` is `main#main`;
    - **`Back gives data-arrive="pop"`**: then `router.navigate(-1)`. The wrapper of `/eu-proekt`, whose location key is `"default"` again, has `data-arrive="pop"`, not none;
    - navigating with `{ state: { arrive: 'hero' } }` gives `data-arrive="hero"`;
    - a hash-only change keeps the same wrapper and attribute;
    - `renderToString(<Layout><p /></Layout>)` contains `<html lang="bg">` (no `class`), and the `screen-h` script comes before the gate script.
  - `src/utils/headScripts.test.js` (the gate through hydration):
    - the file's `Page` renders `<html lang="bg" suppressHydrationWarning>` with both head scripts, the screen-height script first;
    - with `mockMatchMedia()` installed, the path `/` and an empty `sessionStorage`, `parse(html)` runs the scripts, so `<html>` carries `js intro`;
    - hydrating the document records no recoverable error and no `console.error`;
    - `<html>` still carries `js intro` after hydration and after a re-render;
    - the file's header comment, which says scripts never write an attribute on `<html>`, is updated.
  - `src/components/ui/Seam.test.jsx`: it renders `span.seam[aria-hidden="true"]` with no inline style; `draw` adds `data-draw`.
  - `src/motion/useReveals.test.jsx`, with the fake engine pattern of `useMotion.test.jsx` and `mockMatchMedia()`:
    - `[data-split]` calls `SplitText.create(el, { type: 'words,lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, onSplit })`, whose tween is `{ yPercent: 112, duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }`, and the split is reverted on complete;
    - `[data-fade]` calls `gsap.from(el, { opacity: 0, y: 16, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } })`;
    - `[data-draw]` calls `gsap.from(el, { scaleY: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el.parentElement, start: 'top 82%', once: true } })`;
    - an element whose `getBoundingClientRect().top < innerHeight` at setup gets no tween;
    - without motion, nothing runs.
  - `src/motion/flip.test.js`: two calls return the same promise; the plugin is registered once on the loaded engine's `gsap` (`gsap/Flip` mocked).
  - `src/utils/smoothScroll.test.js`: `LENIS_OPTIONS` equals the interface value.
  - `src/utils/scroll.test.js`: `scrollToId` passes `duration: 1.5` and `easing: EXPO_IN_OUT`; `EXPO_IN_OUT(0) === 0`, `EXPO_IN_OUT(0.5) === 0.5` and `EXPO_IN_OUT(1) === 1`.
  - `src/components/ui/Button.test.jsx` (same-page links), inside a memory router at `/` with a `<section id="zapitvane">` on the page:
    - clicking `<Button href="#zapitvane">` calls `scrollToId('zapitvane')` (mocked), and the click's default is prevented;
    - the router's location is still `/`, with no hash;
    - the section has focus;
    - a Ctrl-click does none of this.
  - `src/components/ui/HeroTitle.test.jsx`: the line class contains `js:animate-hero-rise` and not `motion-safe:`.

- [ ] **Step 2: Run them.** Run `npx vitest run src/utils src/styles/motion.test.js src/motion src/root.test.jsx src/components/ui/Seam.test.jsx src/components/ui/HeroTitle.test.jsx src/components/ui/Button.test.jsx`. Expected: FAIL.

- [ ] **Step 3: The gate.**
  - **`MOTION_GATE_SCRIPT`** is plain ES5 in a `try`: classes on `document.documentElement` per the tests, and the session flag `ksm-intro`.
  - **`root.jsx`:** `<html lang="bg" suppressHydrationWarning>`, never a `className`; inject the script right after `SCREEN_HEIGHT_SCRIPT`.
  - **The `js` variant:** `plugin(({ addVariant }) => addVariant('js', ':root.js &'))`. HeroTitle uses `js:animate-hero-rise`.
  - **Lenis:** the new `LENIS_OPTIONS`.
  - **`EXPO_IN_OUT`:** `t === 0 ? 0 : t === 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2`. Use it in `scrollToId`'s Lenis call.

- [ ] **Step 4: The seam primitives and the reveals.**
  - **Seam, hinge and split:** port the seam (`diptych.css:97-98`), the hinge (`.hinge`, extract §4.9: 18 px overshoot, `clamp(24px, 3vw, 52px)` gaps, the bottom margin `clamp(56px, calc(var(--screen-h) * .09), 104px)`), `.split` and the phone conversion at ≤ 900 px (extract §3.4).
  - **Line masks:** `.line-mask, .split-line-mask { display: block; padding: .12em .14em .26em; margin: -.12em -.14em -.26em }`.
  - **`useReveals`:** wraps `useMotion` with one setup per scope.
  - **`useMotionNow`:** returns `() => (allowed ? getMotion() : null)`.
  - **`loadFlip`:** `Promise.all([loadMotion(), import('gsap/Flip')])`, then register the plugin and return `Flip`.

- [ ] **Step 5: The doors.** Write `src/styles/motion.css`:

```css
:root { --arrive: 0s; }
:root.intro { --arrive: .95s; }
[data-arrive="doors"] { --arrive: .52s; }
[data-arrive="hero"], [data-arrive="pop"] { --arrive: 0s; }
@property --door-seam { syntax: '<color>'; inherits: false; initial-value: rgba(184, 149, 74, 0); }
::view-transition-old(.page-out), ::view-transition-new(.page-in),
::view-transition-old(site-menu), ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 200ms; }
@media (prefers-reduced-motion: no-preference) {
  /* What the doors uncover. */
  :root.js::view-transition { background: var(--onyx); }
  /* The page, the root snapshot (footer, grain, ground) and an open menu close together. */
  :root.js::view-transition-old(.page-out),
  :root.js:not(.vt-cut)::view-transition-old(site-menu),
  :root.js:not(.vt-cut)::view-transition-old(root) { animation: door-close 400ms var(--e-io) both; }
  :root.js::view-transition-new(.page-in),
  :root.js:not(.vt-cut)::view-transition-new(root) { animation: door-open 600ms var(--e-out) 520ms both; }
  :root.js::view-transition-image-pair(.page-in) {
    background: linear-gradient(var(--door-seam), var(--door-seam)) 50% 0 / 1px 100% no-repeat;
    animation: door-seam 1120ms linear both;
  }
  /* The hero move and Back/Forward: the new page at once; the root and a menu fade as the browser does. */
  :root.vt-cut::view-transition-old(.page-out),
  :root.vt-cut::view-transition-new(.page-in),
  :root.vt-cut::view-transition-image-pair(.page-in) { animation: none; }
}
@keyframes door-close { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 50% 0 50%); } }
@keyframes door-open { from { clip-path: inset(0 50% 0 50%); } to { clip-path: inset(0 0 0 0); } }
@keyframes door-seam {
  0% { --door-seam: rgba(184, 149, 74, 0); }
  10.7%, 35.7% { --door-seam: #B8954A; filter: none; }
  35.8%, 41% { --door-seam: #D8BD7A; filter: drop-shadow(0 0 8px rgba(216,189,122,.7)); }
  41.1%, 59.8% { --door-seam: #B8954A; filter: none; }
  86.6%, 100% { --door-seam: rgba(184, 149, 74, 0); }
}
```

  Keep the `site-header` rules: the old header snapshot gets `display: none`, the new one `animation: none`. Task 2 gives the menu its group name, `site-menu`.
  - **Arrival.** Never compare location keys. React Router gives the first entry the key `"default"` and Back restores it, so key equality treats Back to the first page as a first load (and replays the intro there).
    - `RouteTransition` holds a first-render ref (`useRef(true)`, set to `false` in a mount effect).
    - Each render it computes the arrival: `undefined` while the ref is `true`; `'pop'` when `useNavigationType()` is `'POP'`; otherwise `'hero'` when `location.state?.arrive === 'hero'`, else `'doors'`.
    - A small frame component inside the keyed `<ViewTransition>`, keyed with it, captures that value once at mount (a `useState` initialiser) as its `data-arrive`. The prerender and the hydration both render the first page, so they agree.
    - Use no module-level flag, so every mounted app (and every test) starts fresh.
  - **Back/Forward.** `RouteTransition` runs `cutOnPop()` in a mount effect and its remover on unmount. A `popstate` fires before the router commits, so the doors never run on Back or Forward (spec §5.6), and the page enters at `--arrive: 0s`.
  - **Focus.** On a client mount the frame focuses `#main` with `preventScroll`.
  - **`LenisScrollSync`:** `TRANSITION_MAX_MS = 1400`; call `clearTransitionCut()` once `viewTransitionDone()` settles.
  - **Same-page links.** Write `glideToHash` (interface) and attach it in `Button` to every `href` that starts with `#`; plain anchors to a section of the same page call it themselves. Without it, the router's hash handling jumps at once, and `LenisScrollSync`'s immediate scroll on the new location key cuts any glide started in the same click.

- [ ] **Step 6: check-dist.** In `scripts/check-dist.mjs`:
  - **Legacy by fingerprint.** Replace `V2_ROUTES` with detection: a route is legacy when any of its first-load files matches `/framerAppearId/` (framer-motion) or `/swiper-slide/` (swiper). Legacy routes WARN over budget; all others FAIL over 160 KiB.
  - **`MUST_BE_V2`.** Keep a list of the rebuilt routes, and FAIL when a listed route carries a legacy fingerprint, so a rebuilt route that pulls in framer-motion or Swiper through a shared module cannot slip into a WARN. The list starts as `['/eu-proekt', '/404']`; Task 3 adds `/`, Task 5 `/projects/golden-residence`, and Task 7 both Golden Residence block routes.
  - **Flip.** Add Flip's fingerprint `/data-flip-id/`. It must not be in any first-load file, and it must be found in exactly one chunk. Report that chunk's gzip size and fail above 10 KiB. If no chunk has it yet, print a note: no page loads Flip before Task 8.
  - **Self-test.** Extend the `PLANTED` self-check with one planted framer file, one planted Flip file, and one listed route whose planted first-load file carries the framer fingerprint, which must FAIL.

- [ ] **Step 7: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist`. Expected: PASS. Routes that carry framer-motion or swiper and are over 160 KiB print WARN; every other route is OK.
  - `npm run dev`: open `/` in Chrome, then click to `/eu-proekt`. The doors close on the seam, glint and open, and the console has no hydration warning. Press Back: no doors, and the page is there at once.
  - Capture frames at 200, 450 and 800 ms with DevTools' animation panel at 10 % speed, for the reviewer.

- [ ] **Step 8: Commit.** `feat(motion): the html.js gate, the seam primitives and the two-door page transition`.

### Task 2: The shell in Diptych

**Files:**
- Create:
  - `src/shell/SiteMenu.jsx`;
  - `src/styles/shell.css`;
  - `src/data/availability/select.js`;
  - `scripts/smoke/fixtures/sheets/{gr-block-a,gr-block-b,gr-garages,gr-parking}.csv`, copied from `C:/ksm-stroy/design/2026-11-14-concepts/data/sheets/`.
- Modify:
  - `src/shell/SiteHeader.jsx`, `src/shell/EuLine.jsx`, `src/shell/SiteFooter.jsx`, `src/shell/handle.js`;
  - `src/components/brand/Logo.jsx` (`markClassName`);
  - `src/root.jsx` (grain element, `min-h-[var(--screen-h)]`, `main` padding by handle);
  - `src/index.css` (`@import './styles/shell.css'`; `--eu-h: 36px`, `--bar-h: 76px` and 64 px at ≤ 900 px, `--header-h`, `html { scroll-padding-top: var(--bar-h) }`; delete the M1 `.eu-line` block);
  - `scripts/smoke/static-server.mjs`;
  - every route module's `handle` (drop `object`).
- Delete: `src/shell/MobileMenu.jsx`, `src/shell/TitleBlock.jsx`.
- Test:
  - `src/shell/shell.test.jsx`, `src/shell/prerender.test.jsx`;
  - `src/data/availability/select.test.js`;
  - `scripts/smoke/static-server.test.mjs`.

**Interfaces:**
- Consumes:
  - from Task 0: `Button`;
  - from Task 1: `Seam`, `useMotionNow`;
  - from M1: `useScrollLock(background)`, `useAvailability()`, `NAV`, `currentFor`, `SITE`, `PRIMARY_PHONE`, `mapsUrl`, `normalizeUnitId`, `parseArea`, `statusKey`, `normalizeStatus`.
- Produces:
  - `SiteHeader()` with `data-look="overlay" | "solid"`, and `data-scrolled` once the page has scrolled past 40 px.
  - `SiteMenu({ id, pathname, onClose })`.
  - `EuLine({ variant = 'row' })`, where `variant` is `'row' | 'footer' | 'menu'`.
  - `SiteFooter()`.
  - `Logo({ variant, className, markClassName })`.
  - The route handle `{ header: 'overlay' | 'solid', project?, inquiry?: true, legacy?: true }`, and `inquiryTarget(handle): string`, which gives `'#zapitvane'` when `handle.inquiry` and `inquiryHref(handle.project)` otherwise.
  - In `src/data/availability/select.js`:

```js
/** M1's unit model (src/utils/units.js) plus suffix and price:
 * { id: 'А501', label: 'А 501', kind: 'apartment', block: 'А' | 'Б', floor: number, suffix: '01',
 *   builtArea, idealParts, totalArea: number | null, type: string, exposure: string, price: string,
 *   status: 'available' | 'reserved' | 'sold' | 'blocked' | 'unknown', statusText: string } */
export function apartmentUnits(data, project = 'golden-residence') // → Unit[] from the API rows; [] for null data
export function grFree(snapshot) // → number | null: available units of both blocks; null unless status is 'ready' or 'fallback'
```

  - The static server answers `GET` and `HEAD` for `/api/availability` by calling `api/availability.js` over the fixture CSVs. The env vars point at `fixture:` URLs, and a fetch shim reads `scripts/smoke/fixtures/sheets/<name>.csv`.

- [ ] **Step 1: Write the failing tests.** `src/shell/shell.test.jsx` (rewrite the header, menu, footer and title-block cases):

```jsx
it('holds the logo, „Меню“, the phone and „Запитване“, and no page links', async () => {
  renderSiteAt('/about')
  const header = await screen.findByRole('banner')
  expect(within(header).getByRole('link', { name: 'КСМ Строй, начална страница' })).toHaveAttribute('href', '/')
  expect(within(header).getByRole('button', { name: /Меню/ })).toHaveAttribute('aria-expanded', 'false')
  expect(within(header).getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
  expect(within(header).getByRole('link', { name: 'Запитване' })).toHaveAttribute('href', '/contact')
  expect(within(header).queryByRole('link', { name: 'Продажби' })).toBeNull()
})
it('carries the EU row with the project number and „За проекта“', ...)  // link → /eu-proekt, the text in the header
it('is see-through over Home until 40 px, then solid, and never hides', ...) // data-look, data-scrolled, no data-hidden at scrollY 2000
it('the menu: six links, the live Golden Residence line, the details, the EU line', async () => {
  goOffline(); renderSiteAt('/about'); await user.click(menuButton())
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  expect(within(menu).getAllByRole('link').slice(0, 6).map((a) => a.textContent))
    .toEqual(['Начало', 'Golden Residence', 'Продажби', 'Обекти', 'За нас', 'Контакти'])
  expect(within(menu).getByRole('link', { name: 'За нас' })).toHaveAttribute('aria-current', 'page')
  await waitFor(() => expect(menu).toHaveTextContent(/жк Левски Г · \d+ свободни/))
  for (const t of ['Телефон', 'Работно време', 'Адреси', 'Имейл', 'За проекта']) expect(menu).toHaveTextContent(t)
})
it('moves focus into the menu, keeps Tab inside, and Escape returns it to „Меню“', ...)
it('a page link closes the menu with the page change; the current page’s link closes it at once', ...)
// on /about: „Обекти“ shows /blog with no dialog; reopened, „За нас“ (aria-current) leaves no dialog at once
it('the footer: details, both Maps links, „Бързи връзки“, © line and no title block', ...)
// both „Отвори в Google Maps“ hrefs equal mapsUrl(office); the five NAV links under „Бързи връзки“;
// „© 2026 КСМ Строй · КСМ СТРОЙ ООД“; Facebook; queryByText(/Обект:/) is null
```

  - `src/shell/prerender.test.jsx`:
    - the strings list keeps `BG16RFPR001-1.012-1485-C01`, `За проекта`, `Продажби` (now from the footer), `+359 887 886 166`, `Запитване`, `КСМ СТРОЙ ООД` and `© 2026 КСМ Строй`;
    - the title-block case is deleted;
    - `data-look="overlay"` holds on `/`.
  - `src/data/availability/select.test.js`:
    - `apartmentUnits({ 'golden-residence': { 'block-a': [{ unit: 'А 501', floor: '5', type: '2-стаен', area: { built: '54,36', ideal: '7,82', total: '62,18' }, exposure: '', status: 'Продадени', price: '' }], 'block-b': [] } })[0]` equals `{ id: 'А501', label: 'А 501', kind: 'apartment', block: 'А', floor: 5, suffix: '01', builtArea: 54.36, idealParts: 7.82, totalArea: 62.18, type: '2-стаен', exposure: '', price: '', status: 'sold', statusText: 'Продадени' }`;
    - an empty status gives `status: 'available'`, `statusText: 'Свободен'`; `Скоро` gives `status: 'unknown'`, `statusText: 'Скоро'`;
    - `grFree` is `null` for `idle`, `loading` and `error`, and counts only `available` for `ready` and `fallback`.
  - `scripts/smoke/static-server.test.mjs`:
    - `GET /api/availability` answers 200 with `sources` `{ BLOCK_A: 'ok', BLOCK_B: 'ok', GARAGES: 'ok', PARKING: 'ok', MNOGO_A: 'missing', MNOGO_B: 'missing' }`, and with 96 rows in each Golden Residence block;
    - `HEAD` answers 200 with no body;
    - `POST` answers 405.

- [ ] **Step 2: Run them.** Run `npx vitest run src/shell src/data/availability/select.test.js scripts/smoke/static-server.test.mjs`. Expected: FAIL.

- [ ] **Step 3: Implement the header, EU line, menu and footer.** Match the concept's header, menu and footer at 1440 and 390 against `index.html:69-79`, `:250-298`. Port `diptych.css:101-134` (header), `:156-182` and `:738-745` (menu), `:175-182` and `:201-230` (footer, EU), and the behaviour of `core.js:301-366`.
  - **Header** (spec §6.2):
    - solid after 40 px; once solid it moves up by `var(--eu-h)`; transitions 0.45 s `--e-soft` (ground, border) and 0.5 s `--e-out` (transform);
    - the logo is 142 px wide (120 px on phones) with `markClassName="text-brass"`;
    - the phone and „Запитване“ show from 901 px, and „Запитване“ goes to `inquiryTarget(handle)`.
  - **EU line** (spec §6.3): plate `#F7F4EE`, logos 20 px tall in the row and 28 px in the footer and menu; a 44 px hit box on „За проекта“.
    - Keep M1's text box (`.eu-line-text` in `src/index.css`), moved into `shell.css`: `minmax(0, 1fr)` with `container-type: inline-size`. It shows the full text when it fits through the project number, else the short text, else nothing, and an ellipsis never cuts the number.
    - Re-measure its two container thresholds for 13 px Manrope and its widest fallback face; spec §6.3 gives the Manrope widths.
  - **Layers** (spec §2.2): header `z-index: 40`, menu 60, skip link 90.
  - **Hit boxes:** 44 × 44 px pseudo-element hit boxes on the footer and menu links and the phone numbers.
  - **Menu** (spec §6.4):
    - the open timeline: halves slide 0.75 s `expo.inOut`, the seam draws at 0.45 s over 0.9 s, items rise 26 px over 0.8 s with stagger 0.04 from 0.5 s;
    - the close: items fade in 0.2 s, halves go back in 0.6 s from 0.05 s;
    - focus to the first link after 650 ms (50 ms without motion); `useScrollLock('#0E0D0B')`;
    - links use `prefetch="intent"`;
    - the menu's root has `view-transition-name: site-menu`, so the doors close over it (Task 1's `motion.css`);
    - `SiteHeader` keeps the pathname the menu was opened on and mounts `SiteMenu` only while that pathname is current. A page link therefore needs no handler: the menu unmounts in the commit that shows the new page, and only the old snapshot holds it. The current page's own link closes the menu at once (no close timeline), then navigates;
    - the button keeps `aria-label="Меню"` (its visible label) and the dialog `aria-label="Меню"`; the smoke run's scroll-lock step selects both.
  - **Footer** (spec §6.5): links use `prefetch="intent"`.
  - **Grain:** `<div class="grain" aria-hidden="true">` (extract §1.2: opacity 0.045, `z-index: 70`, fixed, `pointer-events: none`), rendered by `App` when `!handle.legacy`.
  - **`main` padding:** `0` under an overlay handle, `var(--header-h)` otherwise.
  - **Handles:** `inquiry` and `legacy` are documented in `handle.js`; `object` is removed everywhere.

- [ ] **Step 4: The units adapter and the API fixture.**
  - `select.js`: `parseInt` for the floor; `parseArea` for areas; `statusKey` and `normalizeStatus`; the suffix is the last two digits of the label's trailing number.
  - The static server's fixture runs inside its process, as the interface says. `smoke.mjs` and `scripts/perf/lighthouse.mjs` need no change for it.

- [ ] **Step 5: Run and look.**
  - Run `npm test`, then `npm run build`, then `npm run smoke`. Expected: PASS. The scroll-lock step opens `SiteMenu` on `/about`, and its live line reads the fixture.
  - Screenshots at 1440 and 390: the header on `/` (overlay) and on `/about` (solid), the menu open, and the footer. Compare with the concept's header, menu and footer.
  - With DevTools' animation panel at 10 % speed, capture frames at 200, 450 and 800 ms of two page changes: from the open menu („Обекти“ on `/about`), and from a footer link with the footer filling the screen. The menu and the footer must close with the doors, nothing may vanish or fade on its own, and what the doors uncover must be onyx.
  - Check the header at 1024 and 1100 px with the text-spacing bookmarklet (WCAG 1.4.12): nothing clips.

- [ ] **Step 6: Commit.** `feat(shell): the Diptych header with the EU row, the diptych menu and the footer`.

### Task 3: Home I: the split opening, the company section and the EU poster

**Files:**
- Create:
  - `src/pages/home/SplitHero.jsx`, `SeamIntro.jsx`, `CompanySection.jsx`, `EuPosterSection.jsx`, `home.css`;
  - `src/config/facts.js`;
  - `public/og/ksm-stroy-1200x630.jpg`;
  - `src/data/images/home.json` (generated).
- Modify:
  - `src/pages/Home.jsx` (rewritten as the route module);
  - `scripts/images/sources.json`, `src/data/images/golden-residence.json` and `public/img/` (generated);
  - `src/seo/meta.js` (`DEFAULT_IMAGE`);
  - `src/root.jsx` (drop `ApartmentProvider`);
  - `src/routes/golden-residence-block.jsx` (wrap `GoldenResidenceSingleBlock` in `ApartmentProvider`);
  - `scripts/smoke/smoke.mjs`;
  - `scripts/check-dist.mjs` (`MUST_BE_V2` gains `/`);
  - `src/pages/legacy.focus.test.jsx` (drop the HeroCarousel case).
- Delete: `src/components/EuPosterSection.jsx`, `src/components/ui/HeroCarousel.jsx`, `src/hooks/useSiteAvailability.js` and its test. Delete each only after `grep -rn` shows no other importer.
- Test:
  - `src/config/facts.test.js`;
  - `src/pages/home/home.test.jsx`, `home.prerender.test.jsx`, `home.css.test.js`;
  - `src/seo/meta.test.js`.

**Interfaces:**
- Consumes:
  - from Tasks 0–2: everything they produce;
  - from M1: `useAvailability`, `availabilityPreload`, `ResponsivePicture`, `RollingNumber`, `EmblemPaths` (`src/components/brand/Emblem.jsx`), `pageMeta`, `seoData.home`.
- Produces:
  - In `src/config/facts.js`:
    - `MNOGO_DATED = Object.freeze({ free: 16, total: 144, date: '01.12.2025' })`;
    - `GR_FACTS = Object.freeze({ apartments: 192, blocks: 2, floors: 8, perFloor: 12, minArea: 43.98, maxArea: 114.58, garages: 113, parking: 68, elevations: Object.freeze({ 'А-1': 3.06 }) })`. `elevations` is keyed by floor key; it holds only what the drawings give (spec §9).
  - The Home route module: `handle = { header: 'overlay' }` (Task 0's `legacy` goes); `links = () => [availabilityPreload, ...DISPLAY_FONT_PRELOADS]`; `meta` unchanged.
  - Section ids `proekti`, `za-nas`, `es-proekt`.
  - The GR half is `a.half.half--gr[href="/projects/golden-residence"]`, inside `section.hero` (Task 5 adds the hero move).

- [ ] **Step 1: Write the failing tests.**

```js
// src/config/facts.test.js
it('Многофамилна dated counts match the built-in data', () => {
  const statuses = [getMnogoAFallbackData(), getMnogoBFallbackData()]
    .flatMap((d) => Object.entries(d).filter(([k]) => k !== '0').flatMap(([, units]) => units.map((u) => u.status)))
  const s = summarizeStatuses(statuses)
  expect(MNOGO_DATED).toEqual({ free: s.available, total: s.total, date: '01.12.2025' })
  expect(MNOGO_DATED).toMatchObject({ free: 16, total: 144 })
})
```

```jsx
// src/pages/home/home.test.jsx (goOffline(); renderSiteAt('/'))
it('opens with slogan A, read row by row across the seam', async () => {
  const h1 = await screen.findByRole('heading', { level: 1 })
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(h1.textContent.replace(/\s+/g, ' ').trim()).toBe('Създаваме пространства за мечтания живот')
  expect(h1.querySelector('em')).toHaveTextContent('мечтания')
  expect([...h1.querySelectorAll('[data-part]')].map((p) => p.textContent.replace(/\s+/g, ' ')))
    .toEqual(['Създаваме', 'пространства', 'за мечтания', 'живот'])
})
it('links both buildings with their counts', async () => {
  await waitFor(() => expect(screen.getByRole('link', { name: /^Golden Residence, жк Левски Г: \d+ свободни апартамента от 192\. Изберете апартамент\.$/ })).toHaveAttribute('href', '/projects/golden-residence'))
  expect(screen.getByRole('link', { name: 'Многофамилна сграда, ж.к. Връбница-1: 16 свободни апартамента от 144 по данни към 01.12.2025. Запитване за сградата.' }))
    .toHaveAttribute('href', '/contact?project=mnogofamilna-sgrada')
})
it('tells the company story in production words', () => {
  const s = within(document.getElementById('za-nas'))
  expect(document.querySelector('#za-nas blockquote')).toHaveTextContent('„Добрата работа – реклама за майстора“')
  expect(s.getByRole('heading', { name: 'Традиция и иновации от 2008' })).toBeInTheDocument()
  expect(s.getByText(/КСМ СТРОЙ ООД е основана през септември 2008\s+г\. от двама братя – Кадри и\s+Сухат/)).toBeInTheDocument()
  for (const w of ['коректност', 'бързина', 'точност']) expect(s.getByText(w)).toBeInTheDocument()
})
it('keeps production’s EU poster section last', () => {
  const s = document.getElementById('es-proekt')
  expect([...document.querySelectorAll('main section[id]')].at(-1)).toBe(s)
  expect(s).toHaveTextContent('BG16RFPR001-1.012-1485-C01')
  expect(s.querySelectorAll('a[href="/eu/plakat-ksm-stroy-a3.pdf"]')).toHaveLength(3)
  expect(s.querySelector('a[download="Плакат A3 - КСМ Строй.pdf"]')).not.toBeNull()
  for (const t of ['Безвъзмездна финансова помощ', '24 724,03 евро', 'Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД'])
    expect(s).toHaveTextContent(t)
})
```

  - `home.prerender.test.jsx` (node, then jsdom hydration with fatal recoverable errors, as in `src/hooks/hydration.test.jsx`):
    - the HTML for `/` contains the H1 text, `16` and the intro's `class="intro-doors"`;
    - the GR count renders `—`;
    - no `style` attribute in `section.hero` contains `opacity`, `transform`, `clip` or `visibility`;
    - hydrating with `mockMatchMedia({ fine: true })` records no recoverable error.
  - `home.css.test.js`:
    - every rule in `home.css` that declares `animation` starts with `:root.js` and sits inside `@media (prefers-reduced-motion: no-preference)`;
    - outside `@keyframes` and outside `@media (prefers-reduced-motion: no-preference)`, no rule for the hero or the intro declares `opacity: 0`, `visibility: hidden`, `stroke-dashoffset`, a `translateY(…)` or a `scale…(…)`, and none shows `.intro-doors`. Starting states live in the keyframes (`both` fill), so switching reduced motion on mid-page never leaves anything hidden or covered;
    - the rules that set `--s: .62` and `--s: .38` sit inside `@media (hover: hover) and (pointer: fine) and (min-width: 901px)`;
    - **`the intro doors never show under [data-arrive]`**: `home.css` has `:root.js.intro [data-arrive] .intro-doors { display: none }`;
    - `home.css` contains `@property --s` with `syntax: '<number>'`;
    - it contains the `--xg` and `--xm` formulas of spec §6.7 verbatim, and the phone seam `--sy: clamp(50%, calc(var(--header-h) + 290px), calc(100% - 190px))`.
  - `src/seo/meta.test.js`: the default `og:image` is `https://www.ksmstroy.com/og/ksm-stroy-1200x630.jpg`.

- [ ] **Step 2: Run them.** Run `npx vitest run src/config/facts.test.js src/pages/home src/seo/meta.test.js`. Expected: FAIL.

- [ ] **Step 3: Images.**
  - Add to `scripts/images/sources.json`:
    - `{ "id": "gr-dusk", "group": "golden-residence", "src": "C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/img/gr-dusk-2400.webp", "widths": [800, 1400, 1600, 1920, 2400] }`;
    - `{ "id": "mn-dusk", "group": "home", "src": "C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/img/mn-dusk-2400.webp", "widths": [800, 1400, 1600, 1920, 2400] }`.
  - Run `npm run images`. Check the files the browser actually picks with `sizes="100vw"`: `gr-dusk-800.avif` ≤ 60 kB (phones), and `gr-dusk-1600.avif` (1440 px at DPR 1) and `gr-dusk-1920.avif` (1920 px) ≤ 200 kB.
  - Compare the dusk sky with the concept at 1440. These renders are re-encoded from lossy WebPs; if the sky bands, raise `quality.avif` for `gr-dusk` and `mn-dusk` in `sources.json` and check the budget again.
  - Write `public/og/ksm-stroy-1200x630.jpg` once with sharp from `gr-dusk-2400.webp`: `fit: 'cover'`, `position: '50% 62%'`, JPEG quality 82.
  - Set `DEFAULT_IMAGE = '/og/ksm-stroy-1200x630.jpg'`.

- [ ] **Step 4: Build the opening.** Match `index.html:63-152` against `shots/c2v2-check-home-a-1440.png`, `c2v2-check-home-a-390.png` and `c2v2-company-1440.png`.
  - **`Home.jsx`** composes `SeamIntro`, `SplitHero`, `CompanySection` and `EuPosterSection`, with the route exports from the interface.
  - **`SplitHero`** (spec §6.7):
    - `container-type: inline-size`; height `max(640px, var(--screen-h))`, and `max(560px, var(--screen-h))` at ≤ 900 px;
    - `@property --s { syntax: '<number>'; inherits: true; initial-value: .5 }`, with the clips and the `--xg` / `--xm` translations as written there;
    - widening under `@media (hover: hover) and (pointer: fine) and (min-width: 901px)` with `:root.js .hero:has(.half--gr:hover, .half--gr:focus-visible) { --s: .62 }`, the MN half `.38`, `transition: --s .9s var(--e-out)`, the other shade at 0.4;
    - `object-position` as in the spec; overlays from extract §1.2;
    - pictures through `ResponsivePicture`, the GR one `priority` and the MN one `eager`, both `sizes="100vw"`;
    - the GR half is a `Link` with `prefetch="intent"`;
    - `RollingNumber` for the GR count (`grFree`) and a static 16 for MN;
    - accessible names exactly as tested;
    - the H1 first in the DOM, with parts `<span data-part class="line-mask">`, rows set as in spec §6.7 (desktop at ±0.2 em from the seam; phones as two inline lines broken after „пространства“, at `clamp(28px, 8.4vw, 46px)`);
    - phones: the horizontal seam at `--sy` (spec §6.7). The GR clip, both picture boxes, the seam line and the GR info's `bottom: calc(100% - var(--sy) + 18px)` follow it;
    - the entrance keyframes of spec §5.5 under `:root.js`, with `animation-delay: calc(var(--arrive) + …)`.
  - **`SeamIntro`:** two doors, each holding `EmblemPaths` in a 92 × 105 mark split down its axis (stroke 2.6), plus `.doors__seam`. It is fixed at `z-index: 80`, and `display: none` except under `:root.js.intro`. It never shows inside a page that carries `data-arrive` (`:root.js.intro [data-arrive] .intro-doors { display: none }`), so only the first page the app renders can show it. The rule that shows it sits inside `@media (prefers-reduced-motion: no-preference)` with its keyframes, so turning reduced motion on mid-intro removes the doors rather than freezing them over the page. The timeline of spec §5.5 is in CSS keyframes, the path delays come from `--i` set per path, and the last keyframe sets `visibility: hidden`.
  - **`CompanySection`** (extract §4.10): the triad uses the scoped selector, so it really renders at `clamp(28px, 2.4vw, 38px)`. Mark the reveals with `data-split` and `data-fade`, the seam with `data-draw`, and call `useReveals`.
  - **`EuPosterSection`** (spec §6.13): the poster `<img>` imports `src/assets/home/optimized/eu-poster.webp` (800×1132, `loading="lazy"`).
  - **The data provider.** Move `ApartmentProvider` out of `root.jsx` into `src/routes/golden-residence-block.jsx`. Then delete the legacy-only modules under Files.

- [ ] **Step 5: Smoke.** In `scripts/smoke/smoke.mjs`:
  - **H1 count.** A path now fails when its JS-off HTML has anything other than exactly one `<h1`.
  - **`FOCUS_RING`** becomes a list:
    - `{ path: '/', stops: [{ text: 'За проекта', ring: 'rgb(239, 233, 221)' }, { text: 'Запитване', ring: 'rgb(239, 233, 221)' }, { text: 'Golden Residence', prefix: true, pseudo: '::after', ring: 'rgb(239, 233, 221)' }] }`;
    - `{ path: '/contact', stops: [{ text: 'Изпрати съобщение', ring: 'rgb(14, 13, 11)' }] }`: the Contact form's button reads „Изпрати съобщение“ (`Contact.jsx:438`), and `focusRing` compares the whole text.
  - `focusRing` learns two fields. `prefix` matches a stop whose text starts with `text`, because the GR half's text carries a live count. `pseudo` reads the ring from `getComputedStyle(element, pseudo)`, because the hero halves draw their ring on an inset overlay (spec §11).
  - **Phone hero.** At 390×664, 375×667, 360×640 and 320×560 on `/`, the box of the `h1` and the box of `.half--gr .half__info` must not overlap (spec §6.7).

- [ ] **Step 6: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist`. Expected: `/` OK ≤ 160 KiB.
  - Then `npm run smoke`. Expected: PASS.
  - Screenshots at 1440×900 and 390×844 against the concept, and at 390×664, 375×667 and 360×640 (real phone screens under the EU row).
  - In a fresh profile, capture the intro at 0.3 s, 1.0 s and 1.6 s. Then open `/eu-proekt` from the footer and come back through the menu's „Начало“, and once more with Back: the intro never plays again. Hover the GR half, then the MN half: the seam and the headline travel together, and the shade drops.
  - With reduced motion on: no intro, and halves at 50/50.

- [ ] **Step 7: Commit.** `feat(home): the Diptych opening with slogan A, the company section and the EU poster`.

**Preview** (the orchestrator's line to the user with the push): "Home: the new opening with the slogan, the company section and the EU poster. Services, works, the inquiry and the floor-by-floor teaser come next; Golden Residence is still the legacy page."

### Task 4: Home II: services, works and the closing inquiry

**Files:**
- Create:
  - `src/pages/home/ServicesSection.jsx`, `src/pages/home/WorksSection.jsx`;
  - `src/components/inquiry/InquirySection.jsx`, `InquiryForm.jsx`, `inquiryStore.js`, `inquiry.css`;
  - `src/services/inquiry.js`.
- Modify:
  - `src/pages/Home.jsx` (sections; `handle.inquiry = true`);
  - `src/pages/home/SplitHero.jsx` (the MN half opens the inquiry);
  - `src/pages/home/home.css`;
  - `src/utils/lenis.js` (`scrollLocked`);
  - `scripts/images/sources.json` and the generated `src/data/images/home.json` and `public/img/`.
- Test:
  - `src/services/inquiry.test.js`;
  - `src/components/inquiry/InquiryForm.test.jsx`, `src/components/inquiry/inquiryStore.test.js`;
  - `src/pages/home/services.test.jsx`, `src/pages/home/works.test.jsx`;
  - `src/pages/home/home.test.jsx` (section order, MN half), `src/pages/home/home.css.test.js` (the services' rules).

**Interfaces:**
- Consumes:
  - from Task 1: `useReveals`, `Seam`, `scrollToId`, `useMotionNow`;
  - from Task 0: `Button`;
  - from M1: `ResponsivePicture`, `IS_PRODUCTION_BUILD` (Vite `define`).
- Produces:
  - `buildLead(fields: { name, email, phone, subject, picks: string[], message }, { production: boolean }) → { odoo: { name, email, phone, projectType, budget, message }, emailParams: { from_name, from_email, reply_to, phone, project_type, budget, message, to_email } }`.
  - `sendInquiry(fields): Promise<{ ok: boolean }>`, with `production = IS_PRODUCTION_BUILD`.
  - `INQUIRY_OPTIONS`, from `inquiryStore.js`:

    | Page | value | label | subject |
    |---|---|---|---|
    | `home` | `golden-residence` | „Golden Residence, жк Левски Г“ | „Golden Residence“ |
    | `home` | `mnogofamilna` | „Многофамилна сграда, ж.к. Връбница-1“ | the same |
    | `home` | `build` | „Строителство или ремонт“ | the same |
    | `home` | `other` | „Друго“ | „Друго“ |
    | `golden-residence` | `golden-residence` | „Апартамент в Golden Residence“ | „Golden Residence“ |
    | `golden-residence` | `garage` | „Гараж или паркомясто в Golden Residence“ | „Golden Residence, гараж или паркомясто“ |
    | `golden-residence` | `mnogofamilna` | as Home | as Home |
    | `golden-residence` | `other` | as Home | as Home |

  - `presetInquiry({ option?: string, pick?: string }): void`. It merges into the store. Then, in the first animation frame in which no scroll lock is held (`scrollLocked()`; it gives up after 500 ms of waiting), it calls `scrollToId('zapitvane', { reveal: 'f-name' })`, and 1500 ms later it focuses `#f-name` with `{ preventScroll: true }`.
    - Waiting for the locks matters: Lenis 1.3.27 ignores `scrollTo` while a lock has stopped it (`node_modules/lenis/dist/lenis.mjs:759`), and a dialog closed by the same click releases its lock only in the effects of the commit that closes it.
    - `preventScroll` keeps the late focus from jumping the page natively when the glide has not arrived.
  - `scrollLocked(): boolean`, from `src/utils/lenis.js`: whether any scroll lock (`acquireScrollLock`) is held.
  - `removePick(id: string): void`, `resetInquiry(): void`, `useInquiryState(): { option: string | null, picks: string[] }`.
  - `<InquirySection page="home" | "golden-residence" />`, rendering `section#kontakti` with the left half `#zapitvane`.
  - Section ids `uslugi`, `obekti`, `kontakti`. The final Home order is `proekti`, `za-nas`, `uslugi`, `obekti`, `kontakti`, `es-proekt`; Task 6 inserts `etazhi` before `kontakti`.

- [ ] **Step 1: Write the failing tests.**

```js
// src/services/inquiry.test.js
const fields = { name: ' Иван Петров ', email: 'ivan@example.bg', phone: '+359 888 123 456', subject: 'Golden Residence', picks: ['А 301', 'А 302'], message: '' }
it('subjects a production lead with the option and the picks', () => {
  const { odoo } = buildLead(fields, { production: true })
  expect(Object.keys(odoo).sort()).toEqual(['budget', 'email', 'message', 'name', 'phone', 'projectType'])
  expect(odoo).toEqual({ name: 'Иван Петров', email: 'ivan@example.bg', phone: '+359 888 123 456',
    projectType: 'Golden Residence – А 301, А 302', budget: '', message: 'Запитване за: Golden Residence – А 301, А 302' })
})
it('tags every other build [ТЕСТ], in Odoo and in the email', () => {
  const { odoo, emailParams } = buildLead(fields, { production: false })
  expect(odoo.projectType).toBe('[ТЕСТ] Golden Residence – А 301, А 302')
  expect(emailParams.project_type).toBe('[ТЕСТ] Golden Residence – А 301, А 302')
})
it('keeps a message of 10 characters or more, trimmed', () =>
  expect(buildLead({ ...fields, message: '  Кога е готова сградата?  ' }, { production: true }).odoo.message).toBe('Кога е готова сградата?'))
it('adds the subject to a message under 10 characters', () =>
  expect(buildLead({ ...fields, picks: [], message: 'Здравейте' }, { production: true }).odoo.message).toBe('Здравейте\nЗапитване за: Golden Residence'))
it('fills the EmailJS template', () => expect(buildLead(fields, { production: true }).emailParams).toEqual({
  from_name: 'Иван Петров', from_email: 'ivan@example.bg', reply_to: 'ivan@example.bg', phone: '+359 888 123 456',
  project_type: 'Golden Residence – А 301, А 302', budget: 'Не е посочен',
  message: 'Запитване за: Golden Residence – А 301, А 302', to_email: 'ksm_str@abv.bg' }))
// sendInquiry, with @emailjs/browser mocked and fetch stubbed:
// - one POST to '/api/odoo-lead' whose JSON body equals odoo;
// - emailjs.send('service_qdte1vp', 'template_zsun0cc', emailParams, 'iDCcC1JI_k69MIid0');
// - CRM 502 or a thrown fetch: { ok: true } and console.error called;
// - EmailJS rejects: { ok: false }.
```

  - `InquiryForm.test.jsx`:
    - **Fields:** labelled „Име“, „Телефон“, „Имейл“, „Интересувам се от“, „Съобщение“, the consent checkbox, and the button „Изпратете запитване“.
    - **Empty submit:** sends nothing; shows „Въведете име.“, „Въведете телефон, поне 6 цифри.“, „Въведете имейл, например ime@primer.bg.“ and „Отбележете съгласието, за да изпратим запитването.“; focuses „Име“; sets `aria-invalid="true"`.
    - **Email checks:** `ivan@пример.бг` shows „Въведете имейл с латински букви, например ime@primer.bg.“; `ivan@` shows the plain email error.
    - **Trimmed name:** „ И“ shows „Въведете име.“ and sends nothing: the rule counts the name's characters after trimming, since `buildLead` sends the trimmed name and the proxy drops a one-letter one without a trace.
    - **A valid form** calls `sendInquiry` once with `{ name, email, phone, subject, picks, message }`.
    - **Success** shows „Благодарим ви.“ in `role="status"`, and it takes focus. **Failure** shows „Запитването не беше изпратено. Опитайте отново или се обадете на +359 887 886 166.“.
    - **Picks:** after `presetInquiry({ pick: 'А 301' })` the chip „Апартамент А 301“ shows; its button „Махнете А 301“ removes it.
    - **Option preset:** after `presetInquiry({ option: 'mnogofamilna' })` the select's value is `mnogofamilna`.
  - `inquiryStore.test.js`:
    - picks never repeat, and `removePick` drops one;
    - `resetInquiry` clears the store;
    - **the glide waits for the scroll locks.** The setup: the real `scrollToId`; `<div id="zapitvane"><input id="f-name"></div>` on the page; fake timers including `requestAnimationFrame`; a fake Lenis (`setLenis`) whose `scrollTo` does nothing while it is stopped. With a lock held (`acquireScrollLock()`), `presetInquiry({ pick: 'А 301' })` scrolls nothing over several frames. After `releaseScrollLock()`, the next frame calls `scrollTo` once, with Lenis running. 1500 ms later `#f-name` has focus, and `focus` was called with `{ preventScroll: true }`.
  - `services.test.jsx`:
    - the h2 reads „Строим, ремонтираме, завършваме.“ with `em` „завършваме“;
    - the lead reads „Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти.“;
    - three `article`s, each named by its h3, carry exactly these titles and texts:
      - „Жилищно строителство“ / „Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт.“;
      - „Ремонти и реновация“ / „Цялостни ремонти и модернизация на съществуващи сгради.“;
      - „Комерсиално строителство“ / „Офисни сгради, складове и индустриални обекти.“;
    - the numerals „01“, „02“ and „03“ are `aria-hidden`.
  - `works.test.jsx`:
    - six buttons in this order, each named by the work and its line (extract §7.2, Works rows):
      - „Green Life – Paradise Gardens and Town House“ / „гр. Созопол · жилищен комплекс · 2018“;
      - „Айвазовски Парк“ / „гр. Поморие · жилищен комплекс“;
      - „Панорама Резидънс“ / „гр. Созопол · жилищен комплекс“;
      - „Сънни Хил блок 9“ / „кв. Меден Рудник, гр. Бургас · жилищна сграда“;
      - „Хотел Парадайс“ / „с. Огняново · хотелски комплекс“;
      - „Читалище „Асен Златаров-1924““ / „с. Огняново, община Гърмен · обществена сграда“;
    - the first has `aria-current="true"`;
    - clicking the third moves `aria-current` to it, and the caption becomes „Панорама Резидънс, гр. Созопол“ (each caption is „{name}, {place}“);
    - the tag „груб строеж“ is present.
  - `home.test.jsx`:
    - the section order is as in the interface;
    - the MN half now has `href="#zapitvane"`; clicking it prevents the default jump, sets the form's option to `mnogofamilna`, and leaves the router's location unchanged;
    - the header's „Запитване“ goes to `#zapitvane`, and a click on it leaves the router's location unchanged (`glideToHash`).
  - `home.css.test.js`: the services' `flex-grow` rules (the columns at `.78`, the chosen one at `1.7`) sit inside `@media (hover: hover) and (pointer: fine) and (min-width: 901px)`.

- [ ] **Step 2: Run them.** Run `npx vitest run src/services src/components/inquiry src/pages/home`. Expected: FAIL.

- [ ] **Step 3: Images.** Register these in `sources.json` (group `home`) and run `npm run images`:
  - `svc-residential` from `c2-diptych/img/res-photo4-1600.webp`, widths [900, 1600];
  - `svc-renovation` from `works-chitalishte-1200.webp`, widths [700, 1200];
  - `svc-commercial` from `works-paradise-960.webp`, widths [960];
  - six work covers, `work-green-life`, `work-aivazovski`, `work-panorama`, `work-sunny-hill`, `work-hotel-paradise` and `work-chitalishte`.
    - Each source is the cover `src/pages/Blog.jsx` shows for that project, `project.images[0]` (`Blog.jsx:653`) under `src/assets/projects/`. Where that photo is portrait or soft (Сънни Хил's is 720 × 960), take the sharpest landscape photo in the project's `images[]`.
    - The sources are only 720–960 px wide, so the widths are [700, 960], capped by the pipeline at the source width.

- [ ] **Step 4: Build.**
  - **`ServicesSection`:** match `index.html:159-184` against `shots/c2v2-services-hover-1440.png`. Port `diptych.css:337-370`, `:777-786` and `:915-922` with the values of spec §6.9. The row height uses `--screen-h`. The entrance is from `home.js:211-217`, through `useMotion`.
  - **`WorksSection`:** match `index.html:187-205`; port `diptych.css:372-393` and `:787-790`. The media is sticky at `height: var(--screen-h)`. The change of work follows extract §4.12, with GSAP via `useMotionNow()` and an instant swap without motion.
  - **`InquirySection` and `InquiryForm`:** port `diptych.css:232-253` and `:405-412`, with `hair-ctl` for the field underlines and spec §10's fields, rows and copy. The validation uses the proxy's email regex. With motion, the success state rises (spec §5.7).
  - **`sendInquiry`:** `Promise.allSettled` of EmailJS (lazy `import('@emailjs/browser')`) and `fetch('/api/odoo-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })`. Only EmailJS decides `ok`.
  - **The validation** checks the name after trimming (spec §10).
  - **The MN half** (`SplitHero`): its click prevents the default jump and calls `presetInquiry({ option: 'mnogofamilna' })`, which glides (spec §5.3).
  - **`scrollLocked`** in `src/utils/lenis.js` returns `locks > 0`.

- [ ] **Step 5: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist` (`/` ≤ 160 KiB), then `npm run smoke`.
  - Screenshots: services at rest and hovered at 1440; stacked at 390; works with the third work chosen; the form in error and in success, with `sendInquiry` stubbed in the dev build.
  - At 1440, check that the work covers do not look soft in the sticky panel (about 720 × 750 CSS px). Where one does, take a sharper photo from that project's `images[]`.

- [ ] **Step 6: Commit.** `feat(home): services, completed works and the inquiry wired to the lead proxy`.

**Preview:** "Home: everything but the floor-by-floor teaser, which comes with the explorer: opening, company, services, works, the inquiry and the EU poster. Golden Residence is still the legacy page."

### Task 5: The Golden Residence page

**Files:**
- Create:
  - `src/routes/golden-residence.jsx`;
  - `src/pages/golden-residence/GrHero.jsx`, `StorySection.jsx`, `BlocksSection.jsx`, `GallerySection.jsx`, `ParkingSection.jsx`, `gr.css`.
- Modify:
  - `src/routes.js` (`projects/golden-residence` → `routes/golden-residence.jsx`);
  - `src/data/availability/select.js` (`spotUnits`, `blockFree`);
  - `src/pages/home/SplitHero.jsx` (the hero move);
  - `scripts/images/sources.json` and the generated files;
  - `scripts/check-dist.mjs` (`MUST_BE_V2` gains `/projects/golden-residence`);
  - `src/pages/legacy.prerender.test.jsx`, `src/pages/legacy.focus.test.jsx` (drop the GR selection page).
- Delete: `src/components/GoldenResidenceBlockSelection.jsx`, once grep shows no importer.
- Test:
  - `src/pages/golden-residence/gr.test.jsx`, `gr.prerender.test.jsx`, `gr.css.test.js`;
  - `src/pages/home/heroMove.test.jsx`;
  - `src/data/availability/select.test.js`.

**Interfaces:**
- Consumes:
  - from Tasks 0–4: everything they produce, `InquirySection page="golden-residence"` included;
  - from Task 1: `cutNextTransition()`;
  - `GR_FACTS`.
- Produces:
  - The route module: `handle = { header: 'overlay', project: 'golden-residence', inquiry: true }`; `links = () => [availabilityPreload, ...DISPLAY_FONT_PRELOADS]`; `meta` as M1's GR meta.
  - Section ids `top`, `sgradata`, `blokove`, `galeriya`, `garazhi`, `kontakti`.
  - `spotUnits(data, slot: 'garages' | 'parking'): Array<{ id, label, totalArea, type, status, statusText }>`.
  - `blockFree(units, block: 'А' | 'Б'): number`.
  - `BlocksSection` renders the two halves `#blk-a` and `#blk-b`, each holding: the name, the sub-line, the free count and the action „Изберете апартамент в блок А“ → `/projects/golden-residence/block-a`. Task 8 adds the grids and stats.

- [ ] **Step 1: Write the failing tests.** `gr.test.jsx` (`goOffline(); renderSiteAt('/projects/golden-residence')`):
  - **Hero:** one H1 whose text is „Golden Residence“, with `em` „Residence“; the address „ул. Ген. Климент Бояджиев, жк Левски Г, София“; „192“ and „апартамента в 2 блока“; a number and „свободни в момента“.
    - Actions: the link „Изберете апартамент“ goes to `#blokove` (Task 6 makes it `#explorer`) and „Запитване“ to `#zapitvane`.
  - **Story:** the h2s „Модерен дом в жк Левски Г“, „Бронзови рамки“, „Продължение на дневната“ and „Озеленен двор“, in order.
    - „500 м“ with „до метростанция“; „Отвори в Google Maps“ → `mapsUrl('ул. Ген. Климент Бояджиев, жк Левски Г, София')`.
    - The figures 2, 8, 192 and 12, with „от 43,98 до 114,58 м²“; the index „01 / 04“.
    - The link „113 гаража и 68 паркоместа“ → `#garazhi`; a click on it calls `scrollToId('garazhi')` and leaves the router's location unchanged (`glideToHash`).
    - No text contains „Диана“.
  - **Blocks:** „Блок А“ and „Блок Б“ (the routes contract regexes match `mainText()`); „96 апартамента · 8 етажа · 12 на етаж“ twice; both block actions with their hrefs.
  - **Gallery:** the counter „01 / 03“. „Следващи“ moves it to „02 / 03“ and the caption to „Двата блока откъм двора и паркинга: по осем жилищни етажа, по 12 апартамента на етаж.“. ArrowLeft inside the section moves it back.
  - **Parking:** „Гаражи“ and „Паркоместа“, each with „свободни от 113“ / „свободни от 68“. The `summary` reads „Свободните гаражи (N)“. „Запитване за гараж“ presets `garage`.
  - **Inquiry:** the h2 „Запитване за Golden Residence“ and the lead „Запитванията за Golden Residence приема КСМ Строй. Обадете се или изпратете запитване и ще се свържем с вас.“. The options are the `golden-residence` set.
  - `gr.prerender.test.jsx`: one H1; the free count `—`; no inline hidden state in `#top`; hydration with no recoverable error.
  - `gr.css.test.js`: every rule in `gr.css` that declares `animation` starts with `:root.js` and sits inside `@media (prefers-reduced-motion: no-preference)`; outside `@keyframes` and outside that media query, no rule for the GR hero declares `opacity: 0`, `visibility: hidden`, a `translateY(…)` or a `scale…(…)`.
  - `heroMove.test.jsx` (Home, with `mockMatchMedia({ fine: true })`, a 1440 px window and scrollY 0):
    - clicking the GR half adds `data-moving` and sets `--s: 1` on `section.hero`. After 800 ms (fake timers), `<html>` has `vt-cut`, the location is `/projects/golden-residence`, and `document.querySelector('main#main > div').dataset.arrive` is `'hero'` (Task 1's contract). `history.state` holds no `usr` here, because `renderSiteAt` copies URLs with `history.pushState(null, …)`;
    - with no fine pointer, the click is a plain link navigation without `vt-cut`;
    - **`the hero move is cancelled by unmount`**: navigate away before 800 ms, and no second navigation follows.
  - `select.test.js`: `spotUnits` maps `{ number: 'Г-001', type: 'Гараж', area: { total: '34,01' }, status: 'Продадени' }` to `{ id: 'Г001', label: 'Г-001', totalArea: 34.01, type: 'Гараж', status: 'sold', statusText: 'Продадени' }`; `blockFree` counts `available` in one block.

- [ ] **Step 2: Run them.** Run `npx vitest run src/pages/golden-residence src/pages/home/heroMove.test.jsx src/data/availability`. Expected: FAIL.

- [ ] **Step 3: Images.** Register these in `sources.json` (group `golden-residence`) and run `npm run images`:
  - `gr-entrance` (from `gr-entrance-1920.webp`; [1000, 1920]);
  - `gr-balconies` ([800, 1300]), `gr-terrace` ([900, 1600]), `gr-garden` ([900, 1600]);
  - `gr-corner` ([900, 1600]), `gr-facade-detail` ([640]), `gr-endtowers` ([900, 1600]), `gr-parking` ([900, 1600]);
  - `gr-longfacade` ([1024]).

  All come from `C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/img/`. The spreads reuse `gr-dusk`.

- [ ] **Step 4: Build.** Match `golden-residence.html:61-229` against `shots/c2-gr-390-tap.png` and the concept page.
  - **`GrHero`** (port `diptych.css:417-430` and `:799-807`):
    - height `max(640px, var(--screen-h))`; `gr-dusk` with `priority`, `object-position: 50% 62%` (`68% 62%` on phones);
    - the entrance table of spec §5.5 under `:root.js`, with `[data-arrive="hero"]` skipping the image settle and using the hero-move starts.
  - **`StorySection`** (port `:432-451`, `:808-814` and `:906-914`): a sticky frame `height: var(--screen-h)`; block heights per spec §6.15; the wipes from `gr.js:41-64` through `useMotion`, with ScrollTriggers and no pin; inline figures on phones and under reduced motion. Its „113 гаража и 68 паркоместа“ link glides through `glideToHash`.
  - **`BlocksSection`:** the hinge and the halves of the interface (port `:653-676` and `:834-839`; the grids come in Task 8).
  - **`GallerySection`:** port `:678-691`, `:840-844` and `gr.js:229-269`, with the spreads and object-positions of extract §4.28. The stage is `role="group"` with `aria-roledescription="галерия"`.
  - **`ParkingSection`:** port `:693-715`, `:845-848` and `gr.js:212-227`. The cells are `aria-hidden`; the live counts come from `spotUnits`. „Запитване за гараж“ and „Запитване за паркомясто“ prevent the default jump and call `presetInquiry({ option: 'garage' })`.
  - **The route module** composes the sections in spec §8.2's order (without `#explorer` until Task 6) and ends with `<InquirySection page="golden-residence" />`.
  - **The hero move in `SplitHero`** (spec §6.7):
    - a click handler that runs only with a fine pointer, at ≥ 901 px, under `:root.js`, with `scrollY ≤ 8` and no modifier key;
    - a `setTimeout(800)` cleared on unmount;
    - then `cutNextTransition()` and `navigate('/projects/golden-residence', { state: { arrive: 'hero' } })`.

- [ ] **Step 5: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist`. Expected: `/projects/golden-residence` OK ≤ 160 KiB.
  - Then `npm run smoke`.
  - Screenshots of every section at 1440 and 390.
  - Record the hero move from Home in Chrome: the half grows to full screen and lands as the GR hero without a jump. Its title rises; the image does not settle again.

- [ ] **Step 6: Commit.** `feat(golden-residence): the Diptych page with the hero, story, gallery, parking and inquiry`.

**Preview:** "Golden Residence: the new page with the hero, the story, the blocks, the gallery, parking and the inquiry, and the move from Home's half into it. The explorer comes next; the block pages are still legacy."

### Task 6: Explorer I: model, status vocabulary, facade, edge panel and phone sheet

**Files:**
- Create:
  - `src/explorer/model.js`, `geometry.js`, `PlanSvg.jsx`, `Facade.jsx`, `FloorPanel.jsx`, `FloorSheet.jsx`, `ExplorerSection.jsx`, `explorer.css`;
  - `src/explorer/testing.js` (test helper: the snapshot CSVs from `scripts/smoke/fixtures/sheets/`, read through `sheetsCore.apartmentRows` into API data);
  - `src/components/ui/StatusSwatch.jsx`, `src/components/ui/StatusCount.jsx`;
  - `src/pages/home/TeaserSection.jsx`.
- Modify:
  - `src/components/ui/StatusChip.jsx`, `src/components/ui/StatusLegend.jsx`;
  - `src/routes/golden-residence.jsx` (insert `ExplorerSection`; the hero action becomes `#explorer`);
  - `src/pages/Home.jsx` (insert `TeaserSection` before `kontakti`);
  - `scripts/images/sources.json` and the generated files.
- Test:
  - `src/explorer/model.test.js`, `geometry.test.js`, `PlanSvg.test.jsx`, `Facade.test.jsx`, `ExplorerSection.test.jsx`, `explorer.css.test.js`;
  - `src/components/ui/{StatusSwatch,StatusCount,StatusChip,StatusLegend}.test.jsx`;
  - `src/pages/home/teaser.test.jsx`;
  - `src/styles/tokens.test.js` (the zero count's colour).

**Interfaces:**
- Consumes:
  - from Task 2: `apartmentUnits`;
  - from M1: `summarizeFloor`, `unitButtonLabel`, `formatArea`, `plural`, `STATUS_LABEL`, and the maps `src/data/maps/golden-residence.{building,floors}.json`, imported directly (never through `src/config/projects.js`);
  - from Task 1: `useMotionNow`, `useMotion`.
- Produces:

```js
// src/explorer/model.js
export function floorKey(block, floor) // → 'А-5'
export function buildModel(data) // → Model | null (null while there is no data)
// Model = {
//   units: Unit[],
//   floors: Map<FloorKey, { block, floor, units: Unit[], counts: { available, reserved, sold, blocked, total },
//                           colour: 'available' | 'reserved' | 'sold' | 'unknown', minFree: number | null, maxFree: number | null }>,
//   blocks: { 'А': { counts, types: Record<string, number>, exposure: Record<string, number> }, 'Б': {...} },
//   totals: { available, reserved, sold, blocked, total },
// }
export function rangeLine(floorStats) // → { kind: 'range', min, max } | { kind: 'single', area, one: boolean } | { kind: 'reserved' } | { kind: 'soldout' }
```

```js
// src/explorer/geometry.js
export const FACADE = { width: 1200, height: 599, seamX: 605,
  vbFull: { x: 0, y: 112, w: 1200, h: 454 },
  vbPhone: { 'А': { x: 0, y: 132, w: 628, h: 388 }, 'Б': { x: 572, y: 132, w: 628, h: 388 } },
  railX: { 'А': 71, 'Б': 1129 } }
export function bbox(points) // → { x, y, w, h }
export function floorShapes(buildingMap) // → Array<{ block, floor, key, d, bbox }>, 16 entries
export function planFor(floorsMap, block) // → the floors.json entry whose appliesTo.blocks includes the block
export function planBox(plan, pad) // → union bbox of its 12 polygons plus pad
export function labelPoint(polygon) // → [x, y], grid search with step max(2, min(w, h) / 26)
export function cropFor(box, aspect) // → { x, y, w, h }, margin max(w, h) * 0.42 + 30, matched to aspect, centred
```

  - `<StatusSwatch status />` (16 × 16, the pattern and glyph of spec §7.9, `aria-hidden`).
  - `<StatusChip status text? />` (swatch and label; `unknown` shows `text`, else „Няма информация“).
  - `<StatusCount status count />` (swatch and „**n** word“, singular for 1).
  - `<StatusLegend statuses? />` (labels only, in order).
  - `<PlanSvg plan units mode="mini" | "stage" | "crop" drawing? interactive? hot? focus? viewBox? label? onUnit? onHot? />`. In this task only `mini` is used; Task 7 adds the other two.
  - `<Facade model mode="full" | "compact" initialBlock="А" | "Б" onOpenFloor={(block, floor, unitId?) => void} />`.
  - `<FloorPanel side floor plan onOpenFloor onUnit onPointerEnter onPointerLeave />` and `<FloorSheet floor plan onClose onStep onOpen onUnit />`.
  - `<ExplorerSection headingLevel={2} initialBlock="А" />`, rendering `section#explorer`.
  - `<TeaserSection />`, rendering `section#etazhi`.
  - **Opening a floor, for now:** on the GR page, `onOpenFloor` navigates to `/projects/golden-residence/block-a?floor=5` (block-b for Б). The teaser goes to `/projects/golden-residence?floor=А-5#explorer`. Task 7 makes the GR page open the stage in place.

- [ ] **Step 1: Write the failing tests.**

```js
// src/explorer/model.test.js: snapshot from src/explorer/testing.js
it('counts the snapshot', () => {
  const m = buildModel(snapshotData())
  expect(m.totals).toEqual({ available: 69, reserved: 8, sold: 115, blocked: 0, total: 192 })
  expect(m.floors.get('А-5')).toMatchObject({ counts: { available: 4, reserved: 2, sold: 6, blocked: 0, total: 12 }, colour: 'available', minFree: 63.51, maxFree: 108.56 })
  expect(m.floors.get('Б-6')).toMatchObject({ colour: 'sold', minFree: null, maxFree: null })
  expect(m.blocks['А'].types).toEqual({ '2-стаен': 56, '3-стаен': 32, 'Ателие': 8 })
  expect(m.blocks['Б'].exposure).toMatchObject({ 'Юг': 24, 'Запад': 24, 'Изток': 16, 'Север': 8 })
})
it('counts an unknown status in the total only', ...) // one 'Скоро' unit: total +1, no other count moves
it('is null without data', () => expect(buildModel(null)).toBeNull())
it('describes the free range', () => {
  expect(rangeLine(m.floors.get('А-5'))).toEqual({ kind: 'range', min: 63.51, max: 108.56 })
  expect(rangeLine(m.floors.get('Б-6'))).toEqual({ kind: 'soldout' })
})
```

  - `geometry.test.js`:
    - `floorShapes` gives 16 entries, and `А-1`'s bbox is `{ x: 145, y: 430, w: 460, h: 27 }`;
    - every `labelPoint` lies inside its polygon (point-in-polygon);
    - `cropFor({ x: 0, y: 0, w: 100, h: 50 }, 1)` is square and centred on the box;
    - `planFor(floors, 'Б').imageHeight === 847`.
  - Status tests:
    - `StatusSwatch` renders one `svg` path per glyph (the ✓ path `M1.6 5.3l2.2 2.2 4.6-4.9` for `available`) and `data-status`;
    - `StatusCount` with count 1 shows „1 свободен“, with 2 „2 свободни“, and with 1 for `blocked` „1 блокиран“;
    - `StatusChip status="unknown" text="Скоро"` shows „Скоро“;
    - `StatusLegend` text is exactly „Свободен Резервиран Продаден Блокиран“, whitespace collapsed.
  - `PlanSvg.test.jsx` (mini; the А plan; the floor's units from the snapshot):
    - 12 `g[data-suffix]`, each carrying `data-status`;
    - a blocked unit has `path.u-blocked` shown;
    - a suffix missing from the sheet gets `data-status="none"` and an empty label;
    - two instances on one page get different pattern ids.
  - `Facade.test.jsx`, with a model from the snapshot and `mockMatchMedia({ fine: true })`:
    - **Rails:** 16 rail buttons, named for example „Блок А, етаж 5: 4 свободни, 2 резервирани, 6 продадени, 0 блокирани. Enter отваря плана.“. Each holds an element whose own text is exactly „етаж 5“.
    - **Hover:** pointerover with `pointerType: 'mouse'` on rail А-5 shows panel А with „Блок А · Етаж 5“, „4 свободни“ and „свободни от 63,51 до 108,56 м²“.
    - **Sold out:** rail Б-6 shows „Разпродаден етаж“.
    - **Keys:** focusing rail А-5 shows the panel. ArrowUp focuses А-6; ArrowRight focuses Б-6; Escape hides the panel; Enter calls `onOpenFloor('Б', 6)`.
    - **Touch:** `a touch tap at desktop width previews first`: a pointerdown with `pointerType: 'touch'` and a click on a floor shows it without `onOpenFloor`; a second tap calls it.
    - **Compact mode:** the caption shows „Блок А · етаж 5“ with the chips; a click calls `onOpenFloor`.
  - `ExplorerSection.test.jsx` (`useAvailability` mocked with snapshot data):
    - the h2 reads „Изберете апартамент“;
    - the lead reads „Свободните апартаменти в момента, по данни от таблиците на КСМ Строй: 69 от 192.“;
    - the legend shows „69 свободни“, „8 резервирани“, „115 продадени“ and „0 блокирани“;
    - **`ExplorerSection shows the notice when a slot is built-in`**: with `origin['golden-residence']['block-a'] === 'built-in'`, the text „Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.“ is present; with every slot `live`, it is absent;
    - with the status `loading`, every count is `—`.
  - `teaser.test.jsx`: the h2 „Golden Residence, етаж по етаж“; the ways links „Визуално“ → `/projects/golden-residence#explorer` and „По критерии“ → `/projects/golden-residence?view=list#explorer`; the facade in compact mode. With a Golden Residence slot `built-in`, the notice of spec §9 is present; with every slot `live`, it is absent.
  - `explorer.css.test.js` (reads `src/explorer/explorer.css`):
    - both `--sw` formulas start `max(860px,`, and `--pitch: calc(var(--sw) * 33.5 / 1200)` is there;
    - the rail rows are `min(30px, var(--pitch))` tall, and the desktop count is `clamp(24px, calc(var(--pitch) * .93), 28px)`;
    - the rule that declares `container-type` is not the one that declares `--sw`;
    - the zero count is `rgba(155, 148, 136, .65)`.
  - `src/styles/tokens.test.js`: `contrast(blend('rgba(155, 148, 136, 0.65)', onyx), onyx)` is at least 3. The count is always at least 24 px, so this large-text floor applies.

- [ ] **Step 2: Run them.** Run `npx vitest run src/explorer src/components/ui src/pages/home/teaser.test.jsx src/styles/tokens.test.js`. Expected: FAIL.

- [ ] **Step 3: Images.** Register these (group `golden-residence`) and run `npm run images`:
  - `facade-cut` from `c2-diptych/img/facade-cut-2400.webp`, widths [1200, 2400];
  - `plan-a` from `plan-a.webp` and `plan-b` from `plan-b.webp`, widths [1200].

- [ ] **Step 4: Model, geometry and status.**
  - `buildModel` uses `apartmentUnits` and `summarizeFloor`.
  - `minFree` and `maxFree` are taken over the `available` units' `totalArea`.
  - Port the status glyphs and swatches from `core.js:23-50` and `diptych.css:255-270`, with spec §7.9's values.

- [ ] **Step 5: `PlanSvg` (mini), `Facade`, `FloorPanel`, `FloorSheet`, `ExplorerSection` and `TeaserSection`.** Match against `shots/c2v2-check-explorer-hover-1440.png` and `c2-gr-390-tap.png`.
  - **Port** `explorer.js:64-201` (plans), `:215-555` (facade), `:284-301` and `:403-440` (panel), `:303-325` and `:442-480` (phone), and `diptych.css:453-543`, `:816-828` and `:869-889`.
  - **Layout** is the CSS formulas of spec §7.2. `container-type: inline-size` sits on a wrapper, and the facade root inside it evaluates `--pw`, `--sw`, `--sh` and `--pitch`: container units never resolve against the element that declares the container, so the root's own height would otherwise use the viewport's width. Phones crop with CSS through `data-block` on the root. The only JS layout work is `PlanSvg`'s `fit()`, which writes `--fs`, `--hs`, `--lw` and `--dash` from a `ResizeObserver`.
  - **The 860 px floor.** Both `--sw` formulas start `max(860px, …)` (spec §7.2), so from 901 px the floors stay at least 24 px apart; the concept's formula gave 15.3 px at 1024 and 24.6 px at 1280. Below 1000 px the rails hide the floor number, as on phones, so the counts stay on screen.
  - **Rails** are buttons with the name and the own-text span of the tests. The marker is a 10 × 10 status glyph.
    - Each row is `min(30px, var(--pitch))` tall, with half that as a negative top margin, so rows never overlap.
    - The count is `clamp(24px, calc(var(--pitch) * .93), 28px)` on desktop and 24 px on phones.
    - A zero count is `rgba(155, 148, 136, .65)`.
  - **The edge panel and the sheet** follow spec §7.3 and §7.5. The sheet sits at `z-index: 45`. The hot floor, the 320 ms close and the first-tap rule follow spec §7.2.
  - **The panel's meta** reads „кота +3,06 · 12 апартамента“ only for floor keys in `GR_FACTS.elevations`, and „12 апартамента“ elsewhere.
  - **GSAP** runs through `useMotionNow()` (spec §5.7). Without it, state changes are instant.
  - **The facade intro** runs through `useMotion` at `top 70%`, and is skipped when the facade is in view at setup.
  - **`ExplorerSection`:** the head (hinge variant; the h2 at `headingLevel`), the lead, the legend counts (`StatusCount`), the notice of spec §9, and `Facade` in `full` mode.
  - **`TeaserSection`:** the hinge, `Facade` in `compact` mode, the notice of spec §9 when a Golden Residence slot is `built-in` or the store reports an error, and the ways nav (port `diptych.css:395-403`). The notice is the explorer's line, so Home never shows the built-in counts without it.

- [ ] **Step 6: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist` (`/` and `/projects/golden-residence` ≤ 160 KiB), then `npm run smoke`.
  - With a real mouse at 1440: hover floors in both blocks; the panel slides in from that block's edge with the plan in status colours.
  - At 390: switch the block, tap once (the sheet opens), tap again (it navigates to the block page).
  - At 1024×768 and 1280×800: the facade is at least 860 px wide, and no two rail rows overlap.
  - Screenshots for the reviewer.

- [ ] **Step 7: Commit.** `feat(explorer): the facade with per-floor counts, the edge panel with the floor's plan, and the phone sheet`.

**Preview:** "The explorer: free counts per floor on the facade, the hover panel with the floor's plan in status colours, and the phone sheet, on Golden Residence and as the Home teaser, so Home is complete. A click still opens the legacy block page."

### Task 7: Explorer II: the plan stage, the unit panel, URL state and the block routes

**Files:**
- Create:
  - `src/explorer/PlanStage.jsx`, `UnitPanel.jsx`, `useExplorerState.js`, `ExplorerContext.jsx`, `floorParam.js`, `BlockPage.jsx`;
  - `src/routes/BlockRoute.jsx` (the match-or-404 helper both block routes share).
- Modify:
  - `src/explorer/{PlanSvg,Facade,FloorPanel,FloorSheet,ExplorerSection}.jsx`, `src/explorer/explorer.css`;
  - `src/routes/golden-residence.jsx` (wraps its sections in `ExplorerProvider`);
  - `src/routes/golden-residence-block.jsx` (renders `BlockPage`), `src/routes/mnogofamilna-block.jsx` (uses `BlockRoute`);
  - `src/pages/home/TeaserSection.jsx` (no change to its URL; check only);
  - `scripts/check-dist.mjs` (`MUST_BE_V2` gains both Golden Residence block routes);
  - `src/pages/legacy.prerender.test.jsx` and `src/pages/legacy.focus.test.jsx`: drop their `ApartmentProvider` wrapper, since no page the app serves gets one any more;
  - `tests/contracts/availability.test.jsx` (one regex, Step 5).
- Delete: `src/components/GoldenResidenceSingleBlock.jsx` and any module only it imports.
  - **Keep** `src/components/GoldenResidenceFloorMap.jsx` and `src/context/ApartmentContext.jsx` (with its test) until M4 replaces `/projects`. `src/pages/Projects.jsx:10` imports the floor map, and the floor map calls `useApartments`. Its branch at line 434 is unreachable (`openModal` sends Golden Residence to its own page, lines 107–110), but deleting either file breaks `npm run build`.
  - Keep everything that `src/pages/Projects.jsx` and the Многофамилна pages import (check with `grep -rn`).
- Test:
  - `src/explorer/floorParam.test.js`, `PlanStage.test.jsx`, `UnitPanel.test.jsx`, `useExplorerState.test.jsx`, `BlockPage.test.jsx`, `BlockPage.prerender.test.jsx`;
  - `src/explorer/ExplorerSection.test.jsx` (now rendered inside `ExplorerProvider`);
  - `tests/contracts/availability.test.jsx`, `tests/contracts/routes.test.jsx` (unchanged; must pass).

**Interfaces:**
- Consumes:
  - from Task 6: `buildModel`, `floorKey`, `PlanSvg`, `Facade`, `FloorPanel`, `FloorSheet`, `ExplorerSection`, `StatusLegend`, `StatusCount`, `StatusChip`, `cropFor`;
  - from Task 4: `presetInquiry`;
  - from M1: `useHydrated`, `useScrollLock`, `matchedBlock(project, matches)`, `unitButtonLabel`, `formatArea`.
- Produces:

```js
// src/explorer/floorParam.js
export function parseFloorParam(value, routeBlock) // → { block: 'А' | 'Б', floor: 1..8 } | null; routeBlock is 'А' | 'Б' | null
export function formatFloorParam({ block, floor }, routeBlock) // → '5' when block === routeBlock, else 'А-5'
// src/explorer/useExplorerState.js
export default function useExplorerState({ routeBlock }) // → {
//   stage: { block, floor } | null, unitId: string | null,
//   openFloor(block, floor, unitId?), closeStage(), setFloor(floor), setBlock(block),
//   openUnit(unitId), closeUnit(), view: 'visual' | 'list', setView(view) }
// It reads ?floor, ?unit and ?view after useHydrated() and writes them with setSearchParams(…, { replace: true, preventScrollReset: true }).
// stage and unitId come from the URL alone, never from separate state, so a dialog closes in the same commit as its URL change.
```

  - **Unit ids.** Everywhere a unit id appears (`?unit`, `onUnit`, `openUnit`, `presetInquiry`), it is the unit's `label` („А 501“). Lookups compare `normalizeUnitId(a) === normalizeUnitId(b)`.
  - `<ExplorerProvider routeBlock={'А' | 'Б' | null}>` (`src/explorer/ExplorerContext.jsx`):
    - it builds the model (`buildModel(useAvailability().data)`) and holds `useExplorerState`;
    - it renders `PlanStage` and `UnitPanel` when they are open.
  - `useExplorer()` gives `{ model, snapshot, ...useExplorerState() }` to any section inside the provider (Task 8's block grids use `openUnit`).
  - `<PlanStage model block floor fromRect={DOMRect | null} onClose onFloor={(floor) => void} onBlock={(block) => void} onUnit={(unitId) => void} />`.
  - `<UnitPanel model unitId onClose onStep={(delta) => void} onInquire={(unit) => void} />`.
  - `<BlockPage block="А" | "Б" />`. It renders `ExplorerProvider routeBlock`, the page head, `ExplorerSection` and `InquirySection page="golden-residence"`.
  - `<BlockRoute project render={(block) => ReactNode} />`, rendering `NotFound` for an unmatched id.
  - `ExplorerSection` reads `useExplorer()` and passes `openFloor` to `Facade`. The model is no longer built inside `ExplorerSection`.

- [ ] **Step 1: Write the failing tests.**

```js
// src/explorer/floorParam.test.js
it.each([
  ['3', 'А', { block: 'А', floor: 3 }], ['Б-5', 'А', { block: 'Б', floor: 5 }], ['B-5', null, { block: 'Б', floor: 5 }],
  ['А-8', null, { block: 'А', floor: 8 }], ['9', 'А', null], ['Б-0', null, null], ['5', null, null], ['', 'А', null], [null, 'А', null],
])('parseFloorParam(%j, %j)', (value, route, expected) => expect(parseFloorParam(value, route)).toEqual(expected))
it('writes bare floors for the route’s own block only', () => {
  expect(formatFloorParam({ block: 'А', floor: 3 }, 'А')).toBe('3')
  expect(formatFloorParam({ block: 'Б', floor: 3 }, 'А')).toBe('Б-3')
  expect(formatFloorParam({ block: 'А', floor: 3 }, null)).toBe('А-3')
})
```

  - `PlanStage.test.jsx` (model from the snapshot; block А, floor 5):
    - a dialog named „Блок А · Етаж 5“, with the meta „12 апартамента · 4 свободни“;
    - on floor 1 the meta reads „кота +3,06 · 12 апартамента · 9 свободни“;
    - 12 table rows in suffix order, the first named from „А 501“;
    - `StatusLegend` text inside;
    - „По-горен етаж“ calls `onFloor(6)`; on floor 1 „По-долен етаж“ is disabled;
    - „Блок Б“ calls `onBlock('Б')`;
    - PageUp calls `onFloor(6)`, except inside the table;
    - Escape and „Към сградата“ call `onClose`;
    - hovering row А 503 marks `g[data-suffix="03"]` with `data-hot`.
  - `UnitPanel.test.jsx`:
    - a sold unit shows „Този апартамент е продаден. Свободните на етажа са оцветени в зелено.“ and no button matching `/запитване/i`;
    - a blocked unit shows „Този апартамент не се предлага в момента.“ and no action;
    - a free unit's „Изпратете запитване“ calls `onInquire` with the unit;
    - reserved and unknown units show „Попитайте за апартамента“, and the unknown unit's chip reads „Скоро“;
    - the facts include „Застроена площ“ with „54,36“ and „м²“, and „Изложение“ „няма данни в таблицата“ for an empty value;
    - previous and next wrap round within the floor;
    - Escape calls `onClose` and does not propagate.
  - `useExplorerState.test.jsx` (through `renderSiteAt`):
    - `/projects/golden-residence/block-a?floor=3` opens the stage on А-3 after hydration;
    - ▲ rewrites the URL to `?floor=4` without adding a history entry;
    - opening А 401 adds `&unit=А+401`;
    - closing removes both;
    - `/projects/golden-residence?floor=Б-2` opens Б-2;
    - `?floor=9` opens nothing and logs no error;
    - **`an unknown unit opens its floor only`**: `?floor=3&unit=А%20999` opens the stage on А-3 with no unit panel;
    - a deep link jumps to `#explorer` (instant, no glide) before the stage opens; closing that stage, which has no opener, focuses rail А-3;
    - „Изпратете запитване“ on a free unit removes `?floor` and `?unit` in one replace, adds the unit to the form's picks, returns focus to no opener, and calls `presetInquiry` (Task 4 pins its glide).
  - `BlockPage.test.jsx`:
    - on `block-a`, the link „Към Golden Residence“ (to `/projects/golden-residence`) comes first, then the H1 „Golden Residence, блок А“, then „96 апартамента · 8 етажа · 12 на етаж“;
    - there is one `main`, and it holds the explorer and `#zapitvane`;
    - `mainText()` matches the routes contract's `/блок\s+[аa](?![а-яёa-z])/i` (on `block-b`, the Б pattern). Without the facts line, the H1 would run into the next text („…блок АИзберете“) and fail it.
  - `BlockPage.prerender.test.jsx`, as `home.prerender.test.jsx` does: prerender `/projects/golden-residence/block-a`, then hydrate that HTML at `?floor=3` and again at `?floor=3&unit=А%20301`, with recoverable errors made fatal and `console.error` spied.
    - No error either time.
    - The prerendered HTML has no `role="dialog"`.
    - After hydration the dialog „Блок А · Етаж 3“ is open, and in the second case the unit panel for „А 301“ too.
  - `tests/contracts/availability.test.jsx` runs unchanged except Step 5's regex, and it must pass.

- [ ] **Step 2: Run them.** Run `npx vitest run src/explorer tests/contracts/availability.test.jsx`. Expected: FAIL.

- [ ] **Step 3: Implement.** Match against `shots/c2v2-check-explorer-open-1440.png`.
  - **Port** `explorer.js:560-694` (stage), `:696-809` (unit panel), `diptych.css:545-623`, `:850-863`, and `gr.js:271-309` (deep links), with spec §7.4, §7.6, §7.7 and §7.10.
  - **`PlanSvg`** gains the `stage` and `crop` modes, the drawing, `hot` and `focus`. The plan area clips its drawing.
  - **The morph** clones the mini plan's SVG at its `fromRect` (z 51) and runs the timeline of spec §5.7. Without motion, or without a `fromRect`, it fades.
  - **Dialogs:** the stage at z 50, the unit panel at z 52. While the unit panel is open the stage gets `inert` and `aria-hidden="true"`. Both use `useScrollLock('#1A1714')`.
  - **Focus:** to „Към сградата“ after 700 ms (30 ms without motion); returned to the opener on close. An inquiry close returns it nowhere, since `presetInquiry` focuses `#f-name`. A close with no opener (a deep link) focuses the hot floor's rail.
  - **`onInquire`:** close both dialogs first, with one URL replace that drops `?floor` and `?unit`, then call `presetInquiry({ option: 'golden-residence', pick: unit.label })`. Its glide waits for the first frame with no scroll lock held (Task 4), which comes after the close commit. So neither the stopped Lenis nor `LenisScrollSync`'s immediate scroll on the URL change can cut it.
  - **Deep links** (spec §7.10): when the URL opens the stage on arrival, jump to `#explorer` first, with no glide (`window.scrollTo`, and `scrollTo(y, { immediate: true, force: true })` when Lenis runs), then open the stage.
  - **`ExplorerProvider`** wraps the GR route's sections, from the hero to the inquiry, and `BlockPage`. It renders the two dialogs once per page.
  - **`Facade`, `FloorPanel` and `FloorSheet`** now call `openFloor(...)` in place, and pass their plan's rect as `fromRect`.
  - **Block routes.** `src/routes/golden-residence-block.jsx` renders `<BlockRoute project="golden-residence" render={(b) => <BlockPage block={b.letter} />} />`, with `handle = { header: 'solid', project: 'golden-residence', inquiry: true }`, `links = () => [availabilityPreload, ...DISPLAY_FONT_PRELOADS]` and M1's `meta`. The Многофамилна block route uses `BlockRoute` too, and stays legacy (`legacy: true`).
  - **`BlockPage`'s head** is the link „Към Golden Residence“, the H1, then „96 апартамента · 8 етажа · 12 на етаж“ (spec §7.11).
  - **Remove** `ApartmentProvider`'s last use in the app, drop it from the two legacy tests, and delete the modules listed under Files. `GoldenResidenceFloorMap` and `ApartmentContext` stay until M4.

- [ ] **Step 4: Run and look.** In Chrome:
  - hover a floor, click its mini plan's unit: the plan grows into the stage and the unit panel opens on that unit;
  - ▲▼ and the block switch;
  - Escape twice;
  - `/projects/golden-residence/block-b?floor=2&unit=Б%20201` opens straight on that unit.

- [ ] **Step 5: Update the one contract regex.** In `tests/contracts/availability.test.jsx`, replace `/(?<!\d)1\s*Блокирани|Блокирани:?\s*1(?!\d)/` with `/(?<!\d)1\s*блокиран|блокирани:?\s*1(?!\d)/i`.
  - There is no lookahead after „блокиран“. `pageText()` runs the texts of neighbouring elements together, so in correct markup a letter follows it: „1 блокиранСвободен“ (stage counts, then the legend), „1 блокирансвободен: …“ (panel chips, then the range line), „1 блокиранНаличността“ (explorer legend, then the notice). The pattern still rejects „10 блокирани“ and „11 блокирани“.
  - Reason: Diptych counts agree in number („1 блокиран“), so the old pattern, written for M1's „Блокирани: 1“, would need ungrammatical copy. The contract's intent (a blocked unit is counted on its floor) is unchanged.
  - Update the comment above the assertion to say so. No other line of the contract changes.
  - Run `npx vitest run tests/contracts`. Expected: PASS.

- [ ] **Step 6: Run everything.** Run `npm test`, then `npm run build && npm run check:dist`, then `npm run smoke`.
  - **Budget.** Both GR block routes are now enforced as non-legacy, and must be OK ≤ 160 KiB. If check:dist reports `/projects/golden-residence` or a block route over the budget, move `PlanStage`, `UnitPanel` (and in Task 8 `UnitList`) behind `React.lazy` with a `null` fallback. Preload that chunk on the first floor hover or focus (`import()` in the handler), and re-run.
  - The smoke run now needs no network for any Golden Residence page.

- [ ] **Step 7: Commit.** `feat(explorer): the plan stage, the unit panel, deep links and the block pages`.

**Preview:** "The explorer opens in place: the full floor plan, the unit table and the unit panel, with links straight to a floor or a flat. The block pages are now explorer pages. The criteria list and the block grids come next."

### Task 8: Explorer III: Визуално / По критерии, the list and the block grids

**Files:**
- Create: `src/explorer/ViewTabs.jsx`, `src/explorer/UnitList.jsx`, `src/explorer/filterUnits.js`, `src/explorer/BlockGrid.jsx`.
- Modify:
  - `src/explorer/ExplorerSection.jsx` (tabs, list, Flip), `src/explorer/explorer.css`;
  - `src/pages/golden-residence/BlocksSection.jsx` (grids and stats; the Task 5 block actions are removed);
  - `src/utils/availability.js`: delete `matchesFilter` and its tests if `grep -rn` shows no importer after Task 7.
- Test: `src/explorer/filterUnits.test.js`, `ViewTabs.test.jsx`, `UnitList.test.jsx`, `BlockGrid.test.jsx`; `src/pages/golden-residence/gr.test.jsx` (the blocks section); `src/pages/golden-residence/gr.prerender.test.jsx` (`?view=list`).

**Interfaces:**
- Consumes:
  - from Tasks 6–7: `useExplorer()` (`model`, `view`, `setView` and `openUnit`, which opens the unit panel), `StatusChip`;
  - from Task 1: `loadFlip()`, `useMotionNow()`.
- Produces:

```js
// src/explorer/filterUnits.js
export const AREA_RANGES = Object.freeze({ 'do-70': [0, 70], '70-100': [70, 100], 'nad-100': [100, 999] })
export function filterUnits(units, { block, floor, type, area, exposure, status } = {}) // → Unit[]; each field null/undefined = any
//   area matches totalArea >= a0 && totalArea < a1; exposure matches when unit.exposure.toLowerCase().includes(value)
export function sortUnitsBy(units, { key = 'id', dir = 'asc' } = {}) // key: 'id' (block, floor, suffix) | 'floor' | 'total'
```

  - `<ViewTabs value="visual" | "list" onChange />`.
  - `<UnitList model onUnit={(unitId) => void} />`.
  - `<BlockGrid model block onUnit={(unitId) => void} />`.

- [ ] **Step 1: Write the failing tests.**
  - `filterUnits.test.js`, on the snapshot units:
    - no filter gives 192;
    - `{ block: 'Б', status: 'available' }` gives 27;
    - `{ floor: 5 }` gives 24;
    - `{ type: 'Ателие' }` gives 16;
    - `{ area: 'nad-100' }` keeps only `totalArea ≥ 100`;
    - `{ exposure: 'юг' }` keeps „Юг/Изток“ and „Запад/Юг“;
    - `sortUnitsBy(…, { key: 'total', dir: 'desc' })[0].totalArea` is `114.58`;
    - the default order starts `А 101, А 102`.
  - `ViewTabs.test.jsx`:
    - a tablist named „Как да търсите“ with the tabs „Визуално“ and „По критерии“;
    - `aria-selected` and roving tabindex;
    - ArrowRight selects „По критерии“ and calls `onChange('list')`.
  - `UnitList.test.jsx`:
    - **Filters:** the pills Блок (Всички, А, Б), Вид (Всички, 2-стаен, 3-стаен, Ателие) and Статус (Всички, Свободни, Резервирани, Продадени, Блокирани), with `aria-pressed`; the selects Етаж, Площ and Изложение with spec §7.8's options.
    - **Meta:** `aria-live`, reading „192 от 192 · 69 свободни“. After Б and Свободни it reads „27 от 192 · 27 свободни“.
    - **Empty state:** an impossible combination shows „Няма апартаменти с тези условия. Махнете някой филтър.“.
    - **Sorting:** the header „Обща площ“ toggles the order.
    - **Rows:** a row click calls `onUnit` with the unit's id; sold rows carry `data-status="sold"`.
    - **Footnote:** „Продадените остават в списъка. Изложение има само за блок Б, така е в таблицата.“
  - `BlockGrid.test.jsx`:
    - 96 cell buttons per block, the first row floor 8;
    - a cell is named for example „А 501, Продаден“, with the title „А 501 · 2-стаен · 62,18 м² · Продаден“;
    - a click calls `onUnit`.
  - `gr.test.jsx` (blocks):
    - „56 двустайни · 32 тристайни · 8 ателиета“ in both halves;
    - Б's exposure counts sorted from largest down;
    - А's note „Изложението на блок А не е попълнено в таблицата.“;
    - both halves still read „Блок А“ and „Блок Б“;
    - `/projects/golden-residence?view=list` selects „По критерии“ after hydration.
  - `gr.prerender.test.jsx`: hydrate the prerendered `/projects/golden-residence` at `?view=list`, with recoverable errors made fatal and `console.error` spied: no error, and „По критерии“ is selected after hydration.

- [ ] **Step 2: Run them.** Run `npx vitest run src/explorer src/pages/golden-residence`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - **Port** `gr.js:67-210` and `diptych.css:625-676` and `:834-839`, with spec §7.8, §6.16 and §5.7.
  - **The switch** runs `Flip.getState` / `Flip.from(state, { duration: 0.7, ease: 'expo.inOut', scale: false, simple: true, onComplete: () => ScrollTrigger.refresh() })` through `loadFlip()`, plus the incoming panel's rise. Without motion it switches at once.
  - **`?view=list`** goes through `useExplorerState`.
  - **The block grid's cells** call `useExplorer().openUnit(label)`. `BlocksSection` sits inside Task 7's `ExplorerProvider` on the GR page. The cell entrance is per spec §5.7.
  - **DOM order.** The list's Етаж options („етаж 3“) come after the facade's rails in the DOM: the availability contract clicks the first element whose own text is „етаж 3“.

- [ ] **Step 4: Run and look.**
  - Run `npm test`, then `npm run build && npm run check:dist`. Expected: the Flip chunk is reported ≤ 10 KiB and absent from first-load JS.
  - Then `npm run smoke`.
  - Screenshots: the list at 1440 and 390 with filters on; the switch mid-Flip; the block grids.

- [ ] **Step 5: Commit.** `feat(explorer): the criteria list, the view switch and the block grids`.

**Preview:** "Golden Residence is complete: both ways in, „Визуално“ and „По критерии“, the list with its filters, and the block grids."

### Task 9: Verification, smoke additions and preview checks

**Files:**
- Modify: `scripts/smoke/smoke.mjs`; `scripts/perf/lighthouse.mjs` (a `--categories` flag).
- Create: `docs/superpowers/notes/2026-11-14-m2-results.md`.
- Test: the smoke run itself (`npm run smoke -- --explorer`); `scripts/perf/lighthouse.test.mjs`.

**Interfaces:**
- Consumes: the built site from Tasks 0–8; `npm run perf` (`scripts/perf/lighthouse.mjs`).
- Produces: the smoke flags `--explorer` (included in a full run), the Lighthouse flag `--categories=<list>` (default `performance`), and the M2 results note.

- [ ] **Step 1: Add the explorer steps to `smoke.mjs`.** Each failure message names the step.
  - **Desktop mouse** (1440×900, `/projects/golden-residence`): scroll `#explorer` into view; move a real mouse over the centre of floor А-5's polygon.
    - `aside.fxp--a` must be visible within 600 ms, with „Етаж 5“;
    - a click opens `[role="dialog"]` named „Блок А · Етаж 5“;
    - Escape closes it.
  - **Keyboard:** Tab from the top until a rail button is focused; its panel must be visible and its ring 2 px.
  - **Phone** (390×844, touch, `/projects/golden-residence`): tap floor А-3; `.sheet` must be visible with „Етаж 3“; a second tap opens the dialog.
  - **Deep link:** `/projects/golden-residence/block-a?floor=3` shows the dialog „Блок А · Етаж 3“ after hydration, with no console error.

- [ ] **Step 2: Run the whole check.** Run `npm run verify`. Expected: PASS. That is every test, the build, check:dist with `/`, `/projects/golden-residence` and both GR block routes enforced, and the smoke run with its new steps.

- [ ] **Step 3: Measure.**
  - **Lighthouse categories.** `lighthouse.mjs:73` runs `--only-categories=performance`, and its report keeps only that score. Add `--categories=<list>`, passed on to Lighthouse, and make `metricsOf` and the summary carry each requested category's score. Test it in `lighthouse.test.mjs` on a recorded report.
  - **Serve first.** Start `node scripts/smoke/static-server.mjs` in the background (port 4190): the script measures whatever answers there.
  - Run `npm run perf -- --categories=performance,accessibility,best-practices,seo http://127.0.0.1:4190/ http://127.0.0.1:4190/projects/golden-residence http://127.0.0.1:4190/projects/golden-residence/block-a`. Take the performance figures and the a11y and Best Practices scores from this normal build.
  - **SEO.** Every build but production carries `noindex`, so its SEO score cannot reach 100. Build once locally with `VITE_SITE_STAGE=production npm run build`, serve it, and take only the SEO scores from it. Never deploy that build and never send an inquiry from it: its leads would not be tagged „[ТЕСТ]“. Then rebuild normally.
  - Record the medians in `docs/superpowers/notes/2026-11-14-m2-results.md` against spec §12: LCP, CLS, TBT, bytes before LCP (measured as the M1 baseline note defines them), and the a11y, Best Practices and SEO scores, each with the build it came from.
  - Also record the first-load JS table, the motion and Flip chunk sizes, and the font bytes.
  - A budget miss is written down with its cause, never hidden. Fix a miss inside this task when the fix is local (an image width, a preload). Otherwise report it.

- [ ] **Step 4: Check by eye.**
  - At 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px: no horizontal scroll on Home or Golden Residence, and text spacing (WCAG 1.4.12) holds on the EU row, the counts and the H1 masks.
  - The facade's rails at 901×700, 1024×768 and 1280×800, with a mouse and with touch: no two rail boxes overlap, each rail button is at least 24 px tall, and none is cut off at the edge.
  - With reduced motion and with Save-Data (DevTools network conditions): every section is static and complete.
  - Save the screenshot set the user will judge to `<scratch>/m2/shots/`, named after the matching concept shots in `C:/ksm-stroy/design/2026-11-14-concepts/shots/`: Home opening and company; services hovered; works; teaser; contact; EU poster; GR hero; story; explorer hover; stage; unit panel; list; blocks; gallery; parking; phone views.

- [ ] **Step 5: Commit.** `docs: M2 verification results` (the note, the `smoke.mjs` change, and the Lighthouse flag with its test).

- [ ] **Step 6 (orchestrator only, not the implementer): preview checks.** After the push, open the Vercel preview of `redesign-v2` in the user's logged-in Chrome and check:
  - `/`, `/projects/golden-residence` and `/projects/golden-residence/block-a?floor=3` load with no console error;
  - `/api/availability` answers 200;
  - an inquiry from the preview reaches Odoo with „[ТЕСТ]“ in its title. Send it only with the user's go-ahead, since it lands in the client's CRM and mailbox.

  Then hand the screenshot set to the user.

---

## Self-review notes (for the orchestrator)

- **Spec coverage:**

  | Spec section | Task(s) |
  |---|---|
  | §1 decisions | all |
  | §2 tokens | 0 |
  | §3 type | 0 |
  | §4 layout and seam | 1 |
  | §5.2 gate, §5.3 Lenis, §5.6 doors | 1 |
  | §5.5 first viewport | 3, 5 |
  | §5.7 motion catalogue | 2, 3, 4, 5, 6, 7, 8 |
  | §5.8 reduced motion | every task, checked in 9 |
  | §6.1 actions | 0 |
  | §6.2–6.5 shell | 2 |
  | §6.6 layout primitives | 1 |
  | §6.7–6.8, §6.13 | 3 |
  | §6.9–6.10, §6.12 | 4 |
  | §6.11 teaser | 6 |
  | §6.14–6.15, §6.17–6.18 | 5 |
  | §6.16 blocks | 5, 8 |
  | §7.1–7.5, §7.9 | 6 |
  | §7.6, §7.7, §7.10, §7.11 | 7 |
  | §7.8 | 8 |
  | §8.1 Home | 3, 4, 6 |
  | §8.2 Golden Residence | 5, 6, 7, 8 |
  | §8.3 block routes | 7 |
  | §9 data | 2, 3, 5, 6 |
  | §10 inquiries | 4 |
  | §11 accessibility | every task, checked in 9 |
  | §12 budgets | 1 (check-dist), 9 |
  | §13 out of scope | nothing built |

- **Interfaces used across tasks:**
  - `PALETTE` and the CSS variables (0);
  - `Button` (0);
  - `DISPLAY_FONT_PRELOADS` (0);
  - `useReveals`, `useMotionNow`, `loadFlip`, `Seam`, `cutNextTransition`, `cutOnPop`, `glideToHash`, `--arrive` and `data-arrive` (1);
  - `inquiryTarget` (2);
  - `apartmentUnits` and `grFree` (2);
  - `MNOGO_DATED` and `GR_FACTS` (3);
  - `presetInquiry`, `scrollLocked` and `InquirySection` (4);
  - `spotUnits` and `blockFree` (5);
  - `buildModel`, `floorKey`, `PlanSvg`, `Facade` and `ExplorerSection` (6);
  - `ExplorerProvider` / `useExplorer`, `useExplorerState`, `parseFloorParam` / `formatFloorParam` and `BlockRoute` (7);
  - `filterUnits` (8).
  - Unit ids across Tasks 4, 7 and 8 are labels („А 501“), matched with `normalizeUnitId`.
- **Temporary states each task leaves:**
  - Task 3: the Многофамилна half goes to `/contact?project=mnogofamilna-sgrada` until Task 4.
  - Tasks 5–6: the GR hero action goes to `#blokove` until Task 6 makes it `#explorer`.
  - Task 6: floors open the legacy block page until Task 7.
  - Task 5: the blocks section has links in place of the grids until Task 8.
  - Tasks 3–5: Home has no floor-by-floor teaser until Task 6.
  - Tasks 0–6: the Golden Residence block routes are legacy; `MUST_BE_V2` lists them from Task 7.

  Each of these keeps every contract green and gives the preview a working path. Each task from Task 3 on ends with its **Preview** line for the user.
