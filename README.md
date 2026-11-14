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
- `npm run check:dist`: checks the build in `build/client/`; run `npm run build` first
- `npm run lint`: ESLint

## Motion

Motion is GSAP 3 (ScrollTrigger and SplitText, under GSAP's standard no-charge
licence) through `@gsap/react`'s `useGSAP`, with Lenis for smooth scrolling,
driven by GSAP's ticker. It comes from the Golden Residence landing
(golden-residence @944bb03). Nothing uses it yet: the current pages still
animate with framer-motion, `SmoothScroll` is not mounted and
`trackScreenHeight()` is not called.

- GSAP's plugins are registered once, in `src/utils/gsap.js`: import `gsap`,
  `ScrollTrigger`, `SplitText` and `useGSAP` from there, never from `gsap`
  directly. Without a `window` it registers nothing, so it is safe to import
  while pre-rendering.
- An element's CSS is its final, visible state, and GSAP animates *from*
  hidden or offset values. With reduced motion, in tests and without
  JavaScript the page renders complete and static, so markup never ships
  `opacity: 0`.
- Every animation runs inside `useGSAP`, with a scope wherever it selects
  elements by selector text, behind `useMotionAllowed()`: false under reduced
  motion or data saver, and wherever `matchMedia` is missing (jsdom, so in
  every test that does not install `src/test/media.js`). Effects that follow
  the pointer (`useMagnetic`) also need `useFinePointer()`. Scroll drift
  (`scrubDrift`) runs from `md` up only, through `gsap.matchMedia()` and
  `MD_UP`; `src/utils/motion.js` holds those and the shared eases and
  staggers.
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
  `<style id="screen-h">` before first paint. `trackScreenHeight()` keeps that
  element up to date, changing it only when ScrollTrigger re-measures too.
- Lenis' settings live in `src/utils/smoothScroll.js`: a slower wheel (lerp
  0.07, 80% per notch) and, with `syncTouch`, Lenis' own glide after a flick
  on touch screens. A pinch, and any gesture while the page is zoomed in,
  stays the browser's.
- `src/components/ui/SmoothScroll.jsx` runs Lenis, inside the router. A route
  change starts the new page at its top, through Lenis (`immediate`, so a
  fling still gliding cannot carry the new page down) or, where Lenis is not
  running, `window.scrollTo`; then ScrollTrigger re-measures. Content that
  grows re-measures Lenis and ScrollTrigger too. Lenis overwrites a native
  scroll mid-fling, so anything else that scrolls the page goes through it
  while it runs: `getLenis()` (`src/utils/lenis.js`), `scrollToId()`
  (`src/utils/scroll.js`), `useScrollLock()`.
