# ksmstroy.com v2: M4 Remaining Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every page that is still legacy (Контакти, Продажби, Обекти, За нас, the EU page and 404) in the Diptych system, remove the legacy code, and bring every route within its budgets and speed targets. That makes the site ready for the launch steps.

**Architecture:**
- **Pages.** Each page is a route module built from the system's components, with its own stylesheet, ported from its approved concept.
- **Shared pieces first.** A landing hold for the EU row, one hours source, a Ways component, the hinge gutter and the inquiry's link targets are built once, in Task 1.
- **Budget first.** Task 0 frees first-load bytes before anything shared is added. The Многофамилна routes have about 130 B of room today.
- **Removal last.** Task 7 removes the legacy code once its last user is gone.
- **Speed.** Task 8's speed round makes the targets the launch bar (spec §10).

**Tech Stack:** as M3: React 19.3.1, React Router 8.5.1 (framework mode, prerender), Vite 7, Tailwind 3.4, GSAP 3.15.1 (ScrollTrigger, SplitText, Flip), Lenis 1.3.27, Vitest 4, puppeteer-core, sharp, Node 24.x, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-16-ksmstroy-m3m4-design.md` (the "spec": §2, §4, §5, §7, §8, §9, §10, §11, §12 bind M4). Read it before any task.
- The Diptych spec stays binding for the system: `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md`.
- **Codebase map:** `docs/superpowers/notes/2026-11-16-m3m4-platform-map.md`. §2 covers how pages are built, §3 inquiries and Контакти, §4 legacy removal and content sources, §5 budgets. Since it was written, M3 changed the explorer and the inquiry; `docs/superpowers/notes/2026-11-16-m3-results.md` and `git log 8307261..HEAD` say how.
- **Concept notes:** `docs/superpowers/notes/2026-11-16-m3m4-concepts.md` (production sources by file:line, and the designers' notes).
- **Rulings:** every M1/M2 ruling is in `docs/superpowers/notes/2026-11-16-m1-m2-rulings.md`; M3's are in `docs/superpowers/notes/2026-11-17-m3-rulings.md`. A ruling beats a brief.
- `<scratch>` means `C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad`.
- **Visual reference:** `C:/ksm-stroy/design/2026-11-16-m3m4-concepts/` (`kontakti.html`, `prodazhbi.html`, `obekti.html`, `za-nas.html`, `eu-proekt.html`, `404.html`), each with `css/`, `js/` and `shots/`. To see one live, run `node <scratch>/serve-dir.mjs 5194 C:/ksm-stroy/design` and open `http://127.0.0.1:5194/2026-11-16-m3m4-concepts/<page>.html`. Stop the server when done.

## Global Constraints

**Where to work**
- Work only in `C:/ksm-stroy/ksm-stroy-v2`, on branch `redesign-v2`. Never touch `C:/ksm-stroy/ksm-stroy` or `C:/ksm-stroy/golden-residence`.
- Read `C:/ksm-stroy/design/` but never write to the concept folders. Captures for the user go to `C:/ksm-stroy/design/2026-11-17-m4-shots/`; intermediate files go to `<scratch>/m4/`.
- **Memory is tight** (about 2–3 GB free):
  - run the suite as `npx vitest run --maxWorkers=2`;
  - run at most one build, smoke run, server or headless Chrome at a time, and stop each when done;
  - if a process is killed for low memory, say so instead of retrying in a loop;
  - port 3000 belongs to another project.

**Outward actions**
- Never push. The orchestrator pushes `redesign-v2` after each task, after a full verify, with the task's **Preview** line.
- Never modify `api/odoo-lead.js`. Never print `.env` values or the sheet and Odoo URLs.
- Never submit a form on a preview and never POST to `/api/odoo-lead`. Tests mock the network; local browser checks abort every request that leaves 127.0.0.1.

**Commits**
- Conventional messages with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Stage explicit paths. Never stage `.claude/settings.local.json`.
- `npm test`, `npm run build` and `npm run check:dist` pass at every commit.

**Toolchain:** no new runtime dependency. Removing framer-motion, swiper and react-hook-form is part of the plan. Never delete `package-lock.json`. React Router stays at 8.5.1.

**Contract tests**
- `tests/contracts/` stay green at every commit.
- Change them only where a task says so: Task 2 (the contact form, the routes test's button) and Task 7 (the HANDLES rows of the rebuilt routes, if not already done).
- Ruling G1: a change that turns an unlisted test red updates that test to the new behaviour, and the report lists it. Never drop coverage.

**Final state in HTML, and motion** (M1 and Diptych, verbatim)
- Prerendered HTML is the final visual state. Browser-only values never change the first client render.
- Query-string views render after `useHydrated()`.
- Layout chosen by media is chosen by CSS media queries. `var(--screen-h)`, never `vh` or `svh`.
- First-viewport motion is CSS only, under `:root.js`, inside `prefers-reduced-motion: no-preference`, with `var(--arrive)`; starting states live only in keyframes.
- `gsap`, `gsap/*` and `lenis` are imported only inside `src/motion/`. Flip only through `loadFlip`.
- Never `data-split` or `useMotion` above the fold.

**Budgets** (spec §10)
- First-load JS at most 160 KiB gzip on every route.
- After Task 0, every v2 route keeps at least 512 B of that budget free at every commit.
- The motion chunk at most 60 KiB; Flip at most 10 KiB, lazy; fonts at most 90 KB, never raised.
- LCP images at most 60 kB on mobile and 200 kB on desktop.
- Free bytes before adding them (FR5). Each page's code, data, images and CSS reach only its own route.

**Copy rules** (spec §4.5)
- Production copy; the new lines are those the spec and the concept notes quote.
- „…“ quotes; a spaced en dash for ranges.
- U+00A0 after one-letter words and „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“. Pins write it as `\u00A0`.
- Use `bindAddress`, `plural`, `formatArea` and `formatDecimal`.
- Sentence case; no eyebrow labels; one italic `em` per heading.

**Matching the concept.** Where a step says "match", compare at 1440×900 and 390×844 against the concept page and its named capture. Port its values into the page's own CSS, with token variables, `--screen-h`, the system's focus ring and no `outline: none`. The shell comes from `src/shell`, never from the concept HTML. Page titles use `--fs-slogan` or `--fs-title` only (spec §4.1).

**Speed** (spec §10): measure with `MSYS_NO_PATHCONV=1 npm run perf -- <paths>` (HTTP/2, Lighthouse 13.6.0, three runs, median).

## Review Focus

1. **Leads from the new forms.**
   - The construction subject sends `projectType` „Строителство или ремонт – {Тип проект}“ and `budget` set to production's range string. Exactly six keys, „[ТЕСТ] “ outside production, and the short-message top-up.
   - Text from `?apartment=` never reaches the CRM unless it names an existing unit, at most six.

   *Pinned in Task 2 (`buildLead` cases and the rewritten contact contract).*
2. **Контакти's landing.**
   - `?project=`, `?apartment=` and `#zapitvane` land on the form after the prefill has rendered, with the EU row held until the visitor's first move.
   - A send never re-seeds the form, and the thank-you disables the subjects.

   *Pinned in Task 2 (`contact.test.jsx` landing cases; the smoke landings).*
3. **The sales board before and after data.**
   - Golden Residence's squares are neutral at their final size until the store has data. Многофамилна's come from the snapshot in the HTML.
   - A click opens the right unit on its project page, and touch previews first.

   *Pinned in Task 3 (`projects.prerender` and `projects.test` cases; the smoke step).*
4. **The Обекти book as a dialog.**
   - The Tab trap, Escape, focus back to the plate, swipe and the arrow keys.
   - The page behind is inert. Under reduced motion it opens at once.

   *Pinned in Task 4 (`book.test.jsx`; the smoke keyboard step).*
5. **The legacy removal leaves nothing behind.**
   - No module imports a deleted file, and no public image a live page uses is deleted.
   - check:dist fails on any legacy fingerprint, and every route is within budget.

   *Pinned in Task 7 (check:dist's self-test and its MUST_BE_V2 for every route; a test that every `/images/` and `/img/` reference in `src/` resolves to a file).*

---

### Task 0: Room in the budget

The Многофамилна routes are about 130 B under 160 KiB, and every v2 route needs room for M4's shared pieces. This task frees first-load bytes and changes nothing a visitor sees.

**Files:**
- Modify: `vite.config.js` (chunking, if used), `src/pages/mnogofamilna/MnHero.jsx`, `src/pages/mnogofamilna/MnBlockPage.jsx`, `src/explorer/ExplorerSection.jsx`, and whatever the measurements point to.

**Interfaces:**
- Produces: the same modules and exports. Chunking changes only.

- [ ] **Step 1: Record the starting figures.** Run `npm run build && npm run check:dist`. Note each route's exact first-load bytes (check:dist's parser) in the report.
- [ ] **Step 2: Free the Многофамилна routes' dead weight (M3 ruling T6d).**
  - The routes load `ExplorerSection` and `ViewTabs` code they never render, because importing `Dated` from `ExplorerSection.jsx` keeps the explorer's shared chunks whole.
  - Find a chunk arrangement that drops that code from the Многофамилна routes without growing Golden Residence or Home. Candidates:
    - a `manualChunks` group for the explorer's always-together core, so nothing depends on that import to stay whole;
    - `Dated` moved to a small module with the group pinned.
  - Measure each option, and keep the best.
- [ ] **Step 3: Reduce Golden Residence's render-blocking requests.** M3 added three (gr.js, palette.js, Spreads.js and its CSS), and its simulated LCP moved 0.93 → 0.96 s. Merge chunks that always load together where that doesn't add bytes to other routes.
- [ ] **Step 4: Targets.**
  - Every v2 route has at least 2,048 B of room. At M3's end the Многофамилна block pages had 45 B and its main page 119 B.
  - Golden Residence's request count is back to its Task 0 (M3) figure or lower.
  - check:dist's `CAPS` (M3: Golden Residence at 162,682 B) is replaced by a rule every route keeps from here on: at least 512 B of room, which check:dist enforces.

  Report each route's figure, and what you tried that didn't pay.
- [ ] **Step 5: Run** `npx vitest run --maxWorkers=2` (expected: PASS), `npm run build && npm run check:dist` (expected: OK), and `MSYS_NO_PATHCONV=1 npm run perf -- /projects/golden-residence /projects/mnogofamilna-sgrada` (record the figures).
- [ ] **Step 6: Commit,** with the paths you changed.

```bash
git commit -m "perf(budget): room on every v2 route before M4's shared pieces"
```

**Preview:** „No visible change; the pages load less code.“

---

### Task 1: Shared pieces: the landing hold, one hours source, Ways, the hinge gutter, the inquiry's targets

**Files:**
- Create: `src/shell/landingHold.js`, `src/components/ui/Ways.jsx`, `src/components/ui/ways.css`
- Modify:
  - `src/explorer/ExplorerContext.jsx`, which uses the shared hold;
  - `src/config/site.js` and its readers: `SiteFooter.jsx`, `SiteMenu.jsx`, `InquirySection.jsx`, `src/seo/jsonLd.js`, `src/utils/seo.js`;
  - `src/pages/home/TeaserSection.jsx` and `home.css`, whose `.ways` moves to Ways;
  - `src/styles/diptych.css` (the hinge gutter; the `.grade` class) and `src/pages/mnogofamilna/mn.css` (its local gutter margins go);
  - `src/motion/useReveals.js` (U+00A0 kept while a heading is split) and `src/pages/mnogofamilna/MnBuilding.jsx` (its `<br>` goes);
  - `src/shell/handle.js` (`inquiryHref`);
  - the tests that pin each one.
- Test: `src/shell/landingHold.test.js`, `src/config/site.test.js`, `src/components/ui/Ways.test.jsx`, `src/styles/diptych.test.js`, `src/motion/useReveals.test.jsx`, `src/shell/shell.test.jsx`

**Interfaces:**
- Produces:
  - **`landingHold.js`:**
    - `holdEuRow(on: boolean)`: the `data-eu-hold` attribute on `<html>`, as today;
    - `releaseOnFirstMove(release: () => void, { after = 400 }) → () => void`. It calls `release` on the first `scroll`, `wheel`, `touchmove` or `keydown` from `after` ms on, and returns its own cleanup.

    `ExplorerContext` uses both, with its behaviour unchanged.
  - **`SITE.hours`** becomes structured: `[{ short: 'Пн–Пт', long: 'Понеделник – петък', from: '8:00', to: '18:00', days: ['Mo','Tu','We','Th','Fr'] }, { short: 'Сб', long: 'Събота', from: '9:00', to: '14:00', days: ['Sa'] }, { short: 'Нд', long: 'Неделя', closed: true, days: ['Su'] }]`, with helpers `hoursShort(): string[]` and `hoursLong(): Array<{ day, time }>`.
    - `hoursShort()` returns exactly today's three strings, so every existing pin holds.
    - `hoursLong()` gives „Понеделник – петък“ / „8:00–18:00“, „Събота“ / „9:00–14:00“, „Неделя“ / „почивен ден“.
    - The JSON-LD's `openingHoursSpecification` and the SEO description's hours derive from it, with unchanged output.
  - **`Ways({ label, ways })`.** `ways` is `Array<{ title, sub, to?, href?, onClick? }>`, and the component renders `nav.ways` with Home's markup and CSS. Home's teaser renders through it, and its output is unchanged.
  - **`.grade`** (in `diptych.css`): `filter: saturate(.5) sepia(.2) brightness(.74) contrast(1.08)` (spec §4.3).
  - **The hinge gutter.** From 901 px, a hinge's halves keep the page gutter (spec §4.1), site-wide. The Многофамилна page's local margins go.
  - **`inquiryHref(project)`** returns `/contact#zapitvane`, or `/contact?project=<slug>#zapitvane` with a project. A page with `inquiry: true` still goes to `#zapitvane`.

- [ ] **Step 1: Write the failing tests.**
  - `landingHold.test.js`: `releaseOnFirstMove ignores moves before 400 ms and releases on the first after`; `its cleanup removes every listener`.
  - `site.test.js`: `hoursShort is today's strings`; `hoursLong is the long form`.
  - `Ways.test.jsx`: `renders a nav with each way's title and sub, as links or buttons`.
  - `diptych.test.js`: `a hinge keeps the gutter from 901 px`; `.grade has the spec's filter`.
  - `useReveals.test.jsx`: `a split heading keeps its no-break spaces` (SplitText given `reduceWhiteSpace: false`, or a prepareText that restores U+00A0; assert the option or the restored text).
  - `shell.test.jsx`: the „Запитване“ href table becomes `/contact#zapitvane` on solid pages without an inquiry.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement as in Interfaces.** Golden Residence's, Home's and Многофамилна's prerendered HTML stays identical except for intended differences. Diff the builds before and after, and list each difference.
- [ ] **Step 4: Run** `npx vitest run --maxWorkers=2`, `npm run build && npm run check:dist` (every v2 route keeps at least 512 B of room) and `npm run smoke`. Expected: PASS and OK.
- [ ] **Step 5: Capture** Home's teaser and Golden Residence's hinges at 1024 and 1440. Compare them with M3's captures, and list any difference.
- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(shell): one landing hold, one hours source, Ways, the hinge gutter; the inquiry link lands on the form"
```

**Preview:** „The header's „Запитване“ now lands directly on the contact form. Headings no longer touch the screen edge at tablet widths.“

---

### Task 2: Контакти

**Files:**
- Create: `src/routes/contact.jsx`; `src/pages/contact/ContactReach.jsx`, `ContactInquiry.jsx`, `Offices.jsx`, `contact.css`, `prefill.js`
- Modify:
  - `src/routes.js` (`/contact` points here);
  - `src/components/inquiry/InquiryForm.jsx`, `inquiryStore.js` and `services/inquiry.js` (the contact variant's hooks: the subject as a radio group, the construction group, `seedInquiry` without a glide, `budget` and `projectType` details);
  - `tests/contracts/contact-form.test.jsx` and `tests/contracts/routes.test.jsx` (named changes);
  - `scripts/smoke/smoke.mjs` (the /contact focus-ring stop and the landings);
  - `scripts/check-dist.mjs` (MUST_BE_V2 adds `/contact`);
  - `src/shell/shell.test.jsx` (the HANDLES row).
- Delete: `src/pages/Contact.jsx`, and its `seo.js` entry. Remove `react-hook-form` from `package.json` and its `optimizeDeps` entry.
- Test: `src/pages/contact/contact.prerender.test.jsx`, `contact.hydration.test.jsx`, `contact.test.jsx`, `contact.css.test.js`, `prefill.test.js`; `src/services/inquiry.test.js`

**Interfaces:**
- Consumes: Task 1's `landingHold`, `hoursLong`, Ways. The inquiry store (`picks: { project, label }[]`, `OPTION_PROJECT`), `sendPath.js` with `inquiryChecks`, `MN_SNAPSHOT_DATA` (Многофамилна's units), and the store's Golden Residence units.
- Produces:
  - `parsePrefill(search: string, units: { gr: Set<string> | null, mn: Set<string> }) → { option: string | null, picks: Array<{ project, label }> }`.
    - Slugs: golden-residence and gr; mnogofamilna-sgrada, mnogofamilna and mn; stroitelstvo, remont and build; drugo and other. Anything else is null.
    - `?apartment=` repeats, and Latin A/B read as Cyrillic. A value is kept only if it names an existing unit of the chosen project: Golden Residence's after its data arrives, Многофамилна's from the snapshot. At most six.
  - `seedInquiry({ option, picks })`: like `presetInquiry`, but with no glide and no focus.
  - `buildLead(fields, build)` takes an optional `{ kind, budget }`. For the construction subject, `projectType` is „Строителство или ремонт – {kind}“ (or the bare subject without a kind), and `budget` is the range's production string. Every other subject is as today.
  - `/contact`'s handle is `{ header: 'solid', inquiry: true }`.

- [ ] **Step 1: Write the failing tests.**
  - **`prefill.test.js`:**
    - `?project=stroitelstvo` gives `build`; `?project=GR&apartment=A 301` gives Golden Residence with „А 301“ once the units contain it, and none before;
    - `?apartment=Б-702` with `?project=mn` gives Многофамилна's „Б-702“;
    - an unknown unit, a seventh unit and an unknown slug are dropped.
  - **`inquiry.test.js`:** the construction lead's `projectType` and `budget` (the production string „50,000 - 100,000 лв“ when the shown label is „50 000 – 100 000 лв.“), exactly six keys, and „[ТЕСТ] “ first.
  - **`contact.prerender.test.jsx`:**
    - one H1 „Как можете да се свържете с нас“;
    - both phones;
    - the long-form hours from `hoursLong()`, and no open or closed line;
    - the four subjects as one radio group with Golden Residence checked;
    - the form fields;
    - `#ofisi` with both addresses and two „Отвори в Google Maps“ links;
    - the closing ways.
  - **`contact.test.jsx`:**
    - choosing „Строителство или ремонт“ opens Тип проект and Бюджет;
    - a send with them posts the construction lead;
    - the thank-you disables the subjects;
    - `?project=mn&apartment=Б-702` lands on `#zapitvane` with Многофамилна chosen, its chip, and the EU row held until the first move;
    - a send never re-seeds the form.
  - **The contract** (`tests/contracts/contact-form.test.jsx`, named change):
    - its fill path chooses the construction subject, fills Тип проект and Бюджет, ticks the consent, and sends with „Изпратете запитване“;
    - success is „Благодарим ви.“ and failure the form's alert;
    - every invariant listed in spec §8 stays.

    `tests/contracts/routes.test.jsx`'s button lookup becomes „Изпратете запитване“.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §7.3, §8; match `kontakti.html` and the shots `kontakti-1440-first`, `-inquiry`, `-subject-build`, `-offices`, `-closing`, and `kontakti-390-*`).
  - Only Контакти's route carries the contact variant's code. The other forms' first load must not grow beyond Task 1's figures + 64 B.
  - The smoke changes: the /contact focus-ring stop is re-pinned to the new form's button (the ivory ring). The visits `/contact?apartment=А 301`, `/contact?project=stroitelstvo#zapitvane` and `/contact#zapitvane` become landings: the form in view, the EU row visible, no dialog.
- [ ] **Step 4: Run** `npx vitest run --maxWorkers=2`, `npm run build && npm run check:dist` and `npm run smoke`. Expected: PASS and OK.
- [ ] **Step 5: Capture** at 1440 and 390 into `C:/ksm-stroy/design/2026-11-17-m4-shots/`: the first screen, the form with each subject, a landing, the offices and the closing. Compare them with the concept.
- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(contact): Контакти in the Diptych system; one form, adaptive subjects, prefill and landing"
```

**Preview:** „Контакти is new: phones and hours first, a form whose fields follow the subject (construction brings Тип проект and Бюджет), the two offices, and links from every page that land on the form.“

---

### Task 3: Продажби

**Files:**
- Create: `src/routes/projects.jsx`; `src/pages/projects/SalesBoard.jsx`, `BuildingRows.jsx`, `projects.css`
- Modify:
  - `src/routes.js`;
  - `src/explorer/BlockGrid.jsx` (an optional `project` prop, so a page can show two projects without a provider);
  - `scripts/check-dist.mjs` (adds `/projects`);
  - `scripts/smoke/smoke.mjs` (a board step);
  - `src/shell/shell.test.jsx`.
- Delete:
  - `src/pages/Projects.jsx`;
  - the legacy modules only it used: `FourTowersFloorMap.jsx`, `GoldenResidenceFloorMap.jsx`, `ApartmentDetailsModal`, `PropertyCard`, `src/constants/properties.js`, `buildingImages.js`, `apartmentImages.js`;
  - `src/context/ApartmentContext.jsx` and its test (dead since M2), and `googleSheets.js`'s `calculateStats` and `calculateGarageStats`;
  - `scripts/extract-mnogofamilna-data.mjs` (its output stays).
- Test: `src/pages/projects/projects.prerender.test.jsx`, `projects.hydration.test.jsx`, `projects.test.jsx`, `projects.css.test.js`

**Interfaces:**
- Consumes: `GR_PROJECT`, `MN_PROJECT`, `buildModel`, `MN_SNAPSHOT_DATA`, `MN_FACTS`, `GR_FACTS`, the store, and Ways.
- Produces:
  - `SalesBoard()` renders both buildings, each block a `BlockGrid` with its `project`. A unit's action navigates to `/projects/golden-residence?unit=<label>#explorer` or `/projects/mnogofamilna-sgrada?unit=<label>`.
  - The handle is `{ header: 'solid' }`.

- [ ] **Step 1: Write the failing tests.**
  - **`projects.prerender.test.jsx`:**
    - the H1 „Продажби“;
    - „Golden Residence“ and „Многофамилна“ in `<main>`;
    - Golden Residence's 192 squares neutral at their final size;
    - Многофамилна's 144 with the snapshot's statuses (16 free);
    - the counts („—“ for Golden Residence until data; „16 свободни от 144, по данни към 01.12.2025“);
    - the `#sgradite` rows, with Многофамилна's „2 блока, 9 жилищни етажа (2–10)“ and no „10 етажа“;
    - the closing.
  - **`projects.test.jsx`:**
    - with Golden Residence's data (`goOffline`'s built-in), А 301's square is coloured;
    - Enter on a Многофамилна square navigates to its unit's URL;
    - a touch tap previews first;
    - the caption names the floor and the apartment.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §7.1; match `prodazhbi.html` and the shots `prodazhbi-1440-first`, `-hover-gr`, `-hover-mn`, `-ledger-rows`, `-closing`, `-390-*`).
  - Delete the legacy modules listed above. A search must show no importer left.
  - Add a smoke step: a real mouse over a Golden Residence square shows its caption; a click lands on the Golden Residence page with that unit's panel.
- [ ] **Step 4: Run** the suite, the build with check:dist, and the smoke. Expected: PASS and OK.
- [ ] **Step 5: Capture** and compare as in Task 2.
- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(projects): Продажби as a sales board of both buildings; the legacy sales code goes"
```

**Preview:** „Продажби is new: every apartment of both buildings as a coloured square, with a click opening that apartment, then the two buildings compared row by row.“

---

### Task 4: Обекти

**Files:**
- Create: `src/routes/blog.jsx`; `src/pages/works/works.js`, `Register.jsx`, `Book.jsx`, `works.css`, `book.css`
- Modify: `scripts/images/sources.json` (a `works` group: the 93 photos, ids `work-<slug>-<n>`, widths no wider than each source); `src/routes.js`; `scripts/check-dist.mjs` (adds `/blog`); `scripts/smoke/smoke.mjs`; `src/shell/shell.test.jsx`
- Delete: `src/pages/Blog.jsx`. Delete `OptimizedImage` too, if no importer is left.
- Test: `src/pages/works/works.test.js`, `blog.prerender.test.jsx`, `blog.hydration.test.jsx`, `blog.test.jsx`, `book.test.jsx`, `works.css.test.js`

**Interfaces:**
- Produces:
  - **`WORKS`:** seven entries of `{ id, name, place, type, year (shown for Green Life only), status: 'finished' | 'rough', description, features: string[], photos: string[] }`, in production's order, with the photos in `Blog.jsx`'s `images` order.
  - **What reaches the first load:** only the plates' photos (three a work). The rest of a work's photos load with the book.
  - **`Book({ work, fromRect, onClose })`:** a lazy dialog, opened with Flip.
  - **The handle:** `{ header: 'solid' }`.

- [ ] **Step 1: Write the failing tests.**
  - **`works.test.js`:** seven works, 93 photos, every photo id in the manifest, and Green Life the only one with a year shown.
  - **`blog.prerender.test.jsx`:**
    - the H1 „Обекти“;
    - the filter (Всички проекти 7 / Завършени проекти 6 / Груб строеж 1);
    - seven rows with three plates each, „Айвазовски Парк“ in `<main>`, and the „груб строеж“ tag on Panorama;
    - the closing with „Поръчайте оферта“ to `/contact?project=stroitelstvo#zapitvane`.
  - **`blog.test.jsx`:** the filter folds rows. With motion off it changes at once, and Flip is never loaded in tests.
  - **`book.test.jsx`:**
    - opening gives a dialog named after the work;
    - Tab stays inside, ←/→/Home/End turn the pages, and Escape closes it, with focus back on the plate;
    - the photos show in true colour (no `.grade`).
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §7.2; match `obekti.html` and the shots `obekti-1440-first`, `-rows`, `-book`, `-book-turned`, `-closing`, `-390-*`).
  - The plates take `.grade`.
  - Add a smoke step: Enter on a plate opens the book, ArrowRight turns a page, and Escape returns focus to the plate.
- [ ] **Step 4: Run** the suite, the build with check:dist, and the smoke. Expected: PASS and OK.
- [ ] **Step 5: Capture** and compare as in Task 2.
- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(works): Обекти as a register of works that open as a book"
```

**Preview:** „Обекти is new: the seven works as a register with a filter, each opening as a book of its photos.“

---

### Task 5: За нас

**Files:**
- Create: `src/routes/about.jsx`; `src/pages/about/Lineage.jsx`, `about.css`, and section components as the page needs them
- Modify: `scripts/images/sources.json` (an `about` group: slider01 and slider02 from their larger masters in `src/assets/images/optimized/`, slider03, and the hotel card's photo, reusing existing entries where the source is the same file); `src/routes.js`; `scripts/check-dist.mjs` (adds `/about`); `scripts/smoke/smoke.mjs` (the scroll-lock step re-pinned if needed); `src/shell/shell.test.jsx`; `src/root.test.jsx`
- Delete: `src/pages/About.jsx` and `src/utils/animations.js` (its last user). Remove `swiper` from `package.json` and `optimizeDeps`.
- Test: `src/pages/about/about.prerender.test.jsx`, `about.hydration.test.jsx`, `about.test.jsx`, `about.css.test.js`

**Interfaces:**
- Produces: `Lineage()`, the founding figure. Its caption is one element whose own text contains „основана през месец септември 2008“. The handle is `{ header: 'solid' }`.

- [ ] **Step 1: Write the failing tests.**
  - **`about.prerender.test.jsx`:**
    - the H1 „Добре дошли в КСМ Строй ООД“;
    - the lineage figure's names „Кадри“ and „Сухат“ and „септември“ „2008“;
    - the contract sentence in one element;
    - the section ids `#traditsiya`, `#koi-sme-nie`, `#opit`, `#cennosti`, `#uslugi`, `#misiya`, `#rabota`;
    - the four figures as plain text (no counter);
    - content.txt's four activities with the spelling fixes QUESTIONS.md lists;
    - the value words smaller than their h2 (a CSS test).
  - **`about.css.test.js`:** the lineage's draw is CSS under the motion gate, and the photos take `.grade`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §7.4; match `za-nas.html` and the shots `za-nas-1440-first`, `-traditsiya`, `-koi-sme-nie`, `-opit`, `-cennosti`, `-uslugi`, `-misiya`, `-rabota`, `-390-*`).
- [ ] **Step 4: Run** the suite, the build with check:dist, and the smoke. Expected: PASS and OK.
- [ ] **Step 5: Capture** and compare as in Task 2.
- [ ] **Step 6: Commit.**

```bash
git commit -m "feat(about): За нас with the founding drawn on the seam"
```

**Preview:** „За нас is new: the founding drawn on the gold line (Кадри and Сухат, 2008), then the tradition, the team, the values, the services and the mission.“

---

### Task 6: The EU page and 404

**Files:**
- Modify: `src/routes/eu-proekt.jsx`, `src/routes/not-found.jsx`, `src/routes/BlockRoute.jsx` (if the 404's drawing would otherwise reach the block routes)
- Create: `src/pages/eu/eu.css`, `src/pages/notfound/notfound.css`, and a small static drawing module for the 404 (block А's typical floor outlines only)
- Test: `src/routes/eu-proekt.test.jsx` (new or extended), `src/routes/not-found.test.jsx`, their css tests

**Interfaces:**
- Produces: the EU page and the 404 as spec §7.5–§7.6 describe. `tests/contracts/eu-visibility.test.jsx` is unchanged and passes.

- [ ] **Step 1: Write the failing tests.**
  - **EU page:**
    - the co-funding plate is in the first viewport in the HTML;
    - the H1's accessible name is exactly „Дигитализация на предприятията“;
    - `#byudzhet` has the band with its seam at 70 % (`--split: 70%` at rest) and each budget line as one run of text;
    - one „Изтегли плаката (PDF)“ link;
    - „е да повиши“ is bound with U+00A0.
  - **404:**
    - the drawing is `aria-hidden`, has 11 outlines plus one dashed, and contains no text naming a project;
    - the H1 „Тази страница я няма в чертежа.“ with U+00A0 after „я“ and „в“;
    - three links: Начало, Продажби, Контакти;
    - the 404's drawing is in no other route's first load (check:dist figures).
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (match `eu-proekt.html` and `404.html`, with their shots).
- [ ] **Step 4: Run** the suite, the build with check:dist, and the smoke. Expected: PASS and OK.
- [ ] **Step 5: Capture** and compare. Then commit.

```bash
git commit -m "feat(eu,404): the EU page as a document with its budget on the seam; 404 as the missing room"
```

**Preview:** „The EU page and the 404 page are in the new design.“

---

### Task 7: The legacy removal, share images, and the leftovers

**Files:**
- Modify:
  - `package.json` and the lockfile (drop framer-motion), `vite.config.js` (`optimizeDeps`);
  - `tailwind.config.js` (the legacy palettes, fonts, sizes, shadows, radii, animations and spacing; the dead `./index.html` content glob);
  - `src/index.css` and `src/styles/diptych.css` (the legacy-only rules and `.legacy-ground`);
  - `src/root.jsx` and `src/shell/handle.js` (`legacy`);
  - `src/utils/seo.js` (the unused entries) and `src/utils/smoothScroll.js` (the body-overflow hold, if no page sets it);
  - `scripts/check-dist.mjs` (every route in MUST_BE_V2; the legacy WARN branch fails; the stale Flip note);
  - the tests that pin each of these.
- Delete:
  - the legacy-only public images, once a search shows no live user: `public/images/golden-residence/building-2-blog-*`, `building-2.png`, `golden-residence.jpg`, and any other such file the search finds;
  - `BRAND_GUIDE_LUXURY.md`, `LUXURY_IMPLEMENTATION_GUIDE.md`, and README's ApartmentContext line.
- Create: og:image entries (1200 × 630) in `sources.json`, one per rebuilt page (spec §11: a real photo or render from the page; none for the 404), passed to each page's `pageMeta`.
- Test: `scripts/check-dist` self-test cases; `src/assets.test.js` (every `/images/` and `/img/` path referenced in `src/` resolves to a file); each page's meta test.

- [ ] **Step 1: Write the failing tests** (the asset references, the og:image of each page, check:dist's every-route rule).
- [ ] **Step 2: Remove, then run.** The suite, the build, check:dist (every route enforced) and the smoke pass. Report the build's size before and after (`build/client`).
- [ ] **Step 3: The leftovers:**
  - FR10: the „Затвори“ strip on landscape phones;
  - FR11: the unit panel's scroll-lock colour;
  - shell minors 6 and 7, gr minor 4, infra minors 1, 3 and 4;
  - the Task 9 smoke can-wait items, and the duplicate `stubIdle` flushers;
  - M3's deferred minors that the M3 final review left to M4 (`docs/superpowers/notes/2026-11-17-m3-rulings.md`);
  - M3 ruling FW5: after a `?view=list` arrival, a stage opened in place gives the focus back to its rail, not to `#spisak`. The fix lives in the lazy chunk.

  Each one is a separate commit with its test.
- [ ] **Step 3b: The send path after a deploy** (M3 ruling FW4). Choose between:
  - starting the send path's load once the page is idle (about 30–50 B on each form's route);
  - leaving it to Vercel's Skew Protection, which the user turns on at launch.

  Measure the first and record the choice in the results note. Either way, the launch list in the results note names Skew Protection.
- [ ] **Step 4: Run** the suite, the build with check:dist, and the smoke. Expected: PASS and OK.
- [ ] **Step 5: Commit** each part, for example:

```bash
git commit -m "chore(legacy): remove the legacy pages' code, palettes and libraries; every route is v2"
```

**Preview:** „No legacy page remains. Each page shares its own picture when linked. The build is much smaller.“

---

### Task 8: The speed round, verification, and the hand-off

**Files:**
- Modify: `src/motion/runtime.js` (the engine after the LCP paint), `src/components/ui/ResponsivePicture.jsx` (a `fetchPriority="low"` option), Home's and Многофамилна's pictures and `sizes`, `scripts/fonts/build-fonts.py` (`--subset-from`, only if needed), and whatever the measurements point to
- Create: `docs/superpowers/notes/2026-11-17-m4-results.md`

- [ ] **Step 1: Measure** the nine targeted routes: `/`, `/projects/golden-residence`, its block-a, `/projects/mnogofamilna-sgrada`, its block-a, `/projects`, `/blog`, `/about`, `/contact`.
- [ ] **Step 2: Work through Home's steps** (spec §10), then the contingencies, on every route that misses LCP 2.5 s, CLS 0.02 or TBT 150 ms:
  1. the engine after the LCP paint;
  2. below-the-fold pictures out of the window before the paint;
  3. `fetchPriority="low"` on non-LCP first-screen pictures;
  4. the explorer's CSS out of Home's render-blocking set;
  5. phone `sizes` that keep a DPR-3 phone at the 1400 w render;
  6. lighter LCP images;
  7. fewer pictures above the fold;
  8. font subsetting;
  9. deferring non-critical CSS.

  Each change gets a test where its behaviour is testable, and a measurement either way.
- [ ] **Step 3: If a route still misses** and only a design change would close it, stop changing that route. Report its figures and the options for the user (spec §10).
- [ ] **Step 4: Run** `npm run verify` (with `--maxWorkers=2`). Expected: PASS.
- [ ] **Step 5: Write the results note,** covering:
  - first-load per route against M3's end;
  - the speed figures before and after;
  - what each change gave;
  - any route the user must decide on;
  - the deviations from the concepts that were kept;
  - the open items for launch.
- [ ] **Step 6: Complete the user's capture set** in `C:/ksm-stroy/design/2026-11-17-m4-shots/`, with a `README.txt`.
- [ ] **Step 7: Commit.**

```bash
git commit -m "perf(speed): the speed round; the M4 results"
```

**Preview:** „Every page is in the new design and the speed figures are in the results note. What's left before launch are your steps: the client review, device checks, the test inquiry and the production settings.“
