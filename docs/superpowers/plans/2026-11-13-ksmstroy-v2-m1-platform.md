# ksmstroy.com v2 — M1 Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `redesign-v2` onto the platform every v2 page will stand on:
- prerendered HTML through React Router 8 framework mode;
- hydration-safe hooks;
- a deferred GSAP/Lenis runtime;
- KSM's tokens, fonts and logo;
- the shared primitives;
- the image pipeline;
- the same-origin availability API;
- the new shell (EU line, header, menu, footer, 404, EU page);
- per-route SEO.

The legacy production pages keep working inside the new shell until M2–M4 replace them.

**Architecture:**
- `react-router.config.js` runs with `ssr: false` and prerenders every concrete path. `src/root.jsx` owns the document head, the shell, a keyed `<ViewTransition>` outlet and the motion runtime.
- Motion code never sits in first-load JS. Components queue setups through `useMotion`, which loads `src/motion/engine.js` (GSAP + plugins + Lenis) after first paint.
- Live availability comes from `api/availability.js`, a Vercel Function in the same origin, into a `useSyncExternalStore` store whose server snapshot is a placeholder.

**Tech Stack:**
- React 19.3, React Router 8.5 (framework mode, `@react-router/dev`);
- Vite 7, Tailwind 3.4;
- GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3;
- Vitest 4 + Testing Library + jsdom;
- sharp; puppeteer (smoke tests);
- Node 24.x;
- Vercel.

**Spec:** `docs/superpowers/specs/2026-11-13-ksmstroy-redesign-v2-design.md` (rev. 2). Read §3, §5, §6, §8.1 and §10 before any task.

**Evidence the plan relies on:**
- the React Router spike report: `docs/superpowers/notes/2026-11-13-rr8-spike.md` (copied in by Task 1), with its full diff at `<scratch>/spike/spike-rr.patch` and tools at `<scratch>/spike/tools/`;
- asset outputs in `<scratch>/assets/{fonts,logo}/`.

`<scratch>` = `C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad`.

## Global Constraints

**Where to work**
- Work only in `C:/ksm-stroy/ksm-stroy-v2`, on branch `redesign-v2`. Never touch `C:/ksm-stroy/ksm-stroy` (production checkout on `main`) or `C:/ksm-stroy/golden-residence`, except to read them.
- Never push. The orchestrator pushes `redesign-v2` itself in Task 12; the user approved that one branch only.

**Commits**
- Conventional messages.
- Trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Stage explicit paths.
- The full suite (`npm test`) and `npm run build` pass at every commit.

**Toolchain**
- Node `engines`: `"24.x"`; `.nvmrc` `24`.
- `react` and `react-dom` `^19.3.1`; `react-router`, `@react-router/dev` and `@react-router/node` `^8.5.1`; `isbot` `^5` (it must be listed, or the build silently runs `npm install isbot`).
- npm 11.4.2 crashes on fresh peer resolution. Add packages with `--legacy-peer-deps`, then run a plain `npm install`, and never delete `package-lock.json`.

**Contract tests**
- The contract tests in `tests/contracts/` must stay green. They pin the production behaviour:
  - Блокиран;
  - the EU section, with `BG16RFPR001-1.012-1485-C01` and `/eu/plakat-ksm-stroy-a3.pdf`;
  - the Contact payload `{name, email, phone, projectType, budget, message}`;
  - every URL;
  - `/projects/1` → `/projects`.
- Change them only where a task says so.

**Final state in HTML**
- Prerendered HTML is the final visual state. Never render `opacity: 0`, `initial` motion states or "visible after onLoad" classes into markup.
- Browser-only values (matchMedia, sessionStorage, the query string, pointer type) never change the first client render (spec §6.2).

**GSAP and Lenis**
- `gsap`, `gsap/*`, `@gsap/react` and `lenis` are imported only inside `src/motion/`.
- First-load JS per route ≤ 160 kB gz; the motion chunk ≤ 60 kB gz (spec §10).

**Tokens** (exact values, spec §3.1)

| Token | Value |
|---|---|
| `paper` | `#F1F2EF` |
| `ink` | `#14202F` |
| `dusk` | `#1F3A63` |
| `light` | `#F5D88F` |
| `gold-ink` | `#7A6336` |
| `graphite` | `#4A5462` |
| `rule` | `#CBD0D4` |
| `bronze-ink` | `#7A6549` |
| `status-free` | `#3F8F55` |
| `status-free-deep` | `#2F6E41` |
| `status-reserved` | `#C9962E` |
| `status-sold` | `#B23A30` |
| `status-blocked` | `#7A828C` |

**Copy rules**
- Copy comes from production (`main`).
- The interface microcopy listed in each task is exact.
- No ALL-CAPS tracked labels, no italic accent words, no `→` except on primary actions (spec §3.2–3.3).

**Site facts** (exact, from production, used by header, footer, contact and JSON-LD)
- Legal name: `КСМ СТРОЙ ООД`. Brand in text: `КСМ Строй`.
- Phones: `+359 887 886 166` (primary), `+359 885 762 224`.
- Email: `ksm_str@abv.bg`.
- Offices: `гр. София, ж.к Връбница 1, блок 537А, етаж 9, ап.38` and `гр. Гоце Делчев, ул. Кирил и Методий 17, вх. Б, ет.1`.
- Hours: `Пн–Пт 8:00–18:00`, `Сб 9:00–14:00`, `Нд почивен ден`.
- Facebook: `https://www.facebook.com/ksm.stroi/`.
- Canonical origin: `https://www.ksmstroy.com`.

## Review Focus

1. **Deep links with a query string** (`/projects/golden-residence/block-a?floor=3&unit=А%20301`, `/contact?apartment=А%20301`) must hydrate with no error and then show the query state. Pinned in Task 2 (`useHydrated` test) and Task 12 (smoke deep-link routes).
2. **Trailing-slash and direct loads** (`/about/`, `/projects/golden-residence/`) must reach the right page with no hydration error #418. Pinned in Task 1 (`normalizePathname` test) and Task 12 (smoke direct-load list).
3. **Sheets unreachable or one source failing:**
   - counts show the placeholder and then either the data or the dated fallback, never `0` or a spinner forever;
   - the agency site's sheets stay untouched.

   Pinned in Task 11 (`partial failure` and `api down → direct fetch` tests).
4. **In-app browsers and refused autoplay:**
   - a resizing toolbar must not move content (`--screen-h` written before first paint);
   - a rejected `play()` leaves a poster with no control.

   Pinned in Task 2 (screen-height script test) and Task 7 (`VideoBand refused play` test).
5. **Reduced motion and Save-Data:**
   - no Lenis and no GSAP chunk download;
   - every element present and static;
   - view transitions disabled.

   Pinned in Task 3 (`does not load the engine when motion is not allowed`) and Task 7 (static render tests).

---

### Task 0: Foundation fixes from the M0 review

The review is at `<scratch>/design/foundation-review.md`. It found no production regression, but there are gaps in what the contract tests protect, plus small defects.

**Files:**
- Create: `tests/contracts/availability.test.jsx`.
- Modify:
  - `src/utils/units.js` (+ `units.test.js`);
  - `src/utils/availability.js` (+ test);
  - `src/context/ApartmentContext.jsx` (+ test);
  - `src/services/googleSheets.js` (+ test);
  - `scripts/check-dist.mjs`;
  - `GOOGLE_SHEETS_SETUP.md`;
  - `src/components/explorer/useZoomPan.js` (+ test);
  - `eslint.config.js`;
  - `src/utils/lenis.js` and `src/hooks/useScrollLock.js` (+ tests).

**Interfaces:**
- Produces:
  - **Units:** `toApartment(row, block)` and `toParkingUnit(row, kind)` units carry `statusText: string` (= `normalizeStatus(raw)`) beside `status` (= `statusKey(raw)`). `unitButtonLabel(unit)` uses `statusText` when `status === 'unknown'`.
  - **Scroll locks:** `acquireScrollLock(): void` and `releaseScrollLock(): void` in `src/utils/lenis.js`. Lenis stops on the first acquire and starts on the last release.
  - **Tap tolerance:** `TAP_TOLERANCE = { mouse: 4, touch: 8, pen: 6 }` px, Euclidean distance, in `useZoomPan.js`.

- [ ] **Step 1: Write `tests/contracts/availability.test.jsx`.** This contract must keep holding for the v2 explorer in M2, so it asserts text and roles only.
  - Use `vi.stubEnv` with fake URLs for `VITE_GOOGLE_SHEET_BLOCK_A`, `_GARAGES` and `_PARKING`, and stub `fetch` to return a Block А CSV whose floor 3 holds the units `А 301` `Блокиран`, `А 302` empty, `А 303` `Скоро` and `А 304` `Продаден`, plus small garage and parking CSVs.
  - Render `/projects/golden-residence/block-a` and open floor 3 through its visible control.
  - Assert:
    - the floor's units show the status texts `Блокиран`, `Свободен`, `Скоро` and `Продаден`/`Продадени`;
    - activating `А 301` offers no `Изпратете запитване` / `Запитване` action;
    - a `Блокирани` count of `1` is visible.
  - Mutation-check it by hand: removing the Блокиран legend/count, or making Блокиран units inquirable, must turn it red. Revert afterwards.
- [ ] **Step 2: Keep the status text (finding 3).**
  - Update `units.test.js` (the old lines 35 and 132): a `Скоро` row keeps `statusText: 'Скоро'`, `status: 'unknown'`, and its button label contains `Скоро`.
  - `matchesFilter(unit, { onlyAvailable: true })` still rejects `unknown`.
  - Implement, and run `npx vitest run src/utils` → PASS.
- [ ] **Step 3: Fix the sheets guards and refresh (findings 5 and 6).**
  - Garages and parking keep only rows with a non-empty `Номер`, and a source whose header lacks `Номер` or `Статус` is a failure. Test with the existing `HTML_ERROR_PAGE` as a multi-line body.
  - Unconfigured sheets are skipped silently: no console log.
  - `ApartmentContext` normalises the Многофамилна fallback through the same transform as sheet rows (statuses via `normalizeStatus`, floor key 0 dropped) and loads it with `import()`.
  - Replace the 60 s polling with a refresh when the tab becomes visible and the data is older than 60 s.
  - Add a test: a failed refresh of Block А keeps the last good rows.
- [ ] **Step 4: `check:dist` and lint (findings 4 and 11).**
  - Decode text files (`.html .js .css .json .txt .xml .svg`) as UTF-8.
  - Match the separators `[\s.\- ]`, written as escapes in the source.
  - Add a planted-file self-check with non-breaking spaces.
  - Lint `**/*.mjs` with Node globals.
- [ ] **Step 5: Tap tolerance and nested scroll locks (findings 8 and 12).**
  - Test: a 6 px touch drift on a zoomed plan selects the unit; a 12 px drift pans.
  - Test: two overlapping `useScrollLock` holders, where releasing the inner one keeps Lenis stopped.
  - Implement both.
- [ ] **Step 6: Docs (finding 7).** In `GOOGLE_SHEETS_SETUP.md`, mark the Многофамилна-sheets and Цена sections "Takes effect with the new site (redesign v2)".
- [ ] **Step 7:** Run `npm test`, `npm run build` and `npm run check:dist` → PASS. Commit in two parts: `test(contracts): pin the Блокиран UI, unknown statuses and the live-sheet path`, then `fix: M0 review findings (status text, sheet guards, refresh, check:dist, tap tolerance, scroll-lock nesting)`.

### Task 1: React Router 8 framework mode with prerendering (legacy pages intact)

**Files:**
- Create:
  - `react-router.config.js`;
  - `src/root.jsx`;
  - `src/routes.js`;
  - `src/routes/projects-id-redirect.jsx`;
  - `src/routes/not-found.jsx`;
  - `src/utils/pathname.js` (+ `src/utils/pathname.test.js`);
  - `src/seo/meta.js` (+ `src/seo/meta.test.js`);
  - `docs/superpowers/notes/2026-11-13-rr8-spike.md` (copy of `<scratch>/design/spike-report.md`).
- Modify:
  - `package.json` and `package-lock.json`;
  - `.nvmrc`, `vite.config.js`, `eslint.config.js`, `.gitignore`;
  - `src/index.css`;
  - `src/components/common/Navbar.jsx` (pathname normalisation);
  - `src/components/ui/OptimizedImage.jsx`;
  - `src/components/ui/HeroCarousel.jsx`;
  - `src/pages/Home.jsx`, `src/pages/About.jsx`, `src/pages/Contact.jsx`;
  - `src/pages/Projects.jsx` (no `Math.random` in render);
  - every page and route component, to add `meta`;
  - `tests/contracts/site.jsx`.
- Delete:
  - `index.html`, `src/main.jsx`, `src/App.jsx`;
  - `src/components/common/SEO.jsx`, `src/hooks/useDocumentHead.js` (replaced by route `meta`);
  - `scripts/prerender.js`;
  - devDeps `@vitejs/plugin-react`, `@prerenderer/prerenderer`, `@prerenderer/renderer-puppeteer`, `react-router-dom`.

**Interfaces:**
- Produces:
  - `src/routes.js` default export: the route config. Paths `''` (index), `about`, `projects`, `projects/golden-residence`, `projects/golden-residence/:block`, `projects/mnogofamilna-sgrada`, `projects/mnogofamilna-sgrada/:block`, `projects/:id`, `contact`, `blog`, `*`, plus `dev/tracer` when `import.meta.env.DEV`.
  - `react-router.config.js` `prerender`: the 11 concrete paths from the spike report, plus `'/404'`.
  - `normalizePathname(pathname: string): string`: strips a trailing slash except on `/`.
  - `SITE_URL = 'https://www.ksmstroy.com'` and `pageMeta({ title: string, description: string, path: string, image?: string }): MetaDescriptor[]`. It returns title, description, `og:title`, `og:description`, `og:url`, `og:image`, twitter card and `{ tagName: 'link', rel: 'canonical', href: SITE_URL + path }`.
  - `src/root.jsx` exports `Layout`, `default App`, `ErrorBoundary`, `HydrateFallback` (renders `null`), `meta`, `links`.
  - `tests/contracts/site.jsx` `renderSiteAt(path)`: renders the real route table through `createMemoryRouter`. The root `App` is the root route component, and each child route's module is resolved from `src/routes.js` through `import.meta.glob('/src/**/*.jsx', { eager: true })`. Every contract test keeps calling `renderSiteAt`.

- [ ] **Step 1: Apply the spike's mechanics.** Use `<scratch>/spike/spike-rr.patch` as the reference: dependencies, `react-router.config.js`, `vite.config.js` with the `VITEST` guard, `esbuild.jsx = 'automatic'` and the `optimizeDeps.include` list, the ESLint `allowExportNames`, `.gitignore` `/build` and `/.react-router/`, and removing `html { scroll-behavior: smooth }`. Keep the existing `test` block's `include` patterns and `setupFiles`.
- [ ] **Step 2: Write `src/utils/pathname.test.js`**

```js
it('strips one or more trailing slashes but keeps the root', () => {
  expect(normalizePathname('/about/')).toBe('/about')
  expect(normalizePathname('/projects/golden-residence//')).toBe('/projects/golden-residence')
  expect(normalizePathname('/')).toBe('/')
})
```
Run `npx vitest run src/utils/pathname.test.js` and expect a FAIL (module missing). Implement `normalizePathname` with `pathname.replace(/(.)\/+$/, '$1')`. Run again and expect PASS. Use it for every `pathname` comparison (Navbar active state).
- [ ] **Step 3: Write `src/seo/meta.test.js`**

```js
it('builds a canonical on the live domain', () => {
  const m = pageMeta({ title: 'За нас | КСМ Строй', description: 'd', path: '/about' })
  expect(m).toContainEqual({ title: 'За нас | КСМ Строй' })
  expect(m).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/about' })
  expect(m).toContainEqual({ property: 'og:url', content: 'https://www.ksmstroy.com/about' })
})
it('never appends the brand twice', () => {
  const m = pageMeta({ title: 'КСМ Строй', description: 'd', path: '/' })
  expect(m.find((x) => x.title).title).toBe('КСМ Строй')
})
```
Run, see it fail, implement, then run again and see it pass.
- [ ] **Step 4: `src/root.jsx`, `src/routes.js` and the route modules**
  - **Root:** follow the spike's `root.jsx`, with these differences:
    - no Google Fonts links or `LOAD_FONTS` script (Task 5 adds the self-hosted fonts);
    - keep `CRITICAL_CSS` without the `font-family: system-ui` rule;
    - `LOCAL_BUSINESS` JSON-LD is replaced by `organizationJsonLd()` in Task 10, so keep production's for now but set `url` and `image` to `SITE_URL`;
    - the keyed `RouteTransition` (spike gotcha 9);
    - `ScrollRestoration` plus `LenisScrollSync`, which Task 3 moves into `src/motion/`;
    - keep `ApartmentProvider` around the outlet (the legacy pages need it).
  - **Routes:** `projects/:id` uses `src/routes/projects-id-redirect.jsx`: `clientLoader` returns `redirect('/projects')`; `HydrateFallback` and the default export return `null`. `*` uses `src/routes/not-found.jsx`, a minimal page with `<h1>Тази страница я няма в чертежа.</h1>` (Task 9 designs it).
  - **Page meta:** every page module exports `meta` via `pageMeta`, using production's title and description strings from `src/utils/seo.js`. Delete `SEO.jsx`/`useDocumentHead.js` and their call sites.
- [ ] **Step 5: Make the legacy pages prerender in their final state** (spike gotchas 5, 6, 21):
  - `initial={false}` on the framer page wrappers of Home, About and Contact, and on the About hero;
  - `AnimatePresence initial={false}` in HeroCarousel;
  - `OptimizedImage` priority images start visible, with a post-mount `img.complete && img.naturalWidth > 0` check; use `fetchPriority`;
  - HeroCarousel shows `—` for live numbers while loading;
  - move Projects' `Math.random()` out of render.
- [ ] **Step 6: Rewire `tests/contracts/site.jsx`** to `createMemoryRouter` over the real route table (Interfaces). Run `npm test` and expect all contract tests, including `/projects/1 redirects to /projects`, to PASS.
- [ ] **Step 7: Build and inspect.** Run `npm run build`. Expect:
  - `build/client/{about,projects,contact,blog,...}/index.html` (11 files plus `404/index.html`);
  - each with its page text;
  - Home with the hero `<img ... fetchpriority="high">`.

  Point `scripts/check-dist.mjs` at `build/client`, then run `npm run check:dist` and expect PASS.
- [ ] **Step 8: Commit** `feat(platform): React Router 8 framework mode with prerendered routes`, citing the spike report.

### Task 2: Hydration-safe hooks and pre-paint head scripts

**Files:**
- Modify (rewrite on `useSyncExternalStore`):
  - `src/hooks/useMediaQuery.js`, `useMotionAllowed.js`, `useCoarsePointer.js`, `useFinePointer.js`, and their tests.
- Create:
  - `src/hooks/useHydrated.js` (+ test);
  - `src/utils/headScripts.js` (+ test).
- Modify:
  - `src/utils/screenHeight.js` (export the script source);
  - `src/root.jsx` (inject head scripts).

**Interfaces:**
- Produces:
  - `useMediaQuery(query: string): boolean`: server snapshot `false`, client follows `matchMedia`;
  - `useMotionAllowed(): boolean`: false on the server, without matchMedia, under `prefers-reduced-motion: reduce`, or with `navigator.connection.saveData`;
  - `useCoarsePointer(): boolean` and `useFinePointer(): boolean`: server `false`;
  - `useHydrated(): boolean`: `false` during prerender and hydration, `true` after;
  - `SCREEN_HEIGHT_SCRIPT: string`: an IIFE that writes `<style id="screen-h">:root{--screen-h:<innerHeight>px}</style>` into `document.head`. `screenHeight.js` keeps updating that same style element, never an attribute on `<html>`.

- [ ] **Step 1: Write `src/hooks/hydration.test.jsx`**, which prerenders on the server and then hydrates in jsdom:

```jsx
it('useMotionAllowed hydrates without a mismatch when the browser allows motion', async () => {
  const html = renderToString(<Probe />)              // server: no window.matchMedia → "off"
  installMatchMedia({ '(prefers-reduced-motion: reduce)': false })
  const errors = []
  container.innerHTML = html
  await act(() => hydrateRoot(container, <Probe />, { onRecoverableError: (e) => errors.push(e) }))
  expect(errors).toEqual([])
  expect(container.textContent).toBe('on')             // switched after hydration
})
it('useHydrated is false in the server HTML and true after hydration', ...)
```
`Probe` renders `useMotionAllowed() ? 'on' : 'off'`. Add the same pattern for `useMediaQuery` and `useCoarsePointer`. Run and expect FAIL: today's hooks read `matchMedia` in their initial state, so hydration logs a mismatch.
- [ ] **Step 2: Rewrite the hooks** on `useSyncExternalStore(subscribe, getSnapshot, () => false)`. `saveData` is its own store on `navigator.connection` `change`. Run `npx vitest run src/hooks` and expect PASS.
- [ ] **Step 3: Write `src/utils/headScripts.test.js`.** Evaluate `SCREEN_HEIGHT_SCRIPT` with `new Function` in jsdom, with `innerHeight = 812`. Expect `document.getElementById('screen-h').textContent` to be `:root{--screen-h:812px}` and `document.documentElement.getAttribute('class')` to be `null`. See it fail, implement, see it pass.
- [ ] **Step 4: Inject the script** in `root.jsx` `Layout` as the first child of `<head>` after the meta tags: `<script dangerouslySetInnerHTML={{ __html: SCREEN_HEIGHT_SCRIPT }} />`. Build, then confirm with `grep -c "screen-h" build/client/index.html` (expect ≥ 1).
- [ ] **Step 5: Commit** `fix(platform): hydration-safe media hooks and a pre-paint screen height`.

### Task 3: Deferred motion runtime (`src/motion/`)

**Files:**
- Create:
  - `src/motion/engine.js`: the ONLY module importing `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText` and `lenis`. It registers plugins and `ScrollTrigger.config({ ignoreMobileResize: true })`.
  - `src/motion/runtime.js` (+ test);
  - `src/motion/useMotion.js` (+ test);
  - `src/motion/SmoothScroll.jsx` (+ test), moved from `src/components/ui/SmoothScroll.jsx`;
  - `src/motion/LenisScrollSync.jsx`.
- Modify:
  - `src/root.jsx`;
  - `src/utils/gsap.js`: delete; update importers;
  - `scripts/check-dist.mjs`: per-route first-load JS from `build/client/.vite/manifest.json` or the React Router manifest; a gsap guard.
- Delete: `src/components/ui/SmoothScroll.jsx`, `src/components/ui/SmoothScroll.test.jsx`.

**Interfaces:**
- Consumes: `useMotionAllowed()` (Task 2); `LENIS_OPTIONS` and `createGestureFilter()` from `src/utils/smoothScroll.js`, with `syncTouch: false` (spec §5.1); `setLenis`/`getLenis`/`clearLenis` from `src/utils/lenis.js`.
- Produces:
  - `type Motion = { gsap, ScrollTrigger, SplitText, Lenis }`;
  - `loadMotion(): Promise<Motion>`: memoised `import('./engine.js')`, started on window `load` or on the first `useMotion` call after hydration, whichever is later;
  - `getMotion(): Motion | null`;
  - `scheduleInit(task: () => void): void`: runs queued tasks one per `requestIdleCallback` (`setTimeout(…, 1)` fallback), then calls `ScrollTrigger.refresh()` once when the queue drains;
  - `useMotion(scopeRef, setup: (m: Motion & { lenis: Lenis | null }) => void | (() => void), deps?: any[]): void`. It does nothing when `useMotionAllowed()` is false. Otherwise it loads, then `scheduleInit(() => ctx = gsap.context(() => cleanup = setup(...), scopeRef.current))`, and on unmount calls `cleanup?.()` and `ctx.revert()`.
  - `<SmoothScroll>`: Lenis on `gsap.ticker` (`autoRaf: false`, `lagSmoothing(0)`), created only after `loadMotion()`; `html.lenis` CSS from the spike.
  - `<LenisScrollSync>`: spike version, a layout effect on `location.key` calling `getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true })`, plus `ScrollTrigger.refresh()` after the view transition finishes (`document.getAnimations()` settle or 350 ms).

- [ ] **Step 1: Write `src/motion/useMotion.test.jsx`**

```jsx
vi.mock('./engine.js', () => ({ default: fakeMotion }))
it('does not load the engine when motion is not allowed', async () => {
  render(<Box />)                                   // jsdom: no matchMedia → motion off
  await flushIdle()
  expect(engineImported()).toBe(false)
})
it('runs setup once the engine loads and reverts on unmount', async () => {
  installMatchMedia({ '(prefers-reduced-motion: reduce)': false })
  const { unmount } = render(<Box onSetup={setup} />)
  await flushIdle()
  expect(setup).toHaveBeenCalledTimes(1)
  unmount()
  expect(fakeMotion.contextReverted).toBe(true)
})
it('refreshes ScrollTrigger once after a queue of three setups', ...)
```
Run and expect FAIL. Implement `runtime.js` and `useMotion.js`. Run again and expect PASS.
- [ ] **Step 2: Move SmoothScroll** into `src/motion/`. It now gets Lenis from `engine.js` via `loadMotion()`. Adapt its tests: static passthrough under no motion; Lenis created after the engine resolves (mocked). Mount `<SmoothScroll>` and `<LenisScrollSync>` in `root.jsx`. Run `npm test` and expect PASS.
- [ ] **Step 3: Guard the dist.** `scripts/check-dist.mjs`:
  - computes, per prerendered route, the gzip size of every `<script type=module>` and `<link rel=modulepreload>` in its `index.html`;
  - fails if any route's total exceeds 160 kB, or if any of those files contains `ScrollTrigger` or `SplitText`;
  - reports the motion chunk's size, failing above 60 kB.

  Build, run `npm run check:dist`, and expect PASS with a printed table.
- [ ] **Step 4: Commit** `feat(motion): GSAP and Lenis load after first paint through useMotion`.

### Task 4: Design tokens and base CSS

**Files:**
- Modify:
  - `tailwind.config.js` (add the tokens; keep the legacy palettes until M4; `content` globs include `src/**/*.{js,jsx}`);
  - `src/index.css`.
- Create: `src/styles/tokens.test.js`.

**Interfaces:**
- Produces:
  - Tailwind colours: `paper`, `ink`, `dusk`, `light`, `gold-ink`, `graphite`, `rule`, `bronze-ink`, and `status-{free,free-deep,reserved,sold,blocked}`, with the Global Constraints values.
  - `fontFamily.display: ['"KSM Display"', '"KSM Display Fallback Georgia"', '"KSM Display Fallback Times"', 'serif']` and `fontFamily.text: ['"KSM Text"', '"KSM Text Fallback Segoe"', '"KSM Text Fallback Arial"', 'sans-serif']`. The face names match Task 5's `fonts.css`.
  - `fontSize`, from spec §3.2:

    | Name | Size / line-height |
    |---|---|
    | `body` | 17px / 1.6 |
    | `small` | 14.5px / 1.45 |
    | `label` | 12.5px / 1.4 |
    | `h3` | 24px / 1.25 |
    | `h2` | clamp(34px, 4.2vw, 58px) / 1.06 |
    | `display` | clamp(44px, 7.6vw, 120px) / 0.98 |
    | `count` | clamp(56px, 9vw, 140px) / 0.9 |

  - `borderRadius.ui: '2px'`.
  - Timing functions: `expo-out: cubic-bezier(0.16, 1, 0.3, 1)`, `power3-out: cubic-bezier(0.215, 0.61, 0.355, 1)`.
  - CSS utility `.nums { font-variant-numeric: lining-nums tabular-nums; }`.
  - Base layer:
    - `body { background: theme(colors.paper); color: theme(colors.ink); }`;
    - `:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }`;
    - `.on-dusk :focus-visible { outline-color: theme(colors.paper); }`;
    - `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 1ms !important; transition-duration: 1ms !important; } }`.

- [ ] **Step 1: Write `src/styles/tokens.test.js`.** It imports `tailwind.config.js` and computes WCAG contrast:

```js
expect(contrast(c['gold-ink'], c.paper)).toBeGreaterThanOrEqual(4.5)
expect(contrast(c.graphite, c.paper)).toBeGreaterThanOrEqual(7)
expect(contrast(c.paper, c.dusk)).toBeGreaterThanOrEqual(7)
expect(contrast(c.light, c.dusk)).toBeGreaterThanOrEqual(7)
expect(contrast(c.ink, c.paper)).toBeGreaterThanOrEqual(12)
for (const s of ['status-free-deep', 'status-sold', 'status-blocked'])
  expect(contrast(c[s], c.paper)).toBeGreaterThanOrEqual(3)
```
Run and expect FAIL (tokens missing). Add the tokens. Run and expect PASS. If `gold-ink` fails, darken it until it passes, and record the final hex in the commit body.
- [ ] **Step 2: Add the base layer** to `src/index.css`. Build and expect PASS.
- [ ] **Step 3: Commit** `feat(design): KSM tokens, type scale and base styles`.

### Task 5: Self-hosted fonts with Bulgarian letterforms

**Files:**
- Create:
  - `public/fonts/ksm-display.woff2`, from `<scratch>/assets/fonts/dist/playfair-display.woff2` (50,608 B: Playfair 2.203, opsz pinned at 72, wght 400–560, lining figures frozen, Bulgarian `locl`);
  - `public/fonts/ksm-text.woff2`, from `dist/geologica-text.woff2` (24,624 B: wght 300–600);
  - `public/fonts/OFL-Playfair.txt` and `OFL-Geologica.txt`;
  - `src/styles/fonts.css`, from `dist/fonts.css`, with these renames:

    | Asset family | Renamed to |
    |---|---|
    | `Playfair` | `KSM Display` |
    | `Geologica` | `KSM Text` |
    | `Playfair Fallback Georgia` | `KSM Display Fallback Georgia` |
    | `Playfair Fallback Times` | `KSM Display Fallback Times` |
    | `Geologica Fallback Segoe` | `KSM Text Fallback Segoe` |
    | `Geologica Fallback Arial` | `KSM Text Fallback Arial` |

    Keep the asset's computed `size-adjust`/`ascent-override`/`descent-override` values exactly.
  - `scripts/fonts/build-fonts.py` and `scripts/fonts/REPORT.md`, from the asset folder, documenting opsz 72, the subsets, the checks and the fallback method.
  - `src/styles/fonts.test.js`.
- Notes from the font report that later tasks must respect:
  - signed values such as `кота +3,06` are set in `KSM Text` (Playfair's + − are hairline-thin);
  - keep Playfair at weights 400–560 and set `font-synthesis-weight: none` on display text;
  - `<strong>` in text uses 600;
  - `lang="bg"` on `<html>` is required for the Bulgarian forms.
- Modify: `src/root.jsx` (`links`: preload every display file with `as: 'font', type: 'font/woff2', crossOrigin: 'anonymous'`; the text font is not preloaded); `src/index.css` (`@import './styles/fonts.css'` first).

**Interfaces:**
- Consumes: the families from Task 4.
- Produces: `KSM Display` and `KSM Text` fonts available site-wide.

- [ ] **Step 1: Write `src/styles/fonts.test.js`**:
  - every file under `public/fonts/*.woff2` exists, and their total size is ≤ 90 × 1024 bytes;
  - `fonts.css` declares `font-display: swap` for both families and a `size-adjust` on each fallback;
  - `root.jsx`'s `links()` contains a preload for each display file.

  Run and expect FAIL. Copy the files and wire them in. Run and expect PASS.
- [ ] **Step 2: Remove every Google Fonts reference.** Confirm with `grep -rn "fonts.googleapis" src build/client` (expect no output after the build).
- [ ] **Step 3: Visual check.**
  - Run `npm run build` and serve with `node <scratch>/spike/tools/static-server.mjs build/client 4190`.
  - Screenshot `/` with puppeteer, and check in DevTools that `document.fonts` has `KSM Display` loaded.
  - Check that a Bulgarian `д`/`л` renders in the Bulgarian form: compare against the asset `specimen.png`.
- [ ] **Step 4: Commit** `feat(design): self-hosted Playfair display instance and Geologica with Bulgarian forms`.

### Task 6: KSM logo and favicons

**Files:**
- Create:
  - `src/components/brand/Emblem.jsx`, `Wordmark.jsx`, `Logo.jsx`, `brand.test.jsx`;
  - `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png` (180), `public/icon-512.png`;
  - `public/site.webmanifest`.
- Modify: `src/root.jsx` `links` (replace the 74 kB `favicon.png` links); `public/favicon.png` (delete).

**Interfaces:**
- Consumes:
  - the SVG paths from `<scratch>/assets/logo/{emblem,wordmark,logo-horizontal,logo-stacked,favicon}.svg` and the PNG icons, plus `REPORT.md`;
  - the emblem's 26 paths are already in draw order with classes `ring`, `tower`, `rung`, `sun`, `bird`, `cloud`;
  - copy `build.mjs`, `geom.mjs`, `params.json` and `outline-fit.mjs` to `scripts/logo/` for reproducibility.
- In the header (Task 9) the logo renders at 44–48 px tall. Apply `stroke-width: 3.45` to the emblem there (the report: about 1 CSS px, so it doesn't look faint on 1× screens); the masters keep 2.9.
- Produces:
  - `<Emblem className draw={false} />`: inline SVG, `stroke="currentColor"`, paths in draw order, each with `pathLength="1"`. With `draw`, it carries `data-draw` for the CSS stroke animation used on За нас in M4.
  - `<Wordmark className />`.
  - `<Logo variant="horizontal" | "stacked" className />`: `role="img"`, `aria-label="КСМ Строй"`.

- [ ] **Step 1: Write `brand.test.jsx`:**
  - `screen.getByRole('img', { name: 'КСМ Строй' })` exists for both variants;
  - Emblem renders ≥ 8 `path[pathLength="1"]`;
  - no `fill` other than `none` or `currentColor` on emblem paths.

  Run and expect FAIL. Implement. Run and expect PASS.
- [ ] **Step 2: Wire the favicons and manifest** into `links`. Build, then check that `build/client/index.html` references `/favicon.svg`.
- [ ] **Step 3: Commit** `feat(brand): vector KSM logo and favicons (redrawn from the bitmap)`.

### Task 7: Shared primitives

**Files:**
- Create under `src/components/ui/`, each with a test:
  - `Button.jsx`, `DimensionLine.jsx`, `ElevationMark.jsx`, `RollingNumber.jsx`, `ResponsivePicture.jsx`, `VideoBand.jsx`, `StatusChip.jsx`, `StatusLegend.jsx`, `HeroTitle.jsx`.
- Port from `golden-residence/src/components/{ui,film,availability}` where noted, adapted to the tokens, the hydration rules and `useMotion`.

**Interfaces:**
- Consumes: `useMotion` (Task 3); the tokens (Task 4); `statusKey(raw)` and `STATUS_LABEL` from `src/utils/propertyStatus.js` (M0); `formatArea(n)` from `src/utils/format.js` (M0).
- Produces:
  - **`Button`**: `{ to?, href?, type?, variant: 'primary' | 'secondary' | 'quiet' = 'primary', tone: 'paper' | 'dusk' = 'paper', arrow?: boolean, children }`. It renders `Link` for `to`, `a` for `href`, `button` otherwise. Variant styles:
    - primary on paper: `bg-ink text-paper`;
    - primary on dusk: `bg-paper text-ink`;
    - secondary: a 1 px border in the current text colour;
    - radius `ui`; min height 44 px.

    `arrow` draws an inline SVG arrow, `aria-hidden`.
  - **`DimensionLine`**: `{ value: string, label?: string, draw?: boolean, className }`. It is a hairline with 7 px end ticks and a centred value in `text-label nums`. Static unless `draw`; with `draw`, the line scales X from 0 via `useMotion` when it enters the viewport.
  - **`ElevationMark`**: `{ floor: number, elevation?: number }`. It renders an inline SVG ▽ (`aria-hidden`) and `етаж {floor}`, plus `кота +{elevation in bg-BG, 2 decimals}` when given.
  - **`RollingNumber`**: `{ value: number | null, label?: string, className }`.
    - `null` renders `—` in a span of the final width (`nums`).
    - A number renders digit columns; it rolls only when the value changes after mount, including the `null` → number change.
    - An `sr-only` span carries the plain value.
    - Static under reduced motion.
  - **`ResponsivePicture`**: `{ image: { path: string, w: number, h: number, widths: number[], color: string }, alt: string, sizes: string, priority?: boolean, className, imgClassName }`.
    - `<picture>` with an AVIF and a WebP `srcset` from `widths` (`${path}-${w}.avif ${w}w`), and `<img src=${path}-${widths.at(-1)}.webp width height>`.
    - `priority` gives `fetchPriority="high" loading="eager" decoding="async"`; otherwise `loading="lazy"`.
    - The background is `image.color` until the image loads, via an inline style on the wrapper.
  - **`VideoBand`**: `{ sources: { desktop: Src, mobile: Src }, poster: { desktop: Image, mobile: Image }, alt: string, priority?: boolean, className }`, where `Src = { av1: string, h264: string }`.
    - The poster `ResponsivePicture` is always rendered and is the LCP candidate.
    - The `<video muted playsInline loop preload="none">` is attached only after window `load`, then `poster img.decode()`, then idle, and only when within one viewport (IntersectionObserver).
    - It plays while visible.
    - A pause/play button (`aria-label` „Пауза“ / „Пусни“) appears only after the first `playing` event.
    - A rejected `play()` removes the video and shows no button.
    - Under `!useMotionAllowed()`, poster only.
    - Port logic from `golden-residence/src/components/film/VideoBand.jsx`; breakpoint sources are chosen with `<source media>` only (no JS).
  - **`StatusChip`**: `{ status: 'available' | 'reserved' | 'sold' | 'blocked' | 'unknown' }`. Labels:

    | Status | Label |
    |---|---|
    | available | `Свободен` |
    | reserved | `Резервиран` |
    | sold | `Продаден` |
    | blocked | `Блокиран` |
    | unknown | `Няма информация` |

    A dot plus the label, colours from the status tokens.
  - **`StatusLegend`**: `{ statuses?: string[] }`; defaults to all four known.
  - **`HeroTitle`**: `{ as?: 'h1' | 'h2', lines: string[], className }`.
    - Each line is a `span.block` inside an `overflow-hidden` mask.
    - A CSS animation `hero-rise` (translateY(105%) → 0, 900 ms `expo-out`, a 60 ms stagger via `--i`) runs only under `@media (prefers-reduced-motion: no-preference)`.
    - The markup is the final state; there is no JS.

- [ ] **Step 1: Write the tests, one file per component.** Key assertions:
  - `Button` renders a link with `href="/contact"` when `to="/contact"`, and its accessible name equals its text (the arrow is hidden).
  - `ElevationMark` `{ floor: 1, elevation: 3.06 }` has text `етаж 1` and `кота +3,06`.
  - `RollingNumber`:
    - `value={null}` has text `—`;
    - re-rendered with `69`, the sr-only text is `69`;
    - under no motion, the digits are static.
  - `ResponsivePicture`:
    - `srcset` contains `/img/x-1024.avif 1024w`;
    - `priority` sets `fetchpriority="high"`;
    - non-priority sets `loading="lazy"`.
  - `VideoBand`:
    - **(a) `VideoBand renders only the poster before window load`.**
    - **(b) `VideoBand attaches the video after load, decode and visibility`.** Mock IntersectionObserver, `img.decode` and `requestIdleCallback`.
    - **(c) `VideoBand refused play keeps the poster and shows no control`.** `play` rejects.
    - **(d) The pause button appears after `playing`, and its label toggles.**
  - `StatusChip`: each status renders its exact label.
  - `HeroTitle` `lines={['Създаваме пространства', 'за мечтания живот']}`:
    - an `h1` whose text is both lines joined;
    - no inline `style` with `opacity`.

  Run `npx vitest run src/components/ui` and expect FAIL.
- [ ] **Step 2: Implement each component** until `npx vitest run src/components/ui` passes.
- [ ] **Step 3: Build a dev-only gallery route** `dev/ui` (`import.meta.env.DEV` only) that renders every primitive on `paper` and on `dusk`. Screenshot it at 1440 and 390 for the reviewer under `<scratch>/m1/ui-*.png`.
- [ ] **Step 4: Commit** `feat(ui): KSM primitives (button, dimension line, elevation mark, rolling number, picture, video band, status, hero title)`.

### Task 8: Image pipeline and manifests

**Files:**
- Create:
  - `scripts/images/build-images.mjs`;
  - `scripts/images/sources.json`;
  - `src/data/images/` (one JSON manifest per group: `home.json`, `golden-residence.json`, `mnogofamilna.json`, `shell.json`);
  - `scripts/images/build-images.test.mjs` (vitest, node environment).
- Modify: `package.json` (`"images": "node scripts/images/build-images.mjs"`); `.gitignore` (nothing: outputs in `public/img` are committed).

**Interfaces:**
- Produces:
  - `sources.json` entries: `{ id: string, group: string, src: string, crop?: { left, top, width, height }, widths: number[], quality?: { avif: 50, webp: 74 } }`.
  - Outputs: `public/img/<id>-<w>.avif` and `.webp` for each width ≤ the source's width after crop.
  - The manifest entry `src/data/images/<group>.json[id] = { path: '/img/<id>', w, h, widths, color }`. `color` is the dominant colour as `#RRGGBB`.
  - Idempotent: skips existing outputs unless `--force`.
  - Pre-encoded media (the Golden Residence film posters and stills already in AVIF/WebP ladders) are registered with `kind: 'copy'`: copied from `C:/ksm-stroy/golden-residence/public/...` and measured, not re-encoded.

- [ ] **Step 1: Write the test** with a 2000×1000 fixture generated by sharp in a temp dir:
  - widths `[640, 1024, 2560]` produce 640 and 1024 only (never upscaled);
  - the manifest has `w: 2000, h: 1000, widths: [640, 1024]` and a `color` matching `/^#[0-9A-F]{6}$/`;
  - a `crop` is applied before resizing.

  Run and expect FAIL. Implement. Run and expect PASS.
- [ ] **Step 2: Seed `sources.json` with M1/M2 needs:**
  - the Golden Residence hero poster and the 6 stills (`kind: 'copy'` from golden-residence `public/film` and `public/images/gallery`);
  - the Многофамилна master `src/assets/продажби/project 1/sgrada1.jpg` (crop from `<scratch>/assets/lights/REPORT.md`; widths 768/1024/1440/1920/2560);
  - the EU logos from `git show origin/vidimost-es:public/eu/eu-cofunded-bg.png` and `pkip.png` (widths 300/600/900).

  Run `npm run images`, and expect the files plus the manifests. Commit the outputs.
- [ ] **Step 3: Commit** `feat(images): build-time AVIF/WebP ladders with per-route manifests`.

### Task 9: Shell: EU line, header, mobile menu, footer, 404, EU page

**Files:**
- Create:
  - `src/config/site.js` (the site facts from Global Constraints, as a frozen object);
  - `src/shell/EuLine.jsx`, `SiteHeader.jsx`, `MobileMenu.jsx`, `SiteFooter.jsx`, `TitleBlock.jsx`, with tests in `src/shell/shell.test.jsx`;
  - `src/routes/eu-proekt.jsx` (+ meta);
  - `scripts/postbuild.mjs` (copies `build/client/404/index.html` to `build/client/404.html`).
- Modify:
  - `src/root.jsx` (render `EuLine` + `SiteHeader` + outlet + `SiteFooter`; remove the legacy `Navbar`/`Footer`);
  - `src/routes/not-found.jsx` (designed);
  - `src/routes.js` (add `eu-proekt`);
  - `react-router.config.js` (prerender `/eu-proekt`);
  - `package.json` (`"build": "react-router build && node scripts/postbuild.mjs"`);
  - `vercel.json`;
  - `tests/contracts/eu-visibility.test.jsx` (the EU line on every route).
- Delete: `src/components/common/Navbar.jsx`, `src/components/common/Footer.jsx`.

**Interfaces:**
- Consumes: `Logo` (Task 6), `Button` (Task 7), `ResponsivePicture` with `shell.json` (Task 8), `useScrollLock` (M0, using `getLenis()`).
- Produces:
  - **Route `handle` contract:** `export const handle = { header: 'overlay' | 'solid', project?: 'golden-residence' | 'mnogofamilna-sgrada', object?: string }`. The shell reads it with `useMatches()`. The default is `{ header: 'solid' }`.
  - **`SiteHeader`:**
    - one `position: fixed` element (`view-transition-name: site-header`) containing `<EuLine/>` (36 px) and the 72 px bar;
    - transparent with paper text over an `overlay` route until `scrollY > 80`, then `bg-paper text-ink`;
    - after the first viewport, it hides on scroll down and shows on scroll up (`translateY(-100%)`);
    - links `Начало /`, `Продажби /projects`, `Обекти /blog`, `За нас /about`, `Контакти /contact` (`aria-current` from the normalised pathname);
    - the phone `tel:+359887886166` with visible text `+359 887 886 166`;
    - `Button` `Запитване` → `/contact` or `/contact?project=<handle.project>`;
    - under 1024 px: the logo, a phone icon link (`aria-label="Обадете се"`) and the menu button (`aria-label="Меню"`, `aria-expanded`).
  - **`MobileMenu`:**
    - a portal to `document.body`, `role="dialog"`, `aria-modal="true"`, `aria-label="Меню"`, `bg-dusk text-paper`;
    - links in `font-display` at 40 px, then the phone, email, both offices and `<EuLine tone="dusk"/>`;
    - Esc and the close button close it, and focus returns to the menu button;
    - scroll is locked through `useScrollLock`.
  - **`SiteFooter`** (`bg-dusk text-paper`, class `on-dusk`):
    - left: `Logo`, the production blurb `Водеща строителна компания в България с над 15 години опит. Специализираме се в жилищно и комерсиално строителство, предлагайки иновативни решения и високо качество на изпълнение.`, the phones, email and hours;
    - right: both offices, each with `Отвори в Google Maps` (`https://www.google.com/maps/search/?api=1&query=<encoded address>`), the quick links and Facebook;
    - bottom: `<EuLine tone="dusk"/>`, `© 2026 КСМ Строй`, and `<TitleBlock/>`.
  - **`TitleBlock`:** a 1 px ruled box with `КСМ СТРОЙ ООД`, `Обект: {handle.object}` (only when `handle.project`), and `2026`.
  - **`EuLine`** `{ tone: 'paper' | 'dusk' = 'paper' }`: the two logos (`ResponsivePicture`, `alt` `Съфинансирано от Европейския съюз` and `Програма „Конкурентоспособност и иновации в предприятията“`), the text `Проект „Дигитализация на предприятията“, № BG16RFPR001-1.012-1485-C01, по Програма „Конкурентоспособност и иновации в предприятията“ 2021-2027.` (shortened under 640 px to `Проект № BG16RFPR001-1.012-1485-C01, съфинансиран от ЕС.`), and the link `За проекта` → `/eu-proekt`.
  - **`/eu-proekt`:** the teammate's page text verbatim from `git show origin/vidimost-es:src/pages/EuProekt.jsx` (all paragraphs, the budget list and the disclaimer) as a document page on `paper`, with the logos and a link `Изтегли плаката (PDF)` → `/eu/plakat-ksm-stroy-a3.pdf`. `meta` title `Дигитализация на предприятията | КСМ Строй`.
  - **404:** `<h1>Тази страница я няма в чертежа.</h1>`, the paragraph `Проверете адреса или започнете от някоя от страниците по-долу.`, and links `Начало`, `Продажби`, `Контакти`.
  - **`vercel.json`:** the spike's file with these changes:
    - NO SPA-fallback rewrite;
    - redirects:
      - `{ "source": "/projects/:id((?!golden-residence$|mnogofamilna-sgrada$)[^/]+)", "destination": "/projects", "permanent": false }`;
      - the existing `/home`;
      - `/floor-overlay-demo.html` and `/vite.svg` → `/` (permanent; both were live public URLs before M0);
    - keep `framework: "vite"`, `buildCommand: "npm run build"`, `outputDirectory: "build/client"`, `trailingSlash: false` and the headers.

- [ ] **Step 1: Write `src/shell/shell.test.jsx`.** It renders the root route over memory routes (reuse `tests/contracts/site.jsx`):
  - the header shows the five links and `+359 887 886 166`;
  - `Запитване` points to `/contact?project=golden-residence` on `/projects/golden-residence`;
  - the menu opens on the button, `Escape` closes it, and focus returns;
  - the footer contains both office addresses, both phones, `ksm_str@abv.bg` and `Пн–Пт 8:00–18:00`;
  - the title block shows `Обект: Golden Residence` only on project routes;
  - `/nope` renders `Тази страница я няма в чертежа.`

  Extend `tests/contracts/eu-visibility.test.jsx`: every route in `ROUTES` contains `BG16RFPR001-1.012-1485-C01` and a link named `За проекта` to `/eu-proekt`; Home still links `/eu/plakat-ksm-stroy-a3.pdf`. Run and expect FAIL.
- [ ] **Step 2: Implement the shell.** Remove the legacy Navbar and Footer. The legacy pages render under the new shell. Add `handle` to every route module:
  - Home: `overlay`;
  - Golden Residence page: `overlay` with `project: 'golden-residence', object: 'Golden Residence'`;
  - Многофамилна: likewise with `'Многофамилна жилищна сграда'`;
  - the explorers: `solid` plus the project.

  Run `npm test` and expect PASS.
- [ ] **Step 3: Build and check the output.**
  - `npm run build` produces `build/client/404.html` and `build/client/eu-proekt/index.html`.
  - Validate `vercel.json` against the schema with `node <scratch>/spike/tools/validate-vercel.mjs`, or ajv with `<scratch>/spike/vercel-schema.json`.
- [ ] **Step 4: Commit** `feat(shell): EU line, header, mobile menu, footer with title block, 404 and the EU project page`.

### Task 10: SEO: corrected JSON-LD, robots and sitemap, noindex outside production

**Files:**
- Modify: `src/seo/meta.js` (+ test), `src/root.jsx`, `scripts/postbuild.mjs`.
- Create: `src/seo/jsonLd.js` (+ test).

**Interfaces:**
- Produces:
  - **`organizationJsonLd(): object`:**
    - `@type: ['HomeAndConstructionBusiness', 'Organization']`, `name: 'КСМ Строй'`, `legalName: 'КСМ СТРОЙ ООД'`, `url: SITE_URL`, `logo: SITE_URL + '/icon-512.png'`;
    - `telephone: ['+359887886166', '+359885762224']`, `email: 'ksm_str@abv.bg'`, `foundingDate: '2008-09'`, `sameAs: ['https://www.facebook.com/ksm.stroi/']`;
    - `address`: the two real offices as `PostalAddress` entries;
    - `openingHoursSpecification` (Mo–Fr 08:00–18:00, Sa 09:00–14:00);
    - no `founder`, no `geo`.
  - **`IS_PRODUCTION_BUILD`:** a build-time constant, `process.env.VERCEL_ENV === 'production' && process.env.VITE_SITE_STAGE !== 'review'`, injected with Vite `define`.
  - **Root `meta`:** adds `{ name: 'robots', content: 'noindex, nofollow' }` when `!IS_PRODUCTION_BUILD`. A local build counts as non-production unless `VITE_SITE_STAGE=production` is set.
  - **Analytics:** the root renders Vercel `<Analytics/>` and `<SpeedInsights/>` (`@vercel/speed-insights`), both lazy and client-only after mount, only when `window.location.hostname` ends with `ksmstroy.com` or `vercel.app` (as production does today). They never render during prerender.
  - **`postbuild.mjs`:**
    - production builds write `build/client/robots.txt` (`User-agent: *` / `Allow: /` / `Sitemap: https://www.ksmstroy.com/sitemap.xml`) and `sitemap.xml` listing the prerendered paths (excluding `/404`);
    - non-production builds write `robots.txt` with `Disallow: /` and no sitemap.

- [ ] **Step 1: Write the tests:**
  - `organizationJsonLd()` has no string containing `Строителна 123` or `Кирил`, has `foundingDate` `2008-09`, and has two addresses;
  - with `VITE_SITE_STAGE=review`, the root meta contains the robots noindex;
  - `postbuild` (as a function, `writeSeoFiles({ outDir, production })`) writes the sitemap with 12 URLs in production and `Disallow: /` otherwise.

  Run and expect FAIL. Implement. Run and expect PASS.
- [ ] **Step 2: Build with `VITE_SITE_STAGE=production`.** Check that `grep -c "www.ksmstroy.com" build/client/about/index.html` is ≥ 2 (canonical, og:url) and `grep -c "ksmstroy.bg" -r build/client` is 0.
- [ ] **Step 3: Commit** `feat(seo): canonical domain, real business data, robots and sitemap, noindex outside production`.

### Task 11: Same-origin availability API and store

**Files:**
- Create:
  - `src/services/sheetsCore.js`: pure CSV parsing and row normalisation, extracted from `googleSheets.js`, with no `import.meta.env` and no browser APIs;
  - `api/availability.js`;
  - `tests/contracts/availability-api.test.js` (NOT under `api/`);
  - `src/data/availability/store.js` (+ test);
  - `src/data/availability/useAvailability.js`.
- Modify:
  - `src/services/googleSheets.js` (use `sheetsCore`);
  - `vite.config.js`: a dev-only plugin `devApi()` that serves `/api/availability` and `/api/odoo-lead` by importing the handlers and calling `handler.fetch(request)`, so `react-router dev` behaves like Vercel. Skip it under VITEST.

**Interfaces:**
- **`sheetsCore.js`:**
  - `parseCsv(text: string): string[][]` (quoted fields and newlines);
  - `toRows(table): object[]` (header-keyed);
  - `normalizeApartmentRow(row): { unit: string, floor: string, type: string, area: { built, ideal, total }, exposure: string, status: string, price: string }`, where `status` comes via `normalizeStatus`;
  - `normalizeSpotRow(row)` for garages and parking.

  Column names stay EXACTLY as in today's sheets: `Етаж, Апартамент, Вид, Застроена, Идеални, Обща, Изложение, Статус, Цена, Номер`.
- **`api/availability.js`:**
  - default export `{ fetch(request) }`;
  - `GET` reads env `VITE_GOOGLE_SHEET_BLOCK_A`, `_BLOCK_B`, `_GARAGES`, `_PARKING`, `_MNOGO_A`, `_MNOGO_B` (missing ones are skipped) and fetches them in parallel with an 8 s timeout each;
  - responds `200` with JSON `{ updatedAt: ISOString, sources: { [key]: 'ok' | 'error' | 'missing' }, projects: { 'golden-residence': { 'block-a': Row[], 'block-b': Row[], garages: Spot[], parking: Spot[] }, 'mnogofamilna-sgrada': { 'block-a': Row[] | null, 'block-b': Row[] | null } } }`;
  - header `Cache-Control: public, s-maxage=30, stale-while-revalidate=300`;
  - if every source fails, `503` with `Cache-Control: no-store`;
  - other methods get `405`.
- **`store.js`:**
  - `subscribe`/`getSnapshot` with `getServerSnapshot = () => ({ status: 'idle', data: null })`;
  - on the first client subscribe: `fetch('/api/availability')`. On a non-200 or network error it falls back to the existing direct fetchers in `googleSheets.js`, `fetchApartmentData(block)` for `blockA`, `blockB`, `mnogoA`, `mnogoB` and `fetchGarageData(type)` for `garages`, `parking`, mapped into the same `projects` shape. If those fail too (they resolve `null` when unconfigured), it uses the built-in fallback data (`apartmentFallbackData.js`, `mnogofamilnaFallbackData.js`) with `status: 'fallback'`;
  - it refreshes when the tab becomes visible and the data is older than 60 s; no polling.
- **`useAvailability(): { status: 'idle' | 'loading' | 'ready' | 'fallback' | 'error', data, updatedAt }`.**
- **Route `links` helper:** `availabilityPreload = { rel: 'preload', href: '/api/availability', as: 'fetch', crossOrigin: 'anonymous' }`. The store's fetch uses `{ mode: 'cors', credentials: 'omit' }`, so the preload is reused.

- [ ] **Step 1: Write `tests/contracts/availability-api.test.js`** (node environment; mock `fetch`; fixture CSVs from `google-sheets-data/`):
  - **merges and normalises:** a cell `Блокиран` becomes status `Блокиран`; an empty status becomes `Свободен`;
  - **partial failure:** BLOCK_B returns 500, the response is 200 with `sources.BLOCK_B === 'error'` and the other blocks filled;
  - **all down:** 503 with `no-store`;
  - **cache header** on 200: `public, s-maxage=30, stale-while-revalidate=300`;
  - **method:** POST returns 405;
  - the column names are unchanged (the fixture header row is passed through as is).

  Run and expect FAIL. Extract `sheetsCore.js` and implement the handler. Run and expect PASS.
- [ ] **Step 2: Write `store.test.js`:**
  - **server snapshot:** `renderToString` of a probe shows `idle`;
  - **api ok** gives `ready`, with data from the API;
  - **api down → direct fetch:** the API fails, the mocked `fetchApartmentData`/`fetchGarageData` resolve rows, giving `ready`;
  - **both fail** gives `fallback`, with the built-in data;
  - **visibility refresh** after 61 s triggers one more fetch.

  Run, see it fail, implement, see it pass.
- [ ] **Step 3: Add `devApi()`.** Run `npm run dev`, then check that `curl -s localhost:3000/api/availability` prints JSON with `projects` (with the real `.env`) and that `curl -s -o /dev/null -w "%{http_code}" -X PUT localhost:3000/api/odoo-lead` prints `405`.
- [ ] **Step 4: Commit** `feat(data): same-origin availability API with a cached, prerender-safe client store`.

### Task 12: Verification harness, preview push and checks

**Files:**
- Create:
  - `scripts/smoke/static-server.mjs` (copied from the spike tools, extended to honour `vercel.json` redirects, the no-fallback 404 and `trailingSlash`);
  - `scripts/smoke/smoke.mjs`;
  - `scripts/perf/lighthouse.mjs`.
- Modify: `package.json` (`"smoke": "node scripts/smoke/smoke.mjs"`, `"perf": "node scripts/perf/lighthouse.mjs"`, `"verify": "npm test && npm run build && npm run check:dist && npm run smoke"`).

**Interfaces:**
- `smoke.mjs`:
  - serves `build/client` on port 4190;
  - visits every prerendered path plus the deep links `/projects/golden-residence/block-a?floor=3`, `/contact?apartment=%D0%90%20301`, `/about/` (expects a 308 to `/about`), `/projects/1` (expects a redirect to `/projects`) and `/nope` (expects 404 status and the 404 text);
  - runs at 1440×900 DPR 1 and 390×844 DPR 2 (touch, mobile UA);
  - fails on any console error or warning, page error, failed same-origin request, or a React hydration message (`/hydrat|#418|#423|#425/`);
  - fails if the JS-disabled HTML of a route lacks its H1;
  - asserts on every route at both sizes that the EU line's `За проекта` link has a non-zero bounding box and computed opacity 1 inside the first viewport (no scrolling); on `/` it also checks the poster PDF link (finding 2 of the M0 review: jsdom can't see CSS hiding);
  - writes screenshots to `<scratch>/m1/smoke/`.
- Browser:
  - add `puppeteer-core` as a devDependency (no browser download on install, so Vercel builds stay lean);
  - launch Chrome from `process.env.CHROME_PATH`, defaulting to `C:/Program Files/Google/Chrome/Application/chrome.exe` on Windows, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS, and `google-chrome` elsewhere;
  - with `@prerenderer/*` gone (Task 1), the old puppeteer dependency disappears.
- `lighthouse.mjs`: runs `npx lighthouse@13` mobile ×3 on given URLs and prints the median LCP, CLS, TBT, bytes before LCP and score.

- [ ] **Step 1: Implement the smoke script.** Run `npm run verify` and expect PASS with the route table printed. Fix anything it finds within this task.
- [ ] **Step 2: Measure a baseline.** Run `npm run perf -- http://127.0.0.1:4190/ http://127.0.0.1:4190/projects/golden-residence/block-a` and record the results in `docs/superpowers/notes/2026-11-13-m1-baseline.md`. The pages are still the legacy ones; this is a baseline, not a pass/fail.
- [ ] **Step 3: Orchestrator only (approved by the user for this branch): push.** Run `git push -u origin redesign-v2`, then wait for the Vercel preview. Open the preview URL in the user's logged-in Chrome (Vercel SSO) and check:
  - the build log shows Node 24 and `npm run build`;
  - `/about` direct-loads its own HTML;
  - `/about/` returns a 308;
  - `/projects/1` lands on `/projects`;
  - `/nope` returns a 404 status with the 404 page;
  - `GET /api/odoo-lead` returns 200 `ok:true`;
  - `GET /api/availability` returns 200 JSON with `sources` all `ok`;
  - the page source has `noindex`.

  Record the results in the baseline note and commit `docs: M1 baseline and preview verification`.

---

## Self-review notes (for the orchestrator)

- **Spec coverage:**
  - §6.1 and §6.5 → Tasks 1, 9 and 12;
  - §6.2 and §6.3 → Task 2;
  - §5.1 and §5.3 (runtime, scroll ownership, the transition boundary) → Tasks 1 and 3;
  - §3.1 → Task 4;
  - §3.2 → Task 5;
  - §3.3 emblem → Task 6;
  - §5.4 primitives → Task 7;
  - §6.6 images → Task 8;
  - §8.1 → Task 9;
  - §6.7 → Task 10;
  - §6.4 → Task 11;
  - §10 and §12 → Tasks 3 and 12.
  - Deferred to M2+ by design: page compositions; FrameSequence, ReadingText and viewers; the explorer UI; the lights-off runtime; the theme overlay for dusk sections (§5.2.10); video re-encoding.
  - Must land BEFORE the client reviews M2: the `[ТЕСТ]` tagging of review-host inquiries in `api/odoo-lead.js` (spec §6.7). The function belongs to the teammate, so the change is coordinated through the user and isn't in M1.
  - `src/entry.server.jsx` with `onAllReady` (spike gotcha 22) is needed only if a prerendered route renders `lazy`/Suspense content during prerender. M1 has none; the analytics components mount client-only.
- **Interfaces used across tasks:** `useMotion`, `useMotionAllowed`, `useHydrated`, the route `handle` keys (`header`, `project`, `object`), the `ResponsivePicture` `image` shape (`path, w, h, widths, color`), `useAvailability`'s statuses.
