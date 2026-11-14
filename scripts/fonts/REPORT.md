# Self-hosted fonts: build report

This is what `scripts/fonts/build-fonts.py` built for the Diptych redesign (spec `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md`, §3.1) on 2026-11-14, and the checks behind it. The numbers come from the build's `font-report.json`, which is written to `--out` and not committed, and from Chrome checks on the shipped files. Cormorant Garamond and Manrope replace M1's Playfair Display and Geologica, whose files and licences are gone.

## 1. What ships

| File | Family and face | Weights | Glyphs | Bytes |
|---|---|---|---:|---:|
| `public/fonts/ksm-display.woff2` | `KSM Display`: Cormorant Garamond 4.001 | `wght` 500–600, variable (default 500) | 352 | 35,304 |
| `public/fonts/ksm-display-italic.woff2` | `KSM Display` italic: Cormorant Garamond Italic 4.001 | static 500 | 333 | 22,896 |
| `public/fonts/ksm-text.woff2` | `KSM Text`: Manrope 4.505 | `wght` 400–600, variable (default 400) | 290 | 22,880 |
| | | | **Total** | **81,080** |

- **Budget.** 35,304 + 22,896 + 22,880 = 81,080 B (79.2 KiB) of the 92,160 B (90 KiB) budget, leaving 11,080 B. The spec estimated about 84 KB. `src/styles/fonts.test.js` fails the suite above 90 KiB.
- **Coverage, in each file:**
  - Cyrillic: U+0400–045F, U+0490–0491 (Ґ ґ), U+04B0–04B1 (Ұ ұ) and U+2116 (№);
  - combining grave and acute, the stress marks: U+0300–0301;
  - Basic Latin: U+0020–007E;
  - Latin-1: the no-break space U+00A0, § ©, « », the soft hyphen U+00AD, ° ±, ² ³, · and ×;
  - punctuation: ‐ – —, the quotes U+2018–201E (with „), • …, ′ ″ and ‹ ›;
  - symbols: € and the minus U+2212.

  What each file lacks is in section 4.1. The full coverage fits the budget, so the build needed no subset narrowed to the copy's characters.
- **`src/styles/fonts.css`** is generated: the three web faces with `font-display: swap`, and 15 metric-matched fallback faces (section 5).
- **Licences.** `public/fonts/OFL-Cormorant.txt` covers both Cormorant files and `public/fonts/OFL-Manrope.txt` covers Manrope. Both are byte copies of the masters' `OFL.txt`.
- **sha256 of the shipped files:**

  | File | sha256 |
  |---|---|
  | `ksm-display.woff2` | `330661b94884acd1d0bc63982e5ba44b12c7d5acae25085dddde1fcebd6c3c88` |
  | `ksm-display-italic.woff2` | `907e3f8a8829c56bd8aa31e7a0d0e6c290af23a3a2c290040d871cc9c2b65c46` |
  | `ksm-text.woff2` | `f35d0077cb4ebb169fdfdde4d76c3154c75347f2fdb8930930d1ec30d98b0c04` |

## 2. Sources

Every source comes from google/fonts at commit `cc39c4c2c304bc368c9b7c311ea2bcc6013299fe`. With `--fetch`, the build downloads any missing source from `raw.githubusercontent.com`. It checks every source against the sha256 in `build-fonts.py` (`SOURCES`) and stops on a mismatch.

| Master (path under `ofl/`) | Version | Use | sha256 |
|---|---|---|---|
| `cormorantgaramond/CormorantGaramond[wght].ttf` | 4.001 | `ksm-display.woff2` | `b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0` |
| `cormorantgaramond/CormorantGaramond-Italic[wght].ttf` | 4.001 | `ksm-display-italic.woff2` | `0f48ea6abb2084537854f7174c470991a463b13036309e3b50a81511611c530d` |
| `cormorantgaramond/OFL.txt` | | `OFL-Cormorant.txt` | `60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956` |
| `manrope/Manrope[wght].ttf` | 4.505 | `ksm-text.woff2` | `3ae11c49db0455a3cc33e37d380f20fdb8c7f8b41dc07625c177e3d87a9d6ae6` |
| `manrope/OFL.txt` | | `OFL-Manrope.txt` | `58172e0c0fac2cda8a37b348164bb55e44b0e69051e557e92b1d3f6910141f7b` |
| `notoserif/NotoSerif[wdth,wght].ttf` | 2.015 | fallback metrics only, never shipped | `4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713` |
| `notoserif/NotoSerif-Italic[wdth,wght].ttf` | 2.013 | fallback metrics only, never shipped | `e87acbc6c0efd0d9a20d6a8cbbda2b266c14be3a3a6f5af8ec9d7b2460570ad1` |
| `roboto/Roboto[wdth,wght].ttf` | 3.015 | fallback metrics only, never shipped | `d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134` |

Each face is built as one file from the whole master. That keeps the kerning between Cyrillic letters and punctuation or Latin (section 4.2), which fonts split per script can't hold.

## 3. What the build does

Each face goes through these steps (`build_font`):

1. **Language systems.** The build keeps `DFLT`, `latn`, the `cyrl` default (the Russian forms) and `cyrl/BGR`. Every other language system goes.
2. **Pre-subset and instance.** The font is subset to the coverage, then fontTools' instancer limits the weights:
   - Cormorant upright: `wght` 500–600, kept variable;
   - Cormorant italic: pinned at 500, a static face;
   - Manrope: 400–600, kept variable.
3. **Lining figures.** Cormorant's default figures are old-style, so the build freezes `lnum` into both Cormorant cmaps (`freeze_feature`). `$`, `0`–`9`, `€` and `№` map to their lining forms (`.lf`). `tnum` stays live and gives tabular lining figures. Manrope's default figures are already lining.
4. **Final subset.** It keeps the features `ccmp locl calt liga kern mark mkmk tnum case`. It drops hinting and glyph names (post format 3), and keeps name IDs 0–6, 13 and 14, which hold the copyright and licence the OFL requires.
5. **Tabular-digit fix.** Any tabular digit whose advance drifts from the others gets their advance. This step changed nothing in any face, because the masters' tabular digits already agree.

What each file keeps:

| File | GSUB, every script | GSUB, `cyrl/BGR` only | GPOS |
|---|---|---|---|
| KSM Display (both files) | `calt case ccmp liga tnum` | `locl` | `kern mark mkmk` |
| KSM Text | `calt case liga tnum` | `locl` | `kern` |

Manrope draws neither combining mark in the coverage, so nothing of `ccmp`, `mark` or `mkmk` survives its subset.

Cost of the optional features (`--experiment`: the bytes each file would save without the feature):

| Feature | KSM Display | KSM Display italic | KSM Text |
|---|---:|---:|---:|
| `kern` | 1,596 | 1,200 | 2,372 |
| `liga` | 3,472 | 2,052 | 604 |
| `calt` | 376 | 232 | 472 |
| `case` | 1,796 | 1,468 | −44 |

All four stay, within the budget. Dropping `case` from Manrope would make its file 44 B larger.

## 4. Checks

### 4.1 Build checks

`run_checks` runs on every build, and the build exits 1 if any check fails. All pass.

| Check | KSM Display | KSM Display italic | KSM Text |
|---|---|---|---|
| Requested code points missing | U+201B | U+201B | U+201B and seven more (below) |
| Where `locl` is reachable | `cyrl/BGR` only | `cyrl/BGR` only | `cyrl/BGR` only |
| Substitutions under `cyrl/BGR` | 30 | 12 | 23 |
| Letters with a Bulgarian form of their own | ЍФвгджзийкмнпртцчшщъыьюѝ (24) | ЛФвджзкю (8) | ДЖЛвгджзийклнптцчшщьюѝ (22) |
| BGR substitutions that draw the default glyph | Д И Й Л ф л | Д И Й Ѝ | К |
| Default figures | lining (frozen `lnum`) | lining (frozen `lnum`) | lining |
| Tabular figures (`tnum`) | one advance, 491/1000, at 500, 550 and 600 | one advance, 491/1000 | one advance, 1240/2000, at 400, 500 and 600 |

The three files total 81,080 B, within the 92,160 B budget.

- **The Bulgarian forms are pinned.** Each face's `bg_letters` in `build-fonts.py` lists the letters that must keep a Bulgarian form of their own, and a build that loses one fails. Display pins the 23 Bulgarian letters of its row; the 24th, ы, also changes under BGR, but Bulgarian doesn't use it. The Russian default (`cyrl/dflt`) has no `locl`, so text without `lang="bg"` gets the default glyphs.
- **BGR substitutions that draw the default glyph.** These are Cormorant's Д И Й Л ф л, the italic's Д И Й Ѝ and Manrope's К. For each, the BGR glyph has the same outline, advance and variation deltas as the default glyph.
  - The build lists them (`bgr.identical_outlines` in `font-report.json`), and they are not a failure. The default already has the shape Bulgarian uses:
    - Cormorant's Д has the pointed top, and its Л and л are the Λ shapes;
    - И Й Ѝ are the same in both alphabets;
    - Manrope draws one К for both.
  - Chrome confirms this (section 4.4).
  - The italic draws fewer Bulgarian forms than the upright because italic Cyrillic already looks like them, as in its т, и and п.
- **Figures.** At every checked weight:
  - the default figures are lining;
  - the ten tabular figures share one advance;
  - the advance read through HVAR, as browsers compute it, matches the instanced outline's;
  - the tabular advance varies alike for all ten digits;
  - the tabular figures are lining too.
- **Missing code points.** No file has U+201B (‛, the reversed-9 quote), which Bulgarian doesn't use. Manrope also lacks seven code points of the coverage, allowed in `build-fonts.py` (`allowed_missing`):
  - U+0300 and U+0301, the combining grave and acute (stress marks);
  - U+04B0 and U+04B1, Ұ and ұ (Kazakh);
  - U+2010, the hyphen (the copy uses the hyphen-minus, U+002D);
  - U+2032 and U+2033, the prime and the double prime.

  A browser draws such a character from the next font in the stack.
- **Site copy.** `--copy src` lists the characters in `src`'s text files that a file lacks. For this report it found the same set for all three faces: ← → ↕ ✕ ⌨ ▽ 🔍 🖱 (with U+FE0F), plus the prime ′ for Manrope.
  - They sit in legacy pages (`/projects` and the block pages), the dev tracer page, tests and code comments. The prime appears only in two comments (`src/utils/polygon.js:7`, `src/utils/polygon.test.js:9`).
  - None of them is v2 copy set in a KSM face. The ▽ is an SVG in `ElevationMark`, and the spec draws arrows and ✕ as SVG (§3.3).

### 4.2 Cross-script kerning

These values are at the default weight; "—" means no kern pair covers it.

| Pair | KSM Display (/1000) | KSM Display italic (/1000) | KSM Text (/2000) |
|---|---:|---:|---:|
| „С | — | −23 | −60 |
| „Д | +35 | +35 | — |
| а“ | −35 | — | −60 |
| о“ | −23 | −23 | −60 |
| т“ | — | −29 | — |
| Г. and Г, | −70 | −70 | −200 |
| Т. | −70 | −70 | −200 |
| Р. | −58 | −58 | — |
| У, | −76 | −76 | −280 |
| Т- | −70 | −70 | −200 |
| Г– | −70 | −70 | — |
| ТА | −70 | −70 | −40 |
| Ya | −99 | −76 | −160 |
| T. | −70 | −70 | −200 |

### 4.3 Reproducibility

The committed fonts, licences and `fonts.css` come from the Task 0 build. A fresh rebuild from the pinned sources for this report matched every one of them byte for byte (`cmp`). A build takes about 4 s.

### 4.4 In Chrome

These checks ran in Chrome 157 on Windows 11, on the shipped files served locally. The specimens are scratch files and not committed.

- **Bulgarian forms.** One specimen set the same letters with `lang="bg"` and with `lang="ru"`. The letters with BGR forms switch: д takes the g-like shape and т the m-like one. The letters in the "draw the default glyph" row render alike in both. The default shapes are as described in section 4.1: Cormorant's Δ-topped Д, Λ-shaped Л and л.
- **+ ± −** at 72 px in both faces: see section 6.
- **Fallbacks:** see section 5.3.

### 4.5 Tests

- `src/styles/fonts.test.js` pins:
  - the three woff2 files, and no other woff2 file in `public/fonts`;
  - their total of at most 90 KiB (the test prints the sizes);
  - each face's weights and `font-display: swap`;
  - every fallback family (with italic faces for Display), each with `size-adjust` and the three overrides;
  - the root's text preload, and `DISPLAY_FONT_PRELOADS`.
- `src/components/ui/ElevationMark.test.jsx` pins the кота in `font-text` (section 6).

## 5. Fallback metrics

### 5.1 Method

- **`size-adjust`** is the web face's average advance over a Bulgarian letter-and-space sample, divided by the fallback's.
  - The sample is the letter frequencies of 23,963 characters of the site's deduplicated Cyrillic prose (`BG_COUNTS` in `build-fonts.py`).
  - It uses the Bulgarian forms the web face renders under `lang="bg"`. None of the fallbacks has BGR forms.
- **The overrides** are the web face's vertical metrics divided by `size-adjust`. Both faces use their typo metrics:
  - Cormorant: ascent 924, descent 287, line gap 0, per 1000;
  - Manrope: 2132, 600 and 0, per 2000.
- **One face per weight band**, tuned at the weight its roles use most.
- **Where the fallbacks come from.** The Windows faces are read from `C:/Windows/Fonts` on the build machine: Georgia 5.59, Times New Roman 7.12, Segoe UI 5.71 and Arial 7.06. Noto Serif (2.015, italic 2.013) and Roboto (3.015) come from their pinned masters, at the default instance (Regular).
- **Helvetica Neue is skipped**, because no Cyrillic advance data for it is available or published. Arial ships on macOS and iOS, so its face covers Apple devices.

### 5.2 Values

These are the values in `fonts.css`. The stacks in `src/index.css` and `tailwind.config.js` try Georgia, Times and Noto for Display, and Segoe, Arial and Roboto for Text, in that order. The averages are in em over the sample.

**KSM Display, upright.** The web average is 0.47719 at 500 and 0.48072 at 600.

| Fallback (average) | Weights | Tuned at | size-adjust | ascent | descent | line gap |
|---|---|---|---:|---:|---:|---:|
| Georgia (0.52383) | 500–549 | 500: h1, h2, h3, titles | 91.10% | 101.43% | 31.51% | 0% |
| | 550–600 | 600: counts | 91.77% | 100.69% | 31.27% | 0% |
| Times New Roman (0.47649) | 500–549 | 500 | 100.15% | 92.26% | 28.66% | 0% |
| | 550–600 | 600 | 100.89% | 91.59% | 28.45% | 0% |
| Noto Serif (0.56874) | 500–549 | 500 | 83.90% | 110.13% | 34.21% | 0% |
| | 550–600 | 600 | 84.52% | 109.32% | 33.95% | 0% |

**KSM Display italic, 500.** The web average is 0.43579.

| Fallback (average) | Weights | size-adjust | ascent | descent | line gap |
|---|---|---:|---:|---:|---:|
| Georgia Italic (0.55294) | 500 | 78.81% | 117.24% | 36.41% | 0% |
| Times New Roman Italic (0.49230) | 500 | 88.52% | 104.38% | 32.42% | 0% |
| Noto Serif Italic (0.56942) | 500 | 76.53% | 120.73% | 37.50% | 0% |

**KSM Text.** The web average is 0.56142 at 400 and 0.57056 at 500.

| Fallback (average) | Weights | Tuned at | size-adjust | ascent | descent | line gap |
|---|---|---|---:|---:|---:|---:|
| Segoe UI (0.51621) | 400–449 | 400: body, small | 108.76% | 98.01% | 27.58% | 0% |
| | 450–600 | 500: labels, buttons (and ids at 600) | 110.53% | 96.44% | 27.14% | 0% |
| Arial (0.52515) | 400–449 | 400 | 106.91% | 99.71% | 28.06% | 0% |
| | 450–600 | 500 | 108.65% | 98.11% | 27.61% | 0% |
| Roboto (0.53221) | 400–449 | 400 | 105.49% | 101.05% | 28.44% | 0% |
| | 450–600 | 500 | 107.21% | 99.43% | 27.98% | 0% |

### 5.3 Checked in Chrome

Each fallback face was compared with its web face and with the plain local font.

- **Widths** are of single lines, as a ratio to the web face.
- **Heights** are of the `line-height: normal` box, in px; the ascent and descent overrides set it.
- **Not measured:** Noto Serif and Roboto aren't installed on Windows, so their faces failed to load, as expected, and only the Georgia, Times New Roman, Segoe UI and Arial faces were measured.

| Sample | Fallback | Width, adjusted face | Width, plain font | Height: web / adjusted / plain |
|---|---|---:|---:|---|
| Display 500 at 98 px (the Home H1's largest size) | Georgia | 0.979 | 1.075 | 119 / 119 / 111 |
| | Times | 0.973 | 0.971 | 119 / 119 / 112 |
| „Golden Residence“, Display 500 at 148 px (the GR H1's largest) | Georgia | 1.021 | 1.120 | 179 / 179 / 168 |
| | Times | 1.032 | 1.031 | 179 / 179 / 170 |
| h2, Display 500 at 76 px | Georgia | 1.013 | 1.112 | 92 / 92 / 87 |
| | Times | 1.003 | 1.002 | 92 / 92 / 87 |
| h3, Display 500 at 44 px | Georgia | 1.005 | 1.103 | 54 / 54 / 50 |
| | Times | 0.983 | 0.981 | 54 / 54 / 51 |
| Count, Display 600 at 60 px | Georgia | 1.045 | 1.307 | 72 / 72 / 68 |
| | Times | 1.061 | 1.071 | 72 / 72 / 69 |
| `em`, italic 500 at 76 px | Georgia | 1.013 | 1.286 | 92 / 92 / 87 |
| | Times | 1.003 | 1.134 | 92 / 92 / 87 |
| Lead, Text 400 at 18 px | Segoe UI | 1.044 | 0.960 | 24 / 24 / 24 |
| | Arial | 1.039 | 0.972 | 24 / 24 / 21 |
| Label, Text 500 at 13 px | Segoe UI | 0.960 | 0.892 | 18 / 18 / 17 |
| | Arial | 0.973 | 0.895 | 18 / 18 / 15 |
| Button, Text 500 at 14 px | Segoe UI | 1.007 | 0.940 | 19 / 19 / 19 |
| | Arial | 0.982 | 0.904 | 19 / 19 / 16 |

- **Heights.** The adjusted faces match the web faces' line boxes to the pixel in every sample, so lines don't move vertically when the web face swaps in.
- **Widths.** Widths land within 0.96–1.06 of the web face; the plain fonts land within 0.89–1.31. Times New Roman is already about as wide as Cormorant (`size-adjust` 100.15%), so its face mostly corrects the line box.
- **Wrapping.** A 600 px paragraph of the EU body copy (Text 400, 16 px) wraps to 4 lines in the web face, in both adjusted faces and in both plain fonts.

## 6. Setting notes and known limits

- **+ ± − are light in the display face.** Cormorant draws these signs as monoline strokes about half to three fifths as heavy as its figures' stems; Manrope's are close to its figures. The table gives stroke widths in font units, measured with scan lines through each stroke of the shipped files:

  | Face (units per em) | +, −, ± strokes | Stem of the 1 | Sides of the 0 | Signs ÷ the 1's stem |
  |---|---|---:|---:|---:|
  | KSM Display 500 (1000) | 43 (the ±'s lower bar 38) | 72 | 85 | 0.53–0.60 |
  | KSM Display 600 (1000) | 46–47 (the ±'s lower bar 40) | 88 | 101 | 0.45–0.53 |
  | KSM Display italic 500 (1000) | 41–42 (the ±'s lower bar 38) | 66 | 77–79 | 0.58–0.64 |
  | KSM Text 400 (2000) | 126 | 149 | 149 | 0.85 |
  | KSM Text 500 (2000) | 147 | 181 | 181–182 | 0.81 |
  | KSM Text 600 (2000) | 168 | 214 | 214 | 0.79 |

  - At 72 px in Chrome the difference is plain to see. Cormorant sets „+3,06“, „±0,00“ and „−3,00“ with thin signs beside heavy figures, while Manrope's signs match its figures.
  - So the кота (`src/components/ui/ElevationMark.jsx`) is always set in KSM Text, whatever the face of its row, and `ElevationMark.test.jsx` pins this. Set any other signed value the same way.
- **One scale factor per band can't fit every string.** Single lines land within 0.96–1.06 of the web width (section 5.3). Counts run widest: 1.045 in Georgia and 1.061 in Times. Georgia's default figures are old-style, so until the web face loads a count in Georgia shows old-style figures.
- **Android and Safari are unchecked.** The Noto Serif and Roboto faces carry numbers measured from the masters; no Android device has checked them. Safari wasn't available.
- **Glyphs in neither font.**
  - ▲ ▼ ▽, the arrows and ✕ are drawn as SVG (spec §3.3).
  - U+201B, and Manrope's seven missing code points, come from the next font in the stack.
- **Weights and italics.**
  - Cormorant is used at 500, and at 600 for counts. Manrope is used at 400 for body, 500 for labels and buttons, and 600 for ids and strong text (spec §3.1).
  - The italic is static 500, and `font-synthesis: none` (`src/index.css`) stops faux bold and faux italic, so an italic at another weight renders at 500.
  - Italic is used only from 28 px up (spec §3.3).
- **`lang="bg"`** (`src/root.jsx`) is what selects the Bulgarian forms. Without it, the Russian defaults render.

## 7. Preloads

- The root's `links()` (`src/root.jsx`) preloads `/fonts/ksm-text.woff2`, the shell's face.
- `DISPLAY_FONT_PRELOADS` (`src/utils/fontLinks.js`) holds both display files, with `as: 'font'`, `type: 'font/woff2'` and `crossOrigin: 'anonymous'`.
  - Home, the Golden Residence page and the block routes add it to their own `links` as each is rebuilt (spec §3.1).
  - No route uses it yet. An unused preload is a console warning.

## 8. Rebuilding

```sh
python -I -X utf8 scripts/fonts/build-fonts.py --pylib <dir> --fetch --src <sources dir> --out <output dir> [--copy src]
```

- **`--pylib`** is a folder holding fontTools 4.68 and brotli, for example from `pip install --target <dir> fonttools==4.68.0 brotli`.
- **`--src`** is where the masters are kept or, with `--fetch`, downloaded. The default, `scripts/fonts/src`, isn't git-ignored, so keep the sources outside the repository.
- **`--out`** defaults to `scripts/fonts/dist`, which is git-ignored. It receives:
  - the three woff2 files;
  - `fonts.css`, and `fonts.preview.css` (relative URLs, for local specimens);
  - `font-report.json`;
  - the two OFL texts;
  - `work/`, unshipped copies with glyph names.
- **`--copy <dirs>`** adds the site-copy coverage list to the report. It never changes the fonts.
- **`--experiment`** prints each optional feature's byte cost (section 3) and writes no fonts.
- **Install.** Copy the three woff2 files and the two OFL texts into `public/fonts/`, and `fonts.css` into `src/styles/fonts.css`. Then run `npx vitest run src/styles/fonts.test.js`.
- **If the three files ever exceed 90 KiB**, narrow the coverage to the characters the copy uses (spec §3.1). Never raise the budget.
