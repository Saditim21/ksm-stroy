# Polish round before the client review: results (2026-11-19)

Spec `docs/superpowers/specs/2026-11-19-ksmstroy-polish-design.md`, plan
`docs/superpowers/plans/2026-11-19-ksmstroy-polish.md`, ledger
`.superpowers/sdd/2026-11-19-ksmstroy-polish/progress.md` (every ruling).

## What changed

| # | The owner's ask | What the site does now | Commit |
|---|---|---|---|
| 1 | Remove the project's sentence from the top | The header's EU row holds the co-funding lockup, the programme's logo and „За проекта“; the sentence is in the footer and on /eu-proekt. The emblem stays in view on opening (handbook 2021–2027, §3.1). | cc745d8 |
| 2 | Better covers in „Нашите обекти“ | Six covers of their own (`cover-<work>`), 1920 px masters in one grade; Green Life the night pool from the owner's photo's larger original. AI enlargement waits for the owner to run Real-ESRGAN (`scripts/images/covers.mjs --x4 <dir>`). | 9e33306 |
| 3 | Продажби easier to understand, opening on images | Concept A „Две сгради“: the two buildings first, „Етаж по етаж“, the free apartments with filters. | e98ad04, ea6bea8 |
| 4 | A creative За нас, not opening on the names | Concept A „Стена“: the motto over 35 photographs that zoom into Хотел Парадайс; the founding in production's words; the works on a sideways track (a grid where the track cannot run); the legacy sections. | e544818, 3633804 |
| 5 | Try a light mode | „Травертин“ behind a switch in the header and the menu, remembered, set before the first paint; what sits on photographs stays dark (Home's services' columns included). Dark is the default. | b15410e, 8c4c341, cf076e7 |
| 6 | Responsive on every device | The sweep below, and its fixes. | b31da32, 3633804 |

## The final review, and what it changed

A fresh reviewer read the round (b21719b..9e33306) and checked it in headless Chrome: one critical finding, four important, five minor.

- **Critical: the works track without its slide.** On a desktop with reduced motion, Save-Data or a failed motion engine, and on a tablet turned from upright to its side, the works lay in a one-screen row with the overflow hidden: two of eight in view. The row and its pin are now the slide's own (`data-slide`, set while it runs, on a desktop at least 600 px tall); everywhere else the works stand in a grid. The slide follows the screen across that line.
- **Important: the full photograph covered the wall without motion.** It now enters the page with the reader's first scroll into the zoom.
- **Important: pins taller than a phone on its side.** The wall's pin is one screen tall, never 620 px; a phone on its side lays the wall 7 × 5; the track's pin has no 640 px floor and its photographs are sized by the height too.
- **Important: Home's services unreadable in the light theme** once a column opened on its darkened photograph. The row is a dark island.
- **Important: a floor opened before Golden Residence's numbers said it was sold out.** It now says „Зареждаме апартаментите на етажа…“.
- Found while checking the grid: a work's name sat under its stack's fanned back photograph. The stack keeps room under it.

The five minors are deferred (the ledger's `minor (deferred)` lines).

## Page weight (check:dist, gzip first-load JS)

| Route | M4 end | Now |
|---|---|---|
| `/` | 153,280 | 153,714 |
| `/projects` | 154,619 | 153,366 |
| `/about` | 149,722 | 152,668 |
| `/blog` | 150,624 | 151,139 |
| `/contact` | 155,315 | 155,855 |

Every route keeps more than 512 B of room under 160 KiB; `/` and Golden Residence stay under their caps.

## Lighthouse on a phone

| Page | LCP | TBT | CLS | Performance | Runs |
|---|---|---|---|---|---|
| `/` | 2.27 s | 2 ms | 0.000 | 98 | 2.28, 2.27, 2.26 s |
| `/projects` | 2.43 s | 0 ms | 0.000 | 98 | 2.44, 2.43, 2.43 s |
| `/about` | 2.46 s | 13 ms | 0.000 | 98 | 2.46 s (one run; see below) |
| Target | ≤ 2.5 s | ≤ 150 ms | ≤ 0.1 | | |

За нас measured 3.66 s at first (3.04 s with lighter tiles). Its LCP is a wall tile, and two things made it late. The 35 tiles fetched 1.2 MB of photographs before it. And a tile that grew as it came up was counted again, larger, at the end of its rise, 1.9 s in. The tiles now have small renditions of their own (`wall-*`, 240 to 480 px, 8 KB at 320). Each tile fades in at its size while its photograph settles inside it. The full photograph waits for the first scroll into the zoom. The median of three runs on that version was 2.45 s. After the review's fixes, Claude Code stopped the session's processes for low memory during За нас's second run, so one run (2.46 s) stands for now. The accessibility scores have not been run yet.

## The smoke run

PASS: 32 URLs at 1440 × 900 and 390 × 844, the scroll lock, the focus ring, the phone opening and the explorer. Продажби's check now opens a floor with a real mouse and clicks its first free apartment, in place of the squares board it used to point at.

## The responsiveness sweep

`node scripts/sweep/sweep.mjs` (11 pages × 14 sizes, 320 × 640 to 2560 × 1440, a phone on its side, tablets both ways), dark theme. Two real findings, both on Продажби's floor rows (wider than the screen at 320 and at 1024 px), and a third by eye (at 844 × 390 a building's half slid under the header); all three fixed. On За нас the final review found the pins taller than a phone on its side (fixed, above). The sweep now also takes 932 × 430, a large phone on its side in the desktop layout.

Not yet run: the light theme, and 932 × 430 in either theme (the session's processes were stopped for low memory before them).
