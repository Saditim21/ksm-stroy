Both fonts are built as single files with the Bulgarian forms working. Together they weigh 75,232 B (75.2 kB) against the 90 kB budget, leaving 14.8 kB of headroom. Every check passes, and the build is reproducible byte for byte.

Output folder: C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad/assets/fonts/

There is no REPORT.md: the harness blocks subagents from writing report files ("Subagents should return findings as text"). This message is the report; save it as REPORT.md in the folder if you want it there.

**Decision for you:** I used opsz 72, not the spec's 96. Reasons are in section 2; `--opsz 96` rebuilds with the spec's value.

## 1. What ships

| File | Content | Bytes |
|---|---|---:|
| `dist/playfair-display.woff2` | Playfair 2.203, opsz 72, wdth 100, wght 400–560 variable, lining figures frozen as default | 50,608 |
| `dist/geologica-text.woff2` | Geologica 1.010, CRSV/SHRP/slnt pinned at 0, wght 300–600 variable | 24,624 |
| `dist/fonts.css` | 2 web faces, 8 fallback faces, `--font-display` / `--font-text` stacks | 3,046 (797 gzipped) |

- **Two-file split, for comparison** (`dist/split/`):
  - Playfair: 25,376 + 28,660 = 54,036 B.
  - Geologica: 14,360 + 14,096 = 28,456 B.

  The single file is 3.4–3.8 kB smaller, avoids the double swap, and keeps kerning between Cyrillic and punctuation.
- **Coverage:**
  - Cyrillic: U+0400–045F, 0490–0491, 04B0–04B1, 2116; combining U+0300–0301;
  - Latin: U+0020–007E;
  - Latin-1: U+00A0, A7, A9, AB, AD, B0–B3, B7, BB, D7;
  - punctuation: U+2010, 2013–2014, 2018–201E, 2022, 2026, 2032–2033, 2039–203A;
  - symbols: U+20AC, 2212.

  Only two of these are absent from the fonts: U+00AD (not in Playfair) and U+201B (in neither).
- **Also delivered:** `dist/font-report.json` with every number; `dist/OFL-*.txt` licences to copy next to the fonts.

**Sources: I did not build from the npm files.** I fetched `@fontsource-variable/playfair@5.3.0` and `geologica@5.3.0` with `npm pack` into `src/` and inspected them. Even their all-axes files are split by script, so no file holds both Cyrillic and Latin. That means:
- No fontsource file can kern Cyrillic against punctuation. The master has large pairs: „С −36, У, −145, Р. −131 (units of 1240).
- Their Playfair subset also lacks the `case` feature you asked to keep.

So the build uses the canonical google/fonts masters (Playfair Version 2.203, Geologica 1.010), pinned to a commit with sha256 checked. A provenance check confirms every glyph in the fontsource files is identical in outline, advance and variation data: 218 + 423 glyphs for Playfair, 188 + 277 for Geologica. It is the same font, just unsplit.

## 2. Playfair optical size: 72

Screenshots are in `shots/opsz-s120@2x.png`, `opsz-s64@2x.png`, `opsz-detail-120px@2x.png`, `opsz-small@2x.png`, `opsz-24px-dpr1-x6.png` and `opsz-counts@2x.png`.
- **96 and 120 are practically the same design.** Playfair maps them to almost the same point on the axis (0.849 and 0.852); only 72 differs.
- **At 64 and 120 px all three look right.** 72 is about 0.5% wider, with slightly sturdier strokes.
- **Measured hairlines decide it.** At opsz 72 they are 13–14 font units, against 11–12 at 96/120:
  - an h3 at 24 px on a non-retina screen gets 0.25 px against 0.21 px, and the е crossbar visibly fades at 96/120;
  - an h2 at 34 px on a phone gets 0.36 px against 0.30 px.
- Most display text on this site is 24–58 px, and the file sizes are within 0.3 kB of each other.

## 3. Features and checks

**Playfair:**
- GSUB `ccmp calt liga rlig case tnum`, plus `locl` reached only through the Bulgarian (BGR) language system. GPOS `kern mark mkmk`.
- **Bulgarian forms:** 30 letters — Ѝ Д Ж И Й К Л Ф в г д ж з и й к л н п т у ф ц ч ш щ ъ ь ю я.
- **Digits:** lining figures are frozen into the character map, along with % + < = > ^ ~ ± × −. Digits are now lining and proportional by default. `tnum` still works and gives tabular lining digits.
- **Removed:** the calt arrow ligatures (->), since the site draws arrows as SVG.
- **Weight-dependent glyph swaps:** the `rlig` feature swaps Є Э є э and $. The default feature already applies them at weight 400, so this doesn't rely on browser support for weight-conditional substitution.

**Geologica:**
- **locl BGR: yes.** 20 letters — Д Л в г д ж з и й ѝ к л п т ц ш щ ъ ь ю.
- **tnum: yes.**
- **lnum: no.** None is needed, because its default digits are already lining.
- **case:** it exists, but only for Greek, so nothing of it remains in this subset. Geologica has no case-sensitive punctuation.
- **One font fix:** Geologica's tabular six was 2 units wider than the other tabular digits (of 2000) at weight 300, drifting to 5 at 600. The build gives it the others' width.

**Checks:**
- **Bulgarian forms in Chrome:** I rendered `specimen.html` in system Chrome via puppeteer, comparing lang="bg" with lang="ru" pixel by pixel for every letter. The letters that render differently are exactly the build's list for both fonts. Unchanged letters differ by 0 pixels; changed ones by at least 66. Screenshots: `shots/specimen-letters@2x.png`, `specimen-pf-bgru@2x.png`, `specimen-geo-bgru@2x.png`.
- **Digits:** lining by default. Tabular advances are equal at every tested weight, measured both ways the font stores widths, and the variation is identical across all ten digits. In Chrome every tabular line measures exactly the same: 346.08 px (Playfair) and 388.81 px (Geologica). See `shots/specimen-figures@2x.png`.
- **Typographic marks:** all 32 that the copy uses are drawn by both fonts (`shots/specimen-symbols@2x.png`).
- **Site copy:** I scanned the production, golden-residence and v2 source. The only characters not covered are arrows, ✓ ✕ ✗ ⌨ and emoji, which the spec bans or draws as SVG.
- **Failure test:** I fed `run_checks` deliberately broken reports, and it caught each one. The build script exits 1 on any failed check, so it can run in CI.

## 4. Fallback metrics

**Method:**
- Average advance over a Bulgarian letter-plus-space sample: 23,963 characters of the site's own deduplicated copy, using the Bulgarian forms that actually render.
- The overrides come from the web fonts' vertical metrics.
- One `@font-face` per weight band, read from C:/Windows/Fonts.

| Face | Weights | size-adjust | ascent | descent | line-gap |
|---|---|---|---|---|---|
| Georgia (for Playfair) | 400–449 / 450–560 | 95.44% / 95.71% | 92.78% / 92.52% | 32.95% / 32.86% | 0% |
| Times New Roman (for Playfair) | 400–449 / 450–560 | 104.93% / 105.22% | 84.39% / 84.16% | 29.98% / 29.89% | 0% |
| Segoe UI (for Geologica) | 300–449 / 450–600 | 113.90% / 115.42% | 85.60% / 84.47% | 24.14% / 23.83% | 0% |
| Arial (for Geologica) | 300–449 / 450–600 | 111.96% / 113.46% | 87.08% / 85.94% | 24.56% / 24.24% | 0% |

**Helvetica Neue is skipped:** no Cyrillic width data is available or published. Arial ships on macOS and iOS, so the Arial face covers Apple devices.

**Validation in Chrome** (`fallback-check.html`, `shots/fallback-full.png`, `shots/fallback-h1-detail@2x.png`, `shots/fallback-check.json`):
- Baselines and line heights are identical to the pixel between each web font and its fallbacks.
- Line counts match in every wrapped test. Plain fonts re-wrap the body text: 8 lines become 7, and 15 become 13 on a phone.
- Single-line width ratios (fallback ÷ web font):

  | Text | Ratio |
  |---|---|
  | h1 | 0.977 |
  | h2 | 0.996 |
  | body | 0.979 |
  | label | 0.994–1.006 |
  | the short button | 0.92 |

**Re-wrap simulation** (`tools/wrapsim.py`, with HarfBuzz widths that match Chrome within about 0.1%; results in `shots/wrapsim.txt`). Real headings were wrapped at the spec's sizes and widths, and site paragraphs at 17 and 14.5 px:

| Fallback | Tested | Re-wraps with adjusted face | Re-wraps with plain font |
|---|---|---|---|
| Georgia | 315 heading configurations | 15 | 32 |
| Times New Roman | 315 heading configurations | 11 | 34 |
| Segoe UI | 180 paragraphs | 11 | 48 |
| Arial | 180 paragraphs | 8 | 44 |

Shifting size-adjust by ±1–2%, or adding a kerning correction, does no better, so I kept the method you specified.

## 5. Known limits

- **One scale factor can't fit every string.** Playfair-to-Georgia letter widths range from 0.78 (л) to 1.68 (the Bulgarian т, which is m-shaped). Individual headings land between −7% and +10% of the web width. Preloading Playfair is the main protection for the h1: `<link rel="preload" href="/fonts/playfair-display.woff2" as="font" type="font/woff2" crossorigin>`.
- **No matched fallback on Android.** It has none of these local fonts, so it falls back to plain Roboto or Noto Serif.
- **Safari overrides unconfirmed.** I believe Safari ignores ascent-, descent- and line-gap-override; it does apply `size-adjust`.
- **Thin math signs.** Playfair's + ± − × = are hairline-thin at display size, so signed values like „кота +3,06“ belong in Geologica.
- **h3 at 24 px is delicate** in the display cut.
- **Weight limits.** Keep Playfair within 400–560 (consider `font-synthesis-weight: none` on display text). Geologica's maximum is 600, so `<strong>` should use 600.
- **`lang="bg"` is required for the Bulgarian forms.** Bulgarian lines also run longer than the same text set as Russian.

## 6. How to rebuild

- **Fonts:** `python -I -X utf8 build-fonts.py --pylib ../_py --fetch [--fontsource src] [--copy <src dirs>]`. It takes about 26 s on one core. Two runs, and one fresh fetch into an empty folder, produced byte-identical fonts and CSS.
- **Optional:** `--experiment` prints the extra kB each optional feature costs. Kerning costs 19.2 kB; the others cost 0.2–1.6 kB each, and all are kept.
- **Screenshots and browser checks:** `node shoot-specimens.mjs`. It borrows puppeteer and sharp read-only from C:/ksm-stroy/ksm-stroy and runs system Chrome.
- **Python packages:** fontTools 4.68 and brotli, plus uharfbuzz used only by tools/, are installed in `../_py`.

Nothing was written to any repository. I accidentally wrote one hash list outside the output folder (C:\Users\sadit\AppData\Local\Temp\run1.sha) and deleted it straight away.

Files are in C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad/assets/fonts/:
- build-fonts.py
- shoot-specimens.mjs
- specimen.html
- opsz-compare.html
- fallback-check.html
- dist/ (shipped files; split/, compare/ for comparison; work/ unshipped copies)
- shots/ (screenshots and JSON results)
- src/ (npm tarballs and pinned masters)
- tools/ (investigation helpers)
## Naming in the site

The build output is shipped as `public/fonts/ksm-display.woff2` (playfair-display.woff2) and `ksm-text.woff2` (geologica-text.woff2). `src/styles/fonts.css` renames the families to `KSM Display`, `KSM Text` and their `... Fallback ...` faces; the size-adjust and override values are the computed ones, unchanged. Rules for later work: set signed values such as `кота +3,06` in `KSM Text`; keep Playfair at 400-560 with `font-synthesis-weight: none` on display text; `<strong>` in text is 600; `<html lang="bg">` is required for the Bulgarian forms.
