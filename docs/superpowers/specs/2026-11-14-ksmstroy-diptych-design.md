# ksmstroy.com v2: Diptych design spec

- **Date:** 2026-11-14.
- **Status:** binding for M2: Home, the Golden Residence page and its explorer. M3 and M4 restyle the other pages in this system.
- **Branch:** `redesign-v2` in `C:/ksm-stroy/ksm-stroy-v2` (M1 done at `1b4a6f2`).
- **Replaces** these parts of `docs/superpowers/specs/2026-11-13-ksmstroy-redesign-v2-design.md` (the "v2 spec"):
  - §2 (direction) and §3 (palette, type, motifs, layout, imagery);
  - §5.2 rules 2–5 and 12, §5.3 and §5.4 (motion moments);
  - §8.1 (chrome), §8.2 (Home), §8.4 (Golden Residence) and §8.6 (explorer UI);
  - from the M1 ledger, decisions A2 (buttons), A3 (first screen) and A5 (type ladder), and rulings D1–D7.
- **Keeps by reference**, amended only where this spec says so: §1, §4 (voice and content), §5.1 (engine), §5.5 (smoothness), §6 (architecture), §7 (IA), §9 (data and status), §10 (budgets), §11, §12 (verification), §13 and §14.
- **Visual reference:** the live concept `C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/`. It consists of `index.html`, `golden-residence.html`, `css/diptych.css` and `js/{core,home,gr,explorer}.js`, with screenshots in `../shots/`.
- **Extraction:** `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-extract.md` (the "extract") records the concept's values with file:line references.
  - Where this spec points to it, the extract is binding.
  - Where this spec differs from the concept, this spec wins.
  - Where this spec is silent on a visual detail, match the concept's CSS.

## 1. Intent and the user's decisions

KSM comes in pairs: two buildings, two blocks, two founding brothers, two ways to find a flat. So one thin brass seam splits every key screen, and pages change through two closing doors. The look is black and gold, kept quiet:
- one warm near-black, one gold and warm ivory text;
- gold only as a line, the one italic word in a heading, or an active state;
- never gold fills or gradients.

The user's decisions are binding:
1. **Direction.** Diptych, as the live concept shows it.
2. **Slogan A** opens Home. The H1 „Създаваме пространства за мечтания живот“ is set so each row reads across the seam: row 1 „Създаваме | пространства“, row 2 „за мечтания | живот“.
   - „мечтания“ is the brass-light italic word.
   - Phones show two clean lines.
   - The concept's slogan switcher is not built.
3. **„Нашите услуги“** comes from concept 1, as Diptych shows it.
   - The heading is „Строим, ремонтираме, завършваме.“, a new line the user approved.
   - Three columns carry outlined brass numerals 01/02/03 and the hover reveal. They stack on phones.
4. **Palette.** Black and gold, never blue or paper-white grounds. The v2 paper/ink/dusk design is void.
5. **The explorer is the centrepiece**: "better indications on hover per floor for the availability with the green, red etc colors". It works like this:
   - Free counts per floor sit on each block's outer edge.
   - Hovering a floor slides in a panel from that block's edge, with the floor's plan in status colours.
   - A click opens the full plan, a unit table and a unit panel.
   - There are two ways in, „Визуално“ and „По критерии“.
   - Status always shows as colour plus pattern, glyph and word.
6. **Motion.** "nice animations and transitions, smooth scrolling": Lenis on GSAP's ticker, the seam intro once per session, and the two-door page transition.
7. **Inquiries.** Golden Residence inquiries go to KSM's Odoo through `/api/odoo-lead` (A1).
   - A teammate owns `api/odoo-lead.js`. It is never modified.
   - Inquiries from any build other than production are marked „[ТЕСТ]“ (§10).
8. **Copy comes from production:** the legacy pages and `src/assets/*/content.txt`. The motto „ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА“ is production copy (About).
9. **EU visibility is mandatory:**
   - the EU line on every page, visible on landing;
   - the production EU poster section on Home, with project BG16RFPR001-1.012-1485-C01 and `/eu/plakat-ksm-stroy-a3.pdf`.
10. **Многофамилна's counts** stay labelled „по данни към 01.12.2025“ until its sheets are published. Its page comes in M3.
11. **Previews.** The preview shows the new design early, Home first, then Golden Residence. The user judges each one by eye. From the Home opening on, the preview updates after every task, and each update comes with one line on what it now shows and what is still legacy or temporary.

The decisions this spec had to take are in §14.

## 2. Tokens

### 2.1 Colour

The single source is `src/styles/palette.js`. It feeds both Tailwind and the `:root` variables.

| Token | Value | Role |
|---|---|---|
| `onyx` | `#0E0D0B` | Page ground, dark halves, text on ivory fills, `theme-color` |
| `umber` | `#1A1714` | Second halves and panels: footer and menu right halves, dialogs, plan stage, services columns, works media, parking, phone sheet |
| `umber-2` | `#211D19` | The plan stage's side column and its sticky table header |
| `ivory` | `#EFE9DD` | Text; the solid action's fill; pressed pills; the skip link |
| `ivory-2` | `rgba(239, 233, 221, 0.82)` | Secondary text: leads, paragraphs |
| `ivory-3` | `rgba(239, 233, 221, 0.62)` | Tertiary text: footer blurb, EU text, sold rows |
| `stone` | `#9B9488` | Labels, small text, idle tabs, floor numbers |
| `hair` | `rgba(155, 148, 136, 0.3)` | Borders of boxes: dialogs, the unit panel, table header rule |
| `hair-2` | `rgba(155, 148, 136, 0.16)` | Section rules and row dividers |
| `hair-ctl` | `rgba(155, 148, 136, 0.62)` | **New.** Borders that identify a control: fields, pills, segmented controls, stepper, chips, gallery buttons. It reaches ≥ 3:1 (WCAG 1.4.11), where the concept's `hair` gave 1.6:1. |
| `brass` | `#B8954A` | The seam, rules, `em` in h2/h3, link underline, outline border, outlined numerals, chevrons, the door mark |
| `brass-l` | `#D8BD7A` | Hover and active states, `em` in display titles, hot counts, underlines that draw, facade highlight, the glint |
| `status-free` | `#4FBF85` | Свободен |
| `status-reserved` | `#E9953F` | Резервиран |
| `status-sold` | `#D4574E` | Продаден, and invalid fields |
| `status-blocked` | `#8A867D` | Блокиран |

- **Off-token values:** `#FFFFFF` (solid hover, poster plate) and `#F7F4EE` (the plate behind the EU logos, whose lettering is dark).
- **Overlays and alpha values:** exactly as in the extract's §1.2.
- **Grain:** fractal noise at opacity 0.045, fixed over every non-legacy page.
- **Retired:** `paper`, `ink`, `dusk`, `light`, `gold-ink`, `graphite`, `rule`, `bronze-ink` and `status-free-deep`.
- **Legacy palettes** stay until M4, and Diptych's `ivory` becomes the `DEFAULT` of the legacy `ivory` shades.
- **Contrast floors** (tested):
  - ivory on onyx ≥ 12;
  - ivory-3 on onyx ≥ 4.5;
  - stone on onyx and on umber ≥ 4.5;
  - brass on onyx ≥ 4.5;
  - each status, and `hair-ctl`, on onyx and on umber ≥ 3.

### 2.2 Space, lines, depth, breakpoints

- **Gutter and width.** `--gut: clamp(20px, 3.6vw, 60px)`. There is no max-width container.
- **Page length.** Anything that sets page length uses `--screen-h`, never `vh`/`svh` (v2 spec §3.4). Where the concept writes `vh`, use the same factor of `--screen-h`. For example, sections get `clamp(96px, calc(var(--screen-h) * .16), 180px) 0`, and `88px 0` on phones.
- **Seam-side padding of a half:**
  - `clamp(28px, 4vw, 80px)`: company, contact, ways;
  - `clamp(28px, 5vw, 96px)`: footer, works list, blocks, parking;
  - `clamp(28px, 5vw, 104px)`: story.
- **Hinge.** The gap to the seam is `clamp(24px, 3vw, 52px)` on each side. The space below is `clamp(56px, calc(var(--screen-h) * .09), 104px)`. The seam overshoots 18 px.
- **Radii.** None, except status discs and the 1 px radius of the focus ring.
- **Shadows.** Only three:
  - the phone sheet `0 -24px 60px rgba(0,0,0,.55)`;
  - the hero title's `text-shadow: 0 2px 30px rgba(14,13,11,.45)`;
  - the glint `0 0 16px 1px rgba(216,189,122,.7)`.
- **Layers.** The order is the concept's, scaled so the legacy modals (`z-50`) still sit above the header:

  | Layer | z-index |
  |---|---|
  | header | 40 |
  | phone sheet | 45 |
  | plan stage | 50 |
  | morph clone | 51 |
  | unit panel | 52 |
  | menu | 60 |
  | grain | 70 |
  | intro | 80 |
  | skip link | 90 |

- **Breakpoints.**
  - Halves sit side by side from 901 px, the Tailwind screen `split`; below that they stack. Small phones are 560 px and under.
  - The header bar is 76 px, 64 px at 900 px and under. The EU row is 36 px everywhere.
  - Hover effects need `(hover: hover) and (pointer: fine)`, and Tailwind's `hoverOnlyWhenSupported` is on.

## 3. Type

### 3.1 Families and loading

| Family | Face | File | Weights |
|---|---|---|---|
| `KSM Display` | Cormorant Garamond | `public/fonts/ksm-display.woff2` | variable, 500–600 |
| `KSM Display` (italic) | Cormorant Garamond Italic | `public/fonts/ksm-display-italic.woff2` | static 500 |
| `KSM Text` | Manrope | `public/fonts/ksm-text.woff2` | variable, 400–600 |

- **Names.** The M1 family names stay, so `font-display` and `font-text` keep working.
- **Build.** `scripts/fonts/build-fonts.py` builds each face as one file from the google/fonts masters, pinned with sha256.
  - Each file holds Cyrillic, Basic Latin and the copy's punctuation.
  - The build keeps `locl` (BGR), `kern`, `case` and `tnum`, and freezes lining figures into Cormorant.
- **Budget.** The three files together stay ≤ 90 KiB; the estimate is about 84 KB. If they are over, narrow the coverage to the copy's characters. Never raise the budget.
- **Fallbacks** are metric-matched faces, one per weight band, and Display also gets italic ones:
  - Display: Georgia, Times New Roman, Noto Serif (Android);
  - Text: Segoe UI, Arial, Roboto (Android).
- **Preloads.** The root preloads `ksm-text.woff2`, the shell's face. Home, the Golden Residence page and the block routes add both Display files from their own `links`.
- **Language.** `<html lang="bg">` stays, for the Bulgarian letterforms.
- **Weights in use.** Cormorant 500, and 600 for numerals. Manrope 400 for body, 500 for labels and buttons, 600 for ids and strong text. `font-synthesis: none`.

### 3.2 Roles

The phone value follows "/". Serif means Cormorant 500 at `-0.005em` unless noted.

| Role | Face | Size | Line-height |
|---|---|---|---|
| Home H1 | serif, `-0.01em` | `clamp(46px, 5.7vw, 98px)` / `clamp(28px, 8.4vw, 46px)` (two lines down to 320 px) | 1.06 / 1.08 |
| GR H1 | serif, `-0.012em` | `clamp(54px, 8.6vw, 148px)` / `clamp(48px, 13.5vw, 80px)` | 0.9 |
| h2 | serif | `clamp(40px, 4.6vw, 76px)` | 1 |
| h3 | serif | `clamp(30px, 2.6vw, 44px)` | 1.05 |
| Motto | serif italic | `clamp(48px, 6vw, 104px)` | 0.98 |
| Triad | serif italic, ivory | `clamp(28px, 2.4vw, 38px)` | 1 |
| Lead | Manrope, ivory-2, max 34em | `clamp(16px, 1.16vw, 18px)` | 1.65 |
| Body / long paragraphs | Manrope | 16px / 17px | 1.6 / 1.7 |
| Small, label | Manrope, stone (label 500, `.02em`) | 13px | 1.5 / 1.3 |
| Micro (table heads, `dt`) | Manrope, `.02em` | 12px | — |
| Button | Manrope 500, `.03em` | 14px (small 13px) | 1 |
| Counts (hero, GR facts) | Cormorant 600 | `clamp(40px, 3.6vw, 60px)` / 40px | 0.9 |
| Services numerals | Cormorant 500, 1 px brass stroke, opacity 0.58 → 1 | `clamp(110px, 11vw, 184px)` / 92px | 0.84 |

The other sizes are binding as the extract's §2.2–2.3 gives them. That covers company facts, metro, parking, facade counts (whose desktop size §7.2 ties to the floor pitch), menu links, tabs, panel, stage and unit titles, block names and the thank-you line.

### 3.3 Setting rules

- **Italics.**
  - `em` is the only italic in a heading, one word: brass in h2/h3, brass-l in display titles. Display titles are the H1s, motto, panel, stage and sheet titles, unit id and block name.
  - Italic only at 28 px and up. The single exception is the compact caption at 26 px.
  - The motto and the triad are the only whole italic runs.
- **No eyebrow labels and no tracked capitals.** Sentence case throughout.
- **Figures** are lining everywhere. They are tabular in tables, rails, phone numbers and the stepper.
- **Bulgarian typography.**
  - Quotes „…“ and a spaced en dash for ranges.
  - A non-breaking space after one-letter words and „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“.
- **Masks never clip a glyph.** This fixes extract §8.3.1.
  - Every line mask gets `padding: .12em .14em .26em; margin: -.12em -.14em -.26em`.
  - Split headings are reverted once they land.
- **The triad renders at its role size.** This fixes §8.3.2.
- **▲▼ are SVG**, because neither font has them.

## 4. Layout and the seam

- **Sections are full-bleed `1fr 1fr` grids**, so the seam is the page's centre. The exceptions:
  - the plan stage body, `minmax(0, 1fr) minmax(320px, 400px)`;
  - services, three flex columns;
  - form rows, `1fr 1fr` with a 22 px gap.
- **`<Seam>`** is 1 px of brass at 50 %. With `data-draw` it draws `scaleY 0 → 1` over 1.3 s `expo.out` when its parent reaches `top 82%`.
- **The hinge.**
  - Desktop: the h2 is right-aligned and ends at the seam; the lead starts after it.
  - Phones: one column. The lead gets a brass `border-top` with 22 px above and below.
- **At ≤ 900 px:**
  - every grid stacks and the seams hide;
  - the second half gets `border-top: 1px solid var(--brass)` and `margin: 0 var(--gut)`;
  - right-aligned halves turn left-aligned;
  - images come first.
- **Each screen's seam** is as in the extract's §3.2. The Home hero's seam is the property `--s` (§6.7). The EU dialog is not built.
- **Header heights.** `--eu-h: 36px`, `--bar-h: 76px` (64 px at ≤ 900 px), `--header-h: calc(var(--eu-h) + var(--bar-h))`.
  - Overlay pages start at y = 0. Others start below `--header-h`.
  - `html { scroll-padding-top: var(--bar-h) }`.

## 5. Motion

### 5.1 Engine

The v2 spec §5.1 engine stays as it is:
- GSAP 3.15 (ScrollTrigger, SplitText) and Lenis 1.3 are one deferred chunk;
- `useMotion` runs from an idle queue;
- only `src/motion/` imports `gsap` or `lenis`.

**Flip** is a separate lazy chunk (`src/motion/flip.js`, ≤ 10 KiB gzip), used only by the „Визуално / По критерии“ switch.

### 5.2 The gate: `html.js`

**The head script.** `MOTION_GATE_SCRIPT` runs inline in `<head>`, right after `SCREEN_HEIGHT_SCRIPT`.
- It adds `js` to `<html>` when three things hold:
  - `matchMedia` exists;
  - `prefers-reduced-motion` is not `reduce`;
  - `navigator.connection.saveData` is not `true`.
- On path `/`, when `sessionStorage['ksm-intro']` is unset, it also adds `intro` and sets the flag at once, so no later load in the session plays the intro. Within the document the class stays, and §5.5 keeps the intro to the first page the app renders.

**Hydration.** The Layout renders `<html lang="bg" suppressHydrationWarning>` and never a `className` there.
- This amends v2 spec §6.3: this one class is the single attribute a script writes on `<html>`.
- The reason: the load moment must start before first paint.

**What keys off the gate.**
- CSS motion keys off `:root.js` (the Tailwind variant `js:`). Hand-written keyframes also sit inside `@media (prefers-reduced-motion: no-preference)`. If the setting changes while the page is open, the base rule that cuts animations to 1 ms covers everything else.
- JS motion keys off `useMotionAllowed()`, which applies the same conditions and follows changes.

### 5.3 Lenis

- **Settings.** `lerp: 0.1`, `wheelMultiplier: 1`, `syncTouch: false` (native touch), `allowNestedScroll: true`, `autoRaf: false`. It runs on `gsap.ticker` with `lagSmoothing(0)`.
- These are the concept's values. They replace the v2 spec's 0.07 / 0.8.
- **In-page jumps** (`scrollToId`) glide 1.5 s with `expo.inOut`.
  - Every same-page link (`href="#…"`) goes through one handler. It cancels the router's instant jump (`preventDefault`), calls `scrollToId`, and focuses the target with `preventScroll`. The router's location does not change, so `LenisScrollSync` never cuts the glide short.
  - An action that also presets the inquiry (§7.7, the Многофамилна half, the parking actions) starts its glide in the first animation frame in which no scroll lock is held. A dialog closed by the same click has then released Lenis.

### 5.4 Eases and durations

| Variable | GSAP | CSS |
|---|---|---|
| `--e-out` | `expo.out` | `cubic-bezier(.16, 1, .3, 1)` |
| `--e-soft` | `power2.out` | `cubic-bezier(.33, 1, .68, 1)` |
| `--e-io` | `expo.inOut` | `cubic-bezier(.87, 0, .13, 1)` |
| `--e-in` | `expo.in` | `cubic-bezier(.7, 0, .84, 0)` |

- **Where each ease goes:** `expo.out` for entrances, `expo.inOut` for doors, wipes and morphs, `power2.out` for hovers.
- **Durations:**

  | Motion | Duration |
  |---|---|
  | line rise | 0.9 s, stagger 0.1 |
  | fade-up | 1 s, 16 px |
  | seam draw | 1.3 s |
  | image wipe | 1–1.2 s, with the image settling 1.08–1.14 → 1 over 1.3–1.6 s |
  | panels in / out | 0.45–0.5 s / 0.35 s |
  | CSS hovers | 0.2–0.35 s |

### 5.5 The first viewport: CSS only

**The markup is the final state.** The first viewport's motion is CSS keyframes, and their hidden starting states exist only under `:root.js`. So it plays from first paint and never replays when hydration lands.
- The LCP image is never faded. It only settles in scale.

**`--arrive` delays every entrance:**

| Case | Delay |
|---|---|
| first load | `0s` |
| under `.intro` | `.95s` |
| a page reached through the doors (`[data-arrive="doors"]`) | `.52s` |
| the hero move (`[data-arrive="hero"]`) | `0s`, and the image does not settle again |
| Back or Forward (`[data-arrive="pop"]`) | `0s` |

Only the first page the app renders has no `data-arrive`, so only it inherits `.95s` from `:root.intro`.

**The intro** plays on Home, once per session (`:root.js.intro`), and only on the first page the app renders: `:root.js.intro [data-arrive] .intro-doors { display: none }`. The `intro` class stays on `<html>`, so this rule is what stops a later return to Home in the same document (a link, or Back to the first entry) from replaying it. The intro covers the page and the header for 1.8 s in all.

| t | What |
|---|---|
| 0 | the seam draws down the centre, 0.6 s `expo.out` |
| 0.2 s | the KSM mark draws: 26 paths, dashoffset 1 → 0 over 0.55 s, path *i* delayed `(i mod 13) × 6 ms` |
| 0.9 s | the doors part, to −101 % and 101 %, 0.8 s `expo.inOut` |
| 0.95 s | the hero entrance starts |
| 1.55 s | the seam fades, 0.25 s |
| end | `visibility: hidden` |

The mark is the emblem split down its axis: 92 × 105 px, brass, stroke 2.6.

**The Home entrance.**
- The images settle `scale 1.12 → 1` over 1.4 s.
- The four slogan parts rise `translateY(112%) → 0` over 0.9 s, at `--arrive + .25s + i × .1s`. The order is row 1 left, row 1 right, row 2 left, row 2 right.
- The two info blocks fade up 22 px over 1 s, at `--arrive + .45s + i × .1s`.

**The Golden Residence entrance:**

| What | Normal | Hero move |
|---|---|---|
| image `scale 1.12 → 1`, 1.4 s | 0 s | — |
| the two title words rise, 0.9 s, stagger 0.1 | 0.25 s | 0.05 s |
| address fade-up, 14 px | 0.45 s | 0.2 s |
| facts seam draws | 0.55 s | 0.3 s |
| facts fade-up, stagger 0.08 | 0.6 s | 0.32 s |
| actions fade-up | 0.7 s | 0.42 s |

### 5.6 The doors

The route change runs through React's `<ViewTransition>` in `RouteTransition`: keyed by pathname, with the classes `page-out` and `page-in`. It is all CSS.

| t | What |
|---|---|
| 0–400 ms | the old page closes, `clip-path: inset(0) → inset(0 50% 0 50%)`, `expo.inOut`: two onyx doors meet at the seam |
| 0–120 ms | a 1 px brass seam appears at the centre |
| 400–520 ms | glint: brass-l with the glow for 60 ms, then brass for 60 ms |
| 520–1120 ms | the new page opens, `inset(0 50% 0 50%) → inset(0)`, 600 ms `expo.out`; the seam fades from 670 ms over 300 ms |

- **What closes.** The doors close the whole view, not only the page:
  - the page's own group (`page-out` / `page-in`);
  - the root snapshot, which holds the footer, the grain and the ground. `::view-transition-old(root)` and `-new(root)` run the same keyframes, so a footer link closes like any other;
  - an open menu (§6.4). It is its own group, `site-menu`, painted above the page, so the doors close over it as in the concept.
  - What the doors uncover is onyx: `::view-transition` carries `background: var(--onyx)`.
- **The header** is its own transition group. It stays on top and switches at once.
- **The mark** shows only in the intro.
- **Arrival.** `RouteTransition` decides it when a page mounts, from a first-render ref. It never compares location keys: React Router gives the first entry the key `"default"`, and Back restores it.
  - The first page the app renders (prerendered, then hydrated) carries no `data-arrive`.
  - A page mounted by Back or Forward carries `pop`.
  - The hero move's target carries `hero`.
  - Any other client navigation carries `doors`.
- **The hero move** (§6.7) suppresses the doors for its one navigation with `html.vt-cut`.
- **Reduced motion, or no `.js`:** a 200 ms crossfade instead of the doors.
- **Back/Forward:** instant. A `popstate` sets `vt-cut` before the router commits, so no doors run, and the page enters at `--arrive: 0s`.
- **Unsupported browsers:** instant.
- **After a route change:**
  - `LenisScrollSync` waits up to `TRANSITION_MAX_MS = 1400` before `ScrollTrigger.refresh()`.
  - Focus moves to `#main` (with `preventScroll`), but not on the first load, nor on a hash or query change.
- **Prefetch.** Links in the menu, the footer and the hero halves use `prefetch="intent"`.

### 5.7 Scroll- and action-driven motion

GSAP takes this over after load. Each reveal plays once.

| Marker | What it does |
|---|---|
| `data-split` | SplitText lines rise `yPercent 112 → 0`, 0.9 s, stagger 0.1, at `top 88%`; reverted on landing |
| `data-fade` | body copy fades in from `opacity 0, y 16`, 1 s, at `top 92%` |
| `data-draw` | the seam draws `scaleY 0 → 1`, 1.3 s, when its parent reaches `top 82%` |

- **No replays.** An element already in view when its setup runs stays as it is.
- **Restraint.** No parallax, no fades on photos, no reveals in the first viewport. The one image that fades in is the cut-out facade in the explorer's intro (extract §4.20), which stays as the concept has it.
- **Component motion** follows the extract's §4, which is binding: menu (§4.3), services (§4.11), works (§4.12), story (§4.18), gallery (§4.28), facade intro (§4.20), edge panel (§4.21), plan stage morph (§4.23), unit panel (§4.24), phone sheet (§4.25) and block cells (§4.27). Two motions are new:
  - the views switch runs through Flip, 0.7 s `expo.inOut`;
  - form success rises 18 px over 0.8 s, stagger 0.08.

- **Counts** roll only when the value changes, through `RollingNumber` (`—` → 69). They never roll on hover; this replaces the concept's roll on widening.
- **Without the engine,** or without motion, every state change is instant. GSAP only animates; React renders the final state.

### 5.8 Reduced motion and Save-Data

When either applies:
- no Lenis, intro, entrances or reveals;
- the hero halves stay at 50/50;
- no sticky story or works media, and inline figures instead;
- the services columns stay equal and only fade (0.25 s);
- the menu fades in 0.2 s;
- panels, sheet and dialogs appear at once, without the morph;
- route changes are a 200 ms crossfade;
- counts don't roll.

Hover, focus and status feedback stay.

### 5.9 Changes to v2 spec §5

- **Kept:** rules 5.2.1 (markup is final), 5.2.2 (first viewport in CSS only) and 5.2.7 (compositor-only: the widening animates a registered property, transforms and clip-paths). Rule 5.2.3 is kept as "the LCP is never faded".
- **Changed:** 5.2.4 becomes the 1.8 s once-per-session intro, by the user's decision. 5.2.5 and 5.2.12 give way to §5.7 and §5.4, the 5.3 crossfade to the doors, and the 5.4 catalogue to §5.5–§5.7.

## 6. Components

The values come from the extract's §4 unless this section changes them. Port each component's CSS from `css/diptych.css` into its own stylesheet, and keep the concept's class names.

**6.1 Actions** (`Button`, extract §4.4)
- **Variants:**

  | Variant | Look | Hover |
  |---|---|---|
  | `outline` (default) | 1 px brass border, ivory label, `min-height: 52px`, `padding: 0 28px`, 500 14 px, `.03em` | brass-l border on `rgba(184,149,74,.09)` |
  | `solid` | ivory fill, onyx label | `#fff` |
  | `link` | a 1 px brass underline drawn as a gradient | brass-l underline, white text |

- **Size.** `sm` is 40 px tall, `0 18px` padding, 13 px.
- **Arrow.** `arrow` adds an 18 × 10 SVG, hidden from assistive tech, that moves 4 px on hover.
- **Wrapping.** Labels stay on one line on desktop and may wrap on phones.

**6.2 Header**
- **Contents.** The logo (mark in brass, wordmark in ivory; 142 px wide, 120 px on phones), then:
  - „Меню“;
  - from 901 px, the phone `+359 887 886 166`;
  - from 901 px, `Button size="sm"` „Запитване“, which goes to `#zapitvane` on pages that have the inquiry (the handle's `inquiry: true`) and to `/contact?project=…` elsewhere.
- **No page links in the bar.** They are in the menu and the footer.
- **States.**
  - Overlay pages: the header is see-through over the scrim until the page has scrolled 40 px.
  - After that it turns solid: `rgba(14,13,11,.86)` with `blur(14px) saturate(1.1)` and a `hair-2` line. The whole header moves up by `--eu-h`, so the EU row slides away and the bar stays.
  - It never hides.

**6.3 EU line** (`EuLine`)
- **Parts.** The co-funding lockup and the ПКИП logo sit on a `#F7F4EE` plate. Then come the text and „За проекта“ → `/eu-proekt`, with a 44 px hit box.
- **`row`** is the header's 36 px top row on every page. Its logos are 20 px tall.
  - The text takes the room the logos and „За проекта“ leave: a `minmax(0, 1fr)` box with `container-type: inline-size`, as in M1. No viewport breakpoint decides it.
  - The box shows the full text when it holds it through the project number: „Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027.“
  - Otherwise it shows the short text, when that fits through the number: „Проект № BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.“
  - Otherwise it shows nothing. An ellipsis may end the rest of a text, never the number.
  - The two container thresholds are measured in 13 px Manrope and its widest fallback face. In Manrope, the full text through „…C01, “ plus the ellipsis is about 483 px, and the short text through the number about 256 px.
- **`footer`** shows the full text with 28 px logos. **`menu`** shows the short text with 28 px logos.

**6.4 Menu** (`SiteMenu`, extract §4.3)
- **Mechanics.** A portal dialog named „Меню“, mounted only while open, with the scroll locked. The button that opens it keeps `aria-label="Меню"`, its visible label, so the smoke run finds both.
- **Left half: the links,** right-aligned against the seam:
  - Начало;
  - Golden Residence, with the live sub-line „жк Левски Г · {free} свободни“ („—“ while loading);
  - Продажби, Обекти, За нас, Контакти.
- **Right half:** production's labels Телефон, Работно време, Адреси, Имейл, and the EU line `menu`.
- **Close.** „Затвори“ in the bar.
- **Focus.** It moves to the first link (after 650 ms, or 50 ms without motion). Tab stays inside. Escape returns focus to „Меню“.
- **A page link** leaves the menu open until the router commits the new page. The menu is mounted only while the pathname it was opened on is current, so it unmounts in that same commit. Only the old snapshot holds it, and its group, `site-menu`, closes with the doors (§5.6). The current page's own link closes the menu at once, then navigates.

**6.5 Footer** (`SiteFooter`, extract §4.15)
- **Left half:**
  - the logo (156 px) and production's blurb;
  - Телефон, Работно време, Имейл;
  - Адреси, with „Отвори в Google Maps“;
  - Бързи връзки: the five pages, so every page's HTML keeps crawlable links.
- **Right half (umber):** the EU line `footer`, „© {year} КСМ Строй · КСМ СТРОЙ ООД“ and Facebook.
- **No title block.**

**6.6 Layout primitives.** `Seam`, the hinge, and the split section (§4).

**6.7 The split hero** (Home, extract §4.6)
- **Structure.** `section.hero#proekti`.
  - Height `max(640px, var(--screen-h))`, and `max(560px, var(--screen-h))` on phones. 640 px is shared with the GR hero, so the move lands exactly.
  - The H1 comes first in the DOM.
  - Two half links: Golden Residence → `/projects/golden-residence`, and Многофамилна → the inquiry with „Многофамилна“ selected.
  - Each picture spans the whole hero (`sizes="100vw"`) and is clipped at the seam.
- **The seam.** `--s` is a registered `<number>` with initial value 0.5, in a `container-type: inline-size` hero.
  - GR clips to `inset(0 calc((1 - var(--s)) * 100%) 0 0)`, MN to `inset(0 0 0 calc(var(--s) * 100%))`.
  - The seam line and the H1 move by `translateX(calc(var(--s) * 100cqw))`.
- **Centring.** Each building stays centred in its half, with these translations on the picture wrappers. The focal points are 0.68 and 0.73, and both translations are 0 on phones.
  - `--xg: min(0px, max(calc((var(--s) - 1) * 100cqw), calc(var(--s) * 50cqw - 68cqw)))`
  - `--xm: min(calc(var(--s) * 100cqw), max(0px, calc((1 + var(--s)) * 50cqw - 73cqw)))`
- **Framing.**
  - GR: `object-position: 50% 62%` (phones `70% 62%`).
  - MN: `70% 58%` (phones `72% 60%`).
- **Widening** is CSS only, on fine pointers from 901 px, under `:root.js`.
  - Pointing at or focusing GR sets `--s: .62`; MN sets `.38`.
  - The transition is 0.9 s `--e-out`, and the other half's shade drops to opacity 0.4.
  - Touch, pen, phones, reduced motion and Save-Data never widen.
- **Accessible names.**
  - GR: „Golden Residence, жк Левски Г: {n} свободни апартамента от 192. Изберете апартамент.“ (without the count clause until data arrives).
  - MN: „Многофамилна сграда, ж.к. Връбница-1: 16 свободни апартамента от 144 по данни към 01.12.2025. Запитване за сградата.“
- **The slogan.** Each part is a nowrap mask.
  - Desktop: the parts sit 0.2 em either side of the seam, at `top: calc(var(--header-h) + clamp(28px, calc(var(--screen-h) * .045), 64px))`.
  - Phones: two inline lines, broken after „пространства“, at `top: calc(var(--header-h) + 14px)`.
- **Phones: the seam moves down for the EU row.** The 100 px header pushes the slogan's last line down to about 185 px. On a real phone screen (about 664 px tall in Safari on a 390 × 844 iPhone), a seam at 50 % would put the Golden Residence info over it.
  - The horizontal seam sits at `--sy: clamp(50%, calc(var(--header-h) + 290px), calc(100% - 190px))`. It stays at 50 % on a hero 780 px or taller.
  - The GR clip, both picture boxes, the seam line and the GR info (`bottom: calc(100% - var(--sy) + 18px)`) follow `--sy`.
  - At 390 × 664, 375 × 667, 360 × 640 and 320 × 560, the H1 and the GR info never overlap.
- **The hero move.** It applies to a left click on GR on desktop, with a fine pointer, under `.js`, at scroll ≤ 8 px.
  - The hero gets `data-moving` and `--s: 1`, with a 0.8 s `--e-io` transition. Title and infos fade in 0.3 s, and the seam fades at 0.55 s.
  - At 800 ms: `cutNextTransition()`, then `navigate('/projects/golden-residence', { state: { arrive: 'hero' } })`.
  - The GR hero uses the same image and framing. Any other click goes through the doors.

**6.8 Company** `#za-nas` (extract §4.10)
- The motto blockquote, with brass „ “ and the `em` „реклама“.
- Beside it the story: the h2 set as an h3, two paragraphs, the triad between brass dashes, and three facts.

**6.9 Services** `#uslugi` (extract §4.11)
- **Layout.** A hinge, then a three-column umber row, `height: clamp(470px, calc(var(--screen-h) * .6), 600px)`. Each column is an `article` with `tabindex="0"`: photo, outlined numeral, title, and text at a fixed 23 em.
- **On hover or focus** (fine pointer, from 901 px):
  - the columns flex to `.78`, and the chosen one to `1.7`, over 0.8 s;
  - the photo opens from the bottom;
  - the numeral reaches opacity 1;
  - the text appears after 0.12 s;
  - a brass-l underline draws.
- **Touch tablets** show photos at 0.5 and the text always. **Phones** stack the columns.

**6.10 Works** `#obekti` (extract §4.12)
- Sticky media (`height: var(--screen-h)`) beside the list. Choosing a work wipes its photo in.
- All six works show production's cover photos. The concept's text plates are not built.

**6.11 GR teaser on Home** `#etazhi`
- The hinge, then the facade in compact mode (§7.2), the stale-data notice when §9 calls for it, then the ways nav:
  - „Визуално“ → `/projects/golden-residence#explorer`;
  - „По критерии“ → `/projects/golden-residence?view=list#explorer`.

**6.12 Closing inquiry** `#kontakti`
- Left half `#zapitvane`: the h2, the lead, phones, email (on GR) and hours.
- Right half: the form (§10), in the concept's style: underlined fields and a select with a brass chevron.

**6.13 EU poster section** `#es-proekt`, last on Home. It carries production's `EuPosterSection` content unchanged, as a split:
- **Left half:** the poster on a white plate, linking the PDF in a new tab (sr „(отваря PDF в нов раздел)“), captioned „Плакат във формат A3, PDF“.
- **Right half:**
  - the h2 „Дигитализация на предприятията“, with no italic word because it is the project's title;
  - „Проект, съфинансиран от Европейския съюз“, the paragraph, and the four facts;
  - outline „Отвори плаката“ and link „Изтегли PDF“ (`download="Плакат A3 - КСМ Строй.pdf"`);
  - the disclaimer.

**6.14 GR hero** `#top` (extract §4.17)
- The full-screen `gr-dusk` image (`max(640px, var(--screen-h))`), the H1 „Golden *Residence*“ and the address.
- The facts „192 апартамента в 2 блока“ | „{free} свободни в момента“.
- Solid „Изберете апартамент“ → `#explorer`, and outline „Запитване“ → `#zapitvane`.

**6.15 Story** `#sgradata` (extract §4.18)
- A sticky image half (`var(--screen-h)`) with four layers, the index „01 / 04“ and a caption.
- Four text blocks: the first is `var(--screen-h)` tall, the others `calc(var(--screen-h) * .84)`. Each wipes its image in.
- On phones, inline figures instead.

**6.16 Blocks in numbers** `#blokove` (extract §4.27)
- „Блок *А*“ and „Блок *Б*“, each with „96 апартамента · 8 етажа · 12 на етаж“.
- A 12 × 8 grid of unit cells. A click opens the unit panel.
- Type counts, plus exposure counts, or a note for block А.

**6.17 Gallery** `#galeriya` (extract §4.28). Three two-image spreads that open from the seam, a caption in a live region, ← → buttons and a counter.

**6.18 Garages and parking** `#garazhi` (extract §4.29)
- Each half shows the free count, a legend, a grid of cells (aria-hidden), and a `details` list of the free places.
- „Запитване за гараж“ and „Запитване за паркомясто“ select the garage option.

## 7. The explorer

### 7.1 Data per floor

- **What it shows.** Golden Residence has blocks А and Б, floors 1–8 and suffixes 01–12. For each floor the explorer shows its counts by status, its colour (§9) and the range of free areas.
- **Polygons** come from `src/data/maps/golden-residence.{building,floors}.json`. Explorer code imports these directly, never `src/config/projects.js`.
- **Unit ids.** A unit is named by its label („А 501“) in URLs, callbacks and the inquiry, and it is matched through `normalizeUnitId`.

### 7.2 Facade

- **Stage.** The sky-masked facade (`facade-cut`, a `<picture>` ladder) sits under an SVG on its 1200 × 599 grid, with the desktop viewBox `0 112 1200 454`. A brass seam runs at x 605 from y 120 to 520.
- **Layout is CSS only.** A wrapper carries `container-type: inline-size`, and the facade root inside it evaluates the sizes, because container units never resolve against the element that declares the container:
  - `--pw: clamp(284px, 20cqw, 380px)`;
  - `--sw: max(860px, min(calc((50cqw - var(--pw) - 18px) * 2.6087), calc((var(--screen-h) - 300px) * 2.6432), 1500px))`;
  - `--sh: calc(var(--sw) * 454 / 1200)`;
  - the stage sits at `left: calc(50% - var(--sw) * .504167)`, so x 605 is the page centre, and the root is `--sh + 100px` tall;
  - in compact mode, `--sw: max(860px, min(calc(100cqw - 340px), calc((var(--screen-h) - 300px) * 2.6432), 1180px))`;
  - `--pitch: calc(var(--sw) * 33.5 / 1200)`, the smallest gap between two floors on screen (floors 1 and 2). On phones it is measured on the crop: the stage's width × 33.5 / 628.
- **The 860 px floor.** Below about 1280 px the concept's formula shrinks the stage until the floors sit 15 px apart (at 1024 px) and the rails collide. From 901 px the stage is never narrower than 860 px, so floors stay at least 24 px apart. Between 901 and 1279 px an open edge panel may then cover its block's outer edge.
- **Phones** show one block at a time, picked with a segmented control.
  - The crop is `0 132 628 388` for А and `572 132 628 388` for Б. It is CSS: the stage has `aspect-ratio: 628 / 388` and offsets the full-width SVG and picture inside it.
  - Only the shown block responds.
- **SVG layers,** bottom to top:
  1. a mask holed at the hot floor;
  2. the onyx dim (0.6 while hot);
  3. the tint (the floor's colour at 0.2);
  4. the brass-l highlight (2 px dashed for the keyboard);
  5. the seam;
  6. sixteen floor paths, `aria-hidden`, which are pointer targets only.
- **Rails** are the per-floor counts on each block's outer edge. They are real buttons, eight per block.
  - The А rail is anchored at x 71 and reads floor · glyph · count. Б, at x 1129, is mirrored, so the count is always nearest the facade.
  - Each row is `min(30px, var(--pitch))` tall, at its floor's centre, so no two rows overlap.
  - Contents: the floor number (11 px stone; hidden on phones and below 1000 px, so the counts stay on screen), the floor colour's 10 × 10 status glyph (§7.9), and the free count. The count is serif 600, `clamp(24px, calc(var(--pitch) * .93), 28px)` on desktop and 24 px on phones, so it is always large text.
  - A zero count dims to `rgba(155,148,136,.65)`, 3.36:1 on onyx; the concept's 0.55 gave 2.71:1, under the 3:1 that large text needs. A hot count turns brass-l, and the others drop to 0.32.
  - The name reads „Блок А, етаж 5: 4 свободни, 2 резервирани, 6 продадени, 0 блокирани. Enter отваря плана.“ The button also holds a visually hidden element whose own text is exactly „етаж 5“; the availability contract finds the floor by it.
- **Hot floor.** A floor becomes hot on mouse-over (its path or its rail row), keyboard focus or a first tap.
  - The lens, tint and highlight move to it, and its count turns hot.
  - The edge panel (desktop) or the sheet (phones) shows it.
  - Leaving the facade and its panel clears it after 320 ms.
- **Click.** A mouse click opens the plan stage. A touch or pen tap on a floor that isn't hot only previews it, and the second tap opens it.
- **Keys on a rail:**
  - Enter or Space opens the floor;
  - ↑↓ move a floor, clamped to 1–8;
  - ←→ go to the same floor in the other block (desktop);
  - Escape clears;
  - the moved-to button takes the focus.
- **Compact mode (Home):** no panels and no sheet.
  - The caption is a live region. Idle, it reads „Посочете етаж: свободните, резервираните и продадените апартаменти на него. Кликнете, за да отворите плана му.“ When a floor is hot it reads „Блок А · *етаж 5*“ with the count chips.
  - A click goes to `/projects/golden-residence?floor=А-5`.

### 7.3 Edge panel (desktop)

- **Placement.** One `aside` per block, `aria-live="polite"`.
  - Width `var(--pw)`, at least 470 px tall, on `rgba(26,23,20,.97)`.
  - A 1 px brass line on its inner edge.
  - It slides in from its block's outer side, over that block's rail. Between 901 and 1279 px it may also cover the block's outer edge (§7.2).
- **Contents:**
  - the title „Блок А · *Етаж 5*“;
  - the meta „12 апартамента“, or „кота +3,06 · 12 апартамента“ where the drawings give the elevation (§9);
  - the mini plan;
  - a 2 × 2 grid of count chips („**4** свободни“);
  - the range line;
  - `link` „Отворете плана“.
- **The range line:**

  | Case | Text |
  |---|---|
  | free units of different areas | „свободни от **63,51** до **108,56 м²**“ |
  | free units all one area | „свободен: **X м²**“ (one unit) / „свободни: **X м²**“ |
  | no free units, some reserved | „Няма свободни, има резервирани.“ |
  | otherwise | „Разпродаден етаж“ (serif italic 28 px, status-sold) |

- **Behaviour.**
  - Opening one panel closes the other.
  - Entering a panel cancels the close.
  - A unit in the mini plan opens the stage on that unit.

### 7.4 Plans: one renderer

`PlanSvg` has three modes: `mini`, `stage` and `crop`.
- **viewBox.** The union bbox of the block's 12 polygons plus padding (14; 4 in mini). In crop mode, the unit's crop (§7.7).
- **The dark drawing.** In stage and crop, the dark plan (`plan-a` 1200 × 845, `plan-b` 1200 × 847) sits under the units at 0.6, or 0.78 in crop. Its area is clipped, which fixes extract §8.3.4.
- **Fills.** The pattern size `pat` is 16 in mini, 8 in stage and 5 in crop.

  | Status | Fill |
  |---|---|
  | available | `#4FBF85` at 0.46 |
  | reserved | 45° stripes |
  | sold | dots (extract §4.22) |
  | blocked, and unknown | `#8A867D` at 0.1 with a dashed outline |
  | not in the sheet | no fill and no label |

- **Each unit** has a brass outline (`pathLength 1`), a label „501“ at its pole of inaccessibility (Manrope 600 with an onyx halo) and a hit path.
- **On-screen sizes stay constant** through `fit()`:

  | Mode | Label | Halo | Line | Dash |
  |---|---|---|---|---|
  | mini | 10 px | 3 px | 1 px | 4/3 px |
  | stage | 12.5 px | 3 px | 1 px | 4/3 px |
  | crop | 13 px | 3 px | 1.2 px | 4/3 px |

- **Hot or focused unit:** a brass-l outline at ×2.6, and the other fills drop to 0.4. In crop mode the other units dim to 0.22.
- **Interactive plans.** The hit paths become buttons named by `unitButtonLabel`, for example „А 501, 2-стаен, 62,18 м², Продаден“.

### 7.5 Phones

- **The bar** holds the block switch and „Докоснете етаж“.
- **Taps.** The first tap shows the sheet. A second tap on the same floor opens the stage, morphing from the sheet's plan.
- **The sheet:**
  - fixed at the bottom, umber, with a brass top line and safe-area padding;
  - the title and an × („Затворете“);
  - a 150 px mini plan, the counts and the range line;
  - solid „Отворете плана“ and a 48 px stepper ▲ „етаж 5“ ▼.
- **Scroll.** On first show the page scrolls so the facade sits above the sheet.
- **Width.** The sheet never shows from 901 px. Touch tablets use the panel, with the same first-tap rule.

### 7.6 Plan stage

- **Dialog.** Full screen and umber. Its name is its title.
- **The bar:**
  - the title „Блок А · *Етаж 5*“, with the meta „12 апартамента · 4 свободни“ (кота where known);
  - the block switch (`aria-pressed`);
  - the stepper ▲ „По-горен етаж“ · `output` „етаж **5**“ (live) · ▼ „По-долен етаж“, disabled at 8 and 1;
  - „Към сградата“.
- **The body:**
  - the plan, with a hover inspector showing the id, Вид, Обща площ, Изложение and Статус;
  - the side column (umber-2):
    - counts;
    - the status legend (labels only: the key to the patterns);
    - the unit table (Имот, Вид, Обща площ, Статус);
    - the hint „Посочете апартамент на плана или в списъка. ▲ ▼ сменят етажа, без да се връщате.“
- **Rows** are focusable, and their names start with the unit id. Enter, Space or a click opens the unit. Hovering a row or a unit highlights both.
- **Opening.** It morphs from the mini plan when motion allows (§5.7), and fades otherwise. Focus moves to „Към сградата“ after 700 ms, or 30 ms without motion.
- **Keys.** Escape closes it, Tab stays inside, and PageUp and PageDown step floors (except inside the table).
- **Closing** returns the focus to the opener. After an inquiry it returns it nowhere (§7.7). After a deep link, which has no opener, it goes to the hot floor's rail (§7.10).
- **Phones.** Two bar rows, the plan above the side column, no inspector.

### 7.7 Unit panel

- **Dialog.** Over the stage; at most 1120 × 680; umber, with a seam. While it is open the stage is `inert` and `aria-hidden`. Escape closes the panel alone.
- **Left half:** the crop plan, focused on the unit.
  - The margin is `max(w, h) × 0.42 + 30`, matched to the box's aspect.
  - The caption reads „План на етаж 5, блок А. А 501 е очертан.“
- **Right half:**
  - „А *501*“, and „Блок А · етаж 5 · 2-стаен“ with its status chip;
  - Застроена площ, Идеални части and Обща площ (serif 600 26 px with м²), then Вид, Изложение („няма данни в таблицата“ when empty), Статус, and Цена if the sheet has one;
  - previous and next units on the floor, wrapping round.
- **Actions by status:**

  | Status | What the panel offers |
  |---|---|
  | available | solid „Изпратете запитване“ |
  | reserved | „Попитайте за апартамента“ |
  | unknown | „Попитайте за апартамента“ |
  | sold | the note „Този апартамент е продаден. Свободните на етажа са оцветени в зелено.“, no action |
  | blocked | the note „Този апартамент не се предлага в момента.“, no action |

- **An inquiry action** adds the unit to the form's picks, closes both dialogs, then scrolls to `#zapitvane`:
  - the dialogs close first, through the URL (`?floor` and `?unit` go), and this close returns focus to no opener;
  - the glide starts in the first animation frame in which no scroll lock is held. By then Lenis runs again (a stopped Lenis ignores `scrollTo`), and `LenisScrollSync` has handled the URL change (§5.3);
  - it brings `#f-name` on screen too (`reveal`), and focuses it with `preventScroll` when the 1.5 s glide ends.

### 7.8 Визуално / По критерии

- **Tabs.** A tablist named „Как да търсите“, with roving tabindex and ←→. A brass-l underline follows the selected tab, and the switch runs through Flip.
- **Filters:**

  | Filter | Control | Options |
  |---|---|---|
  | Блок | pills | Всички, А, Б |
  | Етаж | select | Всички, етаж 1–8 |
  | Вид | pills | Всички, 2-стаен, 3-стаен, Ателие |
  | Площ | select | Всяка, до 70 м² `[0, 70)`, 70–100 м² `[70, 100)`, над 100 м² `[100, 999)` |
  | Изложение | select | Всяко, юг, изток, запад, север. Matched by `includes`, so „Юг/Изток“ counts for both. |
  | Статус | pills | Всички, Свободни, Резервирани, Продадени, Блокирани |

- **Meta** (live): „**N** от 192 · K свободни“.
- **The table** has the columns Имот, Етаж, Вид, Обща площ, Изложение and Статус.
  - Имот, Етаж and Обща площ sort.
  - Етаж and Изложение hide on phones.
  - Rows open the unit, and sold rows are dimmed.
- **Fixed lines:**
  - the empty list: „Няма апартаменти с тези условия. Махнете някой филтър.“;
  - the footnote: „Продадените остават в списъка. Изложение има само за блок Б, така е в таблицата.“

### 7.9 Status vocabulary: never colour alone

The order is always available, reserved, sold, blocked.

| Key | Label | Words | Swatch | Glyph (10 × 10) |
|---|---|---|---|---|
| `available` | Свободен | свободен / свободни | solid `#4FBF85`, glyph in onyx | ✓ `M1.6 5.3l2.2 2.2 4.6-4.9` |
| `reserved` | Резервиран | резервиран / резервирани | stripes `#E9953F`, glyph on an umber disc | ◷ circle r 3.7 and hands |
| `sold` | Продаден | продаден / продадени | dots `#D4574E`, glyph on umber | ✕ |
| `blocked` | Блокиран | блокиран / блокирани | dashed `#8A867D` border, no fill | — `M2 5h6` |
| `unknown` | the unit's own text („Скоро“), else „Няма информация“ | — | as blocked | — |

- **Chip:** a 16 px swatch and the label.
- **Count:** the swatch and „**n** word“, singular only for 1.
- **Legend:** labels only, in order.

### 7.10 URL state

| Param | Opens |
|---|---|
| `?floor` | the plan stage |
| `?unit` | the unit panel |
| `?view=list` | the list tab |

- **`?floor` values.** A bare `5` means the route's own block on a block route; `Б-5` names the block. A Latin `A`/`B` reads as Cyrillic, and floors outside 1–8 are ignored.
- **`?unit`** holds a label such as `А 501`. An unknown unit opens its floor only.
- **When.** All three are read after `useHydrated()` and written with `replace`. Closing the stage removes `?floor` and `?unit`.
- **One source.** The stage and the unit panel are open exactly while the URL says so, so a dialog closes in the same commit as its URL change.
- **Deep links.** When a URL opens the stage on arrival, the page first jumps (no glide) to `#explorer`, so closing the stage leaves the reader at the facade. A close with no opener to return to focuses the hot floor's rail.
- **How `?floor` is written.** The GR page always writes the letter (`А-5`). A block route writes its own floors bare.

### 7.11 Block routes

`/projects/golden-residence/block-a` and `block-b` keep their URLs and stay prerendered.
- **Each shows:**
  - the link „Към Golden Residence“, then the H1 „Golden Residence, блок *А*“, then the line „96 апартамента · 8 етажа · 12 на етаж“;
  - the explorer, starting on its own block;
  - the GR inquiry.
- **Why that order.** The routes contract looks for „блок А“ followed by anything but a letter in the page's run-together text. The facts line starts with a digit.
- **Meta** stays as M1 set it.

## 8. Page compositions

### 8.1 Home `/`

- `handle: { header: 'overlay', inquiry: true }`.
- `links`: the availability preload and the Display fonts.
- Meta unchanged. One H1.

| # | Section | Strings | Copy source |
|---|---|---|---|
| — | Intro doors (§5.5) | — | — |
| 1 | `#proekti` hero | the slogan; „Golden Residence“, „{n} свободни от 192 · жк Левски Г“, „ул. Ген. Климент Бояджиев, София“, „Изберете апартамент“; „Многофамилна сграда“, „16“ „свободни от 144 · по данни към 01.12.2025“, „ж.к. Връбница-1, София“, „Запитване за сградата“ | HeroCarousel:27, :42–50, re-set; the built-in data; the concept's actions |
| 2 | `#za-nas` company | motto „„Добрата работа – *реклама* за майстора““; „Традиция и иновации от *2008*“; „КСМ СТРОЙ ООД е основана през септември 2008 г. от двама братя – Кадри и Сухат, синове на известен в родното им село Буково строител зидар (дюлгерин).“; „Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност, бързина и точност.“; the triad; facts 2008 / 2 / 2 with their lines (extract §7.2) | About:415–444, for-us/content.txt:1–3, re-cased |
| 3 | `#uslugi` services | „Строим, ремонтираме, *завършваме*.“; „Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти.“; „Жилищно строителство“, „Ремонти и реновация“, „Комерсиално строителство“ with their sentences | the user-approved heading; Home.jsx:16–27, :72, sentence case |
| 4 | `#obekti` works | „Нашите *обекти*“; Blog's meta description; the six works and places (Green Life with 2018; „груб строеж“ on Панорама Резидънс) | Blog:128–197, :787 |
| 5 | `#etazhi` teaser | „Golden Residence, *етаж* по етаж“; „Цифрите са свободните апартаменти в момента: блок А вляво, блок Б вдясно. Посочете етаж, кликнете, за да видите плана му.“; ways „Визуално“ / „Изберете етаж от фасадата“ and „По критерии“ / „Всички 192 апартамента в списък с филтри“ | the concept |
| 6 | `#kontakti` inquiry | „Готови сте да започнете своя *проект*?“; „Нашият екип е готов да ви помогне да реализирате мечтания проект с качество и професионализъм.“; phones; „Пн–Пт 8:00–18:00, Сб 9:00–14:00, Нд почивен ден“; the form | Contact:506–509; `src/config/site.js` |
| 7 | `#es-proekt` EU poster | production's text, facts, links and disclaimer | EuPosterSection.jsx:9–88 |

### 8.2 Golden Residence `/projects/golden-residence`

- `handle: { header: 'overlay', project: 'golden-residence', inquiry: true }`.
- `links`: the availability preload and the Display fonts. Meta unchanged.
- The page never shows „Диана Хоумс представя“ and never links to Diana Homes (A1).

| # | Section | Strings | Copy source |
|---|---|---|---|
| 1 | `#top` hero | „Golden *Residence*“; „ул. Ген. Климент Бояджиев, жк Левски Г, София“; 192 „апартамента в 2 блока“ and {n} „свободни в момента“; „Изберете апартамент“, „Запитване“; alt „Golden Residence по здрач, визуализация“ | HeroCarousel:49–50; the concept |
| 2 | `#sgradata` story | „Модерен дом в жк *Левски Г*“ with the landing paragraph minus the agency clause, „500 м“ „до метростанция“ and „Отвори в Google Maps“; „Бронзови *рамки*“ with 2 / 8 / 192 / 12 („от 43,98 до 114,58 м²“); „Продължение на *дневната*“; „Озеленен *двор*“ with „113 гаража и 68 паркоместа“; captions and alts from extract §7.3 | golden-residence `src/content.js`:44–76 (the client's own text, v2 spec §4.3); the sheets |
| 3 | `#explorer` | „Изберете *апартамент*“; the tabs; „Свободните апартаменти в момента, по данни от таблиците на КСМ Строй: {n} от 192.“; the legend; the caption „Цифрите отстрани са **свободните апартаменти** на всеки етаж.“ plus the desktop or phone line (extract §7.3) | the concept |
| 4 | `#blokove` blocks | „Два блока, по *96* апартамента“; „Всеки квадрат е апартамент: етажите отгоре надолу, номерата от 01 до 12. Кликнете квадрат, за да отворите апартамента.“ | the concept; the sheets |
| 5 | `#galeriya` | „Golden Residence *отблизо*“; „Визуализации на сградата, фасадата и двора.“; the three captions | GRL:74; the concept |
| 6 | `#garazhi` | „Гаражи и *паркоместа*“; „Свободните места в момента, по данни от таблиците на КСМ Строй.“ | the concept |
| 7 | `#kontakti` inquiry | „Запитване за Golden *Residence*“; „Запитванията за Golden Residence приема КСМ Строй. Обадете се или изпратете запитване и ще се свържем с вас.“; phones, email, hours; the form | A1; the concept |

### 8.3 Block routes

- The link „Към Golden Residence“, the H1 „Golden Residence, блок *А*“ and „96 апартамента · 8 етажа · 12 на етаж“ (§7.11), then §8.2's sections 3 and 7.
- `handle: { header: 'solid', project: 'golden-residence', inquiry: true }`.
- The same `links` as §8.2.

## 9. Data

- **Source.** Everything comes from `useAvailability()`, the platform store: the API, then the sheets, then the built-in data.
- **Units.** Each API row becomes a unit in M1's unit model (`src/utils/units.js`): label, block, floor, areas, type, exposure, status key and status text, plus `suffix` and `price`.
- **Statuses** always go through `src/utils/propertyStatus.js`.
  - An empty cell is Свободен.
  - Precedence is sold > reserved > blocked > available.
  - Unknown text stays `unknown` and shows its own text (Ruling R1). It counts in the total only.
  - The concept's `normStatus` is not used.
- **Floor colour** is `summarizeFloor().color` (v2 spec §9): available if any unit is free; reserved if none is free but one is reserved; sold when every unit is sold or blocked.
- **Placeholders and failures.**
  - Golden Residence counts prerender as `—` and arrive at hydration.
  - When a slot's origin is `built-in`, or the store reports an error, the page shows: „Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.“ It never shows a fake zero.
  - On Home that line sits in the teaser (§6.11), under the facade. The hero's count stays as it is, and the teaser speaks for the page.
  - Home's Многофамилна half keeps its dated figures through M2, even if that project's sheets go live. M3 switches it to live counts together with the project's page.
- **Constants** live in `src/config/facts.js`:

  | Constant | Value |
  |---|---|
  | Многофамилна dated counts | `{ free: 16, total: 144, date: '01.12.2025' }`, tested against the built-in data and prerendered |
  | Golden Residence fixed facts | 192 apartments, 2 blocks, 8 floors, 12 a floor, 43,98–114,58 m², 113 garages, 68 parking places |

  Only the free counts are live.
- **Кота** shows only where the drawings give it: А1 (block А, floor 1) at +3,06. The concept's 2.89 m extrapolation is not used.
- **Plans.** One typical plan per block for all eight floors, matched by suffix.
- **Images.**
  - The concept's finished derivatives are registered in `scripts/images/sources.json`, which builds AVIF/WebP ladders and manifests: `gr-dusk`, `mn-dusk`, `facade-cut`, `plan-a`, `plan-b`, and the story, gallery and services stills.
  - The works' covers come from production's `src/assets/projects/`.

## 10. Inquiries

- **Fields.** Every one but the message is required.

  | Field | Rule |
  |---|---|
  | Име | ≥ 2 characters after trimming |
  | Телефон | ≥ 6 digits |
  | Имейл | the proxy's own pattern, `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` |
  | Интересувам се от | a select |
  | Съобщение | optional |
  | consent | „Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.“ |

- **Options.**
  - Home: Golden Residence, жк Левски Г / Многофамилна сграда, ж.к. Връбница-1 / Строителство или ремонт / Друго.
  - Golden Residence: Апартамент в Golden Residence / Гараж или паркомясто в Golden Residence / Многофамилна сграда, ж.к. Връбница-1 / Друго.
- **Picks.** Units sent from the explorer show as chips „Апартамент А 301“, each removable („Махнете А 301“).
- **The payload** goes to `POST /api/odoo-lead` as JSON with exactly `name, email, phone, projectType, budget, message`.
  - `projectType`: the option's subject, then the picks after „ – “, for example „Golden Residence – А 301, А 302“. Outside production it is prefixed „[ТЕСТ] “.
  - `budget`: `''`.
  - `message`: the visitor's text. Under 10 characters it gains the line „Запитване за: {projectType}“, so the proxy never rejects a lead.
- **Delivery.** EmailJS (Contact's service, template and variables; `to_email: 'ksm_str@abv.bg'`) and Odoo are sent in parallel.
  - Only EmailJS decides what the visitor sees. A CRM failure goes to `console.error` only.
  - No honeypot.
- **Errors:**

  | Case | Message |
  |---|---|
  | name | „Въведете име.“ |
  | phone | „Въведете телефон, поне 6 цифри.“ |
  | email | „Въведете имейл, например ime@primer.bg.“ |
  | email with a Cyrillic domain | „Въведете имейл с латински букви, например ime@primer.bg.“ |
  | consent | „Отбележете съгласието, за да изпратим запитването.“ |

  Focus moves to the first invalid field, which gets `aria-invalid`.
- **Success** is „Благодарим ви.“ / „Ще се свържем с вас в работно време. За бърз отговор: +359 887 886 166.“, in `role="status"`, which takes the focus.
- **Failure:** „Запитването не беше изпратено. Опитайте отново или се обадете на +359 887 886 166.“
- **Contact page.** `/contact` stays as it is until M4.

## 11. Accessibility

- **Focus ring.** 2 px, offset 3 px, in the text colour of the ground it sits on: ivory on the dark grounds, onyx inside `.on-light` (light plates and the legacy ground). Under forced colours it is Highlight, never `currentColor`.
  - Links over positioned media (hero halves, works and gallery media) carry the ring on an inset overlay (`-4px`).
  - Facade floors show focus as the dashed highlight plus the ring on their rail.
  - Plan units show it as the hot outline.
- **Clipping.** No `overflow: hidden` on an ancestor of a focusable element if it would clip the ring.
- **Dialogs** (menu, stage, unit panel): `role="dialog"`, `aria-modal`, a name, a Tab trap, Escape, focus moved in and returned. A dialog under another is inert.
- **Keyboard paths:**
  - rails: arrows and Enter;
  - stage: switch, stepper, close, units, rows, and PageUp/PageDown;
  - unit panel: action, previous and next, close;
  - tabs: ←→;
  - gallery: ←→.
- **Live regions:** the compact caption, the panels, the list meta, the gallery caption, the stepper output and the form status.
- **Target size.** 44 × 44 px wherever the layout allows: pseudo-element hit boxes on footer, menu and contact links and on „За проекта“. Rails and plan units, whose pitch the drawing fixes, are ≥ 24 × 24 (WCAG 2.5.8) from 901 px, where the facade is never narrower than 860 px (§7.2). On phones the rails follow the crop's pitch (about 19 px at 390 px), and the sheet's 48 px stepper is their large target. Plan units have the unit table's rows.
- **Text spacing** (WCAG 1.4.12) holds at 320–360 px and in the header at 1024–1100 px.
- **Structure.** One H1 per page. One `<main>`, the shell's.
- **Status** is never colour alone (§7.9). The contrast floors are in §2.1.
- **Fixed from the concept:** the H1 comes first in the DOM; the gallery's roledescription sits on an element with a role; consent is enforced; ▲▼ are SVG.

## 12. Performance budgets

v2 spec §10 stands, with these amendments:

| Measure | Budget |
|---|---|
| First-load JS per route (gzip) | ≤ 160 KiB, enforced on every route without legacy code: `/`, `/projects/golden-residence` and both block routes once rebuilt. A route is legacy when it carries the framer-motion or swiper fingerprint. |
| Motion chunk | ≤ 60 KiB |
| Flip | ≤ 10 KiB, lazy, never first-load |
| Fonts | ≤ 90 KiB |
| LCP image | ≤ 60 kB mobile, ≤ 200 kB desktop (AVIF) |
| LCP (mobile lab) | ≤ 2.5 s on `/`, the GR page and block-a |
| CLS | ≤ 0.02 |
| TBT | ≤ 150 ms |
| Lighthouse a11y | ≥ 98 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 (production-mode build) |

- **Bytes before LCP** are measured as the M1 baseline note defines them. In M2 they are reported, not gated, and the final task records the first Diptych figures to re-base the budget.
- **Lighthouse scores** come from the same runs as the performance figures. a11y and Best Practices are measured on the normal build. SEO is measured on a local production-mode build (`VITE_SITE_STAGE=production`), because every other build carries `noindex`. That build is never deployed, and no inquiry is sent from it.
- **If the GR route goes over budget,** the stage, unit panel and list move into a lazy chunk, preloaded on the first floor hover or focus.

## 13. Out of scope

- **M3:** the Многофамилна page and its explorer. Its block routes stay legacy, and the Home half leads to the inquiry until then.
- **M4:** За нас, Обекти, Контакти and Продажби in this system; `/eu-proekt` and 404 redesigned; the legacy pages, framer-motion, swiper and the legacy palettes removed.
- **Not built:**
  - from the concept: saved apartments, the slogan switcher and alternative lines, and the EU dialog;
  - the film (stills are used);
  - one plan per floor, and кота above А1;
  - concept 1's status ruler;
  - the `X-Robots-Tag` for the review host (set up with that project);
  - `[ТЕСТ]` on the legacy Contact form.

## 14. Decisions taken in this spec

1. **EU row on every page.** The EU line stays on every page as a quiet 36 px top row. The concept had it only in the footer and menu, but EU rules want the emblem visible on landing without scrolling, and the smoke run checks that. It slides away once the page scrolls.
2. **Email required, short messages topped up.** The proxy rejects a lead without a valid email or with a message under 10 characters, and it cannot change. So the forms require an email, and a short message gets „Запитване за: …“ added.
3. **„[ТЕСТ]“ added in the browser.** Non-production builds prefix the new forms' subject with it, and `api/odoo-lead.js` stays untouched. The legacy Contact form stays untagged unless the teammate adds the server-side marker (v2 spec §6.7).
4. **The concept's header.** It holds „Меню“, the phone and „Запитване“, and never hides. The page links live in the menu and the footer's „Бързи връзки“, which keeps crawlable links on every page.
5. **Status signals that pass.** Control borders use `hair-ctl` (≥ 3:1), and each rail shows a status glyph instead of a dot, so no status is colour alone.
6. **Кота only on А1** (+3,06). Confirm the floor-to-floor height from the drawings to show it on every floor.
7. **Production photos on all six works.** The years follow the concept (Green Life only) until the client confirms the rest (v2 spec §14.10).
8. **The concept's Lenis feel:** lerp 0.1 and the full wheel distance.
9. **One minimum height for both heroes:** 640 px, so the hero move from Home lands exactly.
10. **The doors close over everything.** The menu, the footer and the ground close with the page, so no page change shows a menu vanishing or a footer fading on its own. Back and Forward stay instant.
11. **The phone seam moves down for the EU row.** On a real phone screen a 50 % seam put the Golden Residence info over the slogan. The seam now drops as low as the header plus 290 px, and the phone slogan's floor is 28 px.
12. **The facade is at least 860 px wide from 901 px.** Below about 1280 px the concept's facade shrinks until the per-floor counts collide (15 px apart at 1024 px). At 860 px they stay 24 px apart. Between 901 and 1279 px an open edge panel may cover its block's outer edge.
13. **Home's data states.** The teaser carries the stale-data notice for Home. The Многофамилна half stays dated until M3.

**Client flags carried:**
- Многофамилна's counts are from 01.12.2025.
- The contact address is free mail.
- „над 15 години опит“ against 2008.
- Block А has no Изложение column.
- One typical plan is used for every floor, though the real А1 plan differs.
