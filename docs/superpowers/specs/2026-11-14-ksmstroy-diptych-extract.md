# Diptych: design system and behaviour, extracted for the React rebuild (M2)

**Source, read in full on 2026-11-14:** `C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/`
- `index.html` (325 lines), `golden-residence.html` (337), `css/diptych.css` (929), `js/core.js` (496), `js/home.js` (281), `js/explorer.js` (810), `js/gr.js` (310), `fonts/fonts.css` (7).
- Shared: `../data/maps/golden-residence.building.json`, `../data/maps/golden-residence.floors.json`, `../data/sheets/gr-block-a.csv`, `gr-block-b.csv`, `gr-garages.csv`, `gr-parking.csv`; `../vendor/` (gsap 3.15.1 with ScrollTrigger, SplitText, Flip; lenis 1.3.27 and `lenis.css`).
- Checked against the screenshots `shots/c2v2-check-home-a-1440.png`, `c2v2-check-home-a-390.png`, `c2v2-company-1440.png`, `c2v2-services-hover-1440.png`, `c2v2-check-explorer-hover-1440.png`, `c2v2-check-explorer-open-1440.png`, `c2-doors.png`, `c2-gr-390-tap.png`.
- `c2-diptych-v1-backup/` differs only in `index.html`, `home.js` and the CSS (the slogan rows, the services section) and two GR captions. `core.js`, `explorer.js` and `gr.js` are byte-identical to v1.

**Reference conventions**
- `file:line` is the concept file.
- Production references are the legacy files in `C:/ksm-stroy/ksm-stroy-v2` on `redesign-v2` @ 1b4a6f2 (same text as production `main` unless noted).
- GRL is `C:/ksm-stroy/golden-residence/src/content.js` (the live GR landing, read only).
- Strings are quoted as rendered. The HTML puts `&nbsp;` after one-letter words (в, с, и, а), after „№“, between a number and its unit (`500&nbsp;м`, `114,58&nbsp;м²`) and inside „блок&nbsp;А“. Keep that rule.

---

## 0. Read this first: what M2 must not miss

1. **The forms cannot pass the lead proxy as drawn.**
   - Diptych's forms collect name and phone (both required in JS) and an optional message. They have no email field.
   - `/api/odoo-lead` takes JSON `{name, email, phone, projectType, budget, message}`. It rejects a lead unless name ≥ 2 characters, the email matches `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` and the message is ≥ 10 characters (`api/odoo-lead.js:50-63`, `:222-234`).
   - Production's Contact form posts to the proxy and to EmailJS in parallel, and EmailJS decides what the visitor sees (`src/pages/Contact.jsx:37-100`).
   - The proxy has no `SITE_STAGE` / [ТЕСТ] tagging yet (spec §6.7). The teammate makes that change, coordinated through the user.
   - So the React form needs a required email and a message of at least 10 characters, unless the user decides otherwise. Never change the proxy.
2. **The production EU poster section is missing from Diptych's Home.** Diptych shows the poster only inside the „За проекта“ dialog. Port `src/components/EuPosterSection.jsx` (copy unchanged, restyled black and gold) to the bottom of Home.
3. **Status parsing.** Diptych's `KSM.normStatus` (`core.js:40-46`) maps empty and unknown cells to `blocked`. Production's `normalizeStatus` (`src/utils/propertyStatus.js`) differs:
   - an empty cell is Свободен;
   - unknown text passes through as „Няма информация“;
   - matching uses `includes`, ranked sold > reserved > blocked > available.

   Use production's.
4. **Кота is extrapolated.** Diptych computes `'+' + (3.06 + (f − 1) × 2.89)` for every floor (`core.js:54`). v2's rule is "elevations are never invented": only А1 = +3,06 comes from the drawings (`src/components/ui/ElevationMark.jsx:1-8`). Either confirm 2.89 m from the drawings or show кота only where it is known.
5. **Motion preferences.** Save-Data is not handled at all. Reduced motion is read once at load (`core.js:7`) and never re-read.
6. **Two visible CSS defects. Fix them in the port; do not copy them (§8.3).**
   - Line masks clip descenders, in italic worst.
   - The „коректност — бързина — точност“ trio renders at 17 px.

---

## 1. Tokens

### 1.1 Colour tokens (`diptych.css:4-27`, `color-scheme: dark`)

| Token | Value | Role |
|---|---|---|
| `--onyx` | `#0E0D0B` | Page ground (`html`, `body`); doors; the menu's left half; the bros, teaser, contact, explorer, gallery and blocks sections; the plan-stage bar; the unit panel's left half; text on solid buttons; `theme-color` |
| `--umber` | `#1A1714` | "Second halves" and panels: the footer's right half, the menu's right half, the saved popover, the EU dialog box, the unit-panel box, the plan-stage ground, the services columns, the works media, the story frame, the gallery halves, the parking section, the phone sheet, `<option>` backgrounds |
| `--umber-2` | `#211D19` | The plan stage's side column and its sticky table header |
| `--ivory` | `#EFE9DD` | Text; solid-button ground; pressed segmented buttons and pills; skip-link ground |
| `--ivory-2` | `rgba(239, 233, 221, .82)` | Secondary text: leads, paragraphs, count text, header phone |
| `--ivory-3` | `rgba(239, 233, 221, .62)` | Tertiary text: footer blurb, EU text, sold table rows, the `м²` unit in the unit panel |
| `--stone` | `#9B9488` | Labels, `.small`, idle toggle tabs, floor numbers |
| `--hair` | `rgba(155, 148, 136, .3)` | Control borders: field underlines, pills, segmented controls, stepper, chips, popovers and boxes, table header rule |
| `--hair-2` | `rgba(155, 148, 136, .16)` | Section rules and row dividers |
| `--brass` | `#B8954A` | The seam; rules; `em` in section headings; link underline; button border; outlined numerals; select chevrons; sort arrow; door mark; pressed switcher button |
| `--brass-l` | `#D8BD7A` | Hover and active states; `em` in display titles; the focus ring; hot counts; toggle and services underlines; facade highlight; the seam glint |
| `--st-free` | `#4FBF85` | Свободен |
| `--st-res` | `#E9953F` | Резервиран |
| `--st-sold` | `#D4574E` | Продаден (also the invalid-field border, `core.js:471`) |
| `--st-blk` | `#8A867D` | Блокиран |

**Colours outside the tokens**
- `#fff` (`.btn--solid:hover`, `.link:hover` text, `.dlg__poster` ground).
- `#F7F4EE` (`.eu__plate`, the paper plate behind the EU logos, `:177`).
- `#241F1A` (the `.works__plate` radial centre, `:378`).
- In JS: `#B8954A` and `#D8BD7A` (door seam glint, `core.js:257-263`); the status hexes duplicated in `core.js:31-34` and `explorer.js:83-106`.

### 1.2 Overlays and alpha values

| Where | Value |
|---|---|
| Header scrim (`.hdr::before`, `:107`) | `inset: 0 0 -40px; linear-gradient(rgba(14,13,11,.55), rgba(14,13,11,0))`, fades out when solid |
| Header, solid (`:108`) | `rgba(14,13,11,.86)` + `backdrop-filter: blur(14px) saturate(1.1)` + bottom border `--hair-2` |
| Hero halves, desktop (`:284`) | `linear-gradient(180deg, rgba(14,13,11,.74) 0%, rgba(14,13,11,.34) 24%, rgba(14,13,11,0) 44%, rgba(14,13,11,0) 58%, rgba(14,13,11,.86) 100%)` |
| Hero GR half, phone (`:756`) | `linear-gradient(180deg, rgba(14,13,11,.78) 0%, rgba(14,13,11,.42) 16%, rgba(14,13,11,.46) 24%, rgba(14,13,11,.9) 49%)` |
| Hero MN half, phone (`:757`) | `linear-gradient(180deg, rgba(14,13,11,.35) 50%, rgba(14,13,11,0) 64%, rgba(14,13,11,0) 70%, rgba(14,13,11,.85) 100%)` |
| Hero title vignette (`:318`, desktop only) | `left: -38vw; width: 76vw; top: -14vh; height: 52vh; radial-gradient(closest-side, rgba(14,13,11,.7), rgba(14,13,11,.35) 55%, rgba(14,13,11,0))` |
| Narrowed hero half | `.half__shade`, onyx at opacity `.4` (so the other half drops to 60 % brightness) |
| GR hero (`:420`) | `linear-gradient(180deg, rgba(14,13,11,.62) 0%, rgba(14,13,11,0) 30%, rgba(14,13,11,0) 50%, rgba(14,13,11,.9) 100%)` |
| Services photo (`:349-350`) | `filter: brightness(.66)` + `linear-gradient(0deg, rgba(14,13,11,.95) 0%, rgba(14,13,11,.42) 50%, rgba(14,13,11,.62) 100%)` |
| Works caption (`:382`) | `rgba(14,13,11,.66)` |
| Plan inspect tooltip | `rgba(14,13,11,.92)` |
| Facade panels (`.fxp`) | `rgba(26,23,20,.97)` |
| Facade dim | onyx rect at opacity `.6` with a hole at the hot floor |
| Facade tint | the hot floor's best status colour at `fill-opacity` `.2` |
| EU dialog backdrop | `rgba(8,7,6,.82)` + `blur(6px)` |
| Unit-panel backdrop | `rgba(8,7,6,.72)` + `blur(4px)` |
| Door inner glow (`:143-144`) | `radial-gradient(120% 70% at 100% 50%, rgba(184,149,74,.06), transparent 60%)`, mirrored (`at 0% 50%`) on the right door |
| Brass hover tints | `.06` (ways links), `.08` (table rows, gallery buttons), `.09` (`.btn:hover`), `.12` (stepper hover), `.14` (switcher) |
| `::selection` | `rgba(184,149,74,.35)` |
| Plan label halo | stroke `rgba(14,13,11,.88)` |
| Grain (`body::after`, `:40-43`) | SVG `feTurbulence` fractal noise (`baseFrequency .85`, `numOctaves 2`, 180 × 180 tile, white at matrix alpha `.9`), `position: fixed`, `opacity: .045`, `z-index: 400`, `pointer-events: none` |

### 1.3 Spacing

There is no numeric scale. These are the recurring values:
- **Page gutter:** `--gut: clamp(20px, 3.6vw, 60px)`.
- **Section padding:**
  - `.sec`: `clamp(96px, 16vh, 180px) 0`; phones `88px 0`.
  - Explorer: top `clamp(80px, 13vh, 140px)`, bottom `clamp(64px, 10vh, 110px)`.
  - Footer halves: `clamp(64px, 10vh, 110px) clamp(28px, 5vw, 96px) 48px`; phones `56px var(--gut) 40px`.
- **Seam-side padding of a half** (the outer side uses `--gut`):
  - `clamp(28px, 4vw, 80px)`: bros, contact, `.ways a`.
  - `clamp(28px, 5vw, 96px)`: footer, works list, blocks, parking.
  - `clamp(28px, 5vw, 104px)`: story text.
- **Gap from a hinged heading to the seam:** `clamp(24px, 3vw, 52px)` on each side (`.hinge`, `.explorer__head`, `.gal__bar`).
- **Under a hinged heading:** `margin-bottom: clamp(56px, 9vh, 104px)`. The hinge seam overshoots by `18px` top and bottom.
- **Stack gaps:**
  - 22 px: forms, story blocks, works list, bros story, parking halves.
  - 26 px: contact left, blocks, menu info.
  - Others: 6, 8, 10, 12, 14, 18, 30, 36, 40, 44.
- **Phone separation between stacked halves:** 40 px (bros, contact), 56 px (blocks, parking), 36 px (menu).

### 1.4 Radii

None; everything is square. The only exceptions:
- the facade count dot `.fx__cnt .d` (`border-radius: 50%`);
- the umber disc behind the reserved clock glyph (`.st--reserved .sw svg`, 50 %);
- the focus ring (`border-radius: 1px`);
- form inputs set `border-radius: 0` explicitly.

### 1.5 Borders and hairlines

- **The seam:** 1 px `--brass` (`.seam`, `:97`). On phones a stacked half's `border-top: 1px solid var(--brass)` replaces it.
- **Section rules and row dividers** (`--hair-2`):
  - header solid bottom, footer top;
  - `.svc__cols` top and bottom; `.ways` top and bottom;
  - `.facts-row` top, `.kv` top, `.metro` top;
  - works list rows; table rows; `.lv__bar` top and bottom;
  - plan-stage bar bottom and side left; panel range top; unit-panel `dl` rows; `.up__nav` top; park `details` top.
- **Control borders** (`--hair`): field underlines; `.pills`, `.seg`, `.step` (with inner dividers on the output); `.chip`; `.hdr__saved`; `.saved-pop`, `.dlg__box`, `.up__box`; `.lv__sel`; gallery buttons; `.utable th` bottom; `.ps__inspect`.
- **Brass 1 px:**
  - the facade panels' inner edge (`.fxp--a` right, `.fxp--b` left);
  - the phone sheet's top;
  - on phones: the unit panel's left-half bottom and the plan stage's side top.
- **Other borders:**
  - works plate inner frame: `1px solid rgba(184,149,74,.4)` at `inset: 9%`;
  - works tag: `1px solid rgba(216,189,122,.4)`;
  - slogan switcher: `1px solid rgba(184,149,74,.5)`;
  - status swatches and cells: `1px solid var(--c)`, dashed for blocked.
- **Underlines:**
  - `.link`: 1 px brass background-gradient at the bottom, brass-l on hover;
  - EU links: `text-decoration` brass, offset 3 px, thickness 1 px;
  - footer maps links: underline `--hair`.

### 1.6 Shadows and glows

- `.saved-pop`: `0 30px 80px rgba(0,0,0,.5)`.
- `.sheet`: `0 -24px 60px rgba(0,0,0,.55)`.
- Hero title: `text-shadow: 0 2px 30px rgba(14,13,11,.45)`.
- Door seam glint (JS): `0 0 16px 1px rgba(216,189,122,.7)` for 60 ms.
- No other shadows.

### 1.7 Z-layers

| z | Element |
|---|---|
| 600 | `.skip` |
| 500 | `.doors` |
| 400 | grain `body::after` |
| 300 | `.menu` |
| 290 | plan-morph clone (inline style, `explorer.js:663`) |
| 280 | `.up` (unit panel) |
| 260 | `.ps` (plan stage) |
| 240 | `.sheet` (phone) |
| 220 | `.slg` (review switcher, concept-only) |
| 210 | `.saved-pop` |
| 200 | `.hdr` |
| 6 | `.fxp` (facade panels) |
| 4 | `.hero__title`; `.split > .seam` |
| 3 | `.seam`; `.hero__seam`; `.menu__close`; `.up__close` |
| 2 | `.half__info`; `.svc__col > .seam`; `.menu__seam`; `.up__box > .seam`; `.dlg__close`; `.works__cap`; `.story__cap`; `.story__idx`; `.ps__inspect` |
| 1 | `.half` (both); `.dlg__box > .seam`; `.works__frame`; `.story__frame`; sticky `.utable th` |
| −1 | `.svc__img` (inside an `isolation: isolate` column); `.hdr::before` |

Native `<dialog>` (EU) is in the top layer.

### 1.8 Eases and timings

- **CSS** (`:24-26`):
  - `--e-out: cubic-bezier(.16, 1, .3, 1)` (≈ expo.out), used 19×;
  - `--e-soft: cubic-bezier(.33, 1, .68, 1)` (≈ power2.out), used 12×;
  - `--e-io: cubic-bezier(.87, 0, .13, 1)` is defined but unused.
- **GSAP eases used:** `expo.out` (35×), `expo.inOut` (19×), `power2.out` (14×), `expo.in` (2×), `power2.in` (2×), `power1.out` (2×), `power1.inOut` (2×), `none` (3×), `back.out(3)` (1×).
- **The design note** (`index.html:18-19`): "expo.out entrances, expo.inOut doors and morphs, power2.out hovers".
- **Recurring durations:**
  - line rise `0.9 s`, stagger `0.1`;
  - fade-up `1 s`;
  - seam draw `1.3 s`;
  - image wipe `1–1.2 s` `expo.inOut` with the inner scale `1.08/1.14 → 1` over `1.3–1.6 s` `expo.out`;
  - panels in `0.45–0.5 s` `expo.out`, out `0.35 s` `expo.in`;
  - CSS hovers `.2–.35 s`.

---

## 2. Type

### 2.1 Families and files (`fonts/fonts.css`, self-hosted, SIL OFL, `font-display: swap`)

| Face | `@font-face` | File (bytes) | What the file is |
|---|---|---|---|
| Cormorant Garamond, normal | `font-weight: 500 600` | `cormorant-garamond-normal-500-cyrillic.woff2` (21 168), `…-latin.woff2` (37 640) | **Variable**, `wght` 300–700. 500 and 600 are true weights. |
| Cormorant Garamond, italic | `font-weight: 500` | `cormorant-garamond-italic-500-cyrillic.woff2` (12 704), `…-latin.woff2` (23 924) | Static 500 italic |
| Manrope | `font-weight: 400 600` | `manrope-normal-400-600-cyrillic.woff2` (14 352), `…-latin.woff2` (24 532) | **Variable**, `wght` 200–800 |

- Stacks: `--serif: 'Cormorant Garamond', 'Cormorant', Georgia, 'Times New Roman', serif`; `--sans: 'Manrope', 'Segoe UI', system-ui, -apple-system, sans-serif`.
- Body: `font: 400 16px/1.6 var(--sans); font-feature-settings: 'kern'; -webkit-font-smoothing: antialiased`.
- The design note says Cormorant 500/600 with a 500 italic word in brass, "only from 28 px up", Manrope 400–600 for text and UI, and **no eyebrow labels**.

### 2.2 Sizes per role

Desktop values, with phone overrides after "/". All serif roles are weight 500 unless stated. The base serif letter-spacing is `-.005em` (`.serif, .h1, .h2, .h3, .num`, `:62`).

| Role | Selector | Font | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| H1 Home hero (slogan) | `.hero__title` (`:296`) | serif 500 | `clamp(46px, 5.7vw, 98px)` / `clamp(30px, 8.4vw, 46px)` | `1.06` / `1.08` | `-.01em` |
| H1 GR hero | `.grhero__title` (`:422`) | serif 500 | `clamp(54px, 8.6vw, 148px)` / `clamp(48px, 13.5vw, 80px)` | `.9` | `-.012em` |
| `.h1` (defined, unused) | `:63` | serif | `clamp(48px, 7vw, 116px)` | `.94` | `-.005em` |
| H2 section | `.h2` (`:64`) | serif 500 | `clamp(40px, 4.6vw, 76px)` | `1` | `-.005em` |
| H3 | `.h3` (`:65`), used on the bros h2 | serif 500 | `clamp(30px, 2.6vw, 44px)` | `1.05` | `-.005em` |
| Motto | `.bros__motto blockquote` (`:324`) | serif **italic** 500 | `clamp(48px, 6vw, 104px)` | `.98` | — |
| Triad, intended | `.triad` (`:331`) | serif italic 500 | `clamp(28px, 2.4vw, 38px)` | `1` | — (renders 17 px / 1.7, §8.3) |
| Lead | `.lead` (`:67`) | sans 400, `--ivory-2`, max `34em` | `clamp(16px, 1.16vw, 18px)`; `15px` in the explorer head | `1.65` | — |
| Body | `body` | sans 400 | `16px` | `1.6` | — |
| Long-form paragraphs | `.bros__story p`, `.story__block p` | sans 400 `--ivory-2` | `17px` | `1.7` | — |
| Small | `.small` (`:68`) | sans 400 `--stone` | `13px` | `1.5` | — |
| Labels: menu and footer `h2` | `.menu__info h2`, `.ftr h2` | sans 500 `--stone` | `13px` | `1.3` | `.02em` |
| Labels: form fields | `.field label` | sans 400 `--stone` | `13px` | — | `.02em` |
| Micro labels | `.utable th` (500); `.lv__f > span`, `.up__dl dt`, `.ps__hint` (400) | sans | `12px` | — | `.02em` (none on `.ps__hint`) |
| Facade floor number | `.fx__cnt .f` | sans, tabular | `11px` | — | `.04em` |
| Block-grid floor number | `.blk__fl` | sans, tabular | `10px` | — | — |
| Buttons | `.btn` (`:78`) | sans 500 | `14px`; `.btn--sm` `13px` | `1` | `.03em` |
| Menu button, close buttons | `.hdr__menu`, `.menu__close`, `.ps__close` | sans 500 | `14px` | — | `.03em` |
| Header phone | `.hdr__tel` | sans 500, tabular | `14px` | — | `.02em` |
| Status chip | `.st` | sans 500 | `13px` (`12.5px` in the sheet) | — | — |
| Form input | `.field input` | sans | `17px` | textarea `1.5` | — |
| Menu pages | `.menu__pages a` | serif 500 | `clamp(40px, 4.6vw, 72px)` | `1.08` | — |
| Menu phone numbers | `.menu__tel` | serif 500 | `34px` | `1.15` | — |
| Hero half name | `.half__name` | serif 500 | `clamp(34px, 3.2vw, 54px)` / `32px` | `1` | — |
| Contact phone | `.contact__tel` | serif 500 | `clamp(36px, 3.4vw, 56px)` | `1` | — |
| Works item | `.works__items .serif` | serif 500 | `clamp(28px, 2.3vw, 38px)` | `1.05` | — |
| Works plate | `.works__plate .serif` | serif italic | `clamp(44px, 4.4vw, 72px)` | `1` | — |
| Ways | `.ways .serif` | serif 500 | `clamp(40px, 4vw, 64px)` | `1` | — |
| Services title | `.svc__t` | serif 500, max `8.5em` | `clamp(30px, 2.5vw, 42px)` / `32px` | `1.04` | — |
| Services text | `.svc__d` | sans, fixed `width: 23em` | `16px` / `15px` | `1.6` | — |
| Toggle tabs | `.toggle button` | serif 500 | `clamp(28px, 2.2vw, 36px)` | `1` | — |
| Facade block names | `.fx__bname` | serif 500 | `30px` | `1` | — |
| Panel title | `.fxp__title` | serif 500 | `34px` | `1` | — |
| "Разпродаден етаж" | `.fxp__soldout` | serif italic 500, `--st-sold` | `28px` | `1` | — |
| Plan-stage title | `.ps__title` | serif 500 | `clamp(30px, 2.6vw, 42px)` | `1` | — |
| Unit id | `.up__id` | serif 500 | `clamp(48px, 4.4vw, 72px)` | `.9` | — |
| Block name | `.blk__name` | serif 500 | `clamp(52px, 5.2vw, 88px)` | `.9` | — |
| EU dialog title | `.dlg__text h2` | serif 500 | `clamp(32px, 3vw, 46px)` | `1.02` | — |
| Sheet title, saved title | `.sheet__title`, `.saved-pop h2` | serif 500 | `30px` | `1` | — |
| Thank-you line | `.form__ok p:first-child` | serif 500 | `36px` | `1.05` | — |
| Compact facade caption title | `.fx--compact .fx__cap .t` | serif 500 | `26px` | `1` | — |

### 2.3 Numerals

Numerals are Cormorant 600 unless noted.

| Role | Selector | Size | Line-height |
|---|---|---|---|
| Hero count | `.half__count .num` | `clamp(40px, 3.6vw, 60px)` / `40px`, `min-width: 1.1ch` | `.9` |
| GR hero facts | `.fact .num` | `clamp(40px, 3.6vw, 60px)` / `40px` | `.9` |
| Company facts | `.facts-row dt` | `clamp(36px, 3vw, 48px)` | `1` |
| Metro | `.metro .num` | `clamp(56px, 5vw, 84px)` | `.9` |
| Story figures | `.kv dt` | `40px` | `1` |
| Parking big count | `.park__big .num` | `clamp(72px, 7vw, 120px)` | `.85` |
| Services numerals | `.svc__n`, **500**, transparent fill, `-webkit-text-stroke: 1px var(--brass)`, opacity `.58` → `1` | `clamp(110px, 11vw, 184px)` / `92px` (opacity `.9`) | `.84`, letter-spacing `-.02em` |
| Facade counts | `.fx__cnt .n` | `28px` / `24px` | `1` |
| Story index, gallery counter | `.story__idx`, `.gal__n` | `28px` | — |
| List total | `.lv__meta b` | `30px` | — |
| Stepper value | `.step output b` | `22px` | — |
| Unit areas | `.up__dl dd` | `26px` | `1.1` |
| Exposure counts | `.blk__expo b` | `26px` | — |

- Lining figures are forced on every element: `*, *::before, *::after { font-variant-numeric: lining-nums !important; }` (`:926`). The CSS comment says "Cormorant defaults to old-style figures; the `font` shorthand resets the variant". Cormorant's GSUB carries `lnum`.
- Tabular lining figures are set on `.tab, .utable, .park__list, .step output, .hdr__tel, .lv__meta, .fxp__counts b, .ps__counts b, .legend b, .fx__cnt .f` (`:927`).
- Plan labels use Manrope 600 with `tabular-nums`.

### 2.4 Cyrillic needs

- **Subsets.** The cyrillic files cover `U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116` (№ is here). The latin files cover `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`.
  - Those latin ranges carry „ “ – (U+2000–206F), ² and × (Latin-1) and − (U+2212).
  - ▲ ▼ (U+25B2, U+25BC) are in neither subset: the plan-stage hint „▲ ▼ сменят етажа“ falls back to a system font.
- **Bulgarian localized forms.**
  - All three files keep `locl` for `cyrl/BGR`: Cormorant normal and italic (`BGR: lnum, locl`, plus `calt` in the italic) and Manrope (`BGR: locl`).
  - With `<html lang="bg">` browsers apply the Bulgarian forms, and the approved previews show them (for example Manrope's т like m, д like g, в with the Bulgarian shape).
  - **Keep `lang="bg"` on the React root, and keep `locl` when re-subsetting.**
- **Preloads.** `index.html:52-53` and `golden-residence.html:28-29` preload the Cormorant normal cyrillic file and the Manrope cyrillic file (`crossorigin`). The italic is not preloaded, although „мечтания“ sits in the first viewport. That is a likely FOUT; preload the italic cyrillic file too.
- **Metrics.** Cormorant: UPM 1000, hhea and typo ascender 924, descender −287 (`useTypoMetrics`), so the content area is 1.211 em. With line-height L, the room under the baseline is `L/2 − 0.3185 em`: 0.18 em at L = 1, 0.17 em at the motto's .98, 0.13 em at .9. Below that, masks cut descenders (§8.3). Manrope: UPM 2000, asc 2132, desc −600.

### 2.5 Italic use

- **`em` is the only italic carrier** (`:66`): `font-style: italic; color: var(--brass); font-family: var(--serif); font-weight: 500`. It is one word per heading, for example „Нашите *обекти*“, „Golden *Residence*“, „Блок *А*“, „Блок А · *Етаж 5*“.
- **Brass (`#B8954A`):** `em` in `.h2` and `.h3` section headings.
- **Brass light (`#D8BD7A`):** `em` in `.hero__title` (so the hero's „мечтания“ is brass-light), `.grhero__title`, `.bros__motto blockquote`, `.bros__line`, `.fxp__title`, `.ps__title`, `.sheet__title`, `.up__id`, `.blk__name`, `.fx--compact .fx__cap .t`.
- **Whole italic runs:** the motto blockquote (ivory, with brass „ “ quote marks via `.q`), the triad, the works plates' place names, and „Разпродаден етаж“ (in `--st-sold`).
- **The 28 px floor.** The design note says the italic is used only from 28 px up. The single exception is the compact facade caption's „етаж 5“ at 26 px.

---

## 3. Layout

### 3.1 Containers and gutters

- **No max-width container.** Sections are full-bleed two-column grids, `grid-template-columns: 1fr 1fr`, so the seam is the exact page centre: `.split`, `.hinge`, `.ftr__grid`, `.explorer__head`, `.ways`, `.gal__stage`, `.gal__bar`, `.grhero__facts`, `.menu`, `.up__box`.
- **The exceptions:**
  - `.dlg__box`: `minmax(0, .8fr) minmax(0, 1fr)`, with its seam at 50 %, i.e. not on the column line (§8.3);
  - `.ps__body`: `minmax(0, 1fr) minmax(320px, 400px)` (no seam);
  - `.svc__cols`: flex, three columns, seams on the column edges;
  - `.form__row`: `1fr 1fr`, gap 22 px.
- **The gutter** is `--gut`: on the outer side of each half, and as the page padding of the header and the list view.
- **Measures and box sizes:**
  - lead `34em`; bros paragraphs `33em`; story paragraphs `30em`; footer blurb `30em`; services text fixed `23em` (`24em` max on touch and phones);
  - contact h2 `9em`; motto `9.5em`; services title `8.5em`;
  - `.contact__r` `680px`; `.menu__info` `520px`; `.kv` `520px`; parking cells and details `460px`; footer EU text `34em` (elsewhere `46em`); `.blk__floors` `min(100%, 500px)`;
  - EU dialog `min(1080px, 100vw − 32px)`;
  - unit panel `min(1120px, 100vw − 32px)` × `min(680px, 100svh − 48px)`;
  - saved popover `min(360px, 100vw − 32px)`.

### 3.2 The seam, screen by screen

| Screen | Desktop | Phone (≤ 900 px) | Movement |
|---|---|---|---|
| Home hero | `left: var(--seam)`, 1 px brass, full height (`:295`) | Horizontal: `top: var(--seam)`, full width, `transform-origin: 0 50%` (`:758`) | `--seam` 50 → 62 % (GR pointed at) or 38 % (MN), `0.9s expo.out`. The H1 travels with it. 50 → 100 % on the GR click. Fixed at 50 % on phones. |
| Hinged headings | 50 %, overshoots `±18px` | Hidden; the lead gets `border-top: 1px solid var(--brass)` | Draws top-down, `scaleY 0 → 1`, `1.3s expo.out`, when the parent hits `top 82%` |
| Split sections (bros, works, contact, blocks, parking) | 50 % (`z-index: 4`) | Hidden; the second half gets a brass `border-top` (works has none) | Draws as above where `data-draw` is set (bros, contact, blocks, parking); static in works |
| Services | Left edges of columns 2 and 3 (`left: 0`, `z 2`) | Hidden; `.svc__col + .svc__col` gets a brass `border-top` | Travels with `flex-grow` (`.8s var(--e-out)`); draws in on scroll |
| Ways (two links) | 50 % (static) | Hidden; the second link gets a brass `border-top` | — |
| Footer | 50 % (static) | Hidden | — |
| Menu | 50 % (`z 2`) | Hidden | `scaleY 0 → 1`, `0.9s expo.out` at `0.45s` |
| Doors | 50 % of the viewport | Same | See §4.7 and §4.8 |
| GR hero facts | 50 %, `top/bottom: -6px` | A 56 px horizontal tick centred between the stacked facts (`:802`) | Draws `scaleY 0 → 1` on entrance |
| Story | 50 % (static) | Hidden | — |
| Explorer head | 50 % (static) | Hidden; the right part gets a brass `border-top` | — |
| Facade | SVG `<line x1=605 y1=120 x2=605 y2=520>`. The stage is placed so image x = 605 lands on the page centre (`left: calc(50% − var(--sw) * .504167)`; 605/1200 = .504167). | One block at a time, so the seam sits at the block's inner edge | Draws down (`y2` 120 → 520) on intro |
| Gallery stage and bar | 50 % | Hidden; the halves stack with a brass `border-top` | The images open from the seam |
| Unit panel | 50 % of the box | Hidden; the left half gets a brass `border-bottom` | `scaleY 0 → 1`, `0.6s expo.out` on open |
| EU dialog | 50 % of the box (not on the column line) | Hidden | — |

### 3.3 Breakpoints and media queries

- `max-width: 900px` / `min-width: 901px`: the phone/desktop split. JS mirrors it in `KSM.mqPhone = matchMedia('(max-width: 900px)')`, listened to for `change`.
- `max-width: 560px`: small phones.
  - The header "Запазени" label hides.
  - `.facts-row`, `.park__list` and `.blk__expo` drop to 2 columns; `.ftr__cols` to 1.
  - The stepper output becomes `60px`; list cells get tighter padding.
- `max-width: 1100px`: only `.lv__meta`, which drops its `margin-left: auto`.
- `(hover: hover) and (min-width: 901px)`: services hover. `(hover: none) and (min-width: 901px)`: services on touch tablets.
- `prefers-reduced-motion: reduce`: see §6.
- `KSM.FINE = (hover: hover) and (pointer: fine)` is defined and unused.

### 3.4 How halves become phones

- Every two-column grid becomes one column (`:731`). Seams hide (`:732`, `:929`). The second half gets `border-top: 1px solid var(--brass)` and is inset by `margin: 0 var(--gut)` with zero side padding. Right-aligned halves switch to left-aligned.
- Images come first: the works media and the story's inline figures sit above the text.
- Phones use header height `--hdr: 64px` (desktop 76px) and `.sec` padding `88px 0`.

---

## 4. Components

### 4.1 Boot and page-state classes

- **Inline head script** (`index.html:37-51`):
  - adds `html.js`;
  - swallows view-transition promise rejections (`pagereveal`, `pageswap`);
  - reads `?slogan=a|b|c` into `data-slogan` (concept-only);
  - adds `doors-shut` if `sessionStorage['ksm-doors']`;
  - otherwise, if motion is allowed and `sessionStorage['ksm-intro']` is unset, adds `doors-shut intro`.
- The GR head script (`golden-residence.html:17-27`) adds `from-hero` if `sessionStorage['ksm-hero']`, else `doors-shut` if `ksm-doors`.
- **`KSM.boot()`** (`core.js:485-495`) runs, in order: `initMotion` (registers ScrollTrigger, SplitText and Flip; creates Lenis unless motion is reduced), `initDoors`, `interceptLinks`, `initHeader`, `initMenu`, `initEU`, `initSaved`, `initForm`, then the `[data-year]` fill.
- **Ready gate** (`home.js:196-208`; GR `gr.js:32-37`): `Promise.race([Promise.all([document.fonts.ready, img.decode() of the hero image(s)]), timeout 1200 ms])`. After it:
  - the intro, or the doors opening, or the plain entrance runs;
  - then `KSM.reveal()`;
  - on Home, `servicesIn()`.
- **Data** loads in parallel (`KSM.loadData()`). The HTML carries the snapshot numbers, so nothing reads 0 while loading.

### 4.2 Header (`index.html:69-79`; `diptych.css:101-134`; `core.js:301-308`)

- **Structure.** `header.hdr` holds:
  - the logo link (`aria-label="КСМ Строй, начална страница"`): the horizontal logo SVG, `viewBox 0 0 342.81 165.45`. The mark (`g.mk`) is stroked brass at `stroke-width 2.9`, round caps and joins. The wordmark „KSM / STROY“ is filled `currentColor` (ivory). Width `142px`, `120px` on phones.
  - `.hdr__right` (gap `clamp(14px, 2.2vw, 34px)`), containing:
    1. the saved button (`hidden` until a unit is saved);
    2. the menu button „Меню“;
    3. the phone link (`tel:+359887886166`);
    4. `a.btn.btn--sm.hdr__cta` „Запитване“ → `#zapitvane`.
  - The phone link and the CTA hide at ≤ 900 px.
- **Box.** `position: fixed; inset: 0 0 auto; z-index: 200; height: var(--hdr); padding: 0 var(--gut); display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid transparent`. Transitions: `background-color .45s var(--e-soft), border-color .45s var(--e-soft), transform .5s var(--e-out)`.
- **States.**
  - Transparent over a scrim (`::before`).
  - `.is-solid` when the scroll position is > 40 px (Lenis `scroll` event, or a native passive listener): ground `rgba(14,13,11,.86)`, border `--hair-2`, `blur(14px) saturate(1.1)`, scrim to opacity 0.
  - `.is-hidden { transform: translateY(-100%) }` exists in the CSS but nothing sets it. The header never hides.
- **Menu button.** An icon `<i>` 22 × 8 with two 1 px lines. The bottom line is shorter (`right: 7px`) and becomes `right: 0` on hover (`.35s var(--e-out)`). Height 44 px, gap 12 px.
- **Phone link.** `14px/500`, `.02em`, tabular, `--ivory-2`, hover ivory, `padding: 10px 0`.

### 4.3 Menu, a diptych of its own (`index.html:276-298`; `diptych.css:156-173`, `:738-745`; `core.js:311-366`)

- **Structure.** `div.menu#menu[role=dialog][aria-modal=true][aria-label=Меню][hidden]` holds:
  - `.menu__seam`;
  - the left half (onyx): `nav[aria-label=Страници] > ol.menu__pages`, right-aligned and pushed against the seam (`justify-items: end`, `padding-right: clamp(10px, 3vw, 48px)`);
  - the right half (umber): `.menu__info` with phones, hours, offices, email and the EU block (`padding-left: clamp(10px, 3vw, 48px)`, gap `26px`, max `520px`, `15px`);
  - `button.menu__close` „Затвори“ with an X icon (18 px, two 1 px lines at ±45°), placed in the header band (`top: 0; right: var(--gut); height: var(--hdr)`).
- **Halves.** Padding `calc(var(--hdr) + 6vh) var(--gut) 6vh`; `overflow: auto`; vertically centred.
- **Page links.** Serif `clamp(40px, 4.6vw, 72px)/1.08`, ivory, brass-l on hover and when current. The current link has a 34 × 1 px brass dash to its left (`right: calc(100% + 18px); top: 55%`). The GR item has a sub-line `.sub` (`500 13px/1.4 sans`, stone, `.02em`, `margin: -2px 0 10px`).
- **Open** (`core.js:328-344`):
  - `lockScroll(true)` (Lenis `stop()` plus `body { overflow: hidden }`);
  - timeline: left half `yPercent -100 → 0`, `0.75s expo.inOut`; right half `yPercent 100 → 0`, `0.75s expo.inOut` (both at 0);
  - seam `scaleY 0 → 1`, `0.9s expo.out` at `0.45`;
  - items (`li` and the info children) `opacity 0, y 26 → 1, 0`, `0.8s expo.out`, stagger `0.04` at `0.5`;
  - focus moves to the first page link after `650 ms` (`50 ms` with reduced motion).
- **Close:** items `opacity → 0` (`0.2s`); halves back to `-100 / 100` (`0.6s expo.inOut` at `0.05`); then `hidden`, `clearProps`, unlock scroll, focus returns to the opener (unless the close was instant).
- **Keys:** Escape closes; Tab is trapped (`trapFocus`, `core.js:359-365`). A same-page hash link closes the menu instantly before scrolling.
- **Reduced motion:** a 0.2 s fade.
- **Phones:** one column (`grid-template-rows: auto auto`, the whole menu scrolls). The seam and the current dash hide; pages are left-aligned; left half `padding-bottom: 36px`, right half `padding-top: 36px`.

### 4.4 Buttons and links (`diptych.css:74-94`)

- **`.btn`:** `inline-flex; gap: 12px; min-height: 52px; padding: 0 28px; border: 1px solid var(--b)` with `--b: var(--brass)`; `color: var(--ivory); font: 500 14px/1 var(--sans); letter-spacing: .03em; white-space: nowrap`. Transitions: border-color, background-color and color, `.25s var(--e-soft)`. Hover: `--b: var(--brass-l)`, ground `rgba(184,149,74,.09)`.
- **`.btn--solid`:** ivory ground, onyx text, ivory border; hover `#fff`.
- **`.btn--sm`:** `min-height: 40px; padding: 0 18px; font-size: 13px`.
- **`.btn .arr` and `.link .arr`:** an 18 × 10 arrow SVG (`M0 5h16M12 1l4 4-4 4`, stroke 1.2). On hover `translateX(4px)`, `.3s var(--e-out)`.
- **`.link`:** `inline-flex; gap: 10px; padding: 6px 0`, ivory, 500. The underline is `linear-gradient(var(--brass), var(--brass)) 0 100% / 100% 1px no-repeat`. On hover the underline turns brass-l and the text `#fff`.

### 4.5 The seam primitive (`diptych.css:97-98`)

- `.seam { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; margin-left: -.5px; background: var(--brass); transform-origin: 50% 0; pointer-events: none; z-index: 3; }`.
- `.seam--h` (horizontal, `transform-origin: 0 50%`) is supported by `[data-draw]` but unused.
- Seams with `data-draw` draw in on scroll (§4.9). Phone conversions are in §3.2.

### 4.6 The split hero (Home) (`index.html:85-130`; `diptych.css:275-319`, `:747-771`; `home.js:11-124`)

**Structure.** `section.hero#proekti[aria-label="Нашите сгради"]`, `height: 100svh; min-height: 620px` (`560px` on phones), `--seam: 50%`. It holds:
1. `a.half.half--gr[href=golden-residence.html][data-hero=gr]`:
   - `.half__media > img` (gr-dusk 800 / 1400 / 2400 w, `sizes=100vw`, `fetchpriority=high`, `alt=""`);
   - `.half__shade`;
   - `.half__info`: `h2.half__name`, `p.half__count`, `p.half__place`, `span.link.half__cta`.
2. `a.half.half--mn[href=#zapitvane]`, the same structure; its count is mirrored (text, then number).
3. `.hero__seam`.
4. `h1.hero__title`.

**Clipping.** Each half is `position: absolute; inset: 0` and is clipped:
- desktop: GR `clip-path: inset(0 calc(100% - var(--seam)) 0 0)`, MN `inset(0 0 0 var(--seam))`;
- phones: GR `inset(0 0 calc(100% - var(--seam)) 0)`, MN `inset(var(--seam) 0 0 0)`;
- phone media: GR `top: 0; bottom: 50%`, MN `top: 50%; bottom: 0`.

The media spans the full hero width.

**Image framing** (`object-position`): GR `50% 62%` (phones `70% 62%`), MN `70% 58%` (phones `72% 60%`).

**Keeping each building centred in its half** (`applySeam`, `home.js:27-36`, on every seam change and on resize):
```
s = seam/100, W = hero width
xg = min(0, max((s − 1)·W, (s·W)/2 − FOCAL_GR·W))        // FOCAL_GR = 0.68, the tall tower
xm = min(s·W, max(0, ((1 + s)/2)·W − FOCAL_MN·W))         // FOCAL_MN = 0.73, the right pair of towers
gsap.set(GR media, {x: xg}); gsap.set(MN media, {x: xm})   // phones: x = 0
```

**Info block.**
- `bottom: clamp(32px, 7vh, 72px)`; `max-width: min(40vw, 520px)`; grid gap `6px`. GR sits at `left: var(--gut)`; MN at `right: var(--gut)`, right-aligned.
- Count: `15px`, `--ivory-2`, baseline flex, gap 10 px; the number is serif 600. Place: `14px` stone. CTA: `margin-top: 14px`.
- Phones: GR info sits at `bottom: calc(50% + 18px)`, MN at `bottom: 22px`, both left-aligned; name `32px`, number `40px`, place `13px`, CTA `margin-top: 6px`, gap 4 px.

**The widening rule** (`home.js:41-59`; desktop only, not under reduced motion):
- `pointerenter` with `pointerType === 'mouse'`, or `focus`, on the GR half calls `widen(62, 'gr')`. On the MN half it calls `widen(38, 'mn')`.
- `pointerleave` of the hero (mouse) and `blur` of a half call `widen(50, null)`. Touch and pen never widen. Phones never widen.
- `widen(to, which)`:
  - `gsap.to(st, {s: to, duration: 0.9, ease: 'expo.out', onUpdate: applySeam, overwrite: true})`;
  - the other half's `.half__shade` goes to opacity `0.4` (its own to `0`), `0.9s expo.out`;
  - the pointed half's number rolls `0 → n`, `0.6s power2.out` (`KSM.roll(n, value, 0.6, 0)`).
- The H1 sits at `left: var(--seam)`, so the headline's hinge travels with the seam. A `busy` flag blocks widening during the GR click transition.

**Slogan A arrangement** (`index.html:116-120`; `diptych.css:296-309`):
- Markup:
  ```
  h1.hero__title
    span.sl.sl--a
      span.sl__row:  span.sl__l „Създаваме“            span.sl__r „пространства“
      br.sl__br
      span.sl__row:  span.sl__l „за <em>мечтания</em>“  span.sl__r „живот“
  ```
  Row 1 is „Създаваме“ / „пространства“; row 2 is „за *мечтания*“ / „живот“.
- `.hero__title`: `position: absolute; z-index: 4; left: var(--seam); top: clamp(104px, 16.5vh, 176px); width: 0; pointer-events: none`, with font and shadow as in §2.2 and `--gap: .2em`.
- `.sl__row { position: relative; display: block; height: 1.06em }`. `.sl__l, .sl__r { position: absolute; top: 0; white-space: nowrap }`.
  - `.sl__l { right: var(--gap); text-align: right }`: its right edge sits .2 em left of the seam.
  - `.sl__r { left: var(--gap) }`: it starts .2 em right of the seam.
- Each row reads across the seam. The seam gap (2 × .2 em) stays smaller than the row spacing, so rows group as lines, not columns. Every part is at most 12 letters, so it fits beside a 38 % seam.
- `.sl__br` is hidden at ≥ 901 px. `em` is brass-light here.
- **Phones** (`:769-771`): `.hero__title { left: 0; right: 0; width: auto; top: calc(var(--hdr) + 14px); padding: 0 var(--gut); font-size: clamp(30px, 8.4vw, 46px); line-height: 1.08 }`; `.sl__row { display: inline; position: static; height: auto }`; `.sl__l, .sl__r { position: static; display: inline-block }`. The result is two clean lines, „Създаваме пространства“ / „за мечтания живот“, broken at `.sl__br`. A part never breaks inside.
- **Entrance** (`home.js:98-115`):
  - Each `.sl__l` and `.sl__r` of the active slogan is split separately (`SplitText.create(el, {type: 'words,lines', mask: 'lines', linesClass: 'split-line'})`). The order is row 1 left, row 1 right, row 2 left, row 2 right, so the entrance walks the eye across the seam.
  - Then `gsap.timeline({delay}).from(lines, {yPercent: 112, duration: 0.9, ease: 'expo.out', stagger: 0.1})`.
  - **On complete the split is reverted** (the masks would clip descenders and the shadow). During the rise `.hero__title .split-line-mask { overflow-clip-margin: .2em }`.

**Entrance** (`heroEntrance`, `home.js:117-124`):
- both images `scale 1.12 → 1`, `1.4s expo.out` at 0;
- the title rises at `delay + 0.25`;
- the infos `opacity 0, y 22 →`, `1s expo.out`, stagger `0.1` at `0.45`.

**Home → GR as one move** (`home.js:62-76`):
- A left click on the GR half on desktop, with motion allowed and the scroll position ≤ 8 px, does this:
  - `busy = true`; `img.style.viewTransitionName = 'gr-hero'`;
  - title and infos `opacity → 0` (`0.3s power2.out`); GR shade → 0 (`0.3s`);
  - `st.s → 100` (`0.8s expo.inOut`, `onUpdate: applySeam`);
  - seam `opacity → 0` (`0.25s` at `0.55`);
  - on complete: `sessionStorage['ksm-hero'] = '1'`, then `location.href`.
- No doors. The GR hero uses the same image and the same `object-position: 50% 62%`. At `s = 100`, `xg = 0`, so the frame matches. The GR page skips its image scale-in (`from-hero`).
- Otherwise (phone, reduced motion, scrolled) it uses `KSM.navigate` (the doors).
- Cross-document View Transitions are off: "Chrome aborted them here" (`diptych.css:30-31`).
- The MN half click sets the form's project to `mn` and scrolls to `#zapitvane`.
- On bfcache restore (`ksm:restored`) the seam goes back to 50, opacities are cleared and the transition name is removed.

### 4.7 Intro sequence, once per session (`home.js:170-194`; `diptych.css:137-153`; `index.html:63-67`)

- **Markup.** `#doors[aria-hidden]` holds:
  - `.door--l`, whose `.door__mark` contains the emblem SVG (`viewBox 0 0 145.13 165.45`, `stroke-width 2.6`, round caps; 26 paths, each `pathLength="1"`);
  - `.door--r`, whose empty `.door__mark` gets `innerHTML` cloned from the left one (`core.js:228`);
  - `.doors__seam`.
- **Doors.** Each door is half the width, onyx, `overflow: hidden`, with an inner radial glow.
- **The mark.** It is split down its axis between the doors: 92 × 105 px, `top: 50%; margin-top: -52px`, colour brass. In the left door it sits at `right: -46px`; in the right door at `left: -46px`.
- **CSS start state:** `html.doors-shut .doors` is visible and doors are at `transform: none`. Under `html.intro`, `.doors__seam` is at `scaleY(0)` and the mark paths are at `stroke-dasharray: 1 1; stroke-dashoffset: 1`.
- **Timeline**, after the ready gate (total ≈ 1.8 s; the note says "1.8 s"):

| t (s) | Tween |
|---|---|
| 0 | seam `scaleY 0 → 1`, `0.6s expo.out` (draws down the centre) |
| 0.2 | mark paths `strokeDashoffset 1 → 0`, `0.55s expo.out`, `stagger: (i) => (i % n) * 0.006` with `n = paths/2` (both halves draw in sync) |
| 0.9 | left door `xPercent → -101`, right door `→ 101`, `0.8s expo.inOut` |
| 0.95 | `heroEntrance(0.95)`: images `1.12 → 1`; title at 1.2; infos at 1.4 |
| 1.55 | seam `opacity → 0`, `0.25s power1.out` |
| end | `sessionStorage['ksm-intro'] = '1'`; remove `intro` and `doors-shut`; hide the doors; marks to opacity 0 |

- It plays only when motion is allowed, on the first Home load of the session, when the page was not reached through the doors.

### 4.8 Door page transition (`core.js:220-298`)

- **Interception** (`interceptLinks`). It catches left clicks without modifiers on a same-origin `a[href]`, with no `target` other than `_self` and no `download`.
  - Same path and search with a hash: `preventDefault`; close the menu instantly; `KSM.scrollTo(target, {offset: -data-offset})`. `#zapitvane` on Home has `data-offset="76"`.
  - A different `.html` or `/` path: `KSM.navigate(href)`.
- **Close** (`doorsClose`, 400 ms plus the glint):
  - kill tweens; doors visible with `pointer-events: auto`;
  - seam `scaleY 1, opacity 0, backgroundColor '#B8954A'`, no shadow;
  - timeline:

| t (s) | Tween |
|---|---|
| 0 | seam `opacity → 1`, `0.12s power1.out` |
| 0 | doors `xPercent → 0`, `0.4s expo.inOut` (two onyx panels close onto the seam) |
| 0.40 | glint: seam `backgroundColor '#D8BD7A', boxShadow '0 0 16px 1px rgba(216,189,122,.7)'`, `0.06s none` |
| 0.46 | back: `'#B8954A'`, no shadow, `0.06s none` |

  - then `sessionStorage['ksm-doors'] = '1'`; `location.href = href`.
  - The mark stays hidden on page changes (`html.doors-shut:not(.intro) .door__mark { opacity: 0 }`).
- **Open** on the next page (`doorsOpen(0.05)`):
  - the head script drew the doors shut, seam visible;
  - doors `xPercent → -101 / 101`, `0.6s expo.out`; seam `opacity → 0`, `0.3s power2.out` at `0.15`;
  - then the classes are removed and the doors hidden;
  - the page entrance starts at `0.12`.
- **Reduced motion:** close is the overlay `opacity 0 → 1` in `0.2s` with the doors already shut; open is `opacity → 0` in `0.2s`.
- **bfcache** (`pageshow`, `persisted`): reset the doors to open and hidden, clear `navigating`, dispatch `ksm:restored`.
- **Port note.** The concept is an MPA and passes state through `sessionStorage` flags. In React Router the doors become the route transition: close for 400 ms, navigate, render, open for 600 ms. Keep the timings and the glint.

### 4.9 Reveals and hinged headings (`core.js:192-218`; `diptych.css:191-195`)

- **`[data-split]`:**
  ```
  SplitText.create(el, {type: 'words,lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, {yPercent: 112, duration: 0.9, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: {trigger: el, start: 'top 88%', once: true}})})
  ```
  The split is never reverted (§8.3).
- **`[data-fade]`:** `gsap.from(el, {opacity: 0, y: 16, duration: 1, ease: 'expo.out', scrollTrigger: {trigger: el, start: 'top 92%', once: true}})`. Body copy only fades.
- **`[data-draw]`:** `gsap.from(el, {scaleY: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: {trigger: el.parentElement, start: 'top 82%', once: true}})` (`scaleX` for `.seam--h`).
- **`[data-wipe]`** is supported (a clip-path wipe from the seam side plus the image `1.14 → 1`) but unused in the markup.
- **The hinge.**
  - `.hinge` is a two-column grid, `align-items: end`, `margin-bottom: clamp(56px, 9vh, 104px)`.
  - The first child (the H2) is right-aligned, `padding-right: clamp(24px, 3vw, 52px)`, so the title ends at the seam.
  - The second child (the lead) has `padding-left: clamp(24px, 3vw, 52px)`, so it starts after the seam.
  - The seam overshoots 18 px.
  - The hinge has no side padding on desktop; the H2's left edge can reach the viewport edge.
  - Phones: one column; the H2 is left-aligned with `padding: 0 0 22px`; the lead has `padding: 22px 0 0; border-top: 1px solid var(--brass)`; `.hinge { padding: 0 var(--gut) }`.
- **Where hinges appear:** Home services and teaser; GR blocks, gallery and parking. The explorer head (`.explorer__head`) is a hinge variant.

### 4.10 Company section „За нас“ (`index.html:136-152`; `diptych.css:321-335`, `:773-776`)

- **Structure.** `section.sec.bros.split#za-nas[aria-labelledby=bros-h]` holds a `span.seam[data-draw]` and two halves.
- **Left half: `.bros__motto`.** Flex, centred vertically, pushed to the seam; `padding: 0 clamp(28px, 4vw, 80px) 0 var(--gut)`.
  - `blockquote[data-split]`: italic serif `clamp(48px, 6vw, 104px)/.98`, ivory, right-aligned, max `9.5em`. The quote marks `.q` are brass; `em` is brass-light.
- **Right half: `.bros__story`.** `padding: 0 var(--gut) 0 clamp(28px, 4vw, 80px)`; grid gap 22 px, centred. It holds:
  - `h2.h3#bros-h[data-split]` „Традиция и иновации от *2008*“ (`margin-bottom: 4px`);
  - two `p[data-fade]` (17 px / 1.7, `--ivory-2`, max 33 em);
  - `p.triad[data-fade]`: three italic words separated by a 28 × 1 px brass dash (`span + span::before`, `margin: 0 18px 6px`, `vertical-align: middle`); intended size `clamp(28px, 2.4vw, 38px)/1`, ivory (§8.3);
  - `dl.facts-row[data-fade]`: three auto columns, gap `18px 44px`, `margin-top: 18px`, `padding-top: 26px`, top rule `--hair-2`. `dt` is serif 600 `clamp(36px, 3vw, 48px)/1`; `dd` is `13px` stone, `margin-top: 6px`, max 13 em.
- **Phones.** The motto is left-aligned with `padding: 0 var(--gut) 40px`. The story gets `padding-top: 40px`, a brass `border-top` and `margin: 0 var(--gut)`. `.facts-row` becomes three equal columns with gap 16 px (two at ≤ 560 px).
- With `?slogan=b`, `home.js:126-140` swaps the motto for the former hero line. This is concept-only.

### 4.11 Services, from concept 1 as Diptych shows it (`index.html:159-184`; `diptych.css:337-370`, `:777-786`, `:915-922`; `home.js:210-217`)

- **Structure.** `section.sec.svc#uslugi` (`padding-bottom: 0`) holds:
  - a `.hinge` with H2 „Строим, ремонтираме, *завършваме*.“, the lead and a drawn seam;
  - `.svc__cols`, a flex row, `height: clamp(470px, 60vh, 600px)`, umber, top and bottom rules `--hair-2`.
- **Each column** is `article.svc__col[tabindex=0][aria-labelledby]`:
  - `flex: 1 1 0`; flex column, `justify-content: space-between`, gap 24 px;
  - padding `clamp(30px, 3.2vw, 48px) clamp(28px, 3.4vw, 56px) clamp(36px, 3.8vw, 58px)`;
  - `overflow: hidden; isolation: isolate; transition: flex-grow .8s var(--e-out)`.
  - Columns 2 and 3 start with `span.seam[data-draw]` at `left: 0`.
  - `.svc__img` (`aria-hidden`, absolute, `z-index: -1`): `opacity: 0; clip-path: inset(100% 0 0 0)`. The image inside has `filter: brightness(.66); transform: scale(1.14)` plus the gradient in §1.2.
  - `span.svc__n` „01“ / „02“ / „03“: outlined brass numerals (§2.3).
  - `.svc__body > h3.svc__t + p.svc__d`. The text has `opacity: 0; transform: translateY(14px)` and a **fixed `width: 23em`**, so a narrowed column never rewraps its hidden line and the title holds still.
  - `.svc__col::after`: a 1 px brass-l underline, `left` and `right` `clamp(28px, 3.4vw, 56px)`, at the bottom, `transform: scaleX(0)`, `transform-origin: 0 50%`.
- **Hover and focus reveal** (`(hover: hover) and (min-width: 901px)`, `:356-364`):
  - Every column in a hovered row (or a row with a focus-visible column) gets `flex-grow: .78`; the pointed or focused column gets `flex-grow: 1.7`.
  - The photo opens from the bottom: `opacity 1; clip-path: inset(0 0 0 0)` (transitions `clip-path 1s var(--e-out), opacity .6s var(--e-out)`), and the image goes `scale(1)` (`1.6s var(--e-out)`).
  - The numeral goes to opacity 1 (`.6s`).
  - The text appears with `opacity 1; transform: none; transition-delay: .12s` (`opacity .5s`, `transform .6s var(--e-out)`).
  - The underline draws, `scaleX(1)`, `.7s var(--e-out)`.
- **Touch tablets** (`(hover: none) and (min-width: 901px)`): photos at `opacity: .5`, no clip, no scale; the text is always shown at `width: auto; max-width: 24em`.
- **Entrance** (`servicesIn`, `home.js:211-217`, `scrollTrigger: {trigger: '.svc__cols', start: 'top 84%', once: true}`):
  - numerals `from {yPercent: 36, opacity: 0}`, `1.2s expo.out`, stagger `0.12`;
  - titles `from {y: 22, opacity: 0}`, `1s expo.out`, stagger `0.12` at `0.18`;
  - both with `clearProps: 'transform,opacity'`.
  - The column seams draw through `[data-draw]`.
- **Phones:** the columns stack (`height: auto`); `min-height: 300px; padding: 26px var(--gut) 30px; gap: 36px`; a brass `border-top` between columns; the seams and underline hide; photos `opacity: .62`, unclipped; numeral `92px`, opacity `.9`; title `32px`; text always shown (`15px`, `margin-top: 10px`, `max-width: 24em`).
- **Reduced motion:** columns stay equal (`flex-grow: 1 !important`); no clip or scale; photo, text and underline only fade in (`.25s`).
- `.svc .split-line-mask { overflow-clip-margin: .22em }` keeps the italic з of „завършваме“.
- **Images:**
  - column 1: `res-photo4-900/1600.webp`, `sizes="(max-width: 900px) 100vw, 56vw"`;
  - column 2: `works-chitalishte-700/1200.webp`, `object-position: 40% 50%`;
  - column 3: `works-paradise-960.webp`, `object-position: 50% 35%`.

### 4.12 Completed works „Нашите обекти“ (`index.html:187-205`; `diptych.css:372-393`, `:787-790`; `home.js:219-262`)

- **Structure.** `section.works.split#obekti` (not `.sec`) holds a static seam and two halves.
- **Left half: `.works__media`.** `position: sticky; top: 0; height: 100svh`, umber.
  - `#works-frame`: `inset: calc(var(--hdr) + 3vh) 0 6vh 0`.
  - `#works-cap`: `left: clamp(28px, 4vw, 64px); bottom: calc(6vh + 22px)`, 13 px `--ivory-2` on `rgba(14,13,11,.66)`, `padding: 8px 12px`.
  - Layers `.works__img` are appended per work. A work without a photo gets `.works__plate`: centred italic place name plus a `.small` line, a radial ground and a brass frame at `inset: 9%`.
- **Right half: `.works__list`.** `padding: calc(var(--hdr) + 8vh) var(--gut) 14vh clamp(28px, 5vw, 96px)`, gap 22 px. It holds the H2, the lead (`margin-bottom: 26px`) and `ol#works-items` (top rule `--hair-2`).
  - Each `li` holds a `button[data-w]`: a grid `1fr auto`, `padding: 22px 0 20px`. Inside: the serif name, an optional `.tag` „груб строеж“ (12 px brass-l, 1 px border `rgba(216,189,122,.4)`, `3px 8px`) and a `.small` line spanning both columns.
- **States.** The current item is `aria-current="true"`. When current or hovered, the bottom underline `::before` goes `scaleX 0 → 1` (`.5s var(--e-out)`) and the name turns brass-l with `translateX(10px)` (`color .25s, transform .45s var(--e-out)`).
- **Behaviour** (`showWork(i)`): triggered by `pointerenter` (mouse only), `focus` or `click`.
  - Append the new layer and set the caption (hidden for plates).
  - `clipPath` goes from `inset(0% 0% 0% 100%)` (desktop: opens from the seam edge) or `inset(0% 0% 100% 0%)` (phones: from the top) to `inset(0% 0% 0% 0%)`, `1s expo.inOut`.
  - The inner element goes `scale 1.08 → 1`, `1.3s expo.out` at `0.15`.
  - Old layers are removed on complete.
  - Photos are preloaded.
- **Phones:** the media becomes `position: relative; height: 62svh`, the frame `inset: 0`, the caption `bottom: 16px; left: var(--gut)`, the list `padding: 40px var(--gut) 80px`.

### 4.13 GR teaser on Home „Golden Residence, етаж по етаж“ (`index.html:208-220`; `diptych.css:395-403`; `home.js:264-280`)

- **The hinge** carries the H2 and the lead.
- **`#home-facade`** is `KSM.Facade(el, data, {mode: 'compact', onOpen: (b, f) => KSM.navigate('golden-residence.html?floor=' + b + '-' + f + '#explorer')})`. It is the same facade as §4.20 with these differences:
  - no panels and no sheet;
  - stage width `min(W − 340, (H − 300)·1200/454, 1180)`, at least 520;
  - the caption is `aria-live`, with an idle hint; on hover it shows „Блок А · *етаж 5*“ plus the four count chips;
  - a click navigates.
- **`nav.ways[aria-label="Два начина да изберете апартамент"]`:**
  - a two-column grid, `margin-top: clamp(40px, 6vh, 72px)`, top and bottom rules `--hair-2`, a static seam;
  - links have `padding: 36px clamp(28px, 4vw, 80px)`; the first is right-aligned;
  - hover ground `rgba(184,149,74,.06)` (`.35s var(--e-soft)`); serif `clamp(40px, 4vw, 64px)/1`, brass-l on hover; `.small` 14 px;
  - links go to `golden-residence.html#explorer` and `golden-residence.html?view=list#explorer`;
  - phones: stacked, left-aligned, `padding: 26px var(--gut)`, a brass `border-top` between.

### 4.14 Closing and inquiry (`index.html:223-247`, `golden-residence.html:204-229`; `diptych.css:232-253`, `:405-412`; `core.js:435-482`)

- **Structure.** `section.sec.contact.split#kontakti` holds a drawn seam and two halves.
- **Left half: `.contact__l#zapitvane`.**
  - Home sets `data-offset="76"`. The GR page does not, so the header covers the top of the block after a jump there.
  - `padding: 0 clamp(28px, 4vw, 80px) 0 var(--gut)`; right-aligned grid; gap 26 px.
  - It holds the H2 (max 9 em), the lead, `a.contact__tel` (serif `clamp(36px, 3.4vw, 56px)/1`, hover brass-l), the second phone as `.small` 14 px, (on GR) the email, and the hours.
- **Right half: `.contact__r`.** `padding: 0 var(--gut) 0 clamp(28px, 4vw, 80px); max-width: 680px`.
  - `form.form#enquiry-form[novalidate][data-fade]`, grid gap 22 px:
    - `.form__row` (`1fr 1fr`): Име (`autocomplete=name`, required) and Телефон (`type=tel`, `inputmode=tel`, required);
    - `select#f-project`;
    - a hidden picks field (chips);
    - textarea `#f-msg` (`rows=3`, `min-height: 92px`, `resize: vertical`);
    - `label.consent` (13 px stone; checkbox 16 px, `accent-color: var(--brass)`, `required`);
    - the submit `.btn.btn--solid` „Изпратете запитване“ with an arrow.
  - `.form__ok[hidden][role=status]`: the thank-you line in serif 36 px plus a lead.
- **Fields.** Transparent, `border-bottom: 1px solid var(--hair)`, `padding: 10px 0 12px`, 17 px ivory, `border-radius: 0`. On focus the border turns brass-l; with `:focus-visible` they also get `box-shadow: 0 1px 0 0 var(--brass-l)` and no outline. The select has `appearance: none` and a 12 × 8 brass chevron SVG at `right 4px center` (`padding-right: 26px`); options sit on umber. Labels are 13 px stone, `.02em`.
- **Validation** (JS only):
  - name non-empty; phone with at least 6 digits;
  - `aria-invalid`, `borderColor: var(--st-sold)`, focus moves to the first invalid field.
  - **The consent box is never checked** (`novalidate` disables the native check).
- **Success.** The form hides and `.form__ok` shows, its children `from {opacity: 0, y: 18}`, `0.8s expo.out`, stagger `0.08`. **Nothing is sent** (concept-only, §0.1).
- **Picks.** `KSM.enquire(ids)`:
  - adds the ids to a set and renders chips „Апартамент {id}“ with an × (`aria-label="Махнете {id}"`), height 34 px;
  - closes the plan and the unit panel instantly; sets the select to `gr`;
  - scrolls to `#zapitvane` after 60 ms; focuses the name after 1500 ms.
- **Presets.** `?project=mn` preselects `mn`; the parking links set `garage`; the MN hero half sets `mn`.
- **Phones:** the left half is left-aligned with `padding: 0 var(--gut) 40px`; the right half gets `padding-top: 40px`, a brass `border-top` and `margin: 0 var(--gut)`; `.form__row` becomes one column.

### 4.15 Footer, EU line and EU dialog (`index.html:250-273`, `:301-314`; `diptych.css:175-182`, `:201-230`; `core.js:369-381`)

- **Footer.** `footer.ftr` (onyx, top rule `--hair-2`) holds `.ftr__grid`, two columns with a static seam.
  - Halves: `padding: clamp(64px, 10vh, 110px) clamp(28px, 5vw, 96px) 48px`.
  - **Left half:**
    - the logo (156 px, `margin-bottom: 28px`, mark brass);
    - `.ftr__blurb` (15 px `--ivory-3`, max 30 em, `margin-bottom: 36px`);
    - `.ftr__cols` (two columns, gap `30px 32px`, 15 px) with Телефони, Работно време, Имейл, Офиси (each office followed by „Отвори в Google Maps“, 13 px stone, underline `--hair`).
    - Column labels are `h2` (13 px / 1.3, 500, stone, `.02em`, `margin-bottom: 8px`); link hover brass-l.
  - **Right half** (umber; flex column, `space-between`, gap 40 px):
    - the `.eu` block (column, gap 18 px, 14 px; logo plates 34 px tall; text max 34 em);
    - `.ftr__copy` (13 px stone, wrap, `space-between`): „© {year} КСМ Строй · КСМ СТРОЙ ООД“ and „Обекти · Facebook“.
  - **Phones:** the halves stack (seam hidden), `padding: 56px var(--gut) 40px`; columns 2 → 1 at ≤ 560 px.
- **The EU line `.eu`.** Flex wrap, gap `14px 22px`, 13 px / 1.5 `--ivory-3`.
  - `.eu__plate` (`#F7F4EE`, `padding: 9px 14px`, gap 14 px) carries the two logos at 28 px height (`eu-cofunded-bg.png` 900 × 198, `pkip.png` 1283 × 355). The logos are dark on transparent, hence the paper plate.
  - The text runs beside it. „За проекта“ (`[data-eu-open]`) is underlined in brass and opens the dialog.
  - The full text is in the footer; the short text in the menu.
  - **The EU line appears in the footer and the menu only, not in the header** (spec §14.1 names the header as the default).
- **EU dialog.** Native `<dialog class="dlg" aria-labelledby="eu-h">`:
  - opened with `showModal()` plus `lockScroll`; closed by the × button (`aria-label="Затворете"`, 44 px) or a backdrop click; `close` unlocks scrolling;
  - `.dlg__box`: centred; columns `.8fr / 1fr`; `width: min(1080px, 100vw − 32px)`; `max-height: calc(100svh − 48px)`; umber; border `--hair`; `overflow: auto`;
  - the poster column is white with `padding: 18px`, poster `max-height: 76svh` (`46svh` on phones);
  - the text column has `padding: 48px clamp(24px, 4vw, 56px)`, grid gap 18 px, 15 px `--ivory-2`, and a `dl` in two columns (auto, 1fr; gap `6px 18px`; 14 px; `dt` stone);
  - phones: one column, seam hidden.
- **Port note.** v2 already has `/eu-proekt` (`src/routes/eu-proekt.jsx`) and an EuLine `tone="dusk"` with the same paper-plate idea (`src/shell/EuLine.jsx:92-109`). Diptych's dialog is the concept's version of that link target.

### 4.16 Saved apartments (a concept feature, not production) (`core.js:383-433`; `diptych.css:123-134`)

- A heart toggle (in the unit panel and in list rows) stores ids in `localStorage['ksm-saved']` and dispatches `saved:change`.
- The header button `#saved-btn` (40 px tall, border `--hair`, heart in brass-l, count `b` 600 brass-l) appears once at least one unit is saved. It toggles `#saved-pop`:
  - fixed at `top: calc(var(--hdr) + 6px); right: var(--gut)`; umber; `padding: 18px 20px 20px`; shadow;
  - a list of ids; clicking an id opens the unit (on Home it navigates to `golden-residence.html?unit=…#explorer`); × removes an id;
  - „Запитване за запазените“ calls `KSM.enquire(all)`;
  - a click outside closes it.
- New scope. Keep it only if the user wants it.

### 4.17 GR hero (`golden-residence.html:61-76`; `diptych.css:417-430`, `:799-807`; `gr.js:16-38`)

- **Structure.** `section.grhero#top` (`100svh`, `min-height: 640px`) holds:
  - `.grhero__media > img`: gr-dusk, `alt="Golden Residence по здрач, визуализация"`, `object-position: 50% 62%` (phones `68% 62%`), `view-transition-name: gr-hero`;
  - a gradient overlay;
  - `.grhero__in` at `bottom: clamp(36px, 7vh, 80px)`:
    - centred `h1` „Golden *Residence*“;
    - the address (15 px `--ivory-2`, `margin-top: 18px`);
    - `.grhero__facts`: two columns around a seam, `margin-top: clamp(28px, 5vh, 52px)`. Each `.fact` is a baseline flex with gap 12 px and padding `0 clamp(22px, 2.4vw, 40px)`. The left fact is right-aligned: „192 апартамента в 2 блока“ (192 is hardcoded). The right fact is „69 свободни в момента“ (live).
    - `.grhero__actions` (centred, gap 14 px, `margin-top: clamp(26px, 4.4vh, 44px)`): solid „Изберете апартамент“ → `#explorer`; outline „Запитване“ → `#zapitvane`.
- **Entrance** (delay 0.12 after the doors, else 0):

| Tween | Normal start | `from-hero` start |
|---|---|---|
| Image `scale 1.12 → 1`, `1.4s expo.out` | 0 | skipped |
| Title lines `yPercent 112`, `0.9s expo.out`, stagger `0.1` | 0.25 | 0.05 |
| Address `opacity 0, y 14`, `0.9s` | 0.45 | 0.2 |
| Facts seam `scaleY 0`, `0.9s` | 0.55 | 0.3 |
| `.fact` `opacity 0, y 16`, stagger `0.08` | 0.6 | 0.32 |
| Actions, the same tween | 0.7 | 0.42 |

  The title split is never reverted.
- **Phones:** title `clamp(48px, 13.5vw, 80px)`; address 14 px with gutters; facts stacked and centred around a 56 px horizontal tick; actions in a column.

### 4.18 Story: the pinned image with wipes (`golden-residence.html:84-127`; `diptych.css:432-451`, `:808-814`, `:906-914`; `gr.js:40-65`)

- **Structure.** `section.story.split#sgradata[aria-label=Сградата]`.
- **Left half: `.story__pin[aria-hidden]`.** `position: sticky; top: 0; height: 100svh`.
  - `#story-frame` at `inset: calc(var(--hdr) + 4vh) 0 7vh 0`, umber, holds 4 `.story__img` layers: entrance (`object-position: 40% 50%`), balconies, terrace (`52% 50%`), garden (`48% 50%`), each with a `srcset` and `sizes=50vw`.
  - `#story-idx` „**01** / 04“ (serif 600 28 px; the `/ 04` in stone 500), at `right: 28px; bottom: calc(7vh + 18px)`.
  - `#story-cap` (13 px stone) at `left: var(--gut); bottom: calc(7vh - 32px)`.
- **A static seam.**
- **Right half: `.story__text`** (`padding: 0 var(--gut) 0 clamp(28px, 5vw, 104px)`) holds 4 `article.story__block[data-cap]`: `min-height: 84svh` (the first `100svh`), grid centred, gap 22 px, `padding: 8vh 0`. Each block has a hidden `figure.story__inline` (shown on phones), an `h2.h2[data-split]` and `p[data-fade]` (17 px / 1.7, max 30 em), plus:
  - block 1: `.metro` (top rule; „500 м“ serif 600 `clamp(56px, 5vw, 84px)`, a 15 px text, the address in `.small`) and a Google Maps `.link`;
  - block 2: `dl.kv` (two columns, gap `22px 34px`, top rule, max 520 px; `dt` serif 600 40 px; `dd` 13 px stone);
  - block 4: a `.link` „113 гаража и 68 паркоместа →“ to `#garazhi` (live counts).
- **Wipes** (`gr.js:41-64`). Layer 0 is visible and the others are `clipPath: inset(0% 0% 0% 100%)`. For each block, `ScrollTrigger.create({trigger: block, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => self.isActive && show(i)})`. `show(i)`:
  - raises the layer's `zIndex` (`z++`);
  - `clipPath inset(0% 0% 0% 100%) → inset(0% 0% 0% 0%)`, `1s expo.inOut` (it opens leftward from the seam);
  - inner image `scale 1.08 → 1`, `1.4s expo.out`;
  - index → `padStart(2, '0')`;
  - caption = `data-cap`, faded `0 → 1`, `0.6s`, delay `0.3`.
  - No ScrollTrigger pin; the pin is CSS `sticky`.
- **Phones:** the pin hides; each block shows `figure.story__inline` (aspect `4 / 3`, full-bleed via `margin: 0 calc(var(--gut) * -1) 6px`, a brass 1 px bottom line); blocks lose `min-height` and get `padding: 56px 0`.
- **Reduced motion:** the pin hides; inline figures at `16 / 10`; `.story` becomes one column; `.story__text` max 820 px, centred; blocks `padding: 64px 0`.

### 4.19 Explorer: head, Визуално / По критерии, legend (`golden-residence.html:130-150`; `diptych.css:453-466`; `gr.js:67-104`)

- **Structure.** `section.explorer#explorer` (onyx, `overflow: clip`, padding §1.3) holds:
  - `.explorer__head`, two columns, `align-items: end`, `margin-bottom: 34px`, with a static seam:
    - left: `h2` „Изберете *апартамент*“, right-aligned, `padding-right: clamp(24px, 3vw, 52px)`;
    - right: a grid with gap 18 px, `padding-left: clamp(24px, 3vw, 52px)`, holding `.toggle[role=tablist][aria-label="Как да търсите"]` and a lead (15 px) „…: **69** от 192.“;
  - `.explorer__legend` (centred, `margin: 0 var(--gut) 18px`): `#gr-legend`, `KSM.countsHTML(totals)`, i.e. four chips with numbers, flex wrap, gap `10px 26px`;
  - `.views`: `#view-visual[role=tabpanel]` containing `#gr-facade`, and `#view-list[role=tabpanel][hidden]`.
- **Toggle.** Two `button[role=tab]` „Визуално“ and „По критерии“: serif `clamp(28px, 2.2vw, 36px)/1`, stone, ivory when selected or hovered, `padding: 8px 0 12px`, gap 34 px. `.toggle__bar` is a 1 px brass-l underline; JS sets its `width` to the selected tab's `offsetWidth` and `transform: translateX(offsetLeft)` (`transition .25s var(--e-soft)`). It is re-placed on resize and after the fonts load.
- **`setMode(m, animate)`:**
  - `Flip.getState(views)`; update `aria-selected` and the roving `tabIndex`; toggle the panels' `hidden`; re-place the bar; `fx.layout()`;
  - then `Flip.from(state, {duration: 0.7, ease: 'expo.inOut', scale: false, simple: true, onComplete: ScrollTrigger.refresh})`;
  - and the incoming panel `fromTo {opacity: 0, y: 26} → {opacity: 1, y: 0}`, `0.7s expo.out`, delay `0.12`.
  - ArrowLeft and ArrowRight on a tab focus and select the other tab.
- **Phones:** the head stacks (the right part gets a brass `border-top`); the legend is left-aligned with gap `8px 18px`.

### 4.20 Explorer: the facade layer and outer-edge counts (`explorer.js:215-555`; `diptych.css:468-506`, `:816-828`)

**Markup** (built by JS, `explorer.js:238-255`). `root.fx` holds:
- `.fxm` (phones only): a segmented control Блок А / Блок Б and „Докоснете етаж“;
- `.fx__stage`:
  - `p.fx__bname--a` „Блок А“ and `--b` „Блок Б“ (serif 30 px at `top: -46px`; the А label's right edge sits 18 px left of image x = 605, `right: calc(49.583% + 18px)`; the Б label starts 18 px right of it, `left: calc(50.417% + 18px)`; hidden on phones);
  - `svg.fx__svg[viewBox][role=group][aria-label="Фасада на Golden Residence. Изберете етаж."]` with these layers, in order:
    1. `<mask>`: a white rect plus a black `rect.fx__hole` at the hot floor's bbox;
    2. `image.fx__img`: `img/facade-cut-2400.webp` (2400 × 1198) at `0, 0, 1200 × 599` user units, `preserveAspectRatio="none"`;
    3. `rect.fx__dim`: onyx, masked, opacity 0, `.6` when `.fx.is-hot` (`.25s var(--e-soft)`);
    4. `rect.fx__tint`: fill = the hot floor's best-status colour, `fill-opacity 0 → .2`;
    5. `rect.fx__hl`: stroke brass-l 1 px, `vector-effect: non-scaling-stroke`; opacity 1 when hot; with the keyboard (`.is-kbd`) `stroke-width: 2px; stroke-dasharray: 6 4`;
    6. `line.fx__seam`: x = 605, y 120 → 520, brass 1 px, non-scaling;
    7. `g.fx__floors[tabindex=-1]`: 16 `path.fx__floor` (transparent hit areas, `tabindex=0`, `role=button`, `data-k="А-5"`, `aria-label` = floor label plus „. Enter отваря плана.“);
  - `.fx__rail--a` and `.fx__rail--b` (`aria-hidden`), zero-width columns that hold the counts;
- `p.fx__cap`: the caption (position absolute at the bottom, centred, 13 px stone; static on phones).

**Layout** (`layout()`, `explorer.js:328-363`, run on `ResizeObserver(root)` and on phone-query change):
- Desktop, full mode:
  - `pw = clamp(W·0.2, 284, 380)` → `--pw`;
  - `sw = max(520, min((W/2 − pw − 18)·(1200/(605 − 145)), (innerHeight − 300)·(1200/454), 1500))` → `--sw`. So Block А's outer edge (x = 145) sits 18 px clear of the panel's inner edge, and the panel never covers the block.
  - `--sh = sw·454/1200`. `.fx` height = `--sh + 100px`; the stage sits `top: 52px; left: calc(50% − var(--sw)·.504167)`.
  - Example at 1440 × 900: `pw = 288`, `sw = 1080`, `sh ≈ 409`, stage left ≈ 175.5 px.
- viewBox: desktop `VB_FULL = {x: 0, y: 112, w: 1200, h: 454}` (the building and its podium; the masked sky is cropped away). Phones: `VB_PHONE['А'] = {x: 0, y: 132, w: 628, h: 388}`, `VB_PHONE['Б'] = {x: 572, y: 132, w: 628, h: 388}`, and the stage gets `aspect-ratio: vb.w / vb.h` inside the gutters.
- Rails: `railA.left = (71 − vb.x)/vb.w · 100%`, `railB.left = (1129 − vb.x)/vb.w · 100%`, just outside each block's outer edge (А starts at x 143–148, Б ends at x 1051–1067).

**Counts** (`explorer.js:269-282`):
- One `.fx__cnt` per floor: `top` = the floor bbox's centre y in viewBox percent; `height: 30px; margin-top: -15px`; flex, gap 12 px (7 px on phones).
- Children: `span.f` (floor number, 11 px stone tabular, width 18 px, hidden on phones), `span.d` (a 6 px dot coloured `STATUS[floor.best].color`), `span.n` (the free count, serif 600 28 px, 24 px on phones, `min-width: 1.1ch`, centred).
- А rail: `right: 14px; flex-direction: row`, so it reads floor · dot · count, with the count nearest the facade. Б rail: `left: 14px; flex-direction: row-reverse`, mirrored, with the count again nearest the facade.
- States:
  - `.is-zero` (no free units): the count turns `rgba(155,148,136,.55)`;
  - `.is-hot`: the count turns brass-l;
  - while any floor is hot, the other counts' spans dim to `opacity: .32` (`.25s var(--e-soft)`).
- When panel А is open it covers the А rail (as designed: the panel comes from that edge).

**Hot floor** (`setHot`, `explorer.js:374-389`; `moveLens`, `:366-373`):
- Add `.is-hot` (and `.is-kbd` for the keyboard) to the root.
- Tween `hole`, `tint` and `hl` to the floor's bbox: `{attr: {x, y, width, height}}`, `0.25s power2.out` (instant on the first hot floor).
- Tint `fill-opacity → .2`, `0.2s power2.out`.
- Mark the floor's count hot. Then:
  - compact mode: update the caption;
  - phones: `showSheet`;
  - desktop: `showPanel`.
- `clearHot` reverses this (tint → 0, `0.2s`), hides the panels and restores the idle caption.
- `scheduleClose` = `setTimeout(clearHot, 320)`.

**Events** (`explorer.js:492-535`):
- `pointerdown` records `lastPointer`.
- `pointerover` on a floor (not touch or pen) → `setHot(k, 'mouse')`.
- `pointerleave` of the svg (mouse) → `scheduleClose`.
- `click`:
  - if the last pointer was touch or pen and this floor is not hot, `setHot(k, 'tap')` and stop (**first tap previews, second opens**);
  - else `openFloor`.
- `focusin` on a floor with `:focus-visible` → `setHot(k, 'kbd')`.
- `focusout` → if focus left the svg and no panel is hovered (desktop), `scheduleClose`.
- Keys on a floor:
  - Enter or Space → open the plan;
  - ArrowUp and ArrowDown → floor ±1, clamped 1..8, same block;
  - ArrowLeft → the same floor in А, ArrowRight → the same floor in Б (desktop only);
  - Escape → `clearHot`;
  - a moved selection focuses the new path and sets it hot (`kbd`).

**Intro** (`fx.intro()`, `scrollTrigger: {trigger: root, start: 'top 70%', once: true}`):
- image `opacity 0 →`, `1.2s power2.out`;
- seam `attr y2: 120 →` (draws down), `1.2s expo.out` at `0.2`;
- counts `from {opacity: 0, y: 10}`, `0.6s expo.out`, stagger `0.03`, floor 1 first, at `0.3`.

### 4.21 Explorer: the hover panel with the plan (desktop) (`explorer.js:284-301`, `:403-440`; `diptych.css:508-524`)

- **Structure.** Two `aside.fxp` per facade, each with `aria-live="polite"`:
  - `.fxp--a` sits at `left: 0` with `border-right: 1px solid var(--brass)`; `.fxp--b` at `right: 0` with `border-left`;
  - each is `width: var(--pw); height: 100%; min-height: 470px`; flex column, gap 14 px; `padding: 26px 26px 22px`; ground `rgba(26,23,20,.97)`; `z-index: 6`;
  - start state: `visibility: hidden`, `xPercent ∓102`.
- **Content:**
  - `p.fxp__title` „Блок А · *Етаж 5*“ (serif 34 px);
  - `p.fxp__meta` „кота +14,62 · 12 апартамента“ (12.5 px stone, `margin-top: -6px`);
  - `.fxp__plan` (`flex: 1`, `min-height: 120px`): a mini plan (`makePlan(data, block, {mode: 'mini', pad: 4, pat: 16, labelPx: 10, onUnit: (u) => openFloor(floor, u.id)})`);
  - `.fxp__counts`: a 2 × 2 grid of number chips;
  - `p.fxp__range` (13 px, top rule, `padding-top: 12px`);
  - `button.link.fxp__go` „Отворете плана →“.
- **Show** (`showPanel`):
  1. If the other block's panel is open, slide it shut.
  2. Fill the panel.
  3. If it was closed: `plan.setFloor(fs)`; slide in `xPercent ±102 → 0`, `0.45s expo.out`; then on the next frame `plan.fit()` and `plan.draw()`. The outlines draw with `strokeDashoffset 1 → 0`, `0.5s expo.out`, stagger `0.012`; the fills fade `0 → 1`, `0.3s power2.out`, stagger `0.02`, delay `0.12`.
  4. If it was open: `setFloor(fs, 'cross')`. Fills, labels and blocked overlays go `opacity → 0` in `0.075s` linear, the new floor is applied, then `→ 1` in `0.075s`.
- **Hide:** `xPercent → ±102`, `0.35s expo.in`, then `visibility: hidden`.
- **Hover bridge.** Entering a panel cancels the 320 ms close timer; leaving it (not touch) schedules the close.
- **Clicks.** A click on a unit in the mini plan opens the floor plan with that unit (§4.23). „Отворете плана“ opens the hot floor.
- **Range text** (`KSM.rangeHTML`):
  - free units with different areas: „свободни от **63,51** до **108,56 м²**“;
  - all free areas equal: „свободен: **X м²**“ (one free unit) or „свободни: **X м²**“;
  - none free but some reserved: „Няма свободни, има резервирани.“;
  - otherwise: „Разпродаден етаж“ (italic serif 28 px, `--st-sold`).
- Hidden on phones (`display: none !important`).

### 4.22 Plans, the shared renderer (`explorer.js:64-201`; `diptych.css:526-543`)

`KSM.makePlan(data, block, o)` builds an `svg.plan.plan--{mini|stage|crop}`.

**viewBox.** The union bbox of the block's 12 apartment polygons plus `pad` (default 14; mini 4), or `o.viewBox` for the crop. `preserveAspectRatio="xMidYMid meet"`; `aria-hidden` unless interactive.

**Defs** (`S = o.pat`):

| Pattern | Contents |
|---|---|
| Reserved `{uid}r` | `userSpaceOnUse`, `patternTransform="rotate(45)"`: rect S × S `#E9953F` at `fill-opacity .16`, plus rect `0.34S` × S `#E9953F` at `.95` (diagonal stripes) |
| Sold `{uid}s` | rect S × S `#D4574E` at `.13`, plus a circle at the centre with `r = 0.18S`, `#D4574E` (dots) |

`pat`: mini 16, stage 8, crop 5.

**Drawing** (`o.drawing`). `image.drawing` `img/plan-a.webp` (1200 × 845) or `img/plan-b.webp` (1200 × 847) at `0, 0, imageWidth × imageHeight`, `preserveAspectRatio="none"`. Opacity is `.6` with `.with-drawing` (`.78` in the crop), `.4s` fade. These are dark versions of `data/maps/architecture-{a,b}-floor-2.webp` (same pixel size).

**Per unit** (`g.u[data-suffix]`):
- `path.u-fill`;
- `path.u-blocked` (display none unless blocked);
- `path.u-shape` (`fill: none`, `pathLength: 1`, stroke brass at `var(--lw)`);
- `text.u-label` at the label point (Manrope 600, `var(--fs)`, ivory, halo `paint-order: stroke` with stroke `rgba(14,13,11,.88)` at `var(--hs)`, tabular; sold and blocked labels at ivory `.7`);
- `path.u-hit` (transparent; interactive plans give it `tabindex=0`, `role=button` and `aria-label="А 501, 2-стаен, 62,18 м², Продаден"`).

**Fills** (`fillFor`):

| Status | Fill |
|---|---|
| free | `#4FBF85` at `fill-opacity .46` |
| reserved | `url(#…r)` at 1 |
| sold | `url(#…s)` at 1 |
| blocked (and any unit missing from the sheet) | `#8A867D` at `.1`, plus the dashed outline `stroke: var(--st-blk); stroke-dasharray: var(--dash, 4 3)` |

The label = floor + suffix („501“), empty if the unit is missing.

**`fit()`.** `sc = min(rect.w/vb.w, rect.h/vb.h)`; then `--fs = labelPx/sc`, `--hs = 3/sc`, `--lw = lineW/sc` (default 1), `--dash = 4/sc 3/sc`. So the on-screen label is `labelPx` (mini 10, sheet 9.5, stage 12.5, crop 13), the halo 3 px, the line 1 px (crop 1.2), the dash 4/3 px.

**States:**
- `.u.is-hot`: stroke brass-l at `lw × 2.6`; fill `brightness(1.25)`.
- `.plan.has-hot`: the other fills at `opacity .4`.
- Focused hit (`.u:focus-within`): same as hot.
- `.has-focus` (the unit-panel crop): the non-focus fills at `.22`, labels `.45`, outlines `rgba(184,149,74,.45)`; the focus outline brass-l at `lw × 2.4`.

**Label point** (`labelPoint`). A grid search for the point inside the polygon farthest from its edges, with `step = max(2, min(w, h)/26)` (a pole-of-inaccessibility approximation).

### 4.23 Plan stage: click into the plan, unit table, block switch, ▲▼ stepper (`golden-residence.html:283-300`; `explorer.js:560-694`; `diptych.css:545-591`, `:850-858`)

**Structure.** `div.ps#ps[role=dialog][aria-modal=true][aria-labelledby=ps-title][hidden]`: fixed, `inset: 0`, `z-index: 260`, umber; rows `auto / minmax(0, 1fr)`.

**`.ps__bar`** (onyx; columns `1fr auto 1fr`; gap 18 px; `padding: 18px var(--gut)`; bottom rule):
- `.ps__id`: `h2.ps__title` „Блок А · *Етаж 5*“ and `p.ps__meta` „кота +14,62 · 12 апартамента · 4 свободни“ (13 px stone).
- `.ps__mid` (gap 22 px):
  - `.seg.ps__blocks[role=group][aria-label=Блок]`: buttons Блок А / Блок Б with `aria-pressed`; `min-width: 92px; height: 42px; padding: 0 16px`; 14 px 500 stone; pressed = ivory ground, onyx text.
  - `.step.ps__step`: ▲ (`aria-label="По-горен етаж"`), `output[aria-live=polite]` „етаж **5**“, ▼ (`aria-label="По-долен етаж"`). Buttons are 44 × 42 with a 12 × 8 chevron SVG; the output has `min-width: 74px`, `line-height: 42px` and side rules. Disabled at floor 8 and floor 1 (colour `rgba(155,148,136,.4)`).
- `button.ps__close` „Към сградата“ with an X (hover brass-l).

**`.ps__body`** (columns `minmax(0, 1fr) minmax(320px, 400px)`):
- `.ps__plan` (`padding: 18px 24px 12px`; the svg is absolute at `inset: 18px 24px 12px`, `overflow: visible`):
  - the stage plan: `makePlan(…, {mode: 'stage', drawing: true, pat: 8, labelPx: 12.5, interactive: true, label: 'План на етажа, блок А'})`;
  - `.ps__inspect`: a tooltip at the top left, `min-width: 220px`, `padding: 14px 16px`, ground `rgba(14,13,11,.92)`, border `--hair`. It shows the unit id (serif 30 px) and a `dl` (Вид, Обща площ, Изложение, Статус chip). It goes from `opacity 0; translateY(6px)` to `.is-on` (`.18s`, `.25s var(--e-out)`).
- `.ps__side` (umber-2, left rule):
  - `.ps__counts` (2 × 2 chips);
  - `.ps__list[data-lenis-prevent]` containing `table.utable`, with a sticky header Имот, Вид, Обща площ, Статус (12 px stone);
  - `.ps__hint` (12 px stone).

**Table rows.** `tr.row[tabindex=0][data-id][data-suffix]`: id (600 ivory), type, area „62,18 м²“, status chip. Sold rows show every cell except status in `--ivory-3`. Hover or hot: `rgba(184,149,74,.08)`. Focus: 2 px brass-l outline, offset −2 px. Cells: `padding: 12px 10px` (22 px at the row ends), 14 px, tabular.

**Hover sync** (`hotUnit`). Hovering or focusing a unit on the plan, or hovering a row, sets `plan.hot(suffix)`, highlights the matching row and fills the inspect tooltip. Leaving clears them.

**Open** (`KSM.openPlan(block, floor, {from, unit, back})`):
- Set `hidden = false`, `lockScroll`, `paint()`, `fit()`.
- **Morph**, when a mini plan is open and motion is allowed (`explorer.js:656-678`):
  - Clone the mini svg (labels removed) and fix it at the target plan's content rect (`zIndex 290`, `transformOrigin 0 0`, `--lw` corrected). Set it to `{x: a.left − b.left, y: a.top − b.top, scale: a.width/b.width}`.
  - The real plan starts at opacity 0; the bar and side at opacity 0.
  - Timeline:

| t (s) | Tween |
|---|---|
| 0 | stage `backgroundColor rgba(26,23,20,0) → 1`, `0.45s power2.out` |
| 0 | clone `x/y → 0`, `scale → 1`, `0.8s expo.inOut` |
| 0.55 | real plan `opacity → 1` and clone `opacity → 0`, `0.25s power1.inOut` |
| 0.55 | bar and side `opacity → 1`, `0.5s power2.out`, stagger `0.06` |
| 0.6 | drawing on |
| 0.8 | the plan's `pointer-events` restored |

- Otherwise: a fade `0 → 1`, `0.35s power2.out`.
- Focus goes to „Към сградата“ after 700 ms (30 ms with reduced motion). If a unit was asked for, `openUnit` runs after 820 ms. `KSM.syncURL(block, floor)`.

**Block switch.** Repaint (on the other block's cached plan) and `plan.svg` opacity `0 → 1`, `0.35s power2.out`. The URL is synced.

**Stepper.** `floor = clamp(floor ± 1, 1, 8)`; `paint('cross')` (the 75 + 75 ms crossfade); the URL is synced.

**Keys** (only while the unit panel is closed):
- Escape closes;
- Tab is trapped;
- PageUp and PageDown click ▲ / ▼, unless focus is in the list;
- rows open the unit on Enter or Space.

**Close.** `opacity → 0`, `0.3s power2.in`; then `hidden`, unlock scroll, focus back to the floor path (`back`). `syncURL(null)` removes `?floor`.

**Phones:**
- the bar becomes columns `1fr auto` with `padding: 12px 16px; gap: 10px`; `.ps__mid` moves to row 2, full width, `space-between`; the close label hides (X only);
- the body becomes rows `minmax(250px, 44svh) / minmax(0, 1fr)`; the inspect tooltip hides; the side gets a brass top border;
- segmented buttons `height: 40px; padding: 0 12px`.

### 4.24 Unit panel (`golden-residence.html:303-310`; `explorer.js:696-809`; `diptych.css:593-623`, `:859-863`)

**Structure.** `div.up#up[role=dialog][aria-modal=true][aria-labelledby=up-title][hidden]`: fixed, `inset: 0`, `z-index: 280`, centred, backdrop `rgba(8,7,6,.72)` plus `blur(4px)`. `.up__box`:
- columns `1fr 1fr`; `width: min(1120px, 100vw − 32px)`; `height: min(680px, 100svh − 48px)`; umber; border `--hair`; `overflow: hidden`;
- a seam (`z 2`);
- `.up__close` (44 px X, top right).

**Left half `.up__l`** (onyx). A crop plan (`mode: 'crop', drawing: true, pat: 5, labelPx: 13, lineW: 1.2`), absolute at `inset: 28px`, framed on the unit (`cropFor`):
```
m = max(b.w, b.h)·0.42 + 30; w = b.w + 2m; h = b.h + 2m
match the box aspect, centred on the unit bbox
```
Then `plan.focus(suffix)`. The caption `.up__cap` (12 px stone, bottom left) reads „План на етаж 5, блок А. А 501 е очертан.“.

**Right half `.up__r`** (`padding: 44px clamp(26px, 3.4vw, 52px) 30px`; flex column, gap 22 px; scrolls):
- `p.up__id#up-title` „А *501*“;
- `.up__sub` „Блок А · етаж 5 · 2-стаен“ plus a status chip (14 px `--ivory-2`);
- `dl.up__dl` (two columns, rules `--hair-2`, cells `padding: 14px 0`):
  - Застроена площ, Идеални части, Обща площ: serif 600 26 px with a „м²“ `small` (13 px sans `--ivory-3`);
  - Вид, Изложение (fallback „няма данни в таблицата“), Статус: 500 16 px sans;
- a note for sold and blocked units;
- `.up__actions`:
  - the primary `.btn--solid`: „Изпратете запитване“ (free) or „Попитайте за апартамента“ (reserved); none for sold or blocked. It calls `KSM.enquire(id)`.
  - `.btn.up__save[aria-pressed]` „Запазете“ / „Запазен“ with a heart. Pressed: border and text brass-l, filled heart, and a pop `scale 0.6 → 1`, `0.5s back.out(3)`.
- `nav.up__nav[aria-label="Апартаменти на етажа"]`: previous and next units on the same floor, wrapping, each with an arrow. Switching fades the right half `0.12s` out, refills, then `0.25s` in.

**Open:**
- backdrop `opacity 0 → 1`, `0.3s power2.out`;
- left half `clipPath inset(0% 0% 0% 100%) → 0` and right half `inset(0% 100% 0% 0%) → 0`, `0.7s expo.inOut` at `0.05` (both open outward from the seam);
- box seam `scaleY 0 → 1`, `0.6s expo.out`;
- focus goes to the primary button (or the save button) after 500 ms.

**Close:** `opacity → 0`, `0.25s power2.in`. Scroll unlocks only if the plan stage is closed. Focus returns. Escape (with `stopPropagation`), Tab trap and a backdrop click all close.

**Phones:** one column, rows `38svh / 1fr`; `height: calc(100svh − 24px); width: calc(100vw − 16px)`; seam hidden; the left half gets a brass bottom border; svg at `inset: 14px`; right half `padding: 24px 20px 20px`, gap 18 px; caption hidden.

### 4.25 Phone explorer: block switch, tap-preview, sheet (`explorer.js:303-325`, `:442-480`, `:525-535`; `diptych.css:869-889`)

- **One block at a time.** The `.fxm` bar (flex `space-between`, `margin: 0 var(--gut) 14px`) holds the segmented control and „Докоснете етаж“ (12 px).
  - `setPhoneBlock(b)`: update `aria-pressed`; `clearHot`; `hideSheet`; `layout()` (switches the viewBox); stage `opacity 0.4 → 1`, `0.4s power2.out`; if a floor was hot, select the same floor in the new block.
  - The other block's floor paths are `display: none; tabindex=-1`, and only that block's rail shows.
- **Tap-preview.** The first tap on a floor sets it hot and opens the sheet. The second tap on the same floor opens the plan stage (morphing from the sheet's mini plan). Tapping a unit in the sheet's mini plan opens the plan and that unit.
- **The sheet.** `div.sheet[role=region][aria-label="Избран етаж"]`:
  - fixed at the bottom; `z-index: 240`; umber; `border-top: 1px solid var(--brass)`; `padding: 14px 18px calc(16px + env(safe-area-inset-bottom))`; grid gap 12 px; shadow;
  - top row: the title (serif 30 px „Блок А · *Етаж 5*“) and × (40 px, `aria-label="Затворете"`);
  - `.sheet__plan` (150 px tall: a mini plan, `pat 16`, `labelPx 9.5`);
  - `.sheet__counts` (2 × 2, 12.5 px); `.sheet__range` (12.5 px);
  - `.sheet__act` (columns `1fr auto`): the solid button „Отворете плана“ (48 px) and the stepper (48 × 48 buttons; output `min-width: 64px`, „етаж **5**“).
- **Sheet behaviour.**
  - Show: `yPercent 105 → 0`, `0.5s expo.out`. On first show the page scrolls so the stage sits above the sheet (`KSM.scrollTo(current + delta, {duration: 0.8})`, keeping 8 px below the header).
  - Hide: `yPercent → 105`, `0.35s expo.in`.
  - The stepper moves the hot floor ±1 (1..8) in the same block, with a crossfade.
  - × calls `clearHot` and `hideSheet`.
  - The sheet never shows at ≥ 901 px.
- **Touch at ≥ 901 px** (tablets) uses the desktop panel with the same first-tap-previews rule.

### 4.26 List view „По критерии“ (`gr.js:106-183`; `diptych.css:625-651`)

- **`.lv`** (`padding: 0 var(--gut)`).
- **`.lv__bar`**: flex wrap, gap `18px 30px`, `padding: 22px 0`, top and bottom rules. Filters:
  - Блок: pills Всички / А / Б;
  - Етаж: select Всички / етаж 1…8;
  - Вид: pills Всички / 2-стаен / 3-стаен / Ателие;
  - Площ: select Всяка / до 70 м² (0–70) / 70–100 м² / над 100 м² (100–999); the test is `total >= a0 && total < a1`;
  - Изложение: select Всяко / юг / изток / запад / север; the test is `u.expo.includes(value)`, so „Юг/Изток“ matches both;
  - Статус: pills Всички / Свободни / Резервирани / Продадени / Блокирани;
  - `p.lv__meta[aria-live=polite]` „**N** от 192 · K свободни“.
- **Pills:** 36 px tall, `padding: 0 13px`, border `--hair`, 13 px 500 `--ivory-2`. Hover: border brass. Pressed: ivory ground, onyx text. They do not wrap on desktop.
- **Selects:** 36 px, `min-width: 132px`, brass chevron.
- **Meta:** at the right end, aligned to the bottom; `b` serif 600 30 px.
- **`.lv__table[data-lenis-prevent]`** (`max-height: min(70vh, 720px)`; `64svh` on phones):
  - columns Имот (sortable), Етаж (sortable; `.c-floor`, hidden on phones), Вид, Обща площ (sortable), Изложение (`.c-expo`, hidden on phones), Статус (chip), and an sr-only „Запазване“ heart column;
  - a click on a sortable header toggles asc/desc; the indicator is a 4/4/5 px CSS triangle in brass, rotated for asc;
  - default sort: id asc (block, then floor, then suffix);
  - rows: `tabindex=0`; click, Enter or Space opens the unit panel; sold rows are dimmed;
  - the heart button (36 px, stone, pressed brass-l and filled);
  - empty state: „Няма апартаменти с тези условия. Махнете някой филтър.“;
  - the footnote is `.small`, `margin-top: 14px`.
- **Phones:** pills wrap; tighter cells at ≤ 560 px.

### 4.27 Blocks in numbers „Два блока, по 96 апартамента“ (`golden-residence.html:153-164`; `gr.js:185-210`; `diptych.css:653-676`, `:834-839`)

- **Structure.** A hinge, then a `.split` with a drawn seam holding `#blk-a.blk--a` (right-aligned against the seam) and `#blk-b`. Each block has `padding: 0 clamp(28px, 5vw, 96px)`, grid gap 26 px, and contains:
  - `h3.blk__name` „Блок *А*“;
  - `.blk__sub` „96 апартамента · 8 етажа · 12 на етаж“ (15 px, `margin-top: -10px`);
  - `.blk__floors` (`min(100%, 500px)`): the floor-number column (10 px stone, 8 rows) on the **seam side** (after А's grid, before Б's) and `.blk__grid[role=group][aria-label="Апартаментите на блок А"]`, 12 columns, gap 4 px, floors 8 → 1 from top to bottom, suffixes 01 → 12;
  - the stats: a legend with counts and types „**56** двустайни · **32** тристайни · **8** ателиета“;
  - exposure counts (Б: a four-column grid of `b` serif 600 26 px plus the lowercased exposure, sorted descending) or, for А, the note „Изложението на блок А не е попълнено в таблицата.“.
- **Cells.** `button.s-{status}`, `aspect-ratio: 1`, `border: 1px solid var(--c)`. Hover `scale(1.18)` (`.2s var(--e-out)`). `title` = „А 501 · 2-стаен · 62,18 м² · Продаден“; `aria-label` = „А 501, Продаден“. A click opens the unit panel.
  - free: `rgba(79,191,133,.55)` with border `--st-free`;
  - reserved: `repeating-linear-gradient(-45deg, rgba(233,149,63,.9) 0 1.5px, transparent 1.5px 4px)`;
  - sold: border `rgba(212,87,78,.7)` and `radial-gradient(rgba(212,87,78,.85) 1px, transparent 1.3px)` at 4 × 4 px;
  - blocked: dashed `--st-blk`.
- **Entrance:** cells `from {opacity: 0}`, `0.5s power2.out`, `stagger: {each: 0.004, from: 'end' (А) / 'start' (Б)}`, `scrollTrigger: {start: 'top 75%', once: true}`.
- **Phones:** stacked and left-aligned, with a brass top border on Б; А's floor column moves to the left.

### 4.28 Gallery „Golden Residence отблизо“ (`golden-residence.html:167-187`; `gr.js:229-269`; `diptych.css:678-691`, `:840-844`)

- **Stage.** `.gal__stage[aria-roledescription=галерия][aria-label=Визуализации]`: two halves, `height: min(78svh, 780px)`, a seam. Each half stacks `.gal__img` layers.
- **Bar** `.gal__bar` (two columns, `padding-top: 22px`, a seam):
  - `#gal-cap[aria-live=polite]`, right-aligned against the seam (15 px `--ivory-2`, `min-height: 3.2em`);
  - `.gal__ctl`: ← and → buttons (52 × 52, border `--hair`, hover brass and `rgba(184,149,74,.08)`, `aria-label` „Предишни“ / „Следващи“) and the counter „01 / 03“ (serif 600 28 px).
- **Spreads** (`gr.js:230-234`, image and `object-position`):
  1. `gr-corner-1600` `50% 40%` + `gr-facade-detail-640` `50% 50%`;
  2. `gr-endtowers-1600` `28% 50%` + `gr-parking-1600` `60% 50%`;
  3. `gr-longfacade-1024` `40% 50%` + `gr-dusk-1400` `18% 60%`.
- **`go(i)`** (wraps):
  - desktop: the left layer goes `inset(0% 0% 0% 100%)` and the right layer `inset(0% 100% 0% 0%)` to `inset(0)`, `1s expo.inOut`, together (they open outward from the seam);
  - phones: both from the top (`inset(0% 0% 100% 0%)`), the right one 0.1 s later;
  - images `scale 1.08 → 1`, `1.4s expo.out` at `0.1`.
  - ArrowLeft and ArrowRight work anywhere in the section.
  - Entrance: the halves clip from the seam (`1.2s expo.inOut`, `top 80%`).
- **Phones:** halves stack at `aspect-ratio: 4 / 3` with a brass border between; the caption is left-aligned.

### 4.29 Garages and parking (`golden-residence.html:190-201`; `gr.js:212-227`; `diptych.css:693-715`, `:845-848`)

- **Section.** `section.sec.park#garazhi` (umber) holds a hinge, then a `.split` with a drawn seam: `#park-g` (right-aligned) and `#park-p`.
- **Each half:**
  - `h3.blk__name` (Гаражи / Паркоместа);
  - `.park__big`: `num` (serif 600 `clamp(72px, 7vw, 120px)/.85`) plus „свободни от N“ (15 px);
  - a legend (free and sold always; reserved and blocked only when > 0);
  - `.park__cells[aria-hidden]`: 11 × 11 squares, gap 3 px, max 460 px, the same patterns as the block grid (sold at `.55/.8`); `title` = „Г-001 · 34,01 м² · Продаден“;
  - `details` (top rule, max 460 px) whose `summary` „Свободните гаражи (47)“ ends in `+` / `−` in brass-l, opening `ul.park__list` (three columns, two at ≤ 560 px; id plus area; 13 px tabular);
  - `a.link[data-park]` „Запитване за гараж →“, which sets the form's project to `garage`.

### 4.30 GR inquiry

This is the closing component (§4.14) with GR copy and the email shown. Its select offers Апартамент в Golden Residence / Гараж или паркомясто в Golden Residence / Многофамилна сграда, ж.к. Връбница-1 / Друго. Decision A1: it posts to KSM's Odoo through `/api/odoo-lead`, and review-host inquiries are tagged [ТЕСТ] (§0.1).

### 4.31 Deep links and URL state (`gr.js:271-309`)

- `?floor=А-5`: scroll to `#explorer` instantly; `fx.select` after 650 ms; `openPlan(…, {back: null})` 700 ms later.
- `?unit=А 501`: `openUnit` after 700 ms.
- `?view=list`: list mode with no animation.
- `#explorer`: an instant scroll.
- `KSM.syncURL(block, floor)` keeps `?floor` current through `history.replaceState` and always removes `?unit`.

---

## 5. Data

### 5.1 Loading and parsing (`core.js:64-141`)

- `fetch('../data/sheets/*.csv', {cache: 'no-cache'})` plus both maps JSON files, through `Promise.all`, memoised.
- The parser is naive: it strips the BOM and `\r`, drops blank lines and uses `split(',')`. **It does not support quoted fields.**
- **Units** (block А from `gr-block-a.csv`, Б from `gr-block-b.csv`):

| Field | Source |
|---|---|
| `id` | `Апартамент`, whitespace collapsed („А 501“) |
| `floor` | `parseInt(Етаж)` |
| `suffix` | the last two digits of the trailing number |
| `built` / `ideal` / `total` | `Застроена` / `Идеални` / `Обща` (comma or dot decimals) |
| `type` | `Вид` |
| `expo` | `Изложение` (Б only; the А sheet has no such column) |
| `status` | `normStatus(Статус)` |

- **Floors** `floors['А-5']` = `{units (sorted by suffix), counts {free, reserved, sold, blocked}, best, minFree, maxFree}`. `minFree` and `maxFree` are the min and max `total` of the free units, or null.
- **Blocks** = `{units, counts, types{}, expo{}}`.
- **Totals.** Lots (garages, parking) use `Номер`, `Обща`, `Тип` and `Статус`.
- **Plans:** `plans[block]` is the entry in `floors.json` whose `appliesTo.blocks` includes the block.
- **`KSM.best(c)`** = `free ? 'free' : reserved ? 'reserved' : blocked ? 'blocked' : 'sold'`. It colours the floor's dot and the facade tint.
- **`KSM.normStatus`** (concept): lowercase, trim, then `startsWith('свобод')` → free, `'резерв'` → reserved, `'продад'` → sold, **anything else → blocked**. Replace it with production's `normalizeStatus` (§0.3).
- **`KSM.paintLive(d)`** writes the `[data-live]` keys `gr-free, gr-total, gr-reserved, gr-sold, gr-blocked, a-free, b-free, garage-free, garage-total, parking-free, parking-total` and rolls each changed value (`KSM.roll`, `0.8s power2.out`; instant under reduced motion). The HTML holds the snapshot, so a value only moves if the live data differs.
- Formatting:
  - `KSM.m2` = `Intl.NumberFormat('bg-BG', {minimumFractionDigits: 2, maximumFractionDigits: 2})`, e.g. „62,18“;
  - `KSM.apts(n)` = „1 апартамент“ / „n апартамента“;
  - `KSM.typeWord` = двустаен/двустайни, тристаен/тристайни, ателие/ателиета;
  - `KSM.word(n, key)` = singular for n = 1 („свободен“), else plural („свободни“).
- **Port note.** v2 already has the live path: `src/data/availability/store.js` (api/availability, then the sheets, then the built-in data), `useAvailability`, and `normalizeStatus`. Port the derived numbers (counts, best, min/max free, types, exposure), not the loader.

### 5.2 Status colours, patterns and glyphs: never colour alone (`core.js:23-50`; `diptych.css:255-270`)

| Key | Label (production `STATUS_LABEL`, `propertyStatus.js:45-51`) | Words | Colour | Swatch pattern | Plan pattern | Glyph (SVG 10 × 10) |
|---|---|---|---|---|---|---|
| free | Свободен | свободен / свободни | `#4FBF85` | solid fill, glyph in onyx | solid `#4FBF85` at `.46` | ✓ check `M1.6 5.3l2.2 2.2 4.6-4.9`, stroke 1.7 |
| reserved | Резервиран | резервиран / резервирани | `#E9953F` | `repeating-linear-gradient(-45deg, var(--c) 0 1.5px, transparent 1.5px 4px)`, glyph on an umber disc | stripes rotated 45° (§4.22) | ◷ clock (circle r 3.7 plus hands), stroke 1.2 |
| sold | Продаден | продаден / продадени | `#D4574E` | `radial-gradient(var(--c) 1px, transparent 1.3px)` at `4px 4px`, glyph on umber | dots (§4.22) | ✕ cross, stroke 1.5 |
| blocked | Блокиран | блокиран / блокирани | `#8A867D` | **dashed** 1 px border, no fill | fill `.1` plus a dashed outline | — dash `M2 5h6`, stroke 1.6 |

- **Chip** `.st.st--{key}`: an inline flex with gap 8 px, 13 px 500, nowrap. The swatch `.sw` is 16 × 16 with `border: 1px solid var(--c)` and `color: var(--c)`; the glyph SVG is 10 × 10.
  - `KSM.chip(key, n)` renders „{swatch}**n** word“.
  - `KSM.statusChip(key)` renders „{swatch}Label“.
- **Order everywhere:** free, reserved, sold, blocked (`KSM.ORDER`).
- **Legends:** `.legend` is a flex wrap with gap `10px 26px`; the `b` inside is 600 ivory tabular.

### 5.3 Polygons onto images

- **Facade** (`golden-residence.building.json`):
  - `image: building-2.webp`, `imageWidth: 1200`, `imageHeight: 599`, 16 shapes of `type: 'floor'` with `{block, floor, polygons: [[[x, y] × 4]]}` (rectangles).
  - Block А spans x 143–605 and Б spans 605–1067. Floor 1 is y 430–457 and floor 8 is y 155–192. The А/Б boundary is x = 605 for every floor.
  - The concept draws `facade-cut-2400.webp` (2400 × 1198, exactly 2 × the JSON's pixel space, sky masked) as an SVG `<image>` at `0, 0, 1200, 599` with `preserveAspectRatio="none"`. Polygons are then in image pixels at 1200 wide, and `path d` comes straight from the points (`M x y L … Z`).
  - Bboxes drive the lens, the counts' vertical position and the highlight.
- **Plans** (`golden-residence.floors.json`):
  - two entries, one typical floor per block (`appliesTo: {project: 'golden-residence', blocks: ['А'], floors: [1..8]}`; likewise Б);
  - images 1200 × 845 (А) and 1200 × 847 (Б);
  - each entry has 12 shapes `{type: 'apartment', unitSuffix: '01'…'12', polygons: [[…10–22 points]]}`;
  - a unit matches its polygon by suffix („А 501“ → `'01'`), so every floor uses the same plan.
- **The viewBox** of a plan is the union bbox of the 12 polygons plus padding, so the plan crops to the apartments. The drawing image sits underneath at full image size and overflows the box (§8.3).
- Phone facade crops: §4.20.

### 5.4 The snapshot the concept shows (sheets, 2026-11-14), for verifying the rebuild

**Totals**
- 192 units: 69 free, 8 reserved, 115 sold, 0 blocked.
- А: 42 free, 6 reserved, 48 sold. Б: 27 free, 2 reserved, 67 sold.
- Garages: 113 (47 free, 66 sold). Parking: 68 (34 free, 34 sold).

**Per floor**

| Floor | А free / res / sold, best, free m² range | Б free / res / sold, best, free m² range |
|---|---|---|
| 8 | 6 / 0 / 6, free, 43,98–108,56 | 6 / 0 / 6, free, 43,98–108,56 |
| 7 | 5 / 0 / 7, free, 62,18–108,56 | 5 / 2 / 5, free, 43,98–108,56 |
| 6 | 5 / 3 / 4, free, 62,18–108,56 | 0 / 0 / 12, sold, Разпродаден етаж |
| 5 | 4 / 2 / 6, free, 63,51–108,56 | 0 / 0 / 12, sold |
| 4 | 4 / 0 / 8, free, 63,51–108,56 | 0 / 0 / 12, sold |
| 3 | 3 / 1 / 8, free, 101,48–114,58 | 0 / 0 / 12, sold |
| 2 | 6 / 0 / 6, free, 67,88–114,58 | 7 / 0 / 5, free, 69,88–114,58 |
| 1 | 9 / 0 / 3, free, 65,68–114,58 | 9 / 0 / 3, free, 67,88–114,58 |

**Other values from the sheets**
- Types per block: 56 двустайни, 32 тристайни, 8 ателиета.
- Б exposure: Юг 24, Запад 24, Изток 16, Север 8, Север/Запад 8, Запад/Юг 8, Юг/Изток 8.
- Areas: 43,98–114,58 m².
- The sheets spell sold as both „Продадени“ and „Продаден“.

---

## 6. Accessibility

- **Focus.**
  - `:focus { outline: none }`. `:focus-visible { outline: 2px solid var(--brass-l); outline-offset: 3px; border-radius: 1px }`.
  - Variants: services columns at `outline-offset: -4px`; table rows with a 2 px inset outline; fields use the underline plus `box-shadow: 0 1px 0 0 var(--brass-l)`.
  - Facade floors suppress the outline; their focus mark is the dashed 2 px highlight rectangle (`.is-kbd`).
  - Plan units show focus as the hot outline.
- **Skip link.** „Към съдържанието“ → `#main`, fixed at the top left, onyx on ivory, shown on `:focus-visible`.
- **Dialogs:**
  - the menu: `role=dialog`, `aria-modal`, `aria-label=Меню`;
  - the plan stage: `role=dialog`, `aria-modal`, `aria-labelledby=ps-title`;
  - the unit panel: `role=dialog`, `aria-modal`, `aria-labelledby=up-title`;
  - the EU dialog: native `<dialog>`, `aria-labelledby=eu-h`.
  - All of them close on Escape, trap Tab (`KSM.trapFocus`, which looks only at visible focusables), move focus on open (first menu link, „Към сградата“, the unit's primary button) and return it on close.
  - Scroll locks through `lenis.stop()` plus `body { overflow: hidden }`.
- **Keyboard paths through the explorer:**
  1. Tab to a floor (16 `role=button` paths; the group itself is `tabindex=-1` so Chrome does not stop on it). Focus with `:focus-visible` sets the floor hot and opens its panel (`aria-live=polite`), so the plan and counts are announced.
  2. ArrowUp and ArrowDown change floor; ArrowLeft and ArrowRight change block (desktop); Escape clears; Enter or Space opens the plan stage.
  3. In the stage: Tab moves through the block switch, ▲, ▼ (the output is `aria-live`), Close, the plan units (`role=button`, labelled „А 501, 2-стаен, 62,18 м², Свободен“) and the table rows. PageUp and PageDown change floor. Enter or Space on a unit or row opens the unit panel.
  4. In the unit panel: the primary action, Save (`aria-pressed`), previous and next, and Close.
  5. On phones only the shown block's floors are tabbable.
  - Floor `aria-label`: „Блок А, етаж 5: 4 свободни, 2 резервирани, 6 продадени, 0 блокирани. Enter отваря плана.“.
- **Tabs.** `role=tablist` / `tab` / `tabpanel` with `aria-selected`, `aria-controls`, `aria-labelledby`, a roving `tabIndex` and arrow keys.
- **Live regions:** the compact facade caption, both facade panels, the list meta, the gallery caption, the stage output, `.form__ok` (`role=status`).
- **Status is never colour alone:** a glyph, a pattern and a word on every chip; patterns on every plan fill and grid cell; a dashed outline for blocked.
- **Hero links.** Each half's `aria-label` carries the live count: „Golden Residence, жк Левски Г: 69 свободни апартамента от 192. Изберете апартамент.“ and „Многофамилна сграда, ж.к. Връбница-1: 16 свободни апартамента от 144 по данни към 01.12.2025. Запитване.“. Both are updated from the data.
- **Reduced motion** (`KSM.RM`, read once at load). The design note says: "native scroll, no intro, doors become a 200 ms fade, halves stay 50/50, no pinning; hover and status stay". In detail:
  - no Lenis;
  - no intro (the head script skips the class);
  - doors fade over 0.2 s;
  - no widening listeners;
  - no title split or entrance;
  - `KSM.reveal` returns early (everything static);
  - the story pin and the works sticky are off in CSS;
  - services stay equal and only fade;
  - the menu fades over 0.2 s;
  - panels, the sheet and dialogs appear instantly;
  - the plan morph is skipped;
  - rolls are instant;
  - `scroll-behavior: auto`.
- **Save-Data: not handled.** Spec §5.2.11 treats Save-Data like reduced motion. v2's `src/hooks/useMotionAllowed.js` already returns `canAsk && !reduce && !saveData`; route the intro, doors, Lenis and reveals through it, and subscribe to changes.
- **Accessibility nits in the concept:**
  - The Home `h1` comes after both halves' `h2`s in the DOM.
  - The hero links' `aria-label` overrides their headings.
  - `.svc__col[tabindex=0]` is focusable but not interactive (its focus only shows the reveal).
  - `aria-roledescription` sits on a div without a role (the gallery).
  - The consent checkbox is not enforced.
  - ▲ ▼ in the plan-stage hint are outside the font subsets and fall back to a system font.

---

## 7. Copy inventory

Source keys:
- **About** = `src/pages/About.jsx`;
- **Home.jsx** = `src/pages/Home.jsx`;
- **Blog** = `src/pages/Blog.jsx` (production's „Обекти“ page);
- **Contact** = `src/pages/Contact.jsx`;
- **Hero** = `src/components/ui/HeroCarousel.jsx`;
- **EuPoster** = `src/components/EuPosterSection.jsx`;
- **EuLine** = `src/shell/EuLine.jsx`;
- **site** = `src/config/site.js` (production facts from main's footer and contact page);
- **nav** = `src/shell/nav.js`;
- **for-us** = `src/assets/for-us/content.txt`;
- **SiteHeader** / **SiteFooter** = the v2 M1 shell (labels taken from production);
- **GRL** = golden-residence `src/content.js`;
- **Sheets** = the CSV snapshot (live in production);
- **Proposal** = written for the concept.

### 7.1 Shell (both pages)

| String | Source |
|---|---|
| „Към съдържанието“ (skip link) | SiteHeader.jsx:99 |
| Logo `aria-label` „КСМ Строй, начална страница“ | SiteHeader.jsx:113 |
| „Запазени“ + count; popover „Запазени“, „Запитване за запазените“; × „Махнете {id} от запазените“ | Proposal (saved feature) |
| „Меню“ | SiteHeader.jsx:146 / MobileMenu.jsx:78 (M1) |
| „+359 887 886 166“ | site:23 |
| „Запитване“ (header CTA) | SiteHeader.jsx:134 |
| Menu pages: „Начало“, „Продажби“, „Обекти“, „За нас“, „Контакти“ | nav:4-8 (the concept links them to Home anchors, §8.1) |
| Menu item „Golden Residence“ + „жк Левски Г · 69 свободни“ | Proposal + Sheets |
| Menu labels „Телефони“ / „Работно време“ / „Офиси“ / „Имейл“ | „Работно време“ and „Имейл“: Contact:162 and :151. „Телефони“ and „Офиси“ are proposals; production says „Телефон“ (Contact:139) and „Адреси“ (Contact:127). |
| „+359 887 886 166“, „+359 885 762 224“ | site:23-24 |
| „Пн–Пт 8:00–18:00 · Сб 9:00–14:00 · Нд почивен ден“ (menu); the footer has one per line; contact sections join with „, “ | site:31 |
| „гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап. 38“ / „гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет. 1“ | site:28-29. The concept writes „ап. 38“ and „ет. 1“; production writes „ап.38“ and „ет.1“. |
| „ksm_str@abv.bg“ | site:26 |
| EU short line „Проект № BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.“ + „За проекта“ | EuLine:40, :105 |
| „Затвори“ (menu close) | Production modal wording (`ApartmentDetailsModal.jsx:29` `aria-label`) |
| Footer blurb „Водеща строителна компания в България с над 15 години опит. Специализираме се в жилищно и комерсиално строителство, предлагайки иновативни решения и високо качество на изпълнение.“ | SiteFooter:20 (production Footer on main) |
| „Отвори в Google Maps“ | SiteFooter:84 |
| EU full line „Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027.“ + „За проекта“ | EuLine:31 |
| Logo `alt`s „Съфинансирано от Европейския съюз“, „Програма „Конкурентоспособност и иновации в предприятията““ | EuLine:59, :67 |
| „© 2026 КСМ Строй · КСМ СТРОЙ ООД“ (year from JS) | SiteFooter:114 + site:17 |
| „Обекти · Facebook“ | nav:6; SiteFooter:105 / site:32 |
| EU dialog: „Дигитализация на предприятията“ | EuPoster:51 |
| EU dialog paragraph „КСМ СТРОЙ ООД изпълнява проект № BG16RFPR001-1.012-1485-C01 по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027. Внедряваме четири свързани системи: за управление на ресурсите (ERP), за работа с клиенти (CRM), за бизнес анализи (BI) и за електронно обучение на служителите.“ | EuPoster:54-56 |
| EU dialog `dl`: „Общ бюджет“ 35 320,04 евро; „Безвъзмездна помощ“ 24 724,03 евро; „Собствено съфинансиране“ 10 596,01 евро; „Продължителност“ 27.01.2026 г. – 27.01.2027 г. | EuPoster:9-12. **The concept shortens „Безвъзмездна финансова помощ“ (EuPoster:10); use production's label.** |
| Disclaimer „Цялата отговорност за съдържанието се носи от КСМ СТРОЙ ООД и при никакви обстоятелства не може да се приема, че този документ отразява официалното становище на Европейския съюз и Управляващия орган.“ | EuPoster:87-88 |
| „Плакатът във формат A3, PDF“ (link) | Variant of EuPoster:45 „Плакат във формат A3, PDF“ |
| Poster `alt` „Плакат на проект „Дигитализация на предприятията““ | Shortened from EuPoster:40 |
| × „Затворете“ (`aria-label`) | Proposal |

### 7.2 Home

| Section | String | Source |
|---|---|---|
| Head | `<title>` „КСМ Строй – строителна компания в София“ | Proposal (production: `src/utils/seo.js:5` „KSM Stroy - Строителна компания в София \| Качествено строителство“) |
| Head | Meta description „КСМ Строй строи от 2008 г. Golden Residence в жк Левски Г и Многофамилна сграда в ж.к. Връбница-1: свободните апартаменти в момента, етаж по етаж.“ | Proposal |
| Hero | `aria-label` „Нашите сгради“ | Proposal |
| Hero | H1 „Създаваме пространства / за *мечтания* живот“ | Hero:27 (re-set in two rows) |
| Hero | „Golden Residence“ | Hero:49 |
| Hero | „69“ „свободни от 192 · жк Левски Г“ | Sheets + Hero:50 („жк ЛЕВСКИ Г“, re-cased) |
| Hero | „ул. Ген. Климент Бояджиев, София“ | Hero:50 + „София“ |
| Hero | „Изберете апартамент“ | Proposal |
| Hero | „Многофамилна сграда“ | Shortened from Hero:42 „Многофамилна жилищна сграда“ |
| Hero | „свободни от 144 · по данни към 01.12.2025“ „16“ | Hero:44 built-in data; the date per spec §14.2 („Its data dates from 2025-12-01“) |
| Hero | „ж.к. Връбница-1, София“ | Hero:43 (re-set) |
| Hero | „Запитване за сградата“ | Proposal |
| Company | „„Добрата работа – *реклама* за майстора““ | About:432 / for-us:3. Production sets it in capitals, „ДОБРАТА РАБОТА - РЕКЛАМА ЗА МАЙСТОРА“; the concept re-cases it and uses an en dash. |
| Company | „Традиция и иновации от *2008*“ | About:415-416 |
| Company | „КСМ СТРОЙ ООД е основана през септември 2008 г. от двама братя – Кадри и Сухат, синове на известен в родното им село Буково строител зидар (дюлгерин).“ | About:422-423 / for-us:1, edited („през месец септември“ → „през септември“, a dash added, „/дюлгерин/“ → „(дюлгерин)“) |
| Company | „Учредителите още от самото създаване на дружеството залагат на характерните черти за региона като коректност, бързина и точност.“ | About:427 / for-us:3, lower-cased; the motto clause dropped (the motto is shown as the quote) |
| Company | Triad „коректност“ „бързина“ „точност“ | About:436-444 (capitals in production) |
| Company | Fact „2008“ + „годината, в която братята основават КСМ Строй“ | Proposal (fact from About) |
| Company | Fact „2“ + „сгради в продажба в София в момента“ | Proposal |
| Company | Fact „2“ + „офиса: София и Гоце Делчев“ | Proposal (from site:28-29) |
| Services | H2 „Строим, ремонтираме, *завършваме*.“ | Concept 1 proposal, **approved by the user** (production heading „Нашите Услуги“, Home.jsx:70) |
| Services | Lead „Предлагаме пълен спектър от строителни услуги за жилищни и комерсиални проекти.“ | Home.jsx:72 (a period added) |
| Services | „01“–„03“ | Proposal |
| Services | „Жилищно строителство“ / „Строителство на къщи, апартаменти и жилищни комплекси с висок стандарт.“ | Home.jsx:16-17 (production „Жилищно Строителство“, no final period) |
| Services | „Ремонти и реновация“ / „Цялостни ремонти и модернизация на съществуващи сгради.“ | Home.jsx:21-22 („Ремонти и Реновация“) |
| Services | „Комерсиално строителство“ / „Офисни сгради, складове и индустриални обекти.“ | Home.jsx:26-27 („Комерсиално Строителство“) |
| Works | H2 „Нашите *обекти*“ | Proposal (production page title „Обекти“, nav:6, Blog:277) |
| Works | Lead „Разгледайте нашите успешно реализирани строителни проекти – жилищни комплекси, хотелски комплекси и санирания.“ | Blog:787 meta description (hyphen → en dash). The list omits „Саниране 2017“ (Blog:161) although the lead mentions санирания. |
| Works | „Green Life – Paradise Gardens and Town House“ / „гр. Созопол · жилищен комплекс · 2018“ | Blog:128-132 |
| Works | „Айвазовски Парк“ / „гр. Поморие · жилищен комплекс“ | Blog:139-142 |
| Works | „Панорама Резидънс“ + tag „груб строеж“ / „гр. Созопол · жилищен комплекс“ | Blog:150-153 (status „Груб Строеж“) |
| Works | „Сънни Хил блок 9“ / „кв. Меден Рудник, гр. Бургас · жилищна сграда“ | Blog:172-175 |
| Works | „Хотел Парадайс“ / „с. Огняново · хотелски комплекс“ | Blog:183-186 |
| Works | „Читалище „Асен Златаров-1924““ / „с. Огняново, община Гърмен · обществена сграда“ | Blog:194-197 (production quotes it as `"…"`) |
| Works | Captions „Green Life – Paradise Gardens and Town House, гр. Созопол“, „Хотел Парадайс, с. Огняново“, „Читалище „Асен Златаров-1924“, с. Огняново, община Гърмен“ | Blog data (`home.js:221-226`) |
| Works | Plates „гр. Поморие“ / „Айвазовски Парк · жилищен комплекс“; „гр. Созопол“ / „Панорама Резидънс · в груб строеж“; „кв. Меден Рудник“ / „Сънни Хил блок 9 · гр. Бургас“ | Blog data. They are placeholders: production has photos in `src/assets/projects/…`. |
| Teaser | H2 „Golden Residence, *етаж* по етаж“ | Proposal (echoes GRL:57-58 „Сградата етаж по етаж“) |
| Teaser | Lead „Цифрите са свободните апартаменти в момента: блок А вляво, блок Б вдясно. Посочете етаж, кликнете, за да видите плана му.“ | Proposal |
| Teaser | Compact caption idle „Посочете етаж: свободните, резервираните и продадените апартаменти на него. Кликнете, за да отворите плана му.“; hot „Блок А · *етаж 5*“ + chips | Proposal |
| Teaser | Ways: „Визуално“ / „Изберете етаж от фасадата“; „По критерии“ / „Всички 192 апартамента в списък с филтри“; `aria-label` „Два начина да изберете апартамент“ | Proposal |
| Contact | H2 „Готови сте да започнете своя *проект*?“ | Contact:506 |
| Contact | Lead „Нашият екип е готов да ви помогне да реализирате мечтания проект с качество и професионализъм.“ | Contact:509 (a period added) |
| Contact | Phones and hours | site |
| Form | „Име“ | Contact:287 „Име и фамилия *“, shortened |
| Form | „Телефон“ | Contact:337 |
| Form | „Интересувам се от“ + options „Golden Residence, жк Левски Г“, „Многофамилна сграда, ж.к. Връбница-1“, „Строителство или ремонт“, „Друго“ | Proposal (production has `projectType` and `budget` selects, Contact:171-190, and **an email field**) |
| Form | „Избрани апартаменти“; chip „Апартамент {id}“ | Proposal |
| Form | „Съобщение“ | Contact:397 („Съобщение *“) |
| Form | „Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.“ | Proposal (spec §14.11: the client supplies the GDPR text) |
| Form | „Изпратете запитване“ (button) | Contact:261 (a heading there) |
| Form | „Благодарим ви.“ / „Ще се свържем с вас в работно време. За бърз отговор: +359 887 886 166.“ | Proposal |
| **EU poster (missing; port it)** | „Проект, съфинансиран от Европейския съюз“, H2 „Дигитализация на предприятията“, paragraph, the 4 facts, „Отвори плаката“, „Изтегли PDF“ (`download="Плакат A3 - КСМ Строй.pdf"`), figcaption „Плакат във формат A3, PDF“, sr „(отваря PDF в нов раздел)“, `alt` „Плакат на проект „Дигитализация на предприятията“ на КСМ СТРОЙ ООД, съфинансиран от Европейския съюз“, the disclaimer | EuPoster:40-88 (PDF `/eu/plakat-ksm-stroy-a3.pdf`) |

### 7.3 Golden Residence page

| Section | String | Source |
|---|---|---|
| Head | `<title>` „Golden Residence, жк Левски Г – КСМ Строй“; meta „Golden Residence, ул. Ген. Климент Бояджиев, жк Левски Г, София: 192 апартамента в 2 блока. Свободните в момента, етаж по етаж, с плановете.“ | Proposal + Sheets |
| Hero | „Golden *Residence*“ | Hero:49 |
| Hero | „ул. Ген. Климент Бояджиев, жк Левски Г, София“ | Hero:50 (re-set) |
| Hero | „192“ „апартамента в 2 блока“; „69“ „свободни в момента“ | Sheets + proposal |
| Hero | „Изберете апартамент“, „Запитване“ | Proposal; SiteHeader:134 |
| Hero | Image `alt` „Golden Residence по здрач, визуализация“ | Proposal |
| Story | `aria-label` „Сградата“ | GRL:43 (eyebrow) |
| Story | H2 „Модерен дом в жк *Левски Г*“ | GRL:44-45 |
| Story | „Golden Residence е новострояща се жилищна сграда, която съчетава съвременна архитектурна визия, прецизно функционално разпределение и безупречна локация – в един от най-бързо развиващите се и зелени столични райони – жк Левски Г и само на 500 метра от метростанция.“ | GRL:49-51, without „Диана Хоумс представя“ (spec §14.4) |
| Story | „500 м“ „до метростанция“ + „ул. Ген. Климент Бояджиев, жк Левски Г“; „Отвори в Google Maps“ | GRL:51; Hero:50; SiteFooter:84 |
| Story | H2 „Бронзови *рамки*“ / „Изчистени линии и фасада с бронзови рамки около просторните остъклени тераси.“ | Heading drawn from GRL:74 (the landing titles it „Съвременна архитектура“); text GRL:74 |
| Story | `kv`: „2“ „блока, А и Б“; „8“ „жилищни етажа във всеки блок“; „192“ „апартамента, по 96 в блок“; „12“ „апартамента на етаж, от 43,98 до 114,58 м²“ | Sheets (hardcoded) |
| Story | H2 „Продължение на *дневната*“ / „Терасите са продължение на дневната: място за маса, растения и вечери навън.“ | GRL:75 (landing title „Просторни тераси“) |
| Story | H2 „Озеленен *двор*“ / „Озеленен двор с алеи и дървета около сградата.“ | GRL:76 (landing title „Зелени площи“) |
| Story | „113 гаража и 68 паркоместа“ | Sheets |
| Story | Captions „Визуализация: входът и градината пред него“ (follows GRL:105's alt), „Визуализация: терасите отдолу“, „Визуализация: тераса“, „Визуализация: дворът“; index „01 / 04“ | Proposal |
| Story | Inline `alt`s „Входът на Golden Residence, визуализация“, „Бронзовите рамки на терасите, визуализация“, „Тераса с маса и растения, визуализация“, „Озелененият двор отгоре, визуализация“ | Proposal |
| Explorer | H2 „Изберете *апартамент*“; tabs „Визуално“, „По критерии“ (`aria-label` „Как да търсите“) | Proposal |
| Explorer | Lead „Свободните апартаменти в момента, по данни от таблиците на КСМ Строй: 69 от 192.“ | Proposal + Sheets |
| Explorer | Legend „69 свободни“, „8 резервирани“, „115 продадени“, „0 блокирани“ | Sheets + status words |
| Facade | „Блок А“, „Блок Б“, „Докоснете етаж“ | Proposal |
| Facade | Caption „Цифрите отстрани са **свободните апартаменти** на всеки етаж.“ + desktop „Посочете етаж, кликнете, за да отворите плана му.“ / phone „Докоснете етаж, за да видите плана му; второ докосване го отваря.“ | Proposal |
| Panel / sheet | „Блок А · *Етаж 5*“; „кота +14,62 · 12 апартамента“; range texts (§4.21); „Отворете плана“; „етаж 5“; `aria` „Избран етаж“, „По-горен етаж“, „По-долен етаж“, „Затворете“ | Proposal (кота: §0.4) |
| Plan stage | „Блок А · Етаж 5“; „кота +14,62 · 12 апартамента · 4 свободни“; „Блок А“ / „Блок Б“; „Към сградата“; headers „Имот“, „Вид“, „Обща площ“, „Статус“; inspect „Вид“, „Обща площ“, „Изложение“ (or „—“), „Статус“; hint „Посочете апартамент на плана или в списъка. ▲ ▼ сменят етажа, без да се връщате.“ | Proposal; values from Sheets |
| Unit panel | „А *501*“; „Блок А · етаж 5 · 2-стаен“; „Застроена площ“, „Идеални части“, „Обща площ“, „Вид“, „Изложение“, „Статус“; „м²“; „няма данни в таблицата“ | Proposal (field names follow the sheet columns) |
| Unit panel | „Този апартамент е продаден. Свободните на етажа са оцветени в зелено.“; „Този апартамент не се предлага в момента.“ | Proposal |
| Unit panel | „Изпратете запитване“ / „Попитайте за апартамента“; „Запазете“ / „Запазен“; nav `aria` „Апартаменти на етажа“ | Contact:261; proposal |
| Unit panel | „План на етаж 5, блок А. А 501 е очертан.“ | Proposal |
| List | Labels „Блок“, „Етаж“, „Вид“, „Площ“, „Изложение“, „Статус“ | Proposal |
| List | Options „Всички“, „А“, „Б“, „етаж 1…8“, „2-стаен“, „3-стаен“, „Ателие“, „Всяка“, „до 70 м²“, „70–100 м²“, „над 100 м²“, „Всяко“, „юг“, „изток“, „запад“, „север“, „Свободни“, „Резервирани“, „Продадени“, „Блокирани“ | Proposal; values from Sheets |
| List | Meta „69 от 192 · 69 свободни“ | Proposal + Sheets |
| List | Headers „Имот“, „Етаж“, „Вид“, „Обща площ“, „Изложение“, „Статус“, sr „Запазване“; heart `aria` „Запазете А 501“ | Proposal |
| List | „Няма апартаменти с тези условия. Махнете някой филтър.“; „Продадените остават в списъка. Изложение има само за блок Б, така е в таблицата.“ | Proposal |
| Blocks | H2 „Два блока, по *96* апартамента“; lead „Всеки квадрат е апартамент: етажите отгоре надолу, номерата от 01 до 12. Кликнете квадрат, за да отворите апартамента.“ | Proposal + Sheets |
| Blocks | „Блок *А*“; „96 апартамента · 8 етажа · 12 на етаж“; „56 двустайни · 32 тристайни · 8 ателиета“; exposure „24 юг“… ; „Изложението на блок А не е попълнено в таблицата.“ | Sheets + proposal |
| Gallery | H2 „Golden Residence *отблизо*“; lead „Визуализации на сградата, фасадата и двора.“ | Proposal |
| Gallery | Captions „Изчистени линии и фасада с бронзови рамки около просторните остъклени тераси.“ (GRL:74); „Двата блока откъм двора и паркинга: по осем жилищни етажа, по 12 апартамента на етаж.“ (proposal + Sheets); „Golden Residence през деня и по здрач.“ (proposal) | as noted |
| Gallery | `aria` „Предишни“, „Следващи“, „галерия“, „Визуализации“ | Proposal |
| Parking | H2 „Гаражи и *паркоместа*“; lead „Свободните места в момента, по данни от таблиците на КСМ Строй.“; „Гаражи“, „Паркоместа“; „47 свободни от 113“; „Свободните гаражи (47)“, „Свободните паркоместа (34)“; „Запитване за гараж“, „Запитване за паркомясто“ | Proposal + Sheets |
| Inquiry | H2 „Запитване за Golden *Residence*“; lead „Запитванията за Golden Residence приема КСМ Строй. Обадете се или изпратете запитване и ще се свържем с вас.“ | Proposal (reflects decision A1) |
| Inquiry | Options „Апартамент в Golden Residence“, „Гараж или паркомясто в Golden Residence“, „Многофамилна сграда, ж.к. Връбница-1“, „Друго“ | Proposal |
| Fallback | „Наличността се зарежда от таблиците на КСМ Строй. Отворете страницата през локалния сървър.“ | Concept-only dev message |

Status labels Свободен, Резервиран, Продаден and Блокиран match production `STATUS_LABEL` (`propertyStatus.js:45-49`). Plural words and the singular/plural rule are the concept's (`core.js:31-34`, `:47`).

---

## 8. Concept-only, rough, nits and open conflicts

### 8.1 Concept-only: do not build

- **The slogan switcher:**
  - `?slogan=a|b|c` and `?review=1` (`index.html:42-43`, `home.js:142-168`);
  - `.slg` (`diptych.css:311-317`);
  - `.sl--b` and `.sl--c` with their CSS rules;
  - `data-slogan`;
  - the `FORMER` bros-line swap (`home.js:126-140`) and `.bros__line`.

  Build slogan A only.
- **Front-end-only forms.** Submit only shows the thank-you (`core.js:463-479`). Wire the forms to `/api/odoo-lead` (§0.1) without touching the proxy.
- **Duplicated shell markup.** The header, saved popover, menu, footer, EU dialog and doors SVG are copied into both HTML files, and the right door's mark is cloned with `innerHTML`. In React they become one shell.
- **MPA plumbing:**
  - the `sessionStorage` flags `ksm-intro`, `ksm-doors`, `ksm-hero`;
  - `location.href` navigation; the `pageshow` / `ksm:restored` reset;
  - the `pagereveal` / `pageswap` handlers;
  - the fake shared element (identical framing plus `view-transition-name` with cross-document View Transitions off).

  Replace them with route transitions. The user's decisions keep the doors and the once-per-session intro.
- **Links and data shortcuts:**
  - Menu links point at Home anchors (`index.html#proekti`, `#obekti`, `#za-nas`, `#kontakti`). Production routes are `/projects`, `/blog`, `/about`, `/contact` (nav:4-8).
  - The Многофамилна half links to `#zapitvane` until its own page comes in M3.
  - Its „16“ / „144“ are hardcoded.
- **Loader:** the naive CSV parser, `../data/` paths and `KSM.normStatus` (§0.3, §5.1).
- **Dead code:**
  - CSS: `.hdr.is-hidden`, `.hero__hint`, `.ftr__word`, `.half-pad`, `.wrap`, `.ph`, `.rv`, `.line`, `.h1`, `.em`, `.fx__bname small`, `--e-io`;
  - JS: the `[data-wipe]` and `.seam--h` paths and `KSM.FINE`;
  - images: `facade-cut-1200.webp` and `gr-balcside-510.webp`.
- **The saved-apartments feature** (§4.16) is new scope, not production.

### 8.2 Rough: replace before launch

- **Works without photos.** Айвазовски Парк, Панорама Резидънс and Сънни Хил блок 9 show text plates. Production has photos (`src/assets/projects/…`).
- **One typical plan per block** is used for all eight floors, and Block А has no exposure data (`blk__note`).
- **Кота is extrapolated** for floors 2–8 (§0.4).
- **Stills instead of the film.** Both heroes use the night-graded still `gr-dusk-*`. The client-accepted GR film exists (`design/…/assets/film`, `assets/gr/hero-*`); it is not decided here.
- **Concept image derivatives.** These must be produced for v2: `gr-dusk-*`, `mn-dusk-*` (dusk-graded renders), `facade-cut-*` (facade with the sky masked, 2 × of `building-2.webp`) and `plan-a.webp` / `plan-b.webp` (dark versions of `architecture-{a,b}-floor-2.webp`).
- **„192“ in the GR hero facts and the story `kv` figures are hardcoded**; only „69“ is live.

### 8.3 Known nits: fix them, do not copy

1. **Italic descenders are clipped by line masks.**
   - `KSM.reveal` never reverts SplitText, so every `[data-split]` heading keeps its `overflow: clip` line masks.
   - Only `.hero__title` (`.2em`, and that split is reverted), `.bros__line` (`.22em`) and `.svc` (`.22em`) get `overflow-clip-margin`.
   - With Cormorant's metrics (§2.4) a line box leaves `L/2 − 0.3185 em` under the baseline: 0.17 em for the motto at `.98`, 0.18 em for `.h2` at 1. So р, у, з and д are cut, worst in italic.
   - Visible in `c2v2-company-1440.png`: the motto „Добрата работа – реклама за майстора“ (р, з). It also hits „проект“, „апартамент“, „рамки“, „двор“, „паркоместа“ and „отблизо“.
   - Right-aligned lines that end in an italic word („…*отблизо*“, „…*паркоместа*“, „…*апартамент*“) also lose the italic overhang at the mask's right edge.
   - Fix: revert splits after landing (as the hero does), or give every mask `overflow-clip-margin` of about `.22em`.
2. **The „коректност — бързина — точност“ trio renders at 17 px.**
   - `.bros__story p` (`:330`, specificity 0,1,1) beats `.triad` (`:331`, specificity 0,1,0).
   - The `<p class="triad">` therefore gets `font-size: 17px; line-height: 1.7; color: var(--ivory-2); max-width: 33em`. Only the italic serif family, style and weight survive from `.triad`'s shorthand.
   - Intended: `italic 500 clamp(28px, 2.4vw, 38px)/1`, ivory.
   - Fix: scope it so it wins (for example `.bros__story .triad`).
3. **The EU dialog's seam is not on its column line.** `.dlg__box` uses `.8fr / 1fr` columns (the poster takes 44.4 %), but `.seam` sits at `left: 50%`. On a 1080 px box it falls about 60 px into the text column and can cross the text's first characters.
4. **The plan-stage drawing bleeds outside its area.** `.ps__plan > svg` has `overflow: visible`, so the full architectural drawing spills over the bar and past the screen edge (faint lines over „кота …“ in `c2v2-check-explorer-open-1440.png`). Clip the plan area.
5. **Missing preload.** The italic cyrillic file is not preloaded, yet the hero shows „мечтания“ in the first frame.
6. **Unchecked consent.** The consent checkbox is `required`, but `novalidate` plus JS validation never checks it.
7. **Header covers the GR inquiry.** `#zapitvane` on the GR page lacks `data-offset`, so after a jump the header covers its top 76 px.

### 8.4 Conflicts with the v2 spec to resolve with the user

The user's decisions win over the old spec's voided §3 and the A2, A3 and A5 items. These motion items are not voided by name:

| Topic | Diptych | Spec |
|---|---|---|
| Lenis | `lerp 0.1`, default `wheelMultiplier` (`core.js:169`) | `lerp 0.07`, `wheelMultiplier 0.8` (§5.1; `src/utils/smoothScroll.js:23-24`) |
| First viewport | JS-driven intro and entrance (image `scale 1.12 → 1`, title rise, doors over the page for about 0.9 s) | §5.2.2–5.2.4: the first viewport is CSS-only, LCP is never animated, the load moment is ≤ 1.2 s; §14.7 had dropped the intro. The user now asks for "the seam intro once per session". |
| Section reveals | Fade-up on body copy, wipes on many images | §5.2.5: no generic fade-up, at most one image reveal per page |
| Count-ups | The hero count rolls from 0 on every hover | §5.4: roll only when a value changes |
| Page transitions | The doors (400 + 600 ms) | §5.3: a 240–280 ms crossfade. The user chose the doors. |
| Flip | Used for the Визуально / По критерии height change | §5.1: Flip only in in-page viewers |
| EU line placement | Footer and menu | §14.1 default: the header on every page, plus `/eu-proekt`, plus the Home section |
