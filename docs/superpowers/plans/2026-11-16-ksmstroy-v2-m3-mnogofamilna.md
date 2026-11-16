# ksmstroy.com v2: M3 Многофамилна Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Многофамилна in the Diptych system: its page opens on its own explorer, with a night facade whose floors with free apartments are lit; its block pages become ledgers of floors. Both run on the M2 explorer, made per-project, without growing Golden Residence.

**Architecture:**
- **One explorer, two projects.** A project object (`GR_PROJECT`, `MN_PROJECT`) replaces Golden Residence's constants in `src/explorer`. Each project's maps, images, snapshot and CSS reach only its own routes.
- **Data.** Многофамилна's model comes from a compact, generated snapshot (dated 01.12.2025), prerendered as real numbers. Live rows replace it if its sheets are ever published.
- **The lights.** The facade's base is a lights-off twin of the dusk render. The lit render shows through the bands of floors that have a free apartment, in the prerendered HTML. A CSS-only arrival switches them on.
- **Budget first.** Task 0 frees first-load bytes before anything is added. Golden Residence has 90 B of room today.

**Tech Stack:**
- React 19.3.1; React Router 8.5.1 (framework mode, prerender);
- Vite 7; Tailwind 3.4;
- GSAP 3.15.1 (ScrollTrigger, SplitText, Flip); Lenis 1.3.27;
- Vitest 4 with Testing Library and jsdom; the puppeteer-core smoke run;
- sharp (image pipeline); Node 24.x; Vercel.

**Spec:** `docs/superpowers/specs/2026-11-16-ksmstroy-m3m4-design.md` (the "spec": §2, §4, §5, §6, §10, §11, §12 bind M3). Read it before any task.
- The Diptych spec stays binding for the system: `docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md` ("Diptych").
- The codebase map, with file:line for everything named here: `docs/superpowers/notes/2026-11-16-m3m4-platform-map.md` (§1 is the explorer and Многофамилна).
- The concept notes: `docs/superpowers/notes/2026-11-16-m3m4-concepts.md`.
- Every M1/M2 ruling: `docs/superpowers/notes/2026-11-16-m1-m2-rulings.md`. A ruling beats a brief.
- `<scratch>` means `C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad`.
- **Visual reference:** `C:/ksm-stroy/design/2026-11-16-m3m4-concepts/mnogofamilna.html` and `mnogofamilna-block-a.html`, with `css/`, `js/` and `shots/`.
  - To see them, run `node <scratch>/serve-dir.mjs 5191 C:/ksm-stroy/design` and open `http://127.0.0.1:5191/2026-11-16-m3m4-concepts/mnogofamilna.html`. The server root must be `C:/ksm-stroy/design`, because the concepts load `../2026-11-14-concepts/c2-diptych/`.
  - Stop the server when done.

## Global Constraints

**Where to work**
- Work only in `C:/ksm-stroy/ksm-stroy-v2`, on branch `redesign-v2`.
- Never touch `C:/ksm-stroy/ksm-stroy` or `C:/ksm-stroy/golden-residence`.
- Read the concept folders under `C:/ksm-stroy/design/` but never write to them. Captures for the user go to `C:/ksm-stroy/design/2026-11-16-m3-shots/`; intermediate files go to `<scratch>`.
- **Memory is tight on this machine.** Run at most one local server and one headless Chrome at a time, and stop both when done. If a background process is stopped for low memory, say so in the report instead of restarting it in a loop.

**Outward actions**
- Never push. The orchestrator pushes `redesign-v2` after Tasks 4, 5, 6 and 7, each with its task's **Preview** line.
- Never modify `api/odoo-lead.js`; a teammate owns it.
- Never print `.env` values or the sheet and Odoo URLs.
- Never submit a form on a preview or POST to `/api/odoo-lead`. Tests mock the network, and local browser checks abort every request that leaves 127.0.0.1.

**Commits**
- Conventional messages, with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Stage explicit paths. Never stage `.claude/settings.local.json`.
- `npm test`, `npm run build` and `npm run check:dist` pass at every commit.

**Toolchain**
- No new runtime dependency.
- If a dev dependency must be added, use `--legacy-peer-deps` and then a plain `npm install`. Never delete `package-lock.json`.
- React Router stays at 8.5.1.

**Contract tests**
- `tests/contracts/` stay green at every commit.
- Change them only where a task says so. In M3 that is Task 4 and Task 6, for the Многофамилна rows: the titles, the 'БЛОК B' case, and the HANDLES rows.
- Ruling G1: a change that turns an unlisted test red updates that test to the new behaviour, and the report lists it. Never drop coverage.

**Final state in HTML** (M1, verbatim)
- Prerendered HTML is the final visual state. Never render `opacity: 0`, `initial` motion states or "visible after onLoad" classes into markup.
- Browser-only values (matchMedia, sessionStorage, the query string, pointer type) never change the first client render. Query-string views render after `useHydrated()`.
- Layout chosen by media is chosen by CSS media queries. Sizes that set page length use `var(--screen-h)`, never `vh` or `svh`.
- Hidden starting states of CSS motion exist only under `:root.js`, inside `prefers-reduced-motion: no-preference`, with `animation-delay: var(--arrive)` (Diptych §5.5; `src/test/css.js`).

**GSAP and Lenis**
- `gsap`, `gsap/*` and `lenis` are imported only inside `src/motion/`. Other code uses `useMotion`, `useMotionNow` or `loadFlip`.
- Never `data-split` or `useMotion` above the fold.

**Budgets** (spec §10)
- **First-load JS:** at most 160 KiB gzip on every route (`npm run check:dist`).
- **Golden Residence:** after Task 0, `/projects/golden-residence`'s first-load JS never exceeds its Task 0 figure. Free bytes before adding them (FR5).
- **Per-project code, data, maps and CSS** reach only their own routes.
- **Other budgets:** the motion chunk at most 60 KiB; Flip at most 10 KiB, lazy; fonts at most 90 KB.
- **LCP images:** at most 60 kB on mobile and 200 kB on desktop.

**Copy rules** (spec §4.5)
- Copy comes from production; the new lines are those the spec and the concept notes quote.
- Quotes „…“, and a spaced en dash for ranges.
- U+00A0 goes after one-letter words and „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“. Pins write it as `\u00A0`.
- Addresses go through `bindAddress`, counts through `plural`, areas through `formatArea`.
- Sentence case. No eyebrow labels. One italic `em` per heading.

**Многофамилна facts** (spec §2; the snapshot)
- 2 blocks, А and Б. Apartments on floors 2–10 in each, 8 a floor, 72 a block, 144 in all.
- Floor 10 is „тавански етаж“. Labels run „А-101“ (floor 2) to „Б-908“ (floor 10).
- Statuses as of 01.12.2025: 16 free, 6 reserved, 122 sold, 0 blocked.
- The floors with a free apartment: А-2, А-9, Б-2, Б-3, Б-4, Б-5, Б-7, Б-8 and Б-9.
- The sold-out floors: А-3 to А-6, А-10, Б-6 and Б-10.
- Types: 72 „2-стаен“ and 72 „3-стаен“. No Идеални части, no price.
- The address: „УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София“.

**Matching the concept.** Where a step says "match", compare at 1440×900 and 390×844 against the concept page and its named capture in `shots/`. Port its values into the page's own CSS, using:
- token variables for colours;
- `--screen-h` for `vh` and `svh`;
- the system's focus ring;
- no `outline: none`.

The shell comes from `src/shell`, never from the concept HTML.

## Review Focus

1. **Многофамилна's data states.**
   - The snapshot (dated), live Многофамилна rows (if the sheets appear), and a Golden Residence read failing while you are on the Многофамилна page.
   - The Многофамилна page always shows real dated numbers: never „—“, never 0, and never the stale notice for dated data. The date goes away only with live rows.
   - *Pinned in Task 1 (`snapshot matches the built-in rows`), Task 2 (`MN model uses the snapshot until MN rows are live`) and Task 4 (`mn.prerender: the facts and rails show the snapshot's numbers`).*
2. **Deep links with bad values on Многофамилна:**
   - `?floor=1`, `?floor=11`, `?floor=Б-0`, `?floor=B-5` (Latin);
   - `?unit=А 101` (Golden Residence's format) and `?unit=А-1001`;
   - on a block page, a bare `?floor=10` or `?floor=1`.

   Each is ignored or normalised: no crash, no blank dialog, no hydration error. *Pinned in Task 2 (`parseFloorParam` with Многофамилна's floors) and Task 6 (`a bare ?floor=7 opens floor 7 of this block`).*
3. **Golden Residence regressions.** The generalisation must leave Golden Residence's output and bytes as they were. *Pinned in Task 2: every existing GR test stays green, the prerendered GR pages diff clean against Task 0's build, and check:dist holds the Task 0 figure.*
4. **Phones and touch:**
   - the block switch's crops at 320–390 px;
   - the first tap previews and the second opens;
   - the lit strips never overflow;
   - text spacing holds at 320–360 px;
   - no sideways scroll.

   *Pinned in Task 4 (`mn.css.test.js`, the smoke's phone visits) and Task 7 (the phone explorer step).*
5. **Picks across projects.**
   - Pick a Многофамилна unit, then switch the subject to Golden Residence: the pick is hidden and not sent.
   - A Golden Residence pick is never sent with Многофамилна.
   - Picks persist across pages, and the option clears on unmount (C5.1).

   *Pinned in Task 2 (`InquiryForm` pick-by-project cases).*

---

### Task 0: Room in the budget, and the HTTP/2 measuring mode

M3 adds code to modules that Golden Residence's page loads, and that page has 90 B of room. This task frees first-load bytes without changing anything a visitor sees. It also builds the HTTP/2 measuring mode the spec requires (§10).

**Files:**
- Create: `src/services/emailPattern.js`
- Modify: `src/services/inquiry.js`, `src/components/inquiry/InquiryForm.jsx`, `src/pages/golden-residence/StorySection.jsx`, `src/routes/BlockRoute.jsx` and the two block route modules
- Modify: `scripts/smoke/static-server.mjs`, `scripts/perf/lighthouse.mjs`
- Test: `src/services/inquiry.test.js`, `src/components/inquiry/InquiryForm.test.jsx`, `scripts/smoke/static-server.test.mjs` (create it if absent)

**Interfaces:**
- Produces:
  - `src/services/emailPattern.js` exports `EMAIL_PATTERN`. `services/inquiry.js` re-exports it, so its importers keep working.
  - `InquiryForm` no longer imports `sendInquiry` statically. It loads `services/inquiry.js` with `import()`, starting on the form's first `focusin` and awaited on submit.
  - `npm run perf -- <urls>` measures over HTTP/2 by default, with `--h1` for the old server. Lighthouse is pinned at `13.6.0`.

- [ ] **Step 1: Record the starting figures.** Run `npm run build && npm run check:dist`. Note each route's first-load bytes in the report: `/` 160,685, `/projects/golden-residence` 163,750, the GR blocks 158,897, the MN blocks 154,449, `/eu-proekt` 142,014 and `/404` 141,026 at `01eac18`.
- [ ] **Step 2: Write the failing tests.**
  - `InquiryForm.test.jsx`, `does not load the send service before the form is used`: mock `../../services/inquiry` with a spy factory. Render the form, and assert the factory has not run. `fireEvent.focusIn` a field and assert it has. Submit a valid form and assert one `sendInquiry` call.
  - `inquiry.test.js`, `EMAIL_PATTERN is the proxy's pattern, from emailPattern.js`: the same object from both modules.
- [ ] **Step 3: Run them** with `npm test -- src/components/inquiry src/services`. Expected: the new cases FAIL.
- [ ] **Step 4: Implement the freeing.**
  - **The send path** loads on demand, as Interfaces says. `sending` still shows at once on submit, and the error and success states are unchanged.
  - **`StorySection`** uses `formatDecimal` (`src/utils/format.js`) in place of its own number formatter (gr minor 3).
  - **`BlockRoute`** stops importing `NotFound` statically. Routes are one per block, so the not-found branch is unreachable. Render nothing there, or load NotFound lazily, whichever is fewer bytes. Keep its test meaning.
  - **Then look for more:** code in the GR page's first load that only a dialog or an opened floor needs moves into the surfaces chunk (`src/explorer/surfaces.js`), as F11 did. Each move is listed in the report with its bytes.
  - **Target:** at least 1,024 B of room on `/projects/golden-residence`. If you stop short, report what you found and why.
- [ ] **Step 5: Run** `npm test` (expected: PASS, the counts up by the new cases) and `npm run build && npm run check:dist` (expected: OK). Report the new first-load figure of every route and the room on Golden Residence.
- [ ] **Step 6: Build the HTTP/2 measuring mode.**
  - **The server.** `static-server.mjs` gains an HTTP/2-over-TLS mode (`--h2`) that serves the same handler, which already emulates `vercel.json`, through `node:http2`'s compatibility API with `allowHTTP1: true`.
    - It makes a throwaway self-signed certificate for 127.0.0.1 at start, into a temp directory, with `openssl` (Git for Windows ships it).
    - Never commit a key.
    - The model is `<scratch>/m2/task-9/h2/serve-h2.mjs`.
  - **The perf script.** `lighthouse.mjs` pins `lighthouse@13.6.0` and starts Chrome with `--ignore-certificate-errors` in h2 mode. HTTP/2 is the default; `--h1` keeps the old path.
  - **The test,** `static-server.test.mjs`: `h2 mode answers / with 200 over HTTP/2`. It starts the server on a free port, requests `/` with a `node:http2` client (`rejectUnauthorized: false`), and expects `:status` 200 and `content-type` text/html. It skips with a clear message if `openssl` is missing.
- [ ] **Step 7: Check the mode once.** Run `npm run build`, then `npm run perf -- /` (h2). Record LCP, CLS and TBT for `/` in the report. Expect about 2.7 s, as M2's diagnostic found; this step only proves the mode works.
- [ ] **Step 8: Commit.**

```bash
git add src/services/emailPattern.js src/services/inquiry.js src/services/inquiry.test.js src/components/inquiry/InquiryForm.jsx src/components/inquiry/InquiryForm.test.jsx src/pages/golden-residence/StorySection.jsx src/routes/BlockRoute.jsx src/routes/golden-residence-block.jsx src/routes/mnogofamilna-block.jsx scripts/smoke/static-server.mjs scripts/smoke/static-server.test.mjs scripts/perf/lighthouse.mjs
git commit -m "perf(budget): free first-load bytes on the Golden Residence page; measure over HTTP/2"
```

Add the paths of any other file you changed in Step 4.

---

### Task 1: Многофамилна's snapshot and facts

Многофамилна's page must prerender real, dated numbers (spec §5.1). Today its rows exist only in the store's lazy fallback, and only after a failed live read. This task makes a small static module for them.

**Files:**
- Create: `scripts/mnogofamilna/build-snapshot.mjs`
- Create: `src/data/mnogofamilna/snapshot.js` (generated)
- Create: `src/data/mnogofamilna/facts.js`
- Test: `src/data/mnogofamilna/snapshot.test.js`, `src/data/mnogofamilna/facts.test.js`
- Modify: `package.json` (script `mn-snapshot`), `src/config/facts.test.js`

**Interfaces:**
- Consumes: `src/constants/mnogofamilnaFallbackData.js`, and the normalisers the store's built-in path uses (`src/data/availability/store.js` → `src/services/googleSheets.js`).
- Produces:
  - `MN_SNAPSHOT_DATE = '01.12.2025'`.
  - `MN_SNAPSHOT_DATA`: the project's slice of `useAvailability().data`, i.e. `{ 'mnogofamilna-sgrada': { 'block-a': ApiRow[], 'block-b': ApiRow[] } }`. `ApiRow` is `src/services/sheetsCore.js`'s apartment row: `{ unit, floor, type, area: { built, ideal, total }, exposure, status, price }`.
  - So `apartmentUnits(MN_SNAPSHOT_DATA, 'mnogofamilna-sgrada')` (`src/data/availability/select.js`) gives the 144 units.
  - `MN_FACTS = { blocks: 2, floors: { min: 2, max: 10 }, residentialFloors: 9, perFloor: 8, perBlock: 72, apartments: 144, types: { '2-стаен': 72, '3-стаен': 72 }, minArea, maxArea }`. The areas are the smallest and largest Обща площ in the snapshot.
  - `npm run mn-snapshot` regenerates the module.

- [ ] **Step 1: Write the failing tests.**
  - `snapshot.test.js`:
    - `snapshot matches the built-in rows`: for both blocks, the decoded rows deep-equal the rows the store's built-in path makes from `getMnogoAFallbackData()` and `getMnogoBFallbackData()`.
    - `144 units, floors 2–10, А-101 on floor 2`: through `apartmentUnits`. It finds 144 units, each floor 2–10 holding 8 per block. `А-101` has `floor` 2 and `suffix` '01'; `Б-908` has floor 10.
    - `statuses as of 01.12.2025`: 16 available, 6 reserved, 122 sold, 0 blocked.
    - `stays small`: the gzip size of `snapshot.js`'s source, read with `fs`, is at most 3,072 B.
  - `facts.test.js`, `MN_FACTS derive from the snapshot`: the values in Interfaces. `minArea` and `maxArea` equal the snapshot's extremes.
  - `src/config/facts.test.js`, `MNOGO_DATED agrees with the snapshot`: free 16, total 144, date '01.12.2025'.
- [ ] **Step 2: Run** `npm test -- src/data/mnogofamilna src/config/facts.test.js`. Expected: FAIL, module not found.
- [ ] **Step 3: Write the generator and run it.**
  - `build-snapshot.mjs` writes `snapshot.js` with a header that names the generator and says not to edit it.
  - The encoding is the generator's choice: a compact string table decoded at import, for example. It must decode to plain `ApiRow` objects.
  - `facts.js` derives `MN_FACTS` from `MN_SNAPSHOT_DATA` at import. It holds no literal counts.
- [ ] **Step 4: Run the tests.** Expected: PASS.
- [ ] **Step 5: Commit.**

```bash
git add scripts/mnogofamilna/build-snapshot.mjs src/data/mnogofamilna package.json src/config/facts.test.js
git commit -m "feat(mnogofamilna): a dated snapshot and the facts derived from it"
```

---

### Task 2: One explorer for both projects

The engine in `src/explorer` reads Golden Residence's constants and maps at module level. After this task it reads a project object from its provider. Golden Residence's output and bytes are unchanged, and the engine is tested with Многофамилна's snapshot. The inquiry's picks learn which project they belong to.

**Files:**
- Create: `src/explorer/projects/gr.js`, `src/explorer/projects/mn.js`
- Modify, in `src/explorer`: `ExplorerContext.jsx`, `useExplorer.js`, `model.js`, `floorParam.js`, `useExplorerState.js`, `Facade.jsx`, `FacadeRails.jsx`, `FloorPanel.jsx`, `FloorSheet.jsx`, `PlanStage.jsx`, `PlanSvg.jsx`, `UnitPanel.jsx`, `UnitList.jsx`, `filterUnits.js`, `BlockGrid.jsx`, `StaleNotice.jsx`, `ExplorerDialogs.jsx`, `ExplorerSection.jsx`, `BlockPage.jsx`, `plans.js`, `surfaces.js`, `geometry.js`, `testing.js`, `explorer.css`
- Modify, for the inquiry: `src/components/inquiry/inquiryStore.js`, `InquiryForm.jsx`, `InquirySection.jsx`; `src/pages/golden-residence/ParkingSection.jsx`; `src/pages/home/SplitHero.jsx` (its preset call only)
- Modify, the callers: `src/routes/golden-residence.jsx`, `src/pages/golden-residence/BlocksSection.jsx`, Home's teaser and any other `ExplorerProvider` or `Facade` user
- Test: the explorer's existing tests, plus a new `src/explorer/mn.engine.test.jsx`; `src/components/inquiry/InquiryForm.test.jsx`, `inquiryStore.test.js`

**Interfaces:**
- Consumes: Task 1's `MN_SNAPSHOT_DATA`, `MN_SNAPSHOT_DATE` and `MN_FACTS`.
- Produces:
  - **The project object** (`ExplorerProject`), documented in `useExplorer.js`:

    ```
    { id: 'golden-residence' | 'mnogofamilna-sgrada',
      name: 'Golden Residence' | 'Многофамилна жилищна сграда',
      option: 'golden-residence' | 'mnogofamilna',         // the inquiry option a unit presets
      floors: { min, max },                                  // GR 1–8, MN 2–10
      perFloor, perBlock, total,                             // GR 12/96/192, MN 8/72/144
      unitNumber(unit) → string,                             // what a plan draws: GR '501', MN '101'
      floorMeta(floor) → string | null,                      // MN 10 → 'тавански етаж'
      modelData(snapshot) → data | null,                     // what buildModel reads
      dated(snapshot) → string | null,                       // MN '01.12.2025' unless its rows are live
      types: string[],                                       // the list's Вид options
      exposureNote: string | null,                           // GR's „Изложение има само за блок Б“, MN null
      facade: { map, picture, alt, className, Lights? } }    // MN's facade fields arrive in Task 4
    ```
  - `GR_PROJECT` (`projects/gr.js`) holds today's values. `MN_PROJECT` (`projects/mn.js`) holds Многофамилна's: `modelData` returns the store's data when Многофамилна's origin is 'live' for both blocks, else `MN_SNAPSHOT_DATA`. Its facade fields are placeholders until Task 4.
  - `ExplorerProvider({ project, routeBlock = null, children })`. The context value gains `project` and `dated`.
  - `buildModel(data, project)` reads `data[project.id]` and that project's blocks.
  - `parseFloorParam(value, routeBlock, floors)` and `formatFloorParam(...)`, with `floors` = `{ min, max }`.
  - `BlockGrid({ model, block, onUnit })` sizes itself from `useExplorer().project`: `perFloor` columns, floors max down to min. Its roving tab stop is clamped to the grid (F22).
  - **Plans.** Each project's floor plans and its own-plan mapping load only on that project's pages. Golden Residence's stay out of every first load (`plans.js` today). Многофамилна's plan is small and may be static on its routes.
    - The surfaces chunk gets plans through the project: `project.plans` (data) or `project.loadPlans()` (a promise).
    - If Golden Residence's first-load bytes can't hold, Golden Residence wins: the Многофамилна pages may load GR's plans with the surfaces chunk. Report it.
  - **The inquiry store's picks carry their project.**
    - `picks: Array<{ project: 'golden-residence' | 'mnogofamilna-sgrada', label: string }>`.
    - `presetInquiry({ option?, pick?: { project, label } })`.
    - `OPTION_PROJECT = { 'golden-residence': 'golden-residence', garage: 'golden-residence', mnogofamilna: 'mnogofamilna-sgrada' }`.
    - The form shows and sends only the picks of the chosen option's project. This extends FR4.
  - `INQUIRY_OPTIONS.mnogofamilna`: Многофамилна first (`MNOGOFAMILNA`), then `golden-residence` („Golden Residence, жк Левски Г“, subject „Golden Residence“), `build`, `other`.
  - `InquirySection` copy for `page="mnogofamilna"`:
    - heading „Свържете се с *нас*“;
    - lead „Обадете се или изпратете запитване и ще се свържем с вас.“;
    - the phones, the email and the hours.

- [ ] **Step 1: Freeze Golden Residence's output.** On Task 0's commit, run `npm run build` and copy `build/client/index.html`, `build/client/projects/golden-residence/index.html` and its two block pages to `<scratch>/m3/t2-before/`.
- [ ] **Step 2: Write the failing tests in `mn.engine.test.jsx`.** They render with `MN_PROJECT` and the snapshot, through a test provider in `testing.js`; the store is mocked as `testing.js` already does.
  - `parseFloorParam with Многофамилна's floors`:
    - `'Б-5'`, `'B-5'`, `'б5'` give `{ block: 'Б', floor: 5 }`;
    - `'А-10'` gives floor 10;
    - `'1'`, `'11'`, `'Б-0'` and `'А-1'` give null;
    - with `routeBlock` 'А', `'7'` gives `{ block: 'А', floor: 7 }` and `'1'` gives null.
  - `MN model uses the snapshot until MN rows are live`:
    - a store snapshot that is idle, or ready with Многофамилна's slots null, gives the snapshot's model: 144 units, 16 free, and floor `Б-9` with `colour` 'available'. `dated` is '01.12.2025'.
    - Live Многофамилна rows (origin 'live' for both blocks) give a model from those rows, and `dated` null.
  - `plan labels show the apartment number`: `PlanSvg` for А-2 draws „101“ to „108“, never „201“.
  - `floor meta`: `FloorMeta` for Б-10 reads „8 апартамента“ and „тавански етаж“; for Б-9, no „тавански“.
  - `unit panel`, for А-101:
    - the title is „А-“ plus `<em>101</em>`;
    - there is no „Идеални части“ row;
    - the date line reads „по данни към 01.12.2025“;
    - for a sold unit, the action is „Вижте свободните на етажа“.
  - `list options`: Вид offers „2-стаен“ and „3-стаен“ only, Етаж offers 2 to 10, the meta reads „от 144“, and the GR footnote is absent.
  - `block grid 8 × 9`: 72 squares in rows from 10 down to 2; „А-101“ sits in the bottom row's first cell; ↑ from the top row stays put (the clamp).
  - `no stale notice for dated data`: `StaleNotice` on the Многофамилна project renders nothing for the snapshot, even when Golden Residence's origin is 'built-in'.
  - `a unit's inquiry presets Многофамилна`: the unit panel's „Изпратете запитване“ calls `presetInquiry` with `{ option: 'mnogofamilna', pick: { project: 'mnogofamilna-sgrada', label: 'А-802' } }`.
- [ ] **Step 3: Write the failing inquiry tests.**
  - `InquiryForm.test.jsx`, `picks show and go only with their project`:
    - preset a Многофамилна pick with option `mnogofamilna`: the chip „Апартамент А-802“ shows, and the lead's `projectType` ends „– А-802“;
    - choose Golden Residence: the chip is hidden and the lead carries no pick;
    - choose Многофамилна again: it is back;
    - a Golden Residence pick (`golden-residence`, „А 301“) is never sent with the `mnogofamilna` option.
  - `inquiryStore.test.js`: the `mnogofamilna` options are in that order; `presetInquiry` dedupes picks by project and label.
- [ ] **Step 4: Run** `npm test -- src/explorer src/components/inquiry`. Expected: the new cases FAIL, and the existing ones PASS.
- [ ] **Step 5: Implement.**
  - **The provider takes the project, and every GR binding goes.**
    - Module-level imports of Golden Residence's map, facts and plans become reads of `useExplorer().project`, or of a prop where a component sits outside the provider.
    - Per-project values are memoised, because `useHotFloor` depends on stable identities (map §1, risks).
  - **The facade's geometry stays in CSS variables.** Golden Residence's values in `explorer.css` remain the defaults; another project overrides them under `project.facade.className`.
  - **Golden Residence callers pass `GR_PROJECT`.**
  - **FR7 (CSS only):** the list's table fits from 320 px.
- [ ] **Step 6: Run** `npm test`. Expected: PASS, including every existing Golden Residence test, unchanged except for G1 updates you list.
- [ ] **Step 7: Prove Golden Residence is unchanged.**
  - Run `npm run build`.
  - Diff the four pages against `<scratch>/m3/t2-before/`, ignoring hashed asset names. Expected: no other difference. Explain any you cannot remove.
  - Run `npm run check:dist`. Expected: OK, with `/projects/golden-residence` at or below its Task 0 figure.
- [ ] **Step 8: Commit,** listing the paths you changed.

```bash
git commit -m "refactor(explorer): one engine for both projects; picks carry their project"
```

---

### Task 3: Многофамилна's images and the lights-off twin

**Files:**
- Create: `scripts/images/mn-lights-off.mjs`
- Create: `src/assets/mnogofamilna/mn-dusk-off-2400.webp` (generated by the script, committed as the pipeline's source)
- Modify: `scripts/images/sources.json`, `src/data/images/*.json` (rewritten by `npm run images`), `public/img/` (outputs), `package.json` (script `mn-lights-off`), Home's import of `mn-dusk`
- Test: `scripts/images/mn-lights-off.test.mjs`

**Interfaces:**
- Produces image ids (kebab-case, F7), by manifest group:
  - **`mn-night`:**
    - `mn-dusk`, the lit render, moved here from `home` with its source and widths unchanged;
    - `mn-dusk-off`, the twin, with the same widths.

    Both Home and the Многофамилна routes import this group.
  - **`mnogofamilna`:**
    - photos: `mn-front` (photo-1), `mn-persp` (photo-2), `mn-block-a` (photo-3) and `mn-block-b` (photo-4);
    - drawings: `mn-plan-drawing` (building-all-floors-architecture, from the 1748×900 png) and `mn-garages` (building-garages).

    Widths go no wider than each source. The unused `mnogofamilna-sgrada1` entry and its outputs are removed.
  - **`mn-plans`:**
    - `mn-plan-line`, the dark line-art plan: a `copy` entry from the concept's `img/mnogofamilna/plan-mn.webp`, 2400×1236;
    - one `mn-apt-<id>` per own plan that maps a real apartment (spec §2: not А-858 or А-864), from `src/assets/продажби/project 1/apartment-*`.

    Only lazy code imports this group.

- [ ] **Step 1: Write the failing test** in `mn-lights-off.test.mjs`. It runs the script's exported `makeTwin(src, out)` on the lit source into a temp file and checks:
  - `the twin keeps size and alignment`: same width and height as the source;
  - `it changes only windows inside the building`: the pixels that differ are between 1 % and 12 % of the image, and none lies in the top 8 % (sky) or the bottom 6 % (street);
  - `lit windows become dark glass`: the mean luminance of the changed pixels falls by at least 40 %.
- [ ] **Step 2: Run** `npm test -- scripts/images/mn-lights-off.test.mjs`. Expected: FAIL.
- [ ] **Step 3: Write the script** (spec §6.3). It reads the lit render's source (`sources.json`'s `mn-dusk` src).
  - It finds the warm, bright window pixels inside the building's two towers, using a mask limited to the towers' bands (x 70–516 and 700–1146 on the 1200 grid, scaled).
  - It repaints them in the unlit-glass tone sampled from the same image.
  - It writes the twin, and a mask preview to `<scratch>/m3/twin/`.
  - Lamp glow and the courtyard gap must not read as lit windows.
- [ ] **Step 4: Run the test** (expected: PASS). Then run `npm run mn-lights-off` and `npm run images`.
- [ ] **Step 5: Look at the twin.**
  - Save to `C:/ksm-stroy/design/2026-11-16-m3-shots/twin/`:
    - the lit render and the twin side by side;
    - the twin with the lit render shown only through the bands of А-2, А-9, Б-2–5 and Б-7–9 (one composite);
    - a crop at 100 % of each tower.
  - Check by eye: no lit window remains outside those bands, no window inside them is dark, and the glass reads as glass. Iterate until it does.
  - Name the files in the report.
- [ ] **Step 6: Point Home at `mn-night`.** Run `npm test` (expected: PASS, Home's tests unchanged) and `npm run build && npm run check:dist` (expected: OK; `/` within its figure ± 100 B).
- [ ] **Step 7: Commit,** with `git add` of the script, the twin source, `sources.json`, the manifests, the new and removed `public/img` files, `package.json` and Home's import.

```bash
git commit -m "feat(images): Многофамилна's lights-off twin, photos, drawings and plans"
```

---

### Task 4: The Многофамилна page, part 1: the explorer opening, the dialogs, the list and the inquiry

After this task `/projects/mnogofamilna-sgrada` is a v2 page. It opens on its own explorer, with the night facade and its lit floors, followed by „Всички 144 апартамента“ and the inquiry. The legacy page goes.

**Files:**
- Create: `src/routes/mnogofamilna.jsx`; `src/pages/mnogofamilna/MnHero.jsx`, `MnList.jsx` and `mn.css`; `src/explorer/FacadeLights.jsx`; `src/explorer/mn-facade.css`
- Modify:
  - `src/routes.js`;
  - `src/explorer/projects/mn.js` (the facade fields, the plans, the own plans);
  - `src/explorer/Facade.jsx` (`project.facade.Lights`, the phone crops per project);
  - `UnitPanel.jsx` (the own-plan switch), `PlanSvg.jsx` and `PlanStage.jsx` (the project's drawing and its opacity);
  - `ExplorerContext.jsx` (focus returns to `#spisak` rows; `?view=list` scrolls to `#spisak` when the page has it);
  - `scripts/check-dist.mjs` (MUST_BE_V2 adds `/projects/mnogofamilna-sgrada`);
  - `scripts/smoke/smoke.mjs` (the visits);
  - `src/shell/shell.test.jsx` (the HANDLES row);
  - `src/routes.test.jsx` (the Многофамилна main page's row);
  - `src/pages/legacy.prerender.test.jsx` and `legacy.focus.test.jsx` (their Многофамилна main page rows go).
- Delete: `src/components/MnogofamilnaBlockSelection.jsx`
- Test: `src/pages/mnogofamilna/mn.prerender.test.jsx`, `mn.hydration.test.jsx`, `mn.test.jsx`, `mn.css.test.js`; `src/explorer/FacadeLights.test.jsx`; the own-plan cases in `UnitPanel.test.jsx`

**Interfaces:**
- Consumes:
  - Task 2's `MN_PROJECT`, `ExplorerProvider` and the inquiry's `mnogofamilna` variant;
  - Task 3's `mn-night`, `mnogofamilna` and `mn-plans` images;
  - Task 1's `MN_FACTS`.
- Produces:
  - **The route module:** default, `handle` and `meta`.
    - `handle` is Golden Residence's shape, with header `'solid'`, `project: 'mnogofamilna-sgrada'`, the project's name, and `inquiry: true`.
    - `meta` is `pageMeta` with title „Многофамилна жилищна сграда - KSM Stroy“ and production's description.
  - **The section ids, in order:** `#explorer`, `#spisak`, `#kontakti` (holding `#zapitvane`). Task 5 inserts `#blokove` after `#explorer`, and `#sgradata` and `#galeriya` after `#spisak`.
  - **`FacadeLights({ model, project })`.** For each floor with at least one free apartment, it renders the lit render clipped to that floor's band, in both blocks. It is marked `aria-hidden`. Each lit floor carries `data-lit="Б-9"` (its floor key).

- [ ] **Step 1: Write the failing tests.**
  - **`mn.prerender.test.jsx`:**
    - one H1, whose text is „Многофамилна жилищна сграда“ (whitespace normalised);
    - the address with its no-break spaces;
    - the facts „144“ and „16“ with „по данни към 01.12.2025“;
    - 18 rails, of which Б-9 reads „Блок Б, етаж 9“ with its count;
    - exactly 9 `[data-lit]` floors: А-2, А-9, Б-2, Б-3, Б-4, Б-5, Б-7, Б-8, Б-9;
    - the section ids in order;
    - the inquiry's subject preselected as Многофамилна;
    - no inline opacity, transform, clip, visibility or zero size;
    - only the preloads the page uses at load.
  - **`mn.hydration.test.jsx`:** zero recoverable errors and zero `console.error` for `/projects/mnogofamilna-sgrada`, `?floor=Б-5`, `?unit=А-802` and `?view=list`.
  - **`mn.test.jsx`** (`renderSiteAt` with `goOffline`):
    - „Запитване“ presets Многофамилна and glides to `#zapitvane`;
    - „По критерии“ goes to `#spisak`;
    - `?floor=Б-5` opens the dialog named „Блок Б · Етаж 5“, and its meta includes „по данни към 01.12.2025“;
    - `?unit=А-802` opens А-802's panel, with the own-plan switch if А-802 is mapped;
    - the list shows „144 от 144“ and 16 free;
    - the page adds no preload in the browser.
  - **`mn.css.test.js`:** `firstViewportMotionProblems` passes for the hero and the lights. The lights' keyframes start dark only under `:root.js` inside `no-preference`, with `var(--arrive)`. No `vh` or `svh`.
  - **`FacadeLights.test.jsx`:** a model with free units on А-2 and Б-9 only gives two `[data-lit]` floors; a model with none gives none.
  - **`UnitPanel.test.jsx`, `the own-plan switch only for mapped ids`:** a mapped id shows „План на етажа“ and „План на апартамента“, and switching changes the caption. An unmapped id shows no switch.
- [ ] **Step 2: Run** `npm test -- src/pages/mnogofamilna src/explorer`. Expected: FAIL.
- [ ] **Step 3: Implement the page** (spec §6.1–§6.4; match `mnogofamilna.html` and its shots `mnogofamilna-1440-first`, `-hover-b9`, `-stage`, `-unit-own`, `-390-facade` and `-390-sheet`).
  - **The opening.**
    - The H1 is authored with masks by hand, as Home's slogan is, reading across the seam.
    - The facts, the address and the actions follow.
    - The facade uses `MN_PROJECT` with `mn-facade.css`: the geometry of spec §6.3, the crops, the edge fades and the lens over the block's band. Its alt text is „Фасада на Многофамилна жилищна сграда“.
    - Its lights switch on once, bottom to top, both blocks together, 0.55 s each and 0.11 s apart.
    - The caption has its desktop and touch variants, switched by CSS.
  - **The phones.** The block switch and its crops; the first tap previews and the second opens; the sheet stays open while the page scrolls (ruling, spec §6.3).
  - **The dialogs.**
    - The stage draws `mn-plan-line` at .42 (mini) and .55 (stage), with the date in its meta and „тавански етаж“ on floor 10.
    - The unit panel has the own-plan switch and the date line, and no Идеални part.
  - **`#spisak`.** The hinge „Всички 144 апартамента“ with its lead „По данни към 01.12.2025. Продадените остават в списъка.“, then the lazy list. It loads as the section nears, or at once on „По критерии“ or `?view=list`. No visible content shifts.
  - **`#kontakti`:** `<InquirySection page="mnogofamilna" />`.
  - **The bookkeeping.**
    - Route the URL here and delete the legacy module.
    - Add the route to MUST_BE_V2.
    - Update the HANDLES row and the `routes.test.jsx` row, and list both (G1).
    - Add smoke visits: `/projects/mnogofamilna-sgrada?floor=Б-5` expecting the dialog „Блок Б · Етаж 5“, and `?unit=А-802` expecting А-802's panel. Both landings keep the EU row in view.
- [ ] **Step 4: Run the tests.** `npm test` (expected: PASS). `npm run build && npm run check:dist` (expected: OK, with `/projects/mnogofamilna-sgrada` at most 160 KiB and Golden Residence at most its Task 0 figure). `npm run smoke` (expected: PASS). Report Многофамилна's first-load figure.
- [ ] **Step 5: Capture the page** at 1440 and 390 into `C:/ksm-stroy/design/2026-11-16-m3-shots/`: the first screen, a floor hovered with its panel, the stage, a unit with its own plan, the phone facade and the phone sheet. Compare them with the concept's shots of the same names, and list any difference you keep, with its reason.
- [ ] **Step 6: Commit,** with the paths above.

```bash
git commit -m "feat(mnogofamilna): the page opens on its explorer, with the lit night facade"
```

**Preview:**
- „Многофамилна's page is new: it opens on the night facade, where the floors with free apartments light up (data from 01.12.2025). Hovering a floor shows its plan; clicking opens it.
- Below come all 144 apartments and the inquiry form.
- Still to come: the blocks, the building and the gallery sections (next task), and the block pages. The block pages are still the old design.“

---

### Task 5: The Многофамилна page, part 2: the blocks, the building, the gallery, and Home's link

**Files:**
- Create: `src/pages/mnogofamilna/MnBlocks.jsx`, `MnBuilding.jsx` and `MnGallery.jsx`; `src/components/gallery/Spreads.jsx` and `spreads.css`
- Modify:
  - `src/pages/golden-residence/GallerySection.jsx` (it becomes a thin wrapper over `Spreads`), and `gr.css` (its gallery rules move into `spreads.css`);
  - `src/routes/mnogofamilna.jsx`;
  - `src/pages/home/SplitHero.jsx` with its tests (the Многофамилна half);
  - `src/pages/mnogofamilna/mn.css`.
- Test: the prerender, behaviour and motion cases below; `src/pages/golden-residence/*` stay green.

**Interfaces:**
- Consumes: Task 2's generalised `BlockGrid`; Task 3's `mnogofamilna` images; Task 1's `MN_FACTS`.
- Produces: `Spreads({ id, headingId, heading, lead?, spreads })`, where each spread is `{ left: { image, alt, caption? }, right: { ... }, whole?: boolean }`. A `whole` spread shows drawings uncropped on umber. Golden Residence's gallery renders through it, with its output unchanged.

- [ ] **Step 1: Write the failing tests.**
  - **`mn.prerender.test.jsx`:**
    - the section ids in order are `#explorer`, `#blokove`, `#spisak`, `#sgradata`, `#galeriya`, `#kontakti`;
    - `#blokove` holds two grids of 72 squares with the legend's counts and the types line, and „Преглед на блока“ links to both block pages;
    - `#sgradata` holds „С магазини и подземни гаражи“, production's description without „10 етажа“ or „9 етажа“, the УПИ address, and the facts 2 / 9 / 144 / 8 with the area range from `MN_FACTS`;
    - `#galeriya` holds three spreads, the third showing the two drawings uncropped, under production's titles.
  - **`mn.test.jsx`:** a square in `#blokove` opens its unit panel; Enter on a focused square does the same (T8a).
  - **`home.test.jsx` and `home.prerender.test.jsx`:** the Многофамилна half's action is „Изберете апартамент“, a link to `/projects/mnogofamilna-sgrada`; its dated count is unchanged.
  - **`mn.motion.test.jsx`:** the reveals of the sections below the fold run only below the fold (`recordingMotion`, as `gr.motion.test.jsx` does).
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §6.2 items 2, 4 and 5, and §6.6; match `mnogofamilna-1440-blocks`, `-building` and `-gallery`, and `-390-blocks`, `-building` and `-gallery`).
  - **`#blokove`:** the lead with production's „Изберете блок за преглед“.
  - **`#sgradata`:** the perspective photo graded to the night palette by CSS.
  - **`#galeriya`:** the spreads in the order Блок А + Блок Б, the front + the perspective, then the drawings.
  - **Home's half** uses the doors (no hero move).
- [ ] **Step 4: Run** `npm test` (expected: PASS, with Golden Residence's gallery tests unchanged), `npm run build && npm run check:dist` (expected: OK, every route in budget) and `npm run smoke` (expected: PASS).
- [ ] **Step 5: Capture** the new sections at 1440 and 390 into `2026-11-16-m3-shots/`, and compare them with the concept's.
- [ ] **Step 6: Commit,** with the paths above.

```bash
git commit -m "feat(mnogofamilna): the blocks, the building and the gallery; Home's half opens the page"
```

**Preview:**
- „Многофамилна's page is complete: the facade explorer, both blocks apartment by apartment, the list, the building, the gallery and the inquiry.
- Home's Многофамилна half now opens that page.
- The block pages are still the old design (next task).“

---

### Task 6: The block pages, and the legacy Многофамилна code removed

**Files:**
- Create: `src/pages/mnogofamilna/MnBlockPage.jsx`, `FloorRows.jsx`, `mn-block.css`
- Modify:
  - `src/routes/mnogofamilna-block.jsx` (the new page; the handle as the main page's; meta „Многофамилна сграда, блок А - KSM Stroy“);
  - `src/explorer/Facade.jsx` (a `mode="block"`: one block's crop and one rail, with no panels, sheet, seam or block names, and a hot floor driven from outside through `hotKey` and `onHot`);
  - `scripts/check-dist.mjs` (MUST_BE_V2 adds both block routes);
  - `scripts/smoke/smoke.mjs`;
  - `src/shell/shell.test.jsx`, `src/routes.test.jsx` (the block titles, and the 'БЛОК B' case becomes the new page's „Многофамилна сграда, блок Б“), and the legacy tests' remaining Многофамилна rows.
- Delete: `src/components/MnogofamilnaSingleBlock.jsx`. Keep `FourTowersFloorMap.jsx`, `buildingImages.js` and `apartmentImages.js`, because `Projects.jsx` imports them until M4.
- Test: `src/pages/mnogofamilna/mn-block.prerender.test.jsx`, `mn-block.hydration.test.jsx`, `mn-block.test.jsx`, `mn-block.css.test.js`, `mn-block.motion.test.jsx`

**Interfaces:**
- Consumes: Tasks 2–4's engine, `MN_PROJECT`, the facade and `FacadeLights`; `FloorMeta`, `FloorCounts` and `FloorRange` from `FloorPanel.jsx`; `PlanSvg` in `mini` mode.
- Produces: `MnBlockPage({ block: 'А' | 'Б' })`. Б is rendered mirrored by a class on the page root, not by different markup.

- [ ] **Step 1: Write the failing tests.**
  - **`mn-block.prerender.test.jsx`** (for both blocks):
    - one H1 „Многофамилна сграда, блок А“ (and Б);
    - the back link „Към Многофамилна сграда“;
    - „72 апартамента · 9 етажа (2–10) · 8 на етаж“ with the legend and the date;
    - nine rows from 10 down to 2, each with its floor number, counts, a mini plan of 8 units in status colours, and the range line or „Разпродаден етаж“. Floor 10 reads „тавански етаж“;
    - the facade crop of its own block, with that block's lit floors only;
    - `#kontakti` at the foot.
  - **`mn-block.hydration.test.jsx`:** clean for `block-a`, `block-b`, `block-a?floor=7` and `block-b?unit=Б-702`.
  - **`mn-block.test.jsx`:**
    - focusing a row's „Отворете плана“ marks that floor hot on the facade, through the same hot state hovering uses;
    - activating it opens the stage for that floor;
    - a bare `?floor=7` opens floor 7 of this block;
    - `?floor=1` and `?floor=11` open nothing;
    - focus returns to the row's action when the stage closes.
  - **`mn-block.motion.test.jsx`:** on a desktop (fine pointer, min-width 901) the row crossing the middle of the screen becomes hot through the ScrollTrigger setup. No setup runs on a coarse pointer.
  - **`mn-block.css.test.js`:** the facade half is sticky only from 901 px; the mirror class swaps the halves; no `vh`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement** (spec §6.5; match `mnogofamilna-block-a.html` and the shots `mnogofamilna-block-a-1440-first`, `-floors-mid`, `-row-hover`, `-stage`, `mnogofamilna-block-b-1440-floors` and `mnogofamilna-block-a-390-floors`).
  - Delete the legacy module.
  - Update the contract rows listed above, and list them (G1).
  - Add smoke visits for both block pages and `block-a?floor=7`, which expects the dialog „Блок А · Етаж 7“.
- [ ] **Step 4: Run** `npm test`, `npm run build && npm run check:dist` and `npm run smoke`. Expected: PASS and OK, with both block routes at most 160 KiB.
- [ ] **Step 5: Capture** both block pages at 1440 and 390 into `2026-11-16-m3-shots/`.
- [ ] **Step 6: Commit,** with the paths above.

```bash
git commit -m "feat(mnogofamilna): the block pages as ledgers of floors; the legacy pages go"
```

**Preview:**
- „Многофамилна is fully new: its page and both block pages.
- A block page lists every floor with its plan in colour beside the block's lit facade. Hovering a floor lights it; clicking opens it.
- Everything else not yet rebuilt (Продажби, Обекти, За нас, Контакти) still has the old look until M4.“

---

### Task 7: Verification, the leftovers, speed figures, and the hand-off

**Files:**
- Modify: `scripts/smoke/smoke.mjs` (Многофамилна's explorer steps); `src/explorer/explorer.css` (FR8); `src/explorer/ExplorerContext.jsx` (FR9, if the bytes allow)
- Create: `docs/superpowers/notes/2026-11-16-m3-results.md`
- Test: the smoke steps; `ExplorerContext.load.test.jsx` (FR9); `explorer.css.test.js` (FR8)

- [ ] **Step 1: Add Многофамилна's explorer steps to the smoke run,** mirroring Golden Residence's (`EXPLORER` in `smoke.mjs`):
  - a real mouse over Б-9 shows its edge panel, and a click opens the stage;
  - Tab reaches the rails, and the arrows move between floors with the lens;
  - on the phone, the first tap on a rail shows the sheet and the second opens the stage;
  - the deep link `?floor=А-9` lands with the EU row in view.
- [ ] **Step 2: FR8 (CSS).** Under text spacing at 360×640 and smaller, the stage's side column keeps its height, without changing the layout for anyone else. Add a CSS test for the rule.
- [ ] **Step 3: FR9.**
  - Write the failing test first: `ExplorerContext.load.test.jsx`, `re-opening the same floor retries a failed surfaces load`.
  - Implement only if check:dist still passes with Golden Residence at most its Task 0 figure. Otherwise leave it, and say so in the report.
- [ ] **Step 4: Run** `npm run verify`. Expected: PASS. Note the test count, check:dist's figures for every route, and the smoke's duration.
- [ ] **Step 5: Measure** over HTTP/2: `npm run build`, then `npm run perf -- /projects/mnogofamilna-sgrada /projects/mnogofamilna-sgrada/block-a /projects/golden-residence /projects/golden-residence/block-a /`.
  - Record LCP, CLS, TBT and the bytes before LCP.
  - Name the LCP element of each Многофамилна route.
  - In M3 these figures are reported, not gated (spec §10). Golden Residence must not regress beyond run-to-run noise against Task 0's run.
- [ ] **Step 6: Write the results note** `docs/superpowers/notes/2026-11-16-m3-results.md`:
  - what was built;
  - first-load JS per route against `01eac18`;
  - the perf figures and what M4's speed round must do about any miss;
  - the twin captures;
  - the deviations from the concept you kept;
  - the open items for the user.
- [ ] **Step 7: Complete the user's capture set** in `C:/ksm-stroy/design/2026-11-16-m3-shots/`, adding the steps above, at 1440 and 390. Then write a `README.txt` there listing each file in one line.
- [ ] **Step 8: Commit,** with the paths you changed.

```bash
git commit -m "test(mnogofamilna): the explorer's smoke steps, FR8 and FR9, and the M3 results"
```

**Preview:**
- „M3 is done: Многофамилна, its explorer and both block pages are in the new design, checked by the full test and smoke runs.
- The captures are in C:\ksm-stroy\design\2026-11-16-m3-shots.
- Speed figures are in the results note. Any miss goes into M4's speed round.“
