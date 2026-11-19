# Polish round before the client review: results (2026-11-19)

Spec `docs/superpowers/specs/2026-11-19-ksmstroy-polish-design.md`, plan
`docs/superpowers/plans/2026-11-19-ksmstroy-polish.md`. The round's rulings and
its deferred minors are at the end of this note.

## What changed

| # | The owner's ask | What the site does now | Commits |
|---|---|---|---|
| 1 | Remove the project's sentence from the top | The sentence went first; then, at the owner's request before the preview, the whole EU row (see below). The footer, the menu, Home's poster and /eu-proekt carry the EU line. | cc745d8, 929bf8a |
| 2 | Better covers in „Нашите обекти“ | Six covers of their own (`cover-<work>`), 1920 px masters in one grade; Green Life the night pool from the owner's photo's larger original. AI enlargement waits for the owner to run Real-ESRGAN (`scripts/images/covers.mjs --x4 <dir>`). | 9e33306 |
| 3 | Продажби easier to understand, opening on images | Concept A „Две сгради“: the two buildings first, „Етаж по етаж“, the free apartments with filters. | e98ad04, ea6bea8 |
| 4 | A creative За нас, not opening on the names | Concept A „Стена“: the motto over 35 photographs that zoom into Хотел Парадайс; the founding in production's words; the works on a sideways track (a grid where the track cannot run); the legacy sections. | e544818, 3633804, 467535a |
| 5 | Try a light mode | „Травертин“ behind a switch in the header and the menu, remembered, set before the first paint; what sits on photographs stays dark (Home's services' columns included). Dark is the default. | b15410e, 8c4c341, cf076e7, a4c52d6 |
| 6 | Responsive on every device | The sweep below, and its fixes. | b31da32, 3633804 |

## After the round: the EU row comes off the header

Before sending the preview, the owner asked for the row at the top of every page gone: the co-funding emblem, the programme's logo and „За проекта“ (the round had removed only the project's sentence). The header is now the bar alone, and `--eu-h` is 0. The footer, the menu, Home's poster and /eu-proekt keep the EU line, so the contract test (`tests/contracts/eu-visibility.test.jsx`) passes unchanged. The row's styles and a deep link's landing hold stay, unused; rendering the row and setting `--eu-h` back to 36px restores it.

Before launch, the beneficiary's EU visibility rules for the project (until 27.01.2027) want the emblem visible on opening, without scrolling. That is worth confirming with KSM's contact for the grant: without the row, the emblem shows only in the footer, the menu and on /eu-proekt.

## The final review, and what it changed

A fresh reviewer read the round (b21719b..9e33306) and checked it in headless Chrome: one critical finding, four important, five minor.

- **Critical: the works track without its slide.** On a desktop with reduced motion, Save-Data or a failed motion engine, and on a tablet turned from upright to its side, the works lay in a one-screen row with the overflow hidden: two of eight in view. The row and its pin are now the slide's own (`data-slide`, set while it runs, on a desktop at least 600 px tall); everywhere else the works stand in a grid. The slide follows the screen across that line.
- **Important: the full photograph covered the wall without motion.** It now enters the page with the reader's first scroll into the zoom.
- **Important: pins taller than a phone on its side.** The wall's pin is one screen tall, never 620 px; a phone on its side lays the wall 7 × 5; the track's pin has no 640 px floor and its photographs are sized by the height too.
- **Important: Home's services unreadable in the light theme** once a column opened on its darkened photograph. The row is a dark island.
- **Important: a floor opened before Golden Residence's numbers said it was sold out.** It now says „Зареждаме апартаментите на етажа…“.
- Found while checking the grid: a work's name sat under its stack's fanned back photograph. The stack keeps room under it.
- Found in the light sweep's screenshots: on a phone, /contact's subjects sit below the photograph but inside its dark island, so the chosen one was ivory on the light stone, all but invisible. On a phone they now take the page's light values back.

## Page weight (check:dist, gzip first-load JS)

| Route | M4 end | Now |
|---|---|---|
| `/` | 153,280 | 153,719 |
| `/projects` | 154,619 | 153,371 |
| `/about` | 149,722 | 152,695 |
| `/blog` | 150,624 | 151,144 |
| `/contact` | 155,315 | 155,860 |

Every route keeps more than 512 B of room under 160 KiB; `/` and Golden Residence stay under their caps.

## Lighthouse on a phone (median of 3 runs)

| Page | LCP | TBT | CLS | Performance | Accessibility | LCP per run |
|---|---|---|---|---|---|---|
| `/` | 2.28 s | 0 ms | 0.000 | 98 | 100 | 2.28, 2.27, 2.58 s |
| `/projects` | 2.43 s | 0 ms | 0.000 | 98 | 100 | 2.44, 2.43, 2.42 s |
| `/about` | 2.49 s | 0 ms | 0.000 | 98 | 100 | 2.49, 2.50, 2.47 s |
| Target | ≤ 2.5 s | ≤ 150 ms | ≤ 0.1 | | ≥ 98 | |

За нас measured 3.66 s at first. Its LCP is a wall tile, and two things made it late. The 35 tiles fetched 1.2 MB of photographs before it. And a tile that grew as it came up was counted again, larger, at the end of its rise, 1.9 s in. The tiles now have small renditions of their own (`wall-*`, 240 to 480 px, 8 KB at 320). Each tile fades in at its size while its photograph settles inside it. The full photograph waits for the first scroll into the zoom. On a phone, a works stack's two back photographs, which show only their edges there, are fetched at half the screen's width.

The bytes before За нас's LCP fell from 1,179 KB to 988 KB. Its LCP is within the target, but at its edge. What remains before it is mostly the page's own script work and the lazy photographs Chrome fetches within its lazy-load distance. Home's third run (2.58 s) is the occasional slow run M4 saw too.

## The smoke run

PASS: 32 URLs at 1440 × 900 and 390 × 844, the scroll lock, the focus ring, the phone opening and the explorer. Продажби's check now opens a floor with a real mouse and clicks its first free apartment, in place of the squares board it used to point at.

## The responsiveness sweep

`node scripts/sweep/sweep.mjs --base http://127.0.0.1:4400` against the production build (`node scripts/smoke/static-server.mjs build/client 4400`): 11 pages × 15 sizes, 320 × 640 to 2560 × 1440, two phones on their side (844 × 390, and 932 × 430 in the desktop layout), tablets both ways. Dark: 0 of 165 with problems. Light: 0 of 165 with problems.

What it found over the round, all fixed:
- Продажби's floor rows were wider than the screen at 320 and at 1024 px.
- At 844 × 390 a building's half slid under the header (found by eye).
- За нас's pins were taller than a phone on its side (the final review).
- /contact's subjects were ivory on stone on a phone in the light theme (found by eye, in the light sweep's screenshots).

## Rulings

Each with what it costs if it is wrong.

- Light brass and status colours are a little deeper than the concept's (brass #8E6D2C, brass-l #735619, free #237F4E, reserved #B0621A): the concept's failed 3:1 and 4.5:1 on the light ground. Cost: a slightly deeper gold than the owner saw.
- Многофамилна's floors are numbered as on its own page (10 → 2), not the concept's 9 → 1. Cost: none.
- Units with no type in the sheet show under „Всички“ only, and the opening counts known types only (31 such units in Golden Residence's built-in data). Cost: a typeless free unit is not counted by type.
- The free list renders no rows until both buildings' data is in, so they do not reorder. Cost: an empty list for the moment the data loads.
- За нас keeps the legacy Values section (Качество, Точност, Иновации), the client's own copy, which the concept dropped. Cost: one section longer than the concept.
- The works' data lives in За нас's photos.js, not imported from works.js, so /blog's first load stays its own. Cost: the seven names exist in three places.
- The wall's renders gained 480 px files (Task 3). Cost: other pages' srcsets gain a candidate.
- In the light theme, Многофамилна's whole opening, the explorer's plan stage and its unit panel stay dark. Cost: a dark band and dark dialogs on a light page.
- The covers are enlarged by Lanczos and unsharp mask, not AI: the session's safety check blocked the downloaded Real-ESRGAN twice. Cost: softer than an AI enlargement on 2× screens until the owner runs the upscaler.
- Green Life's cover is the gallery's 960 × 640 original of the photo the owner sent (569 × 427, a darker crop). Cost: the owner's darker grade is not kept.
- The wall's 34 tiles have a second, small rendition of photos the site already has (group `wall`, 240/320/480 px, AVIF 42, WebP 62); works.test's once-only rule exempts the group, which may only re-render existing entries. Cost: 204 more files (2.2 MB) in public/img.
- A wall tile fades in at its size while its photograph settles inside it (scale 1.16 → 1), not the concept's tile growing from 86 %. Cost: an opening slightly different from the approved concept's.
- The zoom's full-size photograph loads on the reader's first scroll into the zoom (progress over 1 %). Cost: a very fast scroller may see the enlarged centre tile for a moment.
- A works stack's back photographs are asked for at 50vw on a phone. Cost: their edges slightly softer there.
- Browsers without color-mix or View Transitions are outside the supported list. Cost: a visitor on iOS 15 or older (well under 1 %) sees a see-through header bar and missing tints.
- The zoom's scrub on a low-end phone is unmeasured (it moves one layer by transform; TBT 0 ms). Cost: a stuttering zoom on such a phone; the remedy would be to bake the tiles' darkening into their files.
- Another open tab keeps its theme until it reloads. Cost: two tabs in two themes for a while.
- Kept as they are, with no cost found: sold squares as outlines (they differ by shape too), the free count's single announcement on load, the theme label's 11 px shift, the rare race between the theme transition and a page change, and the internal choices of order, selectors and test placement.

## Deferred minors

- The works' photo stacks end the slide in other poses than they start (REST and SPREAD are applied front to back; GSAP reads the CSS translate as pixels and adds xPercent).
- The wall shows two Green Life photographs one above the other (tiles 0 and 7).
- The zoom's closing sentence („Строим жилищни…“) is aria-hidden, so screen readers miss it.
- On classic Windows scrollbars, a light strip beside the always-dark plan dialog in the light theme (`useScrollLock('var(--umber)')` resolves on `<html>`).
- Before hydration, a light-theme visitor sees „Светла тема“ on the bar's label (from 1280 px) and a dark theme-color in the address bar.
- A theme switch within 1.4 s of Back or Forward (a door cut) flattens the page outside the circle for 700 ms.
