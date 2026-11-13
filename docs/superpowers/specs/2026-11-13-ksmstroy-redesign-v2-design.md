# ksmstroy.com Redesign v2 — Design Spec

- **Date:** 2026-11-13 (rev. 2, after an independent builder, design and feasibility check)
- **Status:** working spec. The user said "just dive in", so this is not gated on approval. Client-facing decisions are in §14, each with the default we build with.
- **Branch:** `redesign-v2` in the worktree `C:\ksm-stroy\ksm-stroy-v2`, created from production `main` @151c060.
- **Sources:**
  - production `main`: content and production behaviour;
  - tag `archive/redesign-v1` (5cecebb): explorer engine, maps, config;
  - `C:\ksm-stroy\golden-residence` @944bb03: motion infrastructure, film media and explorer UI from the client-accepted landing;
  - recon and check evidence in the session scratchpad (`recon/*`, `design/check-*.md`).

---

## 1. Intent

KSM Stroy (КСМ СТРОЙ ООД) is a Sofia builder and developer. The brothers Кадри and Сухат founded it in September 2008; they are sons of a mason from the village of Буково. It sells two buildings (Golden Residence; Многофамилна жилищна сграда) and has seven completed works.

The user pitched KSM a complete redesign. The brief, in the user's words:
- "completely bring this website to a new level";
- "insanely smooth", with flawless animations;
- very well optimised, so everything loads quickly;
- use the content as it is, presented better;
- focus on Golden Residence for now, but also present KSM as a company and "get more information" (more inquiries).

**Success**
1. **On one screen:** a buyer sees that KSM builds two real buildings, what is free right now, and how to ask, with an inquiry action on the first screen on both phone and desktop.
2. **A company, not a template:** KSM reads as a builder's family business with craft values.
3. **Continuity:** no blank frames, loaders, double reveals or jank. Motion carries content.
4. **Speed:** mobile lab LCP ≤ 2.5 s (production today: 4.1–4.3 s).
5. **Inquiries everywhere:** an inquiry is one tap away from every unit, project and page, and always pre-filled with what was being looked at (`?project=`, `?apartment=`).

**Non-goals**
- new photography or renders;
- 3D or WebGL;
- a CMS beyond Google Sheets;
- multi-language;
- prices, unless the sheet gains a Цена column (already supported).

**Anti-goals** (a failure even if it technically works)
- an intro screen, logo splash or load gate;
- a loader between routes;
- content that paints, then disappears and replays after hydration;
- a fade-up on every section;
- gold-gradient text;
- pastel chips;
- a Golden Residence page that is the Diana Homes landing with KSM's header;
- invented marketing claims;
- losing any production behaviour: Блокиран, the EU section, the Odoo lead payload, current URLs.

---

## 2. Creative direction: "Мярка и светлина" (Measure & Light)

A builder's drawing that comes to life at the blue hour.

- **Мярка (measure)** is the builder's language:
  - dimension lines that carry real values;
  - elevation marks for floors;
  - plans with inked outlines;
  - one honest title block.

  It stands for precision, and for the motto's коректност, бързина, точност.
- **Светлина (light)** is the warmth of a home. The light in the windows of KSM's own Многофамилна render (sampled `#F5D88F`) is the only glow on the site, and it means *available*: a free apartment is a lit window.
- **Both already exist in KSM's own material:** the logo's monoline tower under a sun, the Многофамилна render at dusk, and the Golden Residence film in daylight. Every colour below is sampled from those files.

**One moment per page.** Everything else stays quiet and disciplined. Home must not borrow other pages' moments.

| Page | Its one moment |
|---|---|
| Home | The opening: the Golden Residence film band and the live counts |
| Golden Residence | The Rise: a scroll-scrubbed tilt-up, with a floor gauge that tracks the real slabs |
| Многофамилна | "Светлини в прозорците": only floors with free homes stay lit |
| Explorer | Facade → plan as one spatial gesture |
| За нас | The emblem draws itself, then the motto lights up word by word |
| Обекти, Контакти, Продажби | Calm on purpose |

**Brand architecture: one KSM, two lights.**
- KSM owns every ground, type style and component on ksmstroy.com.
- A project's "light" is the time of day in its own imagery: Golden Residence is daylight, from the film; Многофамилна is dusk, from the render.
- Each project gets **one** mark colour, for marks only (active floor, rules): Golden Residence bronze-ink. Многофамилна uses `light`, which is availability anyway.
- Shared with the agency landing, only what buyers compare across the two sites: unit names (`А 101`), status colours and chips, and area formatting.

---

## 3. Brand system

### 3.1 Colour tokens

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F1F2EF` | Drafting paper; the light ground on every page. Neutral-cool, not cream. |
| `ink` | `#14202F` | **Text only**, on `paper`. Never a ground (it reads as a tinted near-black). |
| `dusk` | `#1F3A63` | The single dark ground, a blue-hour tone sampled from the render. Used only where the light changes: the Многофамилна chapter and page, the mobile menu, the footer. Paper text on it is 10.1:1; `light` on it is 8.2:1. No gold on dusk. |
| `light` | `#F5D88F` | **Availability only:** lit windows, the free-count glow, the window glyph. Not a focus ring, not decoration. |
| `gold-ink` | `#7A6336` | KSM's mark colour on `paper`: the logo, active nav, the dimension-line ticks, link underlines. It must pass AA on `paper`; adjust until it does. |
| `graphite` | `#4A5462` | Secondary text on `paper`. |
| `rule` | `#CBD0D4` | Hairlines on `paper`, used only where people compare things (§3.4). On `dusk`, use `paper` at 16% opacity. |
| `bronze-ink` | `#7A6549` | Golden Residence mark colour (active floor, rules on its page and explorer). |

**Status colours** are shared with the landing. Re-verify contrast on `paper` and `dusk`. Status always carries a text label.

| Status | Hex |
|---|---|
| free | `#3F8F55` (deep `#2F6E41`) |
| reserved | `#C9962E`, plus a hatch on plans |
| sold | `#B23A30` |
| blocked | `#7A828C` |

**Focus ring:** 2 px, `ink` on paper and `paper` on dusk, with a 2 px offset.

### 3.2 Typography

Both families draw **Bulgarian letterforms** via the `locl` BGR feature. `<html lang="bg">` is set in the root layout. No branch, competitor or the landing does this.

**Display: Playfair (the 2.0 family, not Playfair Display)**
- Build a **pinned display instance** with fontTools from the google/fonts master (Playfair 2.203): `opsz = 72`, `wdth = 100`, `wght` 400–560 kept variable.
  - opsz 72 was chosen over 96 by measurement: 96 and 120 are nearly the same design, while 72 keeps hairlines visible at 24–58 px, where most of the site's display text sits.
  - Subset Cyrillic, basic Latin and the punctuation the copy uses into **one** file, keeping `locl` (BGR), `kern`, `case` and `tnum`, with lining figures frozen as the default.
  - Built: `playfair-display.woff2`, 50.6 kB. Geologica is 24.6 kB, so the total is 75.2 kB.
- The default fontsource `wght` file is the opsz-14 text cut and must not be used.
- Self-hosted and served from our own `/fonts/`. Preload **both** Playfair files, or merge them into one: fontsource's Cyrillic range has no space or digits, so a Cyrillic-only preload swaps twice.

**Text, UI and data: Geologica**
- variable `wght` 300–600, Cyrillic plus basic-Latin subsets (about 15.5 plus 13 kB);
- not preloaded; `font-display: swap`.

**Numerals**
- `font-variant-numeric: lining-nums tabular-nums` on every count, area, date and table.
- Playfair's default digits are old-style and proportional, so this is mandatory. Alternatively, freeze `lnum`/`tnum` into the subset.
- CI check: digits 0–9 have equal advances in both subsets, and the BGR forms are present.

**Fallbacks:** metric-override `@font-face` fallbacks (`size-adjust`, `ascent-override`, `descent-override`), computed from **Cyrillic** glyph advances, so the swap re-wraps no heading (CLS ≤ 0.02).

**Budget:** fonts on first load ≤ 90 kB (measured target ≈ 84 kB).

**Delete** the inline `body { font-family: system-ui }` in production `index.html`; today the brand font never renders.

**Type scale** (1.25 ratio; clamps for display)

| Role | Size / line-height | Face and rules |
|---|---|---|
| Body | 17 px / 1.6 | Geologica 400; 60–68ch measure |
| Small | 14.5 px / 1.45 | Geologica |
| Label | 12.5 px / 1.4 | Geologica 500, sentence case. **No ALL-CAPS tracked labels anywhere.** |
| h3 | 24 px / 1.25 | Playfair 500 |
| h2 | clamp(34px, 4.2vw, 58px) / 1.06 | Playfair 480 |
| Display / h1 | clamp(44px, 7.6vw, 120px) / 0.98 | Playfair 420 |
| Count numerals | clamp(56px, 9vw, 140px) / 0.9 | Playfair 400, lining tabular |

**Headings are single strings.** No `eyebrow + titleLead + titleAccent` structures and no italic accent word. Content ported from golden-residence is flattened to one `title` during the port.

**Setting text**
- Bulgarian quotes „…“; spaced en dash for ranges.
- Non-breaking spaces before units (`57,46 м²`), after one-letter words (в, с, и, а, о, у, к) and inside `жк Левски Г`.
- Numbers formatted bg-BG (decimal comma).
- SplitText always with `reduceWhiteSpace: false`.
- The elevation mark ▽ is not in either font. It is an inline SVG inside `ElevationMark`.

### 3.3 Motifs

Each motif encodes information; none is decoration.

1. **Dimension line** (размерна линия): a hairline with end ticks and a value in Geologica.
   - Only where the measurement is the subject: unit areas in the unit panel, `500 м до метростанция`, and the company's span `2008 – 2026`.
   - Never under a slogan, between words, or over the marketing stats.
   - Static by default; it draws once only where it is the subject of a section.
2. **Elevation mark** (кота): an SVG ▽ plus `етаж n`, with `кота +x,xx` only where the drawings give it (Golden Residence А1 is `+3,06`).
   - It labels floors in the floor index, the explorer header and the Rise gauge.
   - Never invent elevations.
3. **One title block** (щампа): a compact box at the bottom right of the footer, holding `КСМ СТРОЙ ООД`, `Обект: {project}` (project pages only) and `2026`. One honest detail, not a whole ruled footer.
4. **Window light**:
   - on the Многофамилна facade (§8.5);
   - as a 10 px window glyph, lit or unlit, beside each floor's free count in floor indexes;
   - as the soft glow behind a free count.
5. **The emblem:** the logo's monoline tower, sun, birds and clouds, redrawn as a stroke SVG (§11.4).
   - It is **prominent** in the header (the owner asked for a prominent logo in v1): about 44–48 px, with the wordmark beside it.
   - On За нас it draws itself once.

**Banned chrome**
- tracked uppercase eyebrows;
- `A · B · C` strings as decoration (allowed only as real separators inside data rows and tooltips);
- `→` on links (allowed only on the 2–3 primary actions per page, drawn and nudged on hover);
- icon tiles, glowing pills, rounded image cards with hover zoom;
- marquees, Ken Burns sliders, stacked sticky cards;
- magnetic buttons, a custom cursor;
- emoji;
- broadsheet ruling everywhere.

### 3.4 Layout

- 12-column grid, max width 1440 px. Gutters: 20 px mobile, 32 px tablet, 48–64 px desktop. Left-aligned throughout.
- Full-bleed media alternates with contained text.
- **The dark ground appears only where the light changes:** the Многофамилна chapter and page, the mobile menu, the footer. Everything else sits on `paper`.
- **Rules only where people compare:** the explorer list, the unit panel facts, the Продажби pair, the Golden Residence facts. Elsewhere, use whitespace.
- **Radius:** 0 for media, panels, sheets and tables; 2 px for buttons and inputs; round only for status dots and the window glyph.
- **Rhythm:** section padding clamp(72px, 10vw, 160px); 8 px baseline within sections.
- **Heights that set page length** use `var(--screen-h)`, written by an inline `<head>` script before first paint (§6.3). Never `vh`/`svh`.

### 3.5 Imagery

- **Time of day per project:**
  - Golden Residence is daylight: the film and its stills.
  - Многофамилна is dusk: the 3308 px render, always cropped to remove its baked white margins.
- **Обекти photos** get one shared warm grade with fine grain at build time. They are shown as archive plates at or below their native size.
- **No upscaling beyond 1.0× in CSS pixels.** Above that, choose another source or crop.
  - The 1920×760 film band is allowed at full width, the accepted landing's treatment.
  - The 608×760 mobile crop fills the phone width.
  - Both are accepted compromises; nothing else may stretch.
- **Every video has an AVIF/WebP poster**, which is the LCP candidate.

---

## 4. Voice and content rules

1. **Production copy is the source** (`recon/content/content-main.md`). We may re-set it, split it across components and choose which page shows what. We don't rewrite its meaning.
2. **Client text in the repo but not yet on the site may be surfaced.** It needs no approval round, because it is the client's own words:
   - `src/assets/for-us/content.txt`: founders, motto, activities, team;
   - the Многофамилна brochure line „с магазини и подземни гаражи“.
3. **The Golden Residence introduction from the landing** opens „Диана Хоумс представя Golden Residence…“, which is the agency speaking.
   - Default on ksmstroy.com: the same paragraph without the agency clause („Golden Residence е новострояща се жилищна сграда, която…“).
   - Flagged in §14.
4. **No invented claims.** These v1 additions are dropped:
   - „Строим от 15 години. Оставаме след това.“;
   - „отговаряме същия ден“;
   - „в рамките на един работен ден“;
   - new numbers.

   The production stats (15+ / 200+ / 50+ / 100%) stay on За нас as plain production text, not on Home, and are never "measured" with dimension lines.
5. **Interface microcopy is ours:** plain Bulgarian, sentence case, active verbs, one name per action ("Изпратете запитване" → "Запитването е изпратено"). Errors say what happened and what to do.
6. **Live-data honesty:**
   - sheet counts may say "в момента";
   - Многофамилна shows fallback data until its sheets are published, so its counts are labelled `по данни към {дата}`, are never the largest numbers on Home, and never say "на живо";
   - a failed source shows a short notice plus the phone number, never a fake zero.
7. **Names:**
   - "Golden Residence" (Latin, never "Голдън Резиденс");
   - "Многофамилна жилищна сграда" in full, short form "Многофамилна сграда";
   - "КСМ Строй" in running text;
   - "КСМ СТРОЙ ООД" as the legal name;
   - "KSM STROY" in the logo.
8. **Fix fabricated metadata:**
   - the JSON-LD fake address and founder;
   - `foundingDate` becomes 2008-09;
   - canonical and OG point at `https://www.ksmstroy.com`.

   The 12 fake projects are already removed.

---

## 5. Motion system

### 5.1 Engine and loading

- **GSAP 3.15.x and Lenis 1.3.x are a deferred chunk**, loaded after first paint (window `load` or idle, whichever comes first). They never sit in first-load JS.
  - Components declare motion through `useMotion(scopeRef, setup)`, which queues `setup(gsap, ScrollTrigger, SplitText, lenis)` until the chunk is ready.
  - Nothing imports `gsap` statically outside `src/motion/`.
- **Init runs from an idle queue,** one section per task, with a single `ScrollTrigger.refresh()` at the end.
  - At load, split only the hero heading.
  - ReadingText, RevealImage and the scrubbed scenes set up when they come within about one viewport.
- **Flip** is lazy, loaded on first use, and only in in-page viewers (the Golden Residence stills strip, Обекти).
- **Lenis** runs on `gsap.ticker` (`autoRaf: false`, `lagSmoothing(0)`), wheel only: lerp 0.07, wheelMultiplier 0.8 (the landing's feel). **`syncTouch: false`** keeps native scrolling on touch and coarse pointers, which also protects iOS ProMotion and in-app WebViews (§14).
- **React 19.3 `<ViewTransition>`** handles route changes and shared elements.
- **Never combine with:**
  - Framer Motion, which goes with the last legacy page;
  - Swiper, three.js;
  - CSS `scroll-behavior: smooth`;
  - AnimatePresence routes;
  - a manual `document.startViewTransition`;
  - ScrollTrigger `pin` (use CSS sticky; §5.2.8).

### 5.2 Rules

1. **Markup is the final state.** Prerendered HTML, no-JS, reduced motion and tests all show the complete page. Never ship `opacity: 0` in markup or in non-`.js` CSS.
2. **The first viewport never animates from JS.**
   - The page's load moment is **CSS-only**, keyed to an `html.js` class that an inline `<head>` script sets before first paint (and skips under `prefers-reduced-motion`).
   - It runs at first paint, so there is no replay when hydration lands seconds later on a slow phone.
   - GSAP is for scroll-driven and action-driven motion only.
3. **LCP is never animated.** The LCP element is complete in the first frame.
4. **The load moment is at most 1.2 s and blocks nothing.**
5. **Scroll-linked motion only where it carries content:**
   - the Rise gauge;
   - the windows lighting on the Многофамилна page;
   - the motto on За нас (ReadingText, used **once** on the site);
   - a dimension line drawing a value when that value is the section's subject.

   At most **one** image reveal per page. No generic parallax, and no fade-up on sections.
6. **Action-driven motion is welcome:**
   - hover and press (≤ 200 ms);
   - sheets and panels (enter 420 ms `expo.out`, exit 260 ms);
   - explorer transitions;
   - viewers growing from their thumbnail.
7. **Compositor-only:** transform, opacity, clip-path. Content scales only **uniformly**: when two boxes differ in shape, the media is zoomed evenly and revealed with a clip-path inset that starts from the source rect. Never animate left/top/width/height. Flip runs with `scale: true` only when the aspect ratios match; otherwise it uses the clip-path technique.
8. **Page length never comes from JS.**
   - Scrubbed scenes use CSS `position: sticky` with heights in markup.
   - ScrollTrigger only scrubs; it never pins.
   - This keeps scroll restoration correct when motion inits late.
9. **ReadingText applies its dim state on enter, never at creation.**
   - At scroll 0, every word below the fold is at full contrast (a11y).
   - It is used once, on За нас, below the fold.
10. **Theme changes:**
    - the body background switches **instantly** at the line;
    - a single overlay of the outgoing colour fades out (≤ 300 ms);
    - text colours switch instantly at the midpoint;
    - never interpolate text colour across grounds.
11. **Reduced motion and Save-Data:**
    - no scrubbing, autoplay or count-ups;
    - posters and stills;
    - instant or ≤ 200 ms crossfades;
    - all content stays reachable.
12. **Eases and durations:**

    | Kind | Ease | Duration |
    |---|---|---|
    | Reveals | `expo.out` | 900–1200 ms |
    | UI | `power3.out` | 320–480 ms |
    | Micro | — | 160–220 ms |
    | Stagger | — | 40–70 ms |
    | Scrub smoothing | — | 0.4–0.6 |

13. **No magnetic hover and no custom cursor.** The owner declined a cursor in v1, and magnets belong to the same family.

### 5.3 Page transitions

- **Default:** a 240–280 ms crossfade of the outlet; the header is excluded (`view-transition-name: site-header`).
- **Shared elements:**
  - **Home's Golden Residence band → the Golden Residence page hero.** Both ends are the **same still poster**: on pointerdown or Enter, the band's video pauses and swaps to its poster. `::view-transition-old/new(project-gr)` gets `height: 100%; object-fit: cover`.
  - **Explorer facade floor band → the floor-plan container,** forward only. Other `?floor=`/`?unit=` changes on the same route use `update="none"`.
  - **Back/forward (popstate)** is instant (React doesn't animate it).
- **Scroll on navigation has one owner.** React Router `ScrollRestoration` plus `lenis.scrollTo(y, { immediate: true })`.
  - The reset to the top happens in a **layout effect**, before the view-transition "new" snapshot.
  - `ScrollTrigger.refresh()` runs after the transition finishes.
- **No blank frames:**
  - every route is prerendered;
  - route chunks prefetch on intent (`prefetch="intent"`);
  - no Suspense loader UI on navigation;
  - the old page stays until the new one is ready.

### 5.4 Motion catalogue

| Pattern | Where | Technique | Reduced motion |
|---|---|---|---|
| CSS load moment: masked rise of the H1 lines (authored as lines), the band's poster-to-film fade | Home and page heroes | CSS keyframes under `html.js`; no JS | Static |
| Rolling numerals | Live counts, only when a value **changes** after first render (first data arrival included) | `RollingNumber`; digits as tabular spans; sr-only value | Static |
| Video band | Golden Residence | `VideoBand`: poster first; attaches after `load` → poster `decode()` → idle; plays only while visible; pause control appears only after `playing`; a refused `play()` stays poster-only with no control | Poster |
| Frame scrub (the Rise) | Golden Residence page | `FrameSequence` with frames pre-decoded via `createImageBitmap` (fallback `img.decode()`), a sliding window of ±10 decoded frames (`close()` the rest), canvas DPR ≈ 1 (no source detail is lost at a cover scale ≥ 1.2), every 4th frame after `load` then fill-in on idle; hand-keyed frame → floor map (§8.4) | One still plus the floor list |
| Window lights | Многофамилна page | Masked layer swap (§8.5), lit floors on, staggered once on enter | Final lit state |
| Facade → plan | Explorer | View Transition shared element, with uniform zoom and a clip-path reveal | Instant |
| Viewer grow/shrink | Golden Residence stills strip, Обекти | Flip (uniform) plus a clip-path inset; transforms only | Crossfade |
| ReadingText | За нас motto | Words dim on enter, then light up by scrub | Full text |
| Emblem draw | За нас opening | SVG stroke-dashoffset, CSS under `html.js` | Static |
| Sheet / panel / menu | Unit panel, mobile menu | GSAP, or CSS transitions where enough; scroll lock via `lenis.stop()` | Instant |

### 5.5 Smoothness budget

Measured with the wheel script (100 px every 60 ms) at DPR 2 and 4× CPU, plus a touch-scroll run (CDP `synthesizeScrollGesture`) at 4× that starts during hydration, on Home, the Golden Residence page and an explorer:
- **0 long tasks over 50 ms** while scrolling;
- **≤ 1% of frames over 33 ms.**

---

## 6. Architecture

### 6.1 Framework

React Router 8.5.x **framework mode, `ssr: false` plus `prerender`** for every concrete path, with React 19.3.x and Node 22.x (`engines`, both Vercel projects).
- Separate vitest config without the `reactRouter()` plugin.
- The M1 spike decides go or no-go, with these exit criteria:
  1. Zero hydration errors on every route, including `?floor=`/`?unit=`/`?apartment=` deep links.
  2. Every URL direct-loads its own HTML; unknown URLs return a 404 page.
  3. `/api/odoo-lead` still deploys as a Function (verified on a Vercel preview).
  4. Home passes Lighthouse mobile LCP ≤ 2.5 s ×3, with the real shell, fonts and opening assets.
  5. The per-route JS report is within budget.
- **Fallback** if the spike fails: a Node build-time render (`react-dom/static` `prerender` plus React Router `createStaticHandler`/`StaticRouterProvider`, hydrated with `createBrowserRouter`). **Not** puppeteer snapshots, which can't hydrate.

### 6.2 Hydration rules (M1, before porting primitives)

- **Browser-dependent hooks** use `useSyncExternalStore` with a `getServerSnapshot` equal to the prerender value. Affected: `useMotionAllowed`, `useMediaQuery`, `useCoarsePointer`, `useFinePointer` and session flags.
- **Query-string-driven views** (explorer floor and unit, contact prefill) render their query state only after `useHydrated()` turns true.
- **Layout and interactivity chosen by media** (Rise height, reduced-motion stills, inert facade bands on coarse pointers) are chosen by **CSS media queries**, never by JS state that changes the DOM.
- Tests and the smoke run **throw** on any recoverable hydration error. Don't port production `main.jsx`'s swallowing `onRecoverableError`.

### 6.3 Head scripts (inline, before first paint)

1. Set `html.js` unless `prefers-reduced-motion: reduce`.
2. Write `:root{--screen-h:Npx}` into a `<style>` element. It changes only when ScrollTrigger re-measures (the landing's `screenHeight.js` logic).

Don't put attributes on `<html>` from scripts; React 19 tolerates extra head nodes.

### 6.4 Data

**`api/availability.js`** is a new Vercel Function next to `api/odoo-lead.js`. It:
- fetches every sheet server-side (Golden Residence А, Б, garages and parking; Многофамилна А and Б when their env vars exist);
- applies `propertyStatus.js`;
- returns compact JSON per project, with `Cache-Control: s-maxage=30, stale-while-revalidate=300`.

Around it:
- **Preload** it from the route `links` on data routes. It feeds a `useSyncExternalStore` store whose **server snapshot is the placeholder**.
- **Fallback:** the client reads the sheets directly, as today, without custom headers.
- **Never** a `clientLoader`.
- The store is provided only on routes that need it: Home, Продажби, the project pages and the explorers.

**Placeholders:**
- Prerendered HTML shows a stable placeholder (`—` at tabular width).
- **Многофамилна's dated fallback counts are prerendered** as real numbers, because they are static.
- Golden Residence counts arrive with the preload at hydration.

**Sheet columns are never renamed.** goldenresidence.dianahomes.bg reads the same sheets and rejects missing columns. Both sites must show the same unit the same way.

### 6.5 Routing on Vercel

- Prerender all concrete paths, including the 4 explorer block pages.
- Emit `404.html` from the `*` route.
- Drop the `/(.*) → /index.html` catch-all (once prerendered, that file is Home).
- `vercel.json` redirects:
  - `/projects/:id` → `/projects`, excluding the two real slugs;
  - `/home` → `/` (production).
- Unlisted dynamic paths fall back to `__spa-fallback.html`.
- Output directory `build/client`; update `check:dist` to match.

### 6.6 Images, video, fonts

**Images**
- A build-time sharp pipeline (extend `scripts/generate-srcset.mjs`, following the landing's `build-photos.mjs`) produces AVIF and WebP ladders (480/768/1024/1440/1920/2560, never above the source).
- Plus **per-route** manifests: widths, intrinsic size, dominant colour, tiny LQIP.
- `<ResponsivePicture>` reads the manifests.
- The **LCP image** of each route is preloaded via route `links` with `fetchpriority="high"`.
- The Многофамилна opening line image gets `fetchpriority="low"` and a dominant-colour placeholder.

**Video**
- Golden Residence clips are copied from `golden-residence/public/film`.
- The hero AV1 (3.1 MB today) is **re-encoded to ≤ 2 MB** from the master film at `C:\Users\sadit\Downloads\Фасади\GOLDEN RESIDENCE MARKETING - KSM INVEST.mp4`, with the landing's `npm run film` budgets. Until then, serve H.264 for that clip.

**Fonts:** see §3.2.

### 6.7 SEO and deploy

**SEO**
- Per-route `meta`: title, description, OG.
- Canonical `https://www.ksmstroy.com/<path>`.
- Corrected JSON-LD: `HomeAndConstructionBusiness`, two real offices, phones, email, `foundingDate: 2008-09`, `sameAs` Facebook.
- `robots.txt` and `sitemap.xml` from a build step.
- One H1 per page.
- A real 1200×630 `og:image`.

**Review host**
- **Noindex:** any host other than `www.ksmstroy.com` gets `noindex` through the root `meta`, with no sitemap.
- **Test inquiries:** a review host tags inquiries `[ТЕСТ]` (`SITE_STAGE` in `api/odoo-lead.js` and the EmailJS subject). It needs a small contract-tested change, coordinated with the teammate who owns the function.
- SEO 100 is measured on a production-mode build; the noindex review URL can't score it.

**Analytics:** Vercel Analytics plus Speed Insights.

**Never port from golden-residence:**
- `inquiry.js`, `api/inquiry*`, `public/api/inquiry.php`;
- the deploy scripts;
- the `site.js` values;
- the Diana Homes logo.

`check:dist` guards the build against these.

---

## 7. Information architecture

| Route | Page | Nav | Ground |
|---|---|---|---|
| `/` | Home | Начало | paper; dusk only for the Многофамилна chapter |
| `/projects` | Both buildings | Продажби | paper |
| `/projects/golden-residence` | Golden Residence | — | paper |
| `/projects/golden-residence/block-a`, `/block-b` | Explorer (`?floor=&unit=`) | — | paper |
| `/projects/mnogofamilna-sgrada` | Многофамилна | — | dusk opening, then paper |
| `/projects/mnogofamilna-sgrada/:block` (real params) | Explorer | — | paper |
| `/blog` | Completed works | Обекти | paper |
| `/about` | Company | За нас | paper |
| `/contact` | Contact (`?project=`, `?apartment=`) | Контакти | paper |
| `/eu-proekt` | EU project | EU strip, footer | paper |
| `/projects/:id` | Redirect to `/projects` | — | — |
| `*` | 404 | — | paper |
| `/dev/tracer` | DEV only | — | — |

---

## 8. Pages

### 8.1 Global chrome

**Header** (one fixed element; it moves with one `translateY`)
- **Row 1, the EU line** (default ON, §14): 32–36 px on `paper`, with the official co-funding lockup, the ПКИП logo and a one-line text linking „За проекта" → `/eu-proekt`. It is visible on landing without scrolling.
- **Row 2, the bar:**
  - the emblem (44–48 px) and the wordmark;
  - the links Начало, Продажби, Обекти, За нас, Контакти;
  - the phone `+359 887 886 166` (tel:);
  - the primary button „Запитване" (→ `/contact`, carrying `?project=` on project pages).
- **Behaviour:**
  - transparent over the Home band and project heroes, solid `paper` after 80 px;
  - hides on scroll down and reveals on scroll up, after the hero;
  - `view-transition-name: site-header`.
- **Mobile:**
  - the bar shows the emblem, the phone icon button and the menu button;
  - "Запитване" sits in the menu **and** as a sticky bottom action on project and explorer pages.

**Mobile menu**
- A full-screen sheet on `dusk`: links in Playfair at 40 px, then the phone, email, both offices and the EU line.
- Rendered as a portal to `body`, never inside a `backdrop-filter` ancestor (that was the v1 bug).
- Scroll is locked through Lenis.

**Footer** (on `dusk`)
- Two calm columns:
  - left: the emblem and the production blurb, then the phones, email and working hours;
  - right: the two offices with "Отвори в Google Maps" links, the quick links and Facebook.
- Below them: the EU line and „© 2026 КСМ Строй".
- Bottom right: the **title block** (§3.3).

**404:** „Тази страница я няма в чертежа.", with links to Начало, Продажби and Контакти.

### 8.2 Home (`/`)

1. **The opening (LCP; `calc(var(--screen-h) - header)`)**
   - **Desktop:**
     - the Golden Residence film band runs full width at 2.5:1 (about 1440×576). The poster is the LCP (≤ 60 kB mobile poster; preloaded); the video attaches after load.
     - Below it on `paper`, left: the H1 **„Създаваме пространства за мечтания живот"** (production).
     - Right: two lines, which are the project index.
       - **Golden Residence** — жк Левски Г, София; the live free count (count numerals with the `light` glow) and „свободни апартамента"; „Изберете апартамент" and „Запитване".
       - **Многофамилна жилищна сграда** — a 1.63:1 thumbnail of the whole dusk render, the district, the dated count, „Разгледайте сградата".
   - **Phone:**
     - the Golden Residence portrait poster/clip at about 55% of the height;
     - then the Golden Residence line with both buttons;
     - then a one-line Многофамилна row.
     - Inquiry is reachable on the first screen.
   - **CSS load moment:** the H1 lines rise once from their masks; the band's poster crossfades to film when the film is ready.
   - **Click** on the band or Golden Residence title → `/projects/golden-residence`, with the band poster as the shared element.
2. **Golden Residence in daylight**
   - The live **floor index** for both blocks: `▽ етаж 8 … 1`, free count and window glyph. Each row links into the explorer at `?floor=`.
   - The dimension line `500 м до метростанция`.
   - The client's introduction (§4.3) as a short paragraph.
   - „Изберете апартамент" and „Запитване".
3. **KSM**
   - The founders sentence: „КСМ СТРОЙ ООД е основана през септември 2008 г. от двама братя – Кадри и Сухат, синове на известен в родното им село Буково строител зидар (дюлгерин)."
   - The motto set large and **static**: „Добрата работа – реклама за майстора" (ReadingText belongs to За нас).
   - The values inside the client's own sentence („…коректност, бързина и точност…").
   - A `2008 – 2026` dimension line.
   - **One services list** (the production Home services' names and descriptions, as a plain list).
   - The link „За нас".
4. **Completed works:** a compact register of the seven works (name and place; years only once the client confirms them, §14), three graded photos, and the link „Всички обекти".
5. **Многофамилна at dusk.** The page's one change of ground:
   - the lights-off render with lit floors (§8.5), **static**;
   - the dated count;
   - the facts „2 блока", „с магазини и подземни гаражи";
   - „Разгледайте сградата" and „Запитване".
6. **EU co-funding** (production content, restyled):
   - the poster image and the facts;
   - „Отвори плаката", „Изтегли PDF";
   - the disclaimer;
   - „За проекта".

   `BG16RFPR001-1.012-1485-C01` and the PDF link stay; they are contract-tested.
7. **Closing:** „Готови сте да започнете своя проект?" (production), with the phone and „Изпратете запитване".

### 8.3 Продажби (`/projects`)

- The two buildings as a **comparable pair**: two columns sharing one row grid, ruled.
  - Rows: render, name, address, blocks, floors, apartments total, free now (Многофамилна dated), garages and parking, the production description and features.
  - Each column ends with „Разгледайте апартаментите" and „Запитване".
  - On mobile: stacked spec sheets.
- Closing: „Търсите нов дом?" with „Попитайте за цени" (production) → `/contact`.
- No filter chips.

### 8.4 Golden Residence (`/projects/golden-residence`)

This is KSM's sales page, not the landing. KSM grounds and type; bronze-ink marks only.

1. **Hero**
   - The film band, „Golden Residence", the address and the live free count.
   - „Изберете апартамент" and „Запитване" **inside the first viewport**.
2. **Facade and floor index on the page**
   - The facade render with floor bands, for both blocks (А left, Б right), next to the live floor index.
   - Choosing a floor opens the explorer at that block and `?floor=` (shared element: band → plan).
3. **The Rise**
   - The 120-frame tilt-up, scrubbed in a CSS-sticky scene. The **floor gauge is hand-keyed**: nine keyframes, marking where each slab crosses the gauge's reference line.
   - The ▽ mark follows the slab line; elevations appear only where the drawings give them.
   - The pin ends on the parapet frame, not empty sky.
   - It closes with „Свободни са {n} от {total} апартамента." and a button.
   - Frames load progressively near the section (budgets in §10).
4. **Facts and location**
   - A facts table: floors, blocks, apartments, types from the sheet's Вид values, exposure.
   - The client's introduction (§4.3).
   - The address, the `500 м до метростанция` dimension line, and „Отвори в Google Maps" (no iframe).
5. **Stills:** one strip of six film stills or photos. The viewer grows from its thumbnail.
6. **Garages and parking:** the counts, a list on demand, „Запитване за гараж/паркомясто".
7. **Inquiry:** KSM's phone and the form link with `?project=golden-residence` (§14).

Dropped from the landing: the stacked chapter cards, the collage gallery and the pointer circle.

### 8.5 Многофамилна (`/projects/mnogofamilna-sgrada`)

1. **Hero, "Светлини в прозорците"**
   - The dusk render, cropped, full-bleed on `dusk`.
   - **Build-time lights-off render:** with sharp, threshold the warm, bright window pixels inside the building into a window mask (about 6% of the facade). Repaint them in the unlit-glass tone sampled from the same image.
   - **At runtime:** show the lights-off render; above it, show the original masked to **(window mask ∩ the rectangles of floors with ≥ 1 free unit)**.
     - Floors are lit or unlit; brightness is not proportional.
     - On enter, the lit floors switch on in a short stagger, once.
     - Reduced motion shows the lit state.
   - Legend: „Светят етажите със свободни апартаменти".
   - Tooltip or tap: `▽ етаж 4 · 3 свободни · 1 резервиран · 4 продадени`. The floor index sits beside the render for touch and keyboard.
   - The name; „УПИ V-1344, кв. 33, ж.к. Връбница-1, София"; the dated count; „Изберете апартамент" and „Запитване".
2. **Facts:** 2 блока, the floors (per the explorer config, see §14), „с магазини и подземни гаражи", the production description.
3. **Choose a block:** crops from the master render, with dated counts, leading to the explorer. The low-resolution `blockA/B.webp` are not used.
4. **Gallery:** the 4 production photos.
5. **Location** and **inquiry**.

### 8.6 Explorer (`/projects/:project/:block`)

Golden-residence's explorer components (FacadeView, FacadeMap, FloorIndex, FloorView, FloorPlan, ApartmentList, UnitPanel, StatusChip, StatusLegend), generalised to read **per-project config** (`src/config/projects.js`).

**Map data**
- **Golden Residence:** the landing's refined `building.json` and `floors.json` (templates plus fitted per-plan transforms), including the real А1 plan. The other block's bands are inert on a block route.
- **Многофамилна:** v1's maps converted to the same template-plus-transform model.
  - The facade bands fit the 3308 px master at ×2.757; add only the white-margin crop offset.
  - One shared plan for keys 2–10, units = key − 1.
  - Floor key 0 (garages) is hidden (owner decision).
- Validate both with `scripts/validate-maps.mjs` and the overlay renders. Look at every overlay.

**Building view**
- The facade bands and the **floor index** (`▽ етаж 8 … 1`, free count, window glyph), with two-way hover sync.
- The tooltip clamps to the viewport.
- Bands are inert on coarse pointers via CSS (`@media (pointer: coarse)`); the index is the touch path.
- The block switch.
- **Counts are scoped to the block.**

**Floor view**
- **Header:** `▽ етаж n`, the ▲/▼ stepper, the block switch, „Към сградата".
- **Plan:**
  - muted status fills, reserved hatched;
  - unit numbers at area centroids in display type;
  - pinch and Ctrl/⌘-wheel zoom anchored at the pointer, with bounded pan (`useZoomPan`, fixed so clicks reach polygons);
  - a plain wheel scrolls the page.
- **List:** unit · вид · площ · status chip, with filters „Само свободни", вид and площ. Two-way hover sync with the plan.
- A failed source shows a notice plus the phone.

**Unit panel**
- A side sheet on desktop and a bottom sheet on mobile.
- A real dialog: focus trap, Esc, Lenis stop, `data-lenis-prevent`.
- Contents:
  - the unit number in display type and the вид;
  - the areas (застроена, идеални части, обща) as dimension-line rows;
  - изложение where the sheet has it;
  - the status chip;
  - Цена, if present;
  - the per-apartment plan, if any (Многофамилна `apartmentImages.js`);
  - previous/next.
- Actions:
  - **free or reserved:** „Изпратете запитване" (→ `/contact?project=…&apartment=А 301`) and „Обадете се" (tel:);
  - **sold or blocked:** the status and „Вижте свободните на етажа".

**Garages and parking** (Golden Residence): a compact summary plus a list on demand. No 113-tile wall.

**State**
- The URL holds `?floor=` and `?unit=`, rendered after `useHydrated()`.
- Keyboard:
  - bands and index rows are buttons;
  - ↑/↓ change floors in the floor view;
  - Enter opens;
  - Esc closes.
- Status comes only from `propertyStatus.js` (§9).

### 8.7 Обекти (`/blog`)

- The production H1 and the filter **„Всички проекти 7 / Завършени проекти 6 / Груб строеж 1"**, a three-option segmented control.
- **A register:** one vertical layout at every width.
  - Each work is a plate: the graded cover at or below its native size, the name, the place, the type, and the year only where the client confirms it (§14).
  - Construction-stage covers are swapped for finished ones where one exists.
- Opening a work grows the viewer from its plate (Flip, uniform). It shows all photos plus „За проекта" and „Особености" (production text).
- Closing (production): „Имате идея за проект?" with „Свържете се с нас" and „Поръчайте оферта".

### 8.8 За нас (`/about`)

1. **Opening:** the emblem draws itself (CSS, ≤ 1.6 s), then the H1 „Добре дошли в КСМ Строй ООД" and the production introduction.
2. **Story „Традиция и иновации от 2008"** (production):
   - the founders and Буково;
   - **the motto as the page's moment (ReadingText)**;
   - коректност / бързина / точност as three stacked words.
3. **A strip of the About photos** (slider01–03 masters): drag/scroll, no autoplay.
4. **Values** (production: Качество, Точност, Иновации) and **the production stats as plain text** (15+ години опит, 200+ завършени проекта, 50+ доволни клиенти, 100% качество и гаранция).
5. **Who we are:** production „Кои сме ние?" plus the client brief's team paragraph and specialists list.
6. **What we offer:** the client's activity list (Екстериор / Интериор / ВиК и електро / Ремонти), with the production „Защо да изберете КСМ Строй ООД?" checklist.
7. **Mission and vision** (production), then **the call to action** (production): „Готови сте да работите с нас?"

### 8.9 Контакти (`/contact`)

- The production H1 and intro.
- **Form** (production fields and validation; the payload shape is unchanged and contract-tested):
  - with `?project=` or `?apartment=`, the form shows a fixed line „Запитване за: Golden Residence, апартамент А 301", hides **Тип проект** and **Бюджет**, and still sends both keys (`projectType` = the project name, `budget` = „Не е посочен");
  - the message is pre-filled: „Здравейте, интересувам се от апартамент А 301…";
  - a required consent checkbox, client-side only: „Съгласен съм личните ми данни да бъдат използвани за връзка по това запитване.";
  - the success state takes focus;
  - an error names the field and the fix.
- **Details:**
  - both offices with „Отвори в Google Maps" links (no iframe; v1 owner decision);
  - both phones and the email;
  - hours: Пн–Пт 8:00–18:00, Сб 9:00–14:00, Нд почивен ден.
- **Closing** (production): „Готови сте да започнете своя проект?", with „Получете безплатна оферта" and „Обадете се сега".

### 8.10 EU project (`/eu-proekt`)

The teammate's text from `origin/vidimost-es` (description, aims, budget, dates, disclaimer), with the logos and the poster PDF, laid out as a document page.

---

## 9. Data and status rules

- `src/utils/propertyStatus.js` is the single source:
  - precedence: sold > reserved > blocked > available;
  - an empty cell is available;
  - unknown text passes through, and the UI shows it as „Няма информация".
- **Floor:**
  - green if ≥ 1 free;
  - amber if 0 free and ≥ 1 reserved;
  - red ("sold out") when every unit is sold or blocked.
  - On the Многофамилна facade, lit = ≥ 1 free.
- **Golden Residence sources:** Блок А, Блок Б, Гаражи, Паркоместа, plus the optional Цена. **Многофамилна:** `VITE_GOOGLE_SHEET_MNOGO_A/B` when set; otherwise dated fallback data. Both go through `api/availability`, with a direct-fetch fallback.

---

## 10. Budgets and quality bar

**Speed** (mobile lab Lighthouse, ×3 median, on `/`, the Golden Residence page and an explorer)

| Metric | Budget |
|---|---|
| LCP | ≤ 2.5 s |
| CLS | ≤ 0.02 |
| TBT | ≤ 150 ms |
| Bytes requested before LCP | ≤ 250 kB |
| LCP image | ≤ 60 kB mobile, ≤ 200 kB desktop |
| First-load JS per route, gz (React, the router and app code; GSAP and Lenis are deferred) | ≤ 160 kB |
| Motion chunk, gz | ≤ 60 kB |
| Flip, gz | ≤ 10 kB, lazy |
| Fonts on first load | ≤ 90 kB |
| Hero clip | ≤ 2 MB |
| Other loops | ≤ 1.5 MB each |
| Rise bytes | desktop ≤ 3.2 MB, mobile ≤ 0.8 MB |
| Rise decoded memory | ≤ 150 MB desktop, ≤ 60 MB mobile |

**Smoothness:** §5.5.

**Accessibility**
- WCAG 2.2 AA;
- Lighthouse a11y ≥ 98 on every route;
- a full keyboard path through the explorer;
- real dialogs;
- reduced motion respected;
- a pause control on playing loops.

**SEO and best practices:** Best Practices 100; SEO 100 on a production-mode build.

**Browsers**
- current Chrome, Edge, Safari (macOS, iOS 18+), Firefox and Samsung Internet;
- the Facebook, Instagram and Viber in-app browsers;
- older browsers get the static page.

---

## 11. Assets

1. **Golden Residence media:**
   - film clips, posters, Rise frames, stills, the graded facade and plans, copied from `golden-residence/public` with a manifest;
   - the hero clip re-encoded (§6.6);
   - a portrait poster for phones.
2. **Многофамилна:**
   - the `sgrada1.jpg` 3308×2339 master, cropped, plus its **lights-off** twin and the **window mask** (built by a script, checked by eye);
   - block crops;
   - the brochure render;
   - the floor-plan masters;
   - the eight ~1100 px apartment-plan twins replace the 748 px ones.
3. **Обекти:** a graded set; covers chosen to avoid scaffolding where possible.
4. **Logo:**
   - the emblem redrawn as a **stroke** SVG over the 621×402 bitmap (circle, sun, tower with rungs, birds, clouds);
   - the KSM STROY wordmark as traced paths;
   - one-colour versions (ink, paper, gold-ink);
   - favicons (SVG, 32, 180, 512) and the og image.
   - The original vector is requested (§14).
5. **EU:**
   - `origin/vidimost-es:public/eu/eu-cofunded-bg.png` and `pkip.png`, optimised to WebP/AVIF at 1× and 2× (prefer an official SVG lockup);
   - `public/eu/plakat-ksm-stroy-a3.pdf`.

---

## 12. Testing and verification

- **Contract tests** (M0) stay green on every commit:
  - status;
  - the Odoo function;
  - the Contact payload, including the prefilled variant;
  - URLs;
  - EU visibility;
  - the dist branding guard.
- **Unit tests:** data and status, units, polygons, formatting (bg-BG, NBSP), config, map resolution, the availability API's merge logic.
- **Component tests** (behaviour, by role and text):
  - explorer flows (facade → floor → unit → inquiry);
  - the dialog;
  - filters, the menu, forms.

  Motion is off in jsdom.
- **Hydration tests:** prerender each route to HTML in Node, then hydrate in jsdom with console errors made fatal. Include deep-link variants.
- **Real browser (puppeteer):**
  - every route at 1440×900 and 390×844, DPR 2;
  - no console errors, no hydration warnings, no failed requests;
  - the explorer driven with a **real mouse**;
  - milestone screenshots for visual review;
  - the smoothness runs from §5.5.
- **Performance:**
  - Lighthouse mobile ×3 on `/`, the Golden Residence page and an explorer;
  - a per-route JS and bytes-before-LCP report;
  - font checks (digit widths, BGR forms).
- `npm run verify` = vitest + build + `check:dist`. Vercel's build runs the tests before the merge to `main`.

---

## 13. Delivery

**M0 Foundation** (running): the test harness and contract tests, the dead-code cleanup, the v1 engine and one status module, the golden-residence motion infrastructure.

**M1 Platform**
- The framework decision (the spike against its exit criteria), React 19.3, React Router 8.
- Hydration-safe hooks (§6.2) and the head scripts.
- The deferred motion chunk and `useMotion`.
- Tokens; the pinned fonts; the logo redraw.
- Primitives: Button, DimensionLine, ElevationMark, SplitLines, ReadingText, RollingNumber, ResponsivePicture, VideoBand, FrameSequence, StatusChip/Legend.
- The shell: header with EU line, mobile menu, footer and title block, SmoothScroll, view transitions, 404.
- The image pipeline; `api/availability`; SEO and meta; Vercel routing; review-host noindex.

**M2 The core:** Home, the Golden Residence page, and the explorer (shared by both projects). Screenshots to the user.

**M3:** the Многофамилна page (lights-off build), Продажби, Контакти (prefill, consent, adaptive fields).

**M4:**
- За нас, Обекти, the EU page;
- remove the legacy pages, framer-motion, swiper and the legacy Tailwind palettes;
- a full pass against §10; docs.

**Launch**
1. The client reviews on a public noindex review URL. The user sets up a second Vercel project whose production branch is `redesign-v2`.
2. Merge `main` in one last time.
3. Merge into `main` as a merge commit.
4. A 15-minute smoke test: an Odoo test lead, the health check, the EU block, old URLs, and counts matching the agency site.
5. Instant Rollback is ready.

Nothing is pushed or deployed without the user's go-ahead. Merge `main` into `redesign-v2` (never rebase) after every production hotfix.

---

## 14. Client and user decisions (defaults we build with)

1. **EU visibility.**
   - Default: the EU line in the header on every page, plus `/eu-proekt`, plus the Home section.
   - The teammate's code says the emblem must be visible without scrolling, so production may be non-compliant today. Landing `origin/vidimost-es` on `main` now is the user's call.
2. **Многофамилна: still on sale? Current availability?** Its data dates from 2025-12-01, and its sheets were never published.
   - Default: dated counts, never the largest on a page.
   - Better: the owner publishes the А/Б tabs, or sends a fresh snapshot.
   - If it's sold out, it leaves the opening and Продажби and becomes a completed work.
3. **Golden Residence inquiries on ksmstroy.com.** Default: KSM's phone and Odoo, as today. Alternative: Diana Homes' contacts.
4. **The Golden Residence introduction.** Default: the landing's paragraph without „Диана Хоумс представя".
5. **A link to goldenresidence.dianahomes.bg.** Default: no.
6. **The original vector logo.** Requested; we ship a redraw meanwhile.
7. **Decisions from the v1 round that v2 deliberately changes:**
   - "intro reveal yes" and "curtain transitions yes" become no load gate and a crossfade/shared-element transition. They cost about 1.9 s before content, which works against "loads quick";
   - the production hero images `photo-4`/`001` become the film band, which is the client-accepted Golden Residence look;
   - kept: the prominent logo, no custom cursor, the Contact map removed (link instead), Блок А = the left half, Многофамилна garages hidden.
8. **The Lenis touch feel.** Default: native touch scrolling (smooth wheel on desktop). The landing used synced touch; we can show both on a real iPhone.
9. **Budgets in лв.** Bulgaria has used the euro since 2026-01-01. Default: keep as is; we recommend converting.
10. **Contradictions to confirm:**
    - Многофамилна floors (9 vs 10);
    - the Golden Residence unit types ("1–4 стаен" vs the sheets' 2-стаен/3-стаен/Ателие);
    - the two versions of the working hours;
    - „Санитарно обновяване" vs „Саниране";
    - the stale Golden Residence line „Очаквайте скоро отваряне за продажба";
    - the years and details of the Обекти works.
11. **Privacy notice (GDPR) for the form.** The client supplies the text. Default: the consent checkbox only.
12. **Previews.** Default: nothing pushed until the user says so.
    - Pushing the branch gives a login-only Vercel preview (production untouched). That is the only way to verify the `/api` functions and the router build before M2.
    - A second Vercel project gives the client a public review URL.

---

## 15. Approaches considered

**A. Merge `main` into the old `redesign` and build on it.** Rejected: its Framer layer, explorer UI and pages would all be replaced. The merge also had silent traps: the EU poster dropped, Блокиран shown as „Няма данни", the honeypot survived.

**B. A fresh branch from `main`, rebuilding everything.** Rejected: it throws away the paid-for explorer engine and the client-accepted golden-residence stack.

**C. Chosen: a fresh branch from production `main`,** porting v1's engine and golden-residence's foundation. Production truth is the default, and each replacement is an explicit, tested diff. Three independent reviews chose it.

**D. A new framework (Astro / Next).** Rejected:
- Astro means a rebuild with islands;
- Next's static export breaks the Odoo proxy;
- React Router framework mode prerenders within the same React tree.
