# KSM Stroy website

The website of KSM Stroy, a residential developer in Bulgaria. The site is in
Bulgarian.

It is built with React 19, Vite 7, Tailwind CSS 3 and React Router 8 in
framework mode, and is deployed on Vercel. Every page is prerendered to static
HTML at build time (`react-router.config.js`); the routes are in
`src/routes.js` and the document and site shell in `src/root.jsx`.

- Apartment availability is read live from published Google Sheets
  (`src/services/googleSheets.js`, `src/context/ApartmentContext.jsx`). See
  [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).
- The contact form sends each inquiry by EmailJS, and through the Vercel
  function `api/odoo-lead.js` to Odoo CRM.

## Scripts

- `npm run dev`: development server on port 3000
- `npm run build`: production build in `build/client/`
- `npm test`: unit tests and production contract tests (Vitest)
- `npm run check:dist`: checks the build in `build/client/` (agency branding,
  dev-only code, first-load JS per route, the motion chunk); run
  `npm run build` first
- `npm run lint`: ESLint

## Indexing

Only the production site is indexed. One decision, `isProductionStage()` in
`src/seo/stage.js`, made at build time by `vite.config.js` (every page's
robots meta) and `scripts/postbuild.mjs` (`robots.txt` and `sitemap.xml`),
reads these variables from the build's environment:

- `VERCEL_ENV` and `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets on every
  build. A build is production when it is the production deployment
  (`VERCEL_ENV=production`) of the project whose production domain is
  ksmstroy.com (`VERCEL_PROJECT_PRODUCTION_URL` is `ksmstroy.com` or
  `www.ksmstroy.com`; Vercel names the project's shortest custom domain, and
  sets it on previews too).
- `VITE_SITE_STAGE`, an override: `review` makes any build noindex, and
  `production` makes any build indexable, to check the production output
  locally.

Every other build is noindex: previews, local builds, and any other Vercel
project, such as a client review project whose production branch is
`redesign-v2`, whose production URL is a `*.vercel.app` domain. Its pages get
`noindex, nofollow`, `robots.txt` disallows everything, and there is no
sitemap.

## Motion

Motion is GSAP 3 (ScrollTrigger and SplitText, under GSAP's standard no-charge
licence), with Lenis for smooth scrolling, driven by GSAP's ticker. It comes
from the Golden Residence landing (golden-residence @944bb03). The current
pages still animate with framer-motion; Lenis runs on every page.

- GSAP and Lenis are one deferred chunk. `src/motion/engine.js` is the only
  module that imports `gsap`, `gsap/*` or `lenis`, and only
  `src/motion/runtime.js` loads it, with `import()`, once the page has loaded.
  They are never part of a route's first-load JS: `npm run check:dist` fails
  if they are, or if the motion chunk grows over 60 KiB gzip.
- A component declares its motion with `useMotion(ref, setup, deps)`
  (`src/motion/useMotion.js`). Once the engine has loaded, the setup gets
  `{ gsap, ScrollTrigger, SplitText, Lenis, lenis }` (`lenis` is the running
  instance, or null). Setups run from an idle queue, one per idle period,
  with one `ScrollTrigger.refresh()` when the queue drains. Each runs inside a
  `gsap.context` scoped to the ref's element, so selector text stays inside
  it, and is reverted on unmount, after the function it returned is called.
- Nothing runs where `useMotionAllowed()` is false: on the server and while
  hydrating, under reduced motion or data saver, and wherever `matchMedia` is
  missing (jsdom, so in every test that does not install `src/test/media.js`).
  A test that allows motion mocks `src/motion/engine.js`.
- An element's CSS is its final, visible state, and GSAP animates *from*
  hidden or offset values. With reduced motion, in tests and without
  JavaScript the page renders complete and static, so markup never ships
  `opacity: 0`.
- `src/utils/motion.js` holds the shared eases and staggers, the clip-path
  pair of an uncover, and `MD_UP`, the `md` breakpoint as a media query for
  `gsap.matchMedia()`. There is no generic scroll drift (parallax): spec
  §5.2.5 rules it out.
- Hooks that ask the browser (`useMotionAllowed`, `useMediaQuery`,
  `useCoarsePointer`, `useFinePointer`) answer `false` on the server and while
  the page hydrates, then the browser's answer. A view that shows something
  only the browser knows, such as a deep link's query string, waits for
  `useHydrated()`. Layout chosen by media stays in CSS media queries.
- Only `transform`, `opacity` and `clip-path` animate: none of them makes the
  browser lay the page out again.
- A height that sets the page's length uses `var(--screen-h)`, never `vh` or
  `svh`. Messenger's and Instagram's in-app browsers resize the page as their
  toolbars slide, so a `vh` height moves everything below it under the
  reader's finger. An inline script in `<head>` (`SCREEN_HEIGHT_SCRIPT`,
  `src/utils/screenHeight.js`) writes `--screen-h` into
  `<style id="screen-h">` before first paint. From app start (`src/root.jsx`),
  `trackScreenHeight()` keeps that element up to date, changing it only when
  ScrollTrigger re-measures too.
- Lenis' settings live in `src/utils/smoothScroll.js`: a slower wheel (lerp
  0.07, 80% per notch), and touch scrolling left to the browser
  (`syncTouch: false`). A panel that scrolls on its own keeps the wheel while
  it can scroll (`allowNestedScroll`). A pinch, and any gesture while the page
  is zoomed in or held still with `body { overflow: hidden }` (the legacy
  modals), stays the browser's.
- `src/motion/SmoothScroll.jsx` runs Lenis around the site shell
  (`src/root.jsx`) once the engine has loaded; content that grows re-measures
  Lenis and ScrollTrigger. On a route change React Router's
  `<ScrollRestoration/>` sets the position (the top, a saved position on Back,
  a `#hash` target), and `src/motion/LenisScrollSync.jsx` hands it to Lenis at
  once (`immediate`, so a fling still gliding cannot carry the new page down),
  after Lenis has measured the new page (it clamps every jump to the last page
  height it measured), then has ScrollTrigger re-measure after the view
  transition. Lenis
  overwrites a native scroll mid-fling, so anything else that scrolls the
  page goes through it while it runs: `getLenis()` (`src/utils/lenis.js`),
  `scrollToId()` (`src/utils/scroll.js`), `useScrollLock()`.
