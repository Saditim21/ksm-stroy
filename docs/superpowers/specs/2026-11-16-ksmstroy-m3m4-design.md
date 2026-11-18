# ksmstroy.com v2: M3/M4 design spec (every remaining page)

- **Date:** 2026-11-16.
- **Status:** binding for M3 (Многофамилна, its explorer and its block pages) and M4 (Продажби, Обекти, За нас, Контакти, ЕС проект, 404, the legacy removal, the budget pass and the leftovers).
- **Branch:** `redesign-v2` in `C:/ksm-stroy/ksm-stroy-v2` (M2 done at `01eac18`).
- **Builds on the Diptych spec** (`docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md`, "Diptych"). It stays binding for the system: tokens, type, the seam, motion, the doors, the shell, the explorer's behaviour, accessibility, inquiries and budgets. This spec adds the remaining pages and changes Diptych only where it says so.
- **Replaces:**
  - in the v2 spec (`2026-11-13-ksmstroy-redesign-v2-design.md`): §8.3 Продажби, §8.5 Многофамилна, §8.7 Обекти, §8.8 За нас, §8.9 Контакти, §8.10 the EU page, and the M3/M4 lines of §13;
  - in Diptych: the M3 and M4 bullets of §13.
- **Visual reference:** the approved concepts in `C:/ksm-stroy/design/2026-11-16-m3m4-concepts/`: one HTML file per page, with `css/<page>.css`, `js/<page>.js`, `img/<page>/`, and captures in `shots/` (`sheet-all.png`, `sheet-moments.png`).
  - The designers' notes, with every production source by file:line, are in `docs/superpowers/notes/2026-11-16-m3m4-concepts.md` (the "concept notes").
  - Where this spec is silent on a visual detail, match the concept's CSS and JS. Where it differs from a concept, this spec wins.
  - Port behaviour and values, never markup. The shell (header with its EU row, menu, footer, doors) comes from `src/shell` as built. Never port the concepts' `html.in` gate, `.nb` spans, `outline: none`, vh or svh units, an `overflow: hidden` that clips a focus ring, or keyframe names that clash with Tailwind's (Diptych rulings C4.2 and F9; use `--screen-h`).
- **Codebase map:** `docs/superpowers/notes/2026-11-16-m3m4-platform-map.md` (six read-only readers at `01eac18`). It gives file:line for everything this spec names and lists the traps. Line numbers drift; read the current file.
- **Open client questions:** `C:/ksm-stroy/design/2026-11-16-m3m4-concepts/QUESTIONS.md`. Every question has a default, and the build uses it until the client answers (§2).

## 1. Intent and the user's decisions

The user pitched KSM a complete redesign: insanely smooth, fast, built from the content as it is, focused on Golden Residence, presenting KSM as a company, and bringing in more inquiries. M2 rebuilt Home, the Golden Residence page and its explorer. M3 and M4 rebuild every page that is still legacy, in the same system, and then remove the legacy code so that every route meets the budgets.

The user's decisions are binding:
1. **The eight page concepts are approved as shown** (2026-11-16: "approve, start it"): Многофамилна and its block page, Продажби, Обекти, Контакти, За нас, ЕС проект and 404.
2. **Nothing goes live until everything is done** (2026-11-16: "the project goes live only when every page and everything else is fully done"). `main` is merged only after M3, M4 and the launch steps (§12).
3. **Многофамилна is still selling** (2026-11-13). Its counts stay labelled „по данни към 01.12.2025“ until its sheets are published.
4. **Golden Residence inquiries go to KSM** (A1, 2026-11-14). Every form sends through the existing inquiry service to `/api/odoo-lead`. A teammate owns `api/odoo-lead.js`, and it is never modified.
5. **Copy comes from production** (Diptych §1.8). The few new lines the designs needed are listed in the concept notes and QUESTIONS.md, and are used as written.
6. **The client's open questions take their defaults** (§2) until KSM answers.

## 2. Content defaults until the client answers

- **Многофамилна's floors** follow the data:
  - apartments on floors 2 to 10 in both blocks, 8 a floor, 72 a block, 144 in all;
  - floor 10 is labelled „тавански етаж“;
  - floors are numbered 2 to 10 and apartments keep the data's ids, so А-101 is on floor 2.
  - Production's „Блок А – 10 етажа, Блок Б – 9 етажа“ is shown nowhere. It is cut from production's description and features wherever they appear: #sgradata, and Продажби's За проекта and Особености rows.
- **Многофамилна's availability** is the built-in snapshot dated 01.12.2025: 16 free, 6 reserved, 122 sold. Every count, lit floor and status carries the date.
- **Многофамилна's garages** stay hidden (owner decision, v1). The garages drawing is in the gallery.
- **Многофамилна's price:** none is shown (production says „По запитване“, and the data has no Цена). A Цена row appears only if a live sheet gains one.
- **Многофамилна's Идеални части** are empty, so the row is hidden.
- **Многофамилна's own apartment plans** are offered wherever `src/constants/apartmentImages.js` maps a real apartment. Two ids are left out because those apartments don't exist: А-858 and А-864. The photo fallback in `getApartmentImage` is never used.
- **Working hours:** `SITE.hours` (Пн–Пт 8:00–18:00, Сб 9:00–14:00, Нд почивен ден). The legacy „Пон-Пет: 9:00 - 18:00“ leaves with the legacy pages.
- **Контакти's live open or closed line** is not built.
- **Money:** лв, as production has it. The only лв amounts are Контакти's budget ranges.
- **Golden Residence's description:** production's text without its stale last sentence „Очаквайте скоро отваряне за продажба.“ Its types come from the sheets (двустайни, тристайни, ателиета), never „1-стайни до 4-стайни“.
- **The years of the works** on Обекти: only Green Life's 2018, as Home shows.
- **Years on Продажби:** „Жилищна сграда, 2024“ under Многофамилна and „Жилищна сграда, 2025“ under Golden Residence (properties.js).
- **„Саниране 2017“** keeps the legacy type „Санитарно обновяване“.
- **За нас:**
  - the client's own text in `src/assets/for-us/content.txt` is shown, with the spelling fixes QUESTIONS.md lists;
  - the legacy figures (15+ години опит, 200+ завършени проекта, 50+ доволни клиенти, 100 % качество и гаранция) are plain text that never counts up.
- **404:** Golden Residence's real typical floor (блок А), with one apartment cut out.
- **Contacts:**
  - both phones are company numbers, +359 887 886 166 first;
  - the email stays ksm_str@abv.bg;
  - the consent line is the built form's;
  - there is no embedded map.

## 3. Approaches considered

**Многофамилна's explorer**
- **A. Chosen: one explorer with a per-project config.** The M2 engine reads a project object instead of Golden Residence's constants, so both buildings get every M2 fix and every future one. Its cost is a careful generalisation under Golden Residence's 90 B of budget headroom, which §10 solves by freeing bytes first.
- **B. A fork of the explorer for Многофамилна.** This was rejected. Two copies would drift apart, and the shared chunks would carry both.
- **C. Restyling the legacy MN pages.** This was rejected. They don't read the availability store, they have click-only floor divs, and the user approved the concept's explorer.

**The other pages**
- **Chosen: route modules built from the system's components**, with the concept's values ported into each page's own CSS.
- **Rejected: embedding the concept HTML and JS.** It would duplicate the shell, break the hydration rules (prerendered final state, no browser-only markup), and blow the budgets.

**The plans**
- M3 and M4 are planned and executed one after the other. Each has its own plan, its own final review and its own preview hand-off.
- M4's plan is written after M3 lands, so it plans against the code M3 leaves.

## 4. Shared rules and pieces (M3 and M4)

### 4.1 Type and layout

- **Page titles use the system's two title sizes only.**
  - `--fs-slogan`, Home's H1, is for the H1s that read across the seam: Многофамилна, Контакти, За нас, ЕС проект and 404.
  - `--fs-title`, the Golden Residence H1, is for the big single-word titles: Продажби and Обекти.
  - One exception (ruling T5a, M4 Task 5, amended at the end of M4): above 900 px, За нас's H1 takes the approved concept's `clamp(40px, 4.3vw, 72px)`, so „в КСМ Строй ООД“ stays on one line and the founding caption stays in the first screen. Below 900 px it keeps `--fs-slogan`'s phone sizes. The H1 is part of the lineage figure's composition, which the user approved by eye.
  - Block pages use Golden Residence's block-page head (`.bp`).
  - A heading never outsizes its section's h2. For example, За нас's value words are smaller than „Какво ни прави различни“.
- **No text sits in the page gutter** at 1440, 1024, 390, 360 or 320 px, the hinge's lead included (the critic's hinge fix). No page scrolls sideways.
- **Halves stack on phones,** with the image first unless the concept says otherwise. The seam hides, and the second half takes the brass rule. Each component writes its own stacking rule.

### 4.2 Motion

- **The first viewport is CSS only:**
  - masks are authored by hand in markup;
  - keyframes run under `:root.js`, inside `prefers-reduced-motion: no-preference`, with `animation-delay: var(--arrive)`;
  - starting states live only in the keyframes.

  `data-split` and `useMotion` are never used above the fold (Diptych §5.5, `src/test/css.js`).
- **New reveals live in a module of their own,** imported only by the pages that use them: a picture opening from the seam (the concepts' `data-wipe`) and a horizontal draw. `useReveals`, which ships on Home and Golden Residence, does not grow.
- **Flip is reached only through `loadFlip`** (lazy). GSAP is imported only inside `src/motion`.
- **Each page has one signature moment,** as the concept notes name it. Everything else is the system's reveals.

### 4.3 Photos

- **Archive photos on Обекти and За нас take one CSS grade:** `saturate(.5) sepia(.2) brightness(.74) contrast(1.08)`.
- **The Обекти book shows its photos in true colour.**
- **Every photo goes through the image pipeline** (`scripts/images/sources.json`, `npm run images`) with kebab-case ids (ruling F7). No source photo gets two pipeline entries; reuse the existing entry.

### 4.4 Components extracted for reuse

Each extracted piece moves its CSS into a stylesheet that only the routes using it load. Its output on Home and Golden Residence must not change, and their first-load bytes must not grow (§10).
- **Ways:** the closing pair of ways, from Home's teaser. Used on Контакти, Обекти and Продажби.
- **Gallery spreads:** Golden Residence's `GallerySection` gets props for its spreads, heading and ids. Used on Многофамилна.
- **Block grid:** `BlockGrid` is sized from the project: floors, units a floor, unit labels and the floor's unit number. Used on Многофамилна and Продажби. Golden Residence keeps 12 × 8. Its roving tab stop is clamped (F22).
- **The inquiry form and section:** page variants (§8).
- **Hours:** one structured source in `src/config/site.js`. The footer, the menu, the inquiry half, Контакти's long form, the SEO description and the JSON-LD all derive from it. The tests that pin the hours move with it.

### 4.5 Copy and accessibility

- **Diptych's copy rules apply:**
  - quotes „…“ and a spaced en dash for ranges;
  - U+00A0 after one-letter words and after „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“;
  - addresses go through `bindAddress`, counts through `plural`, areas through `formatArea`.

  Pins write U+00A0 as its escape.
- **Diptych §11 applies to every page:**
  - the 2 px ivory ring;
  - 44 px targets;
  - real dialogs;
  - a full keyboard path;
  - text spacing holding at 320–360 px;
  - Lighthouse a11y ≥ 98.

## 5. Data

1. **Многофамилна's snapshot.**
   - A script in `scripts/` generates a compact module from `src/constants/mnogofamilnaFallbackData.js` (target ≤ 3 KB gzip). A test checks it against the source.
   - The Многофамилна routes and Продажби import it statically. Their prerendered HTML shows its real numbers with the date, never „—“ and never zeros.
   - When the store holds live Многофамилна rows (origin 'live'), the model uses them and drops the date.
2. **Golden Residence** works as in M2: „—“ in the prerender, live at hydration, and the built-in fallback labelled as such.
3. **Dated is not stale.**
   - The date label is not the stale notice.
   - The single `StaleNotice` (F15) takes the page's project. It shows only when that project's live read failed and older rows are shown.
   - Многофамилна's dated snapshot shows the date label and no notice. The smoke's `.stale` check holds on every page.
4. **Многофамилна facts** are derived from the snapshot: blocks, floors 2–10, units a floor, totals, types (72 двустайни, 72 тристайни) and the area range. Продажби and #sgradata use them.
5. **Works data.**
   - One module in Обекти's chunk holds the seven works: name, place, type, year (shown for Green Life only), status (finished or rough), description, features and the ordered photo ids. The photo order follows `Blog.jsx`'s `images` arrays.
   - Home keeps its own six; `works.test.jsx` pins them.
6. **Unit ids are labels in URLs and callbacks** (F10): Golden Residence „А 501“, Многофамилна „А-101“. Parsing validates a label against the project's units. Latin A/B are read as Cyrillic.

## 6. M3: Многофамилна

### 6.1 Route and head

- `/projects/mnogofamilna-sgrada` gets a v2 route module, replacing `MnogofamilnaBlockSelection.jsx`.
- Handle: `{ header: 'solid', project: 'mnogofamilna-sgrada', inquiry: true }`.
- Meta: production's title „Многофамилна жилищна сграда - KSM Stroy“ and its description.
- It preloads through `preloadWithDocument` only what it uses at load.

### 6.2 Composition (concept `mnogofamilna.html`)

1. **#explorer, the opening, is the explorer itself.**
   - The H1 „Многофамилна | жилищна *сграда*“ reads across the seam, under hand-written masks.
   - Under it:
     - the address „УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София“;
     - the facts pair „144 апартамента в 2 блока“ | „16 свободни по данни към 01.12.2025“;
     - the actions „Запитване“ (solid; presets Многофамилна and glides to #zapitvane) and „По критерии“ (glides to #spisak).
   - Then the night facade with „Блок А“ and „Блок Б“, a rail on each outer edge, and the lights (§6.3).
   - Then the caption „Светят етажите със свободни апартаменти, по данни към 01.12.2025. …“, with the concept's desktop and phone variants.
2. **#blokove „Два блока, по 72 апартамента“.**
   - The lead uses production's „Изберете блок за преглед“.
   - Two block grids, 8 squares a floor, floors 10 down to 2, labelled „А-101“.
   - The legend with counts, the types line, and „Преглед на блока“ to each block page.
3. **#spisak „Всички 144 апартамента“: the По критерии list as a section of its own.**
   - Filters: Блок, Етаж 2–10, Вид (no Ателие), Площ, Изложение and Статус. Sorting.
   - The live meta „144 от 144 · 16 свободни“.
   - The heading and lead are in the HTML. The list itself loads lazily as the section nears, without shifting visible content.
   - `?view=list` scrolls to #spisak.
4. **#sgradata, a split.**
   - Left: the street perspective (photo-2, graded to the night palette).
   - Right:
     - H2 „С магазини и подземни *гаражи*“;
     - production's description;
     - the УПИ address;
     - the facts 2 / 9 / 144 / 8, with the area range and the types (§5.4).
5. **#galeriya „Галерия със *снимки*“: the spreads.**
   - Блок А with Блок Б (photo-3, photo-4).
   - The front with the perspective (photo-1, photo-2).
   - The two drawings (the floor plan and the garages), whole on umber and never cropped, under production's titles.
6. **#kontakti, the inquiry diptych, in a Многофамилна variant.**
   - „Свържете се с *нас*“ and the lead „Обадете се или изпратете запитване и ще се свържем с вас.“
   - The phones, the email and the hours.
   - The form, with Многофамилна first and preselected.
   - Apartments picked in the explorer show as chips.
7. **The dialogs:** the plan stage and the unit panel (§6.4).

### 6.3 The facade and its lights

- **Geometry** (concept `js/mnogofamilna.js:257-266, 403-409`), in the building map's grid of 1200 × 848:
  - the render without its margins sits at y 56.2, 1200 × 732.5;
  - the seam is at x 609.5;
  - the rails are at x 72 and 1142;
  - the light bands run across x 70–516 (А) and 700–1146 (Б).
  - **Crops:**
    - desktop 0 / 150 / 1200 × 480;
    - phone, А −36 / 208 / 652 × 412 and Б 600 / 208 / 652 × 412;
    - block page, А 0 / 196 / 600 × 436 and Б 610 / 196 / 600 × 436.
  - The edge fades on the crops follow the concept (`:438-452`).
  - The geometry lives in Многофамилна's own stylesheet, as CSS variables on the facade root.
- **Two renders, pixel-aligned:**
  - the lit render is the source of Home's `mn-dusk`;
  - its lights-off twin is derived from that same file by a repo script. The script finds the warm, bright window pixels inside the building (about 6 % of the facade) and repaints them in the unlit-glass tone sampled from the image.
  - The twin is checked by eye: lamp glow and the courtyard gap must not read as lit windows. The implementer saves comparison captures of the lit render, the twin and the page at 1440 and 390 for the user, and the task's preview line says where to see it.
  - Both renders go through the pipeline with the same crop and widths. This amends the v2 spec's "from the 3308 px master" (§8.5, §11.2), so that the grade and alignment match by construction.
- **The prerendered HTML** shows the dark twin, with the lit render through the bands of every floor that has at least one free unit, in both blocks, per the model the page prerenders with (§5.1).
  - Sources come from `srcset` and `sizes`. No source is swapped in JS by width, and no markup depends on `matchMedia`.
  - A stack of per-floor strips holding the lit picture is the default technique.
- **Arrival:**
  - the lit floors switch on once, bottom to top, both blocks of a floor together, 0.55 s each, 0.11 s apart;
  - it is CSS under `:root.js`;
  - under reduced motion or without JS they are simply lit.

  This is the page's one signature moment.
- **Hover, focus and the panel** work as in M2:
  - the floor tints in its status colour and the rest dims;
  - the dashed lens marks the keyboard floor;
  - the edge panel slides from that block's edge with the floor's plan, the counts, the range line or „Разпродаден етаж“, and „Отворете плана“.

  The lens covers the block's band.
- **Phones:**
  - the switch Блок А / Блок Б, with one crop per block;
  - the first tap shows the sheet and the second opens the plan.
  - The sheet stays open while the page scrolls (M2's binding ruling). The concept's close-on-leave is not built.
- **The facade's alt text** is „Фасада на Многофамилна жилищна сграда“.

### 6.4 One explorer, two projects

**What the project config holds** (one object per project):
- id and name, and the inquiry option ('golden-residence' or 'mnogofamilna');
- blocks, the floor range, units a floor and a block, and the totals;
- `unitFloor` and the unit label (Golden Residence „А 501“, Многофамилна „А-101“);
- the floor meta (Многофамилна's floor 10 is „тавански етаж“);
- the facade: its images, its building map and the class that holds its CSS geometry;
- the plan drawing and its opacity (Многофамилна: the dark line-art plan, .42 and .55);
- lazy loaders for the floor plans and the own-plan mapping;
- the date label, or none;
- copy (the facade's alt text, the list's type options and footnote) and the inquiry preset.

**Rules:**
- **Golden Residence's behaviour and output are unchanged.** Its tests stay green, and its first-load bytes do not grow (§10). Each project's maps, images, snapshot and CSS enter only its own routes' chunks.
- **Plan labels show the apartment's number:** А-101 shows „101“ on floor 2. The unit panel's title splits on the space or the dash: „А-*101*“.
- **`?floor=` accepts only the project's floors.**
  - Многофамилна: 2 to 10. „Б-5“, „B-5“ and, on a block page, a bare „7“ open the floor; „1“ and „11“ open nothing.
  - Steppers and arrow keys stop at the project's ends.
  - `?unit=` opens a known label and ignores anything else.
- **The unit panel on Многофамилна:**
  - no Идеални части row while it is empty;
  - the switch „План на етажа / План на апартамента“ when the apartment has its own plan. The own plan is shown whole on a light plate, and the caption changes with it;
  - the date line „по данни към 01.12.2025“;
  - actions by status, as on Golden Residence. The inquiry presets Многофамилна with the unit as a pick.
- **The plan stage on Многофамилна:** the status legend, the meta „… · по данни към 01.12.2025“, and „тавански етаж“ on floor 10.
- **Focus returns and the deep-link landing fit Многофамилна's layout.**
  - Focus goes back to the rail, the list row or the block page's row it came from (C7.2, C8.1).
  - The EU-row hold (T7a) works as on Golden Residence.
  - FR9's retry is added once the bytes allow (§11).

### 6.5 Block pages `/projects/mnogofamilna-sgrada/block-a` and `block-b`

The concept is `mnogofamilna-block-a.html`. One template serves both blocks, with Б mirrored: its facade stands on the right.

- **Handle:** `{ header: 'solid', project: 'mnogofamilna-sgrada', inquiry: true }`.
- **Meta:** „Многофамилна сграда, блок А - KSM Stroy“, with production's description pattern.
- **The head is a hinge.**
  - Left: the back link „Към Многофамилна сграда“ and the H1 „Многофамилна сграда, блок *А*“.
  - Right: „72 апартамента · 9 етажа (2–10) · 8 на етаж“, the count legend and the date.
- **Then a split.**
  - One half holds the block's facade: its block crop, one rail and its lights. It stays pinned while the page scrolls.
  - The other half runs the floors from 10 down to 2. Each row holds:
    - the large serif floor number;
    - the count chips;
    - the floor's plan in status colours (a mini plan);
    - the range line or „Разпродаден етаж“;
    - „Отворете плана“.
- **Behaviour:**
  - pointing at or focusing a row lights its floor on the facade and draws a brass rule on the row's seam side;
  - on a desktop, the row at the middle of the screen does the same as the page scrolls;
  - a unit, or „Отворете плана“, opens the same stage and unit panel, growing from the row's plan;
  - a bare `?floor=7` opens floor 7 of this block.
- **The foot:** the Многофамилна inquiry section (#kontakti, #zapitvane), as Golden Residence's block page ends with its own.
- **Phones:** the facade comes first and is not pinned. The rows follow.

### 6.6 Around the site

- **Home's Многофамилна half** gets the Golden Residence half's action, „Изберете апартамент“, pointing to `/projects/mnogofamilna-sgrada`. The dated count stays. The link uses the doors; Golden Residence's hero move is not copied.
- **Removed in M3:**
  - `MnogofamilnaBlockSelection.jsx`, `MnogofamilnaSingleBlock.jsx` and their legacy test rows;
  - `routes.test.jsx`'s 'БЛОК B' case, which becomes the new page's text.
- **Kept until Продажби is rebuilt in M4:** `FourTowersFloorMap.jsx`, `buildingImages.js` and `apartmentImages.js`, because `Projects.jsx` still imports them. The cleaned own-plan mapping is copied into Многофамилна's config.

## 7. M4 pages

### 7.1 Продажби `/projects` (concept `prodazhbi.html`)

- **Handle:** `{ header: 'solid' }`.
- **#top, the sales board, is the page's moment.**
  - The H1 „Продажби“, production's lead, and the board hint.
  - On the board, Golden Residence stands left of the seam and Многофамилна right. Each block is drawn as its grid of squares: Golden Residence 12 × 8, Многофамилна 8 × 9. Both use one square size and stand on one brass ground line that crosses the seam. Floor numbers sit on each building's outer side.
  - Under each building:
    - its name and address;
    - the free count: „69 свободни от 192 в момента“ (live), or „16 свободни от 144, по данни към 01.12.2025“;
    - „Разгледайте апартаментите“, to the project page;
    - the legend with counts.
  - **Hover or focus** on a square lights its floor and dims the rest. The caption names the floor, its counts, and the apartment with its type, area, exposure and status.
  - **Click or Enter** opens that unit on its project page: `/projects/golden-residence?unit=А 101#explorer` or `/projects/mnogofamilna-sgrada?unit=Б-702`.
  - **Touch:** the first tap previews and the second opens.
  - **Keyboard:** one tab stop per block (T8a, roving).
  - **Before Golden Residence's data arrives,** its squares are neutral at their final size. Многофамилна's come from the snapshot in the HTML.
  - **Opening motion,** CSS only:
    1. the H1 rises;
    2. the seam draws down and the ground line draws across;
    3. the buildings rise floor by floor, each floor spreading out from the seam.

    Under reduced motion it shows the final state.
- **#sgradite, the two buildings row by row.**
  - The renders open from the seam. The rows' labels sit on the seam: Адрес, Блокове и етажи, Апартаменти, Видове, Обща площ, Свободни, Гаражи и паркоместа, За проекта, Особености.
  - Многофамилна's row reads „2 блока, 9 жилищни етажа (2–10)“. Its garages row is production's „Подземни гаражи“, with no counts.
  - Actions: „Разгледайте апартаментите“ (solid) and „Запитване“ (to `/contact?project=…#zapitvane`).
  - On desktop, the two names stay pinned under the header while the rows scroll. Phones get two stacked spec sheets.
- **Closing:** a hinge with „Търсите нов *дом*?“ and production's lead, then the ways: „Попитайте за цени“ (solid, to `/contact#zapitvane`), „Свържете се с нас“ (to `/contact`) and the phone.
- **The contract:** `<main>` shows „Golden Residence“ and „Многофамилна“ as static text.

### 7.2 Обекти `/blog` (concept `obekti.html`)

- **Handle:** `{ header: 'solid' }`. The URL stays `/blog`.
- **#top:**
  - the H1 „Обекти“, hinged on the seam;
  - production's description;
  - a three-way segmented control, „Всички проекти 7 / Завършени проекти 6 / Груб строеж 1“, with short labels below 1240 px.
- **The register: each work is a row across the seam.**
  - Three graded plates: the cover and two smaller ones. The cover is a finished photo where one exists; Panorama keeps its construction photos.
  - The record:
    - the name;
    - the place and type, with the year only for Green Life;
    - the brass „груб строеж“ tag on Panorama;
    - the description;
    - the features, joined by brass dashes;
    - „Разгледайте проекта“ and „N снимки“.
  - The plates open from the seam as each row arrives. Filtering folds rows away and closes the gaps with Flip.
- **The book is the page's moment.**
  - Opening a work flies its plate into a full-screen book (Flip, uniform).
  - The title page is the record: „За проекта“ and „Особености“.
  - The photos come two at a time, hinged on the seam, in true colour, each at or below its own size. Pages turn from the seam.
  - Controls: a thumbnail strip, a counter, ← and →, Home, End, swipe and Escape.
  - It is a real dialog: a portal on `<body>`, `useScrollLock`, `data-lenis-prevent`, `trapTab`, and the page behind inert. Focus goes back to the plate.
  - Phones show one photo at a time. Under reduced motion it opens at once.
  - Its code and Flip load lazily.
- **Closing:** a hinge with „Имате идея за *проект*?“, then the ways:
  - „Свържете се с нас“, with the phone and the email under it;
  - „Поръчайте оферта“, to `/contact?project=stroitelstvo#zapitvane`.
- **The contract:** `<main>` shows „Айвазовски Парк“.

### 7.3 Контакти `/contact` (concept `kontakti.html`)

- **Handle:** `{ header: 'solid', inquiry: true }`.
- **#top, the question | the answer.**
  - Left, on onyx: the H1 „Как можете да се *свържете* с нас“ in three masked lines that end at the seam, with production's intro.
  - Right, on umber:
    - Телефон, with both numbers;
    - Работно време in the long form from the hours source: „Понеделник – петък 8:00–18:00“, „Събота 9:00–14:00“, „Неделя почивен ден“;
    - Имейл;
    - „Изпратете запитване“, which glides to the form.
  - There is no open or closed line (§2).
  - **Load moment:** the seam draws down, the H1 lines rise, and the answer follows down the seam.
- **#zapitvane: one form across both halves.**
  - **Left, sticky:** the subject as a radio group under „Интересувам се от“, set over the chosen subject's picture. The subjects:
    - Golden Residence, with the live meta „69 свободни от 192 · жк Левски Г“;
    - Многофамилна сграда, with its dated meta;
    - Строителство или ремонт: the three service stills as strips;
    - Друго: the KSM mark on umber.

    A new picture opens from the seam (CSS, 1 s). Under reduced motion it changes at once.
  - **Right:** Име, Телефон, Имейл, Съобщение, the consent and „Изпратете запитване“, with the built form's rules, errors and states.
  - **The construction subject adds a group:**
    - „Тип проект“, with production's six options;
    - „Бюджет“, with production's five ranges. Each range is shown typeset („50 000 – 100 000 лв.“), and its production string is the value sent;
    - production's message hint „Опишете подробно вашия проект, изисквания и очаквания.“

    Groups fold open and closed in 0.55 s.
  - **Picks:** Golden Residence's picks show as chips under Golden Residence, and Многофамилна's under Многофамилна (§8).
  - **Prefill,** applied after hydration with no glide:
    - `?project=` takes golden-residence or gr; mnogofamilna-sgrada, mnogofamilna or mn; stroitelstvo, remont or build; drugo or other. Anything else is ignored.
    - `?apartment=` repeats. A value is kept only if it names an existing unit of that project, at most six.
    - Without `?project=`, Golden Residence is chosen.
  - **Landing:** with `?project=`, `?apartment=` or `#zapitvane`, the page lands on #zapitvane after the prefill has rendered. The EU row stays in view until the visitor first scrolls (§8). A send never re-seeds the form.
  - **The thank-you:** the fields hide, the subjects are disabled, and the thank-you takes focus.
- **#ofisi, the two doors.**
  - A hinge: „Нашите *офиси*“ and production's line.
  - Two door panels: „София“ | „Гоце Делчев“ across the seam, with the KSM mark split on it.
  - Each office's full address (through `bindAddress`), and „Отвори в Google Maps“ (`mapsUrl`, a new tab, with an sr-only office name).
  - The mark draws itself when the band enters.
- **Closing:** a hinge with „Готови сте да започнете своя *проект*?“ and production's line, then the ways:
  - „Получете безплатна оферта“: it glides to the form and focuses Име;
  - „Обадете се сега“, a `tel:` link.

### 7.4 За нас `/about` (concept `za-nas.html`)

- **Handle:** `{ header: 'solid' }`.
- **#top, the founding drawn on the seam.**
  - The seam comes down as one line, with „село Буково | строител зидар (дюлгерин)“ either side of it.
  - It opens into a brass lens holding „Кадри“ | „Сухат“, with an italic „и“ inside.
  - It closes again at „септември | 2008“.
  - The figure's caption is the founding sentence, in one element that contains „основана през месец септември 2008“ (the contract).
  - The H1 „Добре *дошли* | в КСМ Строй ООД“ hinges on the seam.
  - **The page draws itself once, in CSS (about 2.4 s):**
    1. the H1 rises and the stem draws;
    2. the lens opens from the top down;
    3. the names unveil outward from the seam;
    4. the „и“ fades in and the date rises.

    Under reduced motion it shows the final state.
  - On phones the lineage stays a vertical figure.
- **#traditsiya, tradition and what the founders promised.**
  - The h2 „*Традиция* и иновации от 2008“ ends at the seam.
  - The founders' principles sentence closes with the motto at h3 size (not a display quote).
  - „Обещани дейности | от учредителите“ across the seam.
  - The pair Екстериор (the Hotel Paradise facade) | Интериор (slider03), each opening from the seam.
  - „ВиК и електродейности | Ремонт в дома и офиса“.
  - The client's closing line, under a short brass stem.
- **#koi-sme-nie:**
  - a hinge „Кои сме *ние*?“ with its two leads;
  - the team sentence, large, on the left;
  - „Квалифицирани специалисти“ as a ruled list on the right.
- **#opit:** two aerial photos meeting on the seam (slider02 and the hotel card's photo). The four legacy figures sit at their foot, two per half, as plain serif text.
- **#cennosti:** a hinge, then three ruled rows read across the seam: Качество, Точност, Иновации. Each word ends at the seam and its sentence starts after it.
- **#uslugi:** the four legacy services on onyx face the five reasons on umber, with brass dashes.
- **#misiya:** „Мисия | и *визия*“ across the seam, the seam running on into the two texts, set in serif.
- **#rabota:**
  - production's heading and lead;
  - „Свържете се с нас“ (solid, to `/contact`) and „Разгледайте проектите“ (outline, to `/blog`);
  - slider01, opening from the seam.
- **Photos** take the grade (§4.3).

### 7.5 ЕС проект `/eu-proekt` (concept `eu-proekt.html`)

- **#top, the seal on the fold.**
  - The co-funding plate sits on the seam: the EU lockup first and larger, then ПКИП.
  - The plate never hides, even during the entrance, so the emblem shows on landing.
  - The H1 „Дигитализация на | предприятията“ has no italic word and ends at the seam. The two paragraphs follow it.
  - On phones the logos stack.
- **#byudzhet, the page's moment.**
  - „Общ бюджет: 35 320,04 евро“ sits above a full-width band.
  - The grant half (umber) and KSM's own half (onyx) meet at a brass seam at 70 % (24 724,03 of 35 320,04).
  - When the band is first seen, the seam travels from 50 % to 70 % in 1.5 s (expo.inOut, a registered `--split`). Under reduced motion or without JS, it rests at 70 %.
  - No percentage is printed. Each budget line stays one run of text.
  - On phones: a 14 px bar with the seam at 70 %, over a list with swatches. The dates line may break between the two dates.
- **#plakat:** „Изтегли плаката (PDF)“ with a ↓ (the only such link) | the disclaimer, across the seam. The poster picture stays on Home.
- **Copy:** the no-break spaces are fixed („е да повиши“).
- **The contracts** in `eu-visibility.test.jsx` are unchanged: the H1's accessible name, each line as one run, and one PDF link.

### 7.6 404 (concept `404.html`)

- **Left, on the plan stage's umber:** Golden Residence's typical floor, блок А.
  - The dark plan at .4, with the explorer's brass unit outlines one screen pixel wide.
  - One apartment (04) is cut out of the drawing and left as a dashed ivory outline.
  - On arrival the outlines draw in sequence, and the missing one appears last (CSS).
  - The drawing is hidden from assistive tech, and no text inside it names a project (`routes.test.jsx`).
- **Right:**
  - the H1 „Тази страница | я няма в чертежа.“, with U+00A0 after „я“ and „в“;
  - its sentence;
  - the three ways back: Начало, Продажби, Контакти.
- **noindex,** as today. On phones the drawing comes first, under a brass rule.
- **Nothing of the drawing reaches another route's first load.** The block routes' NotFound fallback loads lazily or goes, since those routes are one per block.

## 8. Inquiries on every page

- **One form component with page variants:** home, golden-residence, mnogofamilna and contact.
  - The option order is the page's: on Многофамилна, Многофамилна comes first.
  - The contact variant has the radio subjects, the construction group and the prefill.
  - The other variants keep the select and today's fields.
- **Picks carry their project.** A pick shows, and is sent, only while its project's subject is chosen: Golden Residence picks with golden-residence or garage, Многофамилна picks with mnogofamilna. This extends FR4.
- **The send path** is the existing service:
  - EmailJS and `/api/odoo-lead` through `allSettled`, and only EmailJS decides what the visitor sees;
  - „[ТЕСТ] “ outside production;
  - exactly six keys;
  - the short-message top-up.
- **What a lead carries,** with no proxy change:
  - `projectType` is the subject, plus „ – {Тип проект}“ for construction, or „ – {picks}“ for apartments;
  - `budget` is the chosen range's production string, else '' (EmailJS gets „Не е посочен“).
- **The header's „Запитване“:**
  - pages with an inquiry section go to `#zapitvane`: Home, Golden Residence and its blocks, Многофамилна and its blocks, Контакти;
  - every other page goes to `/contact#zapitvane`;
  - a test checks that #zapitvane exists on every `inquiry: true` route (shell minor 7).
- **A landing on a deep link or on #zapitvane keeps the 36 px EU row in view.** One shared hold replaces the explorer's private one. It lets go when the landing's dialogs close (explorer), or on the visitor's first scroll, wheel, touch move or key after 400 ms (Контакти). This generalises T7a.
- **The contact contract.**
  - `tests/contracts/contact-form.test.jsx` moves to the new Контакти form. Its fill path becomes: choose „Строителство или ремонт“, fill Тип проект and Бюджет, tick the consent, and send with „Изпратете запитване“. The expected values include „[ТЕСТ] “.
  - Its success and failure checks follow the new form's own states: the thank-you „Благодарим ви.“ and its failure alert, in place of production's „…изпратено успешно…“ and „грешка“.
  - Its invariants stay: one POST, six keys, no `company`, nothing sent while invalid, success only when EmailJS resolves (even when the CRM fails), failure when EmailJS rejects, and the EmailJS ids with the eight variable names.
  - `routes.test.jsx`'s button lookup becomes „Изпратете запитване“; the „Съобщение“ textbox lookup stays.
- **Never submit a form on a preview.** Tests mock the network, and local checks abort every request that leaves 127.0.0.1.

## 9. The legacy removal (end of M4)

- **Deleted:**
  - the legacy pages and their components: About, Blog, Contact, Projects, the legacy Golden Residence and Многофамилна components, PropertyCard, OptimizedImage, ApartmentDetailsModal, FourTowersFloorMap, GoldenResidenceFloorMap;
  - ApartmentContext;
  - `utils/animations.js`;
  - the constants properties, buildingImages and apartmentImages;
  - the legacy tests;
  - `handle.legacy` with `.legacy-ground` and its plumbing;
  - the legacy Tailwind palettes, fonts, sizes, shadows and animations, and the legacy-only CSS;
  - the unused `seo.js` entries and `calculateStats` / `calculateGarageStats`;
  - framer-motion, swiper and react-hook-form (package.json, the lockfile, `optimizeDeps`);
  - the stale docs (`BRAND_GUIDE_LUXURY.md`, `LUXURY_IMPLEMENTATION_GUIDE.md`, README's ApartmentContext line).
- **Legacy-only public images** go once a search shows no live user: `public/images/golden-residence/building-2-blog-*`, `building-2.png`, `golden-residence.jpg`. These are about 127 MB, copied into every build.
- **Kept:**
  - `mnogofamilnaFallbackData.js`, the snapshot's source;
  - `apartmentFallbackData.js` and `googleSheets.js`;
  - `@emailjs/browser`, `isbot` and `@react-router/node`;
  - `building-2.webp` and its widths;
  - the 14 px root size up to 360 px, a production holdover that M2's 320 px layouts rely on.
- **`scripts/extract-mnogofamilna-data.mjs`** reads `FourTowersFloorMap.jsx`. It is retired with that file, and its output stays.
- **check:dist:** every prerendered route is in MUST_BE_V2, and the legacy WARN branch becomes a failure.

## 10. Budgets and performance

- **Budgets:**
  - every route: at most 160 KiB first-load JS, gzip (check:dist);
  - the motion chunk: at most 60 KiB;
  - Flip: at most 10 KiB, lazy;
  - fonts: at most 90 KB, never raised.
- **Free bytes before adding them** (FR5). Golden Residence has 90 B of headroom, so M3 starts by freeing first-load bytes in the shared chunks and Golden Residence's, and the explorer's generalisation must not grow Golden Residence. The candidates:
  - the inquiry send path loaded on submit;
  - `StorySection`'s own number formatter replaced by `formatDecimal`;
  - the block routes' NotFound fallback;
  - code that only a dialog needs, moved into the surfaces chunk.
- **Per-project code, data, maps and CSS enter only their own routes.** Многофамилна's map, snapshot and lights never ship on Golden Residence, and Golden Residence's never ship on Многофамилна.
- **If a route still cannot fit,** its stage, unit panel and list move into a lazy chunk, preloaded on the first hover or focus (Diptych §12). If that is not enough, the implementer reports it rather than forcing it.
- **Performance is measured as Vercel serves the site:**
  - over HTTP/2, through a local TLS mode of the static server that `npm run perf` uses;
  - with Lighthouse pinned at 13.6.0, mobile defaults, 3 runs and the median.
- **Targets:** LCP ≤ 2.5 s, CLS ≤ 0.02 and TBT ≤ 150 ms on `/`, `/projects/golden-residence`, its block-a, `/projects/mnogofamilna-sgrada`, its block-a, `/projects`, `/blog`, `/about` and `/contact`. Bytes before LCP are reported, not gated.
- **When they bind:**
  - **End of M3:** both Многофамилна routes are measured, and Golden Residence is checked for regressions. The figures are reported, and M3 finishes either way. A miss carries into M4's performance round. M3 therefore builds the HTTP/2 measuring mode, but not the shared-chunk changes, which wait for M4.
  - **End of M4:** the targets are the launch bar. M4's round works through Home's steps below, then the contingencies, on every route that misses:
    - lighter LCP images;
    - fewer pictures above the fold;
    - font subsetting, through a `--subset-from` option in the font pipeline;
    - deferring non-critical CSS.

    CLS and TBT misses are always fixed.
  - **If a route still misses LCP** after that, and closing the gap needs a design change (dropping the lights layer on phones, for example), the user gets the figures and the options and decides. A miss never silently blocks the launch.
- **Home's LCP round (M4)** aims for `/` ≤ 2.5 s on HTTP/2:
  1. the motion engine loads after the LCP paint, not at `load`;
  2. Home's below-the-fold pictures stay out of the window before the paint;
  3. the Многофамилна half's picture gets `fetchpriority="low"`, through a new `ResponsivePicture` option;
  4. the explorer's CSS leaves Home's render-blocking set where it can.
- **Pages that open on an image** (Многофамилна) keep their LCP image within 60 kB on mobile and 200 kB on desktop.

## 11. Leftovers taken in

- **M3, in the explorer:**
  - FR7: the list's table scrolls 21 px at 320 px;
  - FR9: re-opening a floor retries a failed surfaces load, once the bytes allow;
  - F22: the grid's tab stop is clamped;
  - FR8: on ≤ 360 × 640 with text spacing, the stage's side column keeps its height. The fix must not change the layout for anyone else.
- **M4, polish:**
  - FR10: the „Затвори“ strip on landscape phones;
  - FR11: the unit panel's scroll-lock colour;
  - gr minor 3, shell minors 6 and 7, gr minor 4;
  - infra minors 1, 3 and 4;
  - the Task 9 smoke can-wait items, and the duplicate `stubIdle` flushers;
  - the stale Flip note in check-dist.
- **Real og:image files** (1200 × 630, from the pipeline) for the rebuilt pages. Each uses a real photo or render from its own page. The 404 has none.
- **Waits on the client:** FR6, the garage label. The other client items are in QUESTIONS.md.

## 12. Verification and delivery

- **Every rebuilt page gets M2's tests:**
  - prerender (one H1, final state in the HTML, section ids, counts);
  - hydration (console errors fatal, query-string variants included);
  - behaviour (`renderSiteAt` plus `goOffline`);
  - CSS (the first-viewport motion helper);
  - motion.
- **The explorer gets Многофамилна variants:**
  - floors 2–10 ('10' opens; '1' and '11' don't);
  - 8 units a floor and „101“ on floor 2;
  - the тавански meta and the date line;
  - no Идеални row, and the own-plan switch only for mapped ids;
  - the lit bands in the prerendered HTML.
- **Contracts change only where §8 and this list say:**
  - the contact form;
  - the button lookup;
  - the 'БЛОК B' case, and the Многофамилна pages' titles in `src/routes.test.jsx`;
  - the HANDLES rows of the rebuilt routes;
  - the retired legacy rows.

  Every other contract stays.
- **Smoke:**
  - every prerendered path, Многофамилна's deep links (`?floor=Б-5`, `?unit=…`), `/contact?project=…`, `/contact?apartment=…` and `/contact#zapitvane` as landings with the EU row in view;
  - Многофамилна's explorer steps (hover, keyboard, phone, deep link);
  - opening a unit from the Продажби board;
  - the Обекти book, with the keyboard;
  - the 404 cases;
  - the focus-ring and scroll-lock steps, re-pinned to the new pages.
- **`npm run verify` passes before every push.** Vercel runs no tests.
- **Delivery:**
  - two plans, executed in order with subagent-driven development: M3, then M4;
  - each task pushes `redesign-v2` (the user's standing approval for this branch only) and reports, in one line, what the preview now shows and what is still legacy;
  - each plan ends with a whole-branch review, a results note, and screenshots for the user.
- **Launch, as v2 spec §13 says, each outward step on the user's go-ahead:**
  1. the client's review on a public noindex URL. The user sets up a second Vercel project, and it gets the X-Robots-Tag;
  2. the user's device checks;
  3. the Production variables in Vercel (the user);
  4. the test inquiry;
  5. merging `main` in, then merging into `main` as a merge commit;
  6. the 15-minute smoke test on the live site, with Instant Rollback ready.

## 13. Decisions taken in this spec

1. One explorer with a per-project config, not a fork (§3).
2. Многофамилна's snapshot is prerendered as real numbers with its date; live rows replace it once the sheets exist (§5.1).
3. The lights are a dark twin with the lit render shown through the floor bands. The twin is derived from the lit render's own source, which amends the v2 spec's "from the 3308 px master". Sources come from `srcset`, never swapped by JS (§6.3).
4. The phone sheet stays open while scrolling, per M2's ruling, not the Многофамилна concept's close-on-leave (§6.3).
5. Продажби's board has one tab stop per block, as T8a says, not the concept's one per building (§7.1).
6. Picks carry their project, which extends FR4 to Многофамилна (§8).
7. The budget ranges send production's strings and show typeset labels, so the CRM's values don't change (§7.3).
8. `?apartment=` is kept only when it names an existing unit (at most six), so URL text never reaches the CRM unchecked (§7.3).
9. Pages without a form send the header's „Запитване“ to `/contact#zapitvane` (§8).
10. One shared EU-row hold for landings (§8).
11. The photo grade is CSS; the Обекти book shows true colour (§4.3).
12. Performance is measured over HTTP/2 with Lighthouse pinned (§10).
13. Page titles snap to the system's two sizes (§4.1).
14. Контакти's live hours line is dropped (§2).
15. Home keeps its own six works, and Обекти gets the full works module (§5.5).
16. New reveals live in page-only modules, and `useReveals` doesn't grow (§4.2).
17. The 404 drawing never reaches another route's first load (§7.6).
18. M3 covers Многофамилна only. Продажби and Контакти move to M4 with the other pages (the v2 spec had them in M3).
19. The v2 spec's §8.9 Контакти design (a fixed „Запитване за…“ line, a prefilled message, hidden Тип проект and Бюджет, its consent wording) is replaced by §7.3 and §8.
20. The v2 spec's §8.8 За нас opening (the emblem drawing itself, the motto as the page's moment) is replaced by the lineage figure, with the motto closing the founders' sentence (§7.4).
21. Performance is reported at the end of M3 and is the launch bar at the end of M4. A miss that only a design change can close goes to the user (§10). This answers the builder check's one open question.

**Client flags carried:** every QUESTIONS.md item, plus Diptych's (§14): the free-mail address, „над 15 години опит“ against 2008, no Изложение column in block А, one typical plan per floor, the кота on А1 only, and the works' years.
