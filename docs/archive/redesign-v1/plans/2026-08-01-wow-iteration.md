# Act II — "Wow" Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address the owner's review of Plan B: bring back the production hero slider (exact images) as a cinematic multi-image experience, restore the About slider vibes, make the navbar logo prominent again, and add an owner-approved "wow layer" — branded intro reveal, Lenis inertia scrolling, curtain page transitions, masked line reveals, scroll parallax, and a marquee divider.

**Architecture:** New motion foundations (Lenis provider, SplitLines, Parallax, Marquee) + one shared `CineSlider` component power both the Home hero and the About slider. `PageTransition` keeps its name/API but its internals become an ink curtain sweep. `IntroReveal` mounts once in App with a session flag. Everything gated by `useReducedMotion`.

**Tech Stack:** React 19, Framer Motion 12, **lenis (new runtime dep — owner-authorized)**, Tailwind 3, Vitest.

**Owner decisions (binding):** intro reveal YES · smooth scrolling YES · curtain transitions YES · custom cursor NO. Production hero images return EXACTLY: `src/assets/home/optimized/photo-4.webp` ("Луксозни жилищни комплекси" / "Създаваме пространства за мечтания живот") and `src/assets/home/optimized/001.webp` ("Модерна архитектура" / "Иновативни дизайнерски решения").

## Global Constraints

- Branch `redesign` only; never touch `main`. All 129 existing tests stay green after every task.
- Design tokens/primitives/motion grammar from Plan B remain the law: plaster/ink/graphite/gold-accent(#C7A032)/gold-deep/concrete; ONE `<em>` per display headline; gold discipline; availability colors semantic-only; `useReducedMotion` on everything new (reduced users: no autoplay, no parallax, no curtain — opacity fades and static images).
- New dependency allowed: `lenis` ONLY. Swiper may be REMOVED if grep-proven unused.
- Explorer untouched (polygon coordinate space is frozen). Contact frozen logic untouched.
- Commits: conventional + trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## File Structure

```
src/components/ui/SmoothScroll.jsx    # Lenis provider (Task 1)
src/components/ui/SplitLines.jsx      # masked word-rise reveal (Task 1)
src/components/ui/Parallax.jsx        # scroll-linked image drift (Task 1)
src/components/ui/Marquee.jsx         # outlined scrolling strip (Task 1)
src/components/ui/CineSlider.jsx      # cinematic crossfade slider (Task 2)
src/components/ui/IntroReveal.jsx     # branded first-visit intro (Task 4)
src/components/ui/PageTransition.jsx  # UPGRADE: curtain internals, same API (Task 4)
src/App.jsx                           # mount SmoothScroll + IntroReveal (Tasks 1,4)
src/pages/Home.jsx                    # hero→CineSlider, marquee, parallax, SplitLines (Task 3)
src/components/common/Navbar.jsx      # logo prominence (Task 5)
src/pages/About.jsx                   # CineSlider section + parallax (Task 5)
package.json                          # +lenis; −swiper if unused (Tasks 1,6)
```

---

### Task 1: Motion Foundations II (Lenis, SplitLines, Parallax, Marquee)

**Files:** Create the four components above + `src/components/ui/motion2.test.jsx`. Modify `src/App.jsx` (wrap the routed content div in `<SmoothScroll>`), `package.json` (`npm install lenis`).

**Interfaces produced (frozen for Tasks 2–5):**
- `<SmoothScroll>{children}</SmoothScroll>` — initializes Lenis (`{ lerp: 0.1, wheelMultiplier: 1 }`) in a `useEffect` with a rAF loop, `lenis.destroy()` cleanup; **renders children directly and skips Lenis entirely** when `useReducedMotion()` or in test env (`typeof IntersectionObserver === 'undefined'` guard not needed here — guard on `import.meta.env.MODE === 'test'` OR simply try/catch the init; document choice).
- `<SplitLines as="span" className delay stagger={0.045}>text</SplitLines>` — splits its string children into words; each word: `<span className="inline-block overflow-hidden align-bottom"><motion.span className="inline-block" initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.65, ease: EASE, delay: delay + i * stagger }}>word&nbsp;</motion.span></span>`. Reduced-motion: renders plain text. Non-string children: rendered as-is (documented limitation).
- `<Parallax strength={40} className>{children}</Parallax>` — `useScroll({ target: ref, offset: ['start end', 'end start'] })` + `useTransform(scrollYProgress, [0,1], [strength, -strength])` applied to an inner `motion.div`; outer div `overflow-hidden`; the inner content is scaled `scale-110` so drift never exposes edges. Reduced-motion: static passthrough.
- `<Marquee text speed={40} className>` — `overflow-hidden whitespace-nowrap` strip; inner flex with the text repeated (aria-hidden duplicates) animated by CSS keyframes `translateX(0 → -50%)` (duration = content-length/speed, linear infinite; add the keyframes `marquee` to tailwind.config). Text style (binding): `font-display text-6xl sm:text-8xl text-transparent [-webkit-text-stroke:1px_#C7A032] opacity-60 py-6`. Reduced-motion: animation-none (static strip).

**Steps:** failing tests (each renders; SplitLines word-count spans; reduced-motion plain-text path via matchMedia mock if feasible else structural assertions) → implement → App.jsx wraps content in SmoothScroll (inside Router, around the existing top-level div) → full suite green (SmoothScroll must not break jsdom — the try/catch/env-guard matters; App.routes tests exercise it) → build → commit `feat(motion): lenis smooth scroll, split-line reveals, parallax and marquee foundations`.

---

### Task 2: CineSlider (shared cinematic slider)

**Files:** Create `src/components/ui/CineSlider.jsx` + `src/components/ui/CineSlider.test.jsx`.

**Interface (frozen):** `<CineSlider slides={[{ src, srcSet?, sizes?, alt, caption?, sub? }]} interval={6500} className overlayClassName>{overlay children}</CineSlider>`
- Fills its parent (`absolute inset-0` images inside a `relative h-full w-full overflow-hidden` root; consumer sets the height).
- Active slide: `AnimatePresence` crossfade (opacity, 1.2s EASE); Ken Burns per slide alternating direction (even: `scale 1→1.08`, odd: `scale 1.08→1`, duration = interval+1200ms, linear, via animate on the img).
- Chrome (all `pointer-events-none` except dots): bottom-left caption block (if `caption`: `text-plaster font-display text-lg` + `sub` in `text-plaster/60 text-sm`) that crossfades with the slide; bottom-right slide index `0{i+1} — 0{n}` in eyebrow style `text-plaster/70 text-xs tracking-eyebrow`; a 1px gold progress line above the index (`motion.div key={index} initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration: interval/1000, ease:'linear'}} className="h-px w-24 origin-left bg-gold-accent"`).
- Autoplay: `setInterval` advancing `(i+1)%n`, paused while `document.hidden` (check inside tick), cleanup on unmount. Reduced-motion: NO autoplay, NO Ken Burns, static first slide, chrome still shown, plus small prev/next buttons (`aria-label`ed, min 44px) so slides stay reachable.
- Dark legibility gradient at bottom: `bg-gradient-to-t from-ink/80 via-ink/25 to-transparent`.
- `{children}` render in an `absolute inset-0` layer above chrome (`overlayClassName` for positioning) — this is where Home's headline/counter go.

**Steps:** failing tests (renders slide 1; fake-timers advance changes visible img alt; progress line remounts per slide via key; reduced-motion → no interval + buttons present; buttons navigate) → implement → suite green → commit `feat(ui): CineSlider cinematic crossfade slider`.

---

### Task 3: Home — Act II

**Files:** Modify `src/pages/Home.jsx` + its test.

**Binding changes:**
1. Hero (structure/copy/counter/CTAs unchanged) becomes: `<section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink">` containing `<CineSlider slides={HERO_SLIDES} interval={6500}>` with the existing content block (DimensionLine, h1, sub, trust line, CTA row) as overlay children. `HERO_SLIDES` (exact):
   - `{ src: photo4 (src/assets/home/optimized/photo-4.webp), alt: 'Многофамилна жилищна сграда', caption: 'Луксозни жилищни комплекси', sub: 'Създаваме пространства за мечтания живот' }`
   - `{ src: img001 (src/assets/home/optimized/001.webp), alt: 'Golden Residence', caption: 'Модерна архитектура', sub: 'Иновативни дизайнерски решения' }`
   - `{ src: GOLDEN_RENDER.src, srcSet: GOLDEN_RENDER.srcSet, sizes: '100vw', alt: 'Голдън Резиденс', caption: 'Голдън Резиденс', sub: 'Реална наличност — на живо' }`
   (NOT sgrada1.webp — its baked white margins would show in a cover hero.) Captions must not collide with the overlay content: overlay bottom-left holds the headline block, so CineSlider's caption block moves to top-right for this consumer — add an optional `captionPosition="bottom-left"|"top-right"` prop to CineSlider (default bottom-left) in THIS task (update its test).
2. The h1's text runs through `SplitLines` (keep the `<em>` accent working: SplitLines handles strings — split the headline so the `<em>` word is its own animated segment; acceptable implementation: compose two SplitLines runs around a masked `<em>` span with its own rise animation, same grammar).
3. Insert `<Marquee text="Голдън Резиденс · Многофамилна сграда · София · КСМ Строй · " />` between the projects duo and services sections.
4. Wrap the two project-card images and three service images in `<Parallax strength={30}>`.

**Steps:** update failing tests first (hero still asserts headline + counter + CTAs; NEW: three slide alts present, marquee text present) → implement → suite + build green → visual check (slider crossfades with Ken Burns, captions legible, marquee scrolls, parallax subtle, 390px clean) → commit `feat(home): cinematic hero slider with production imagery, marquee and parallax`.

---

### Task 4: Intro Reveal + Curtain Transitions

**Files:** Create `src/components/ui/IntroReveal.jsx` (+test); rewrite internals of `src/components/ui/PageTransition.jsx` (same exported API: default export, `as` prop — ALL page files stay untouched); modify `src/App.jsx` (mount IntroReveal once, above routes).

**IntroReveal (binding):** on mount, if `sessionStorage.getItem('ksm-intro-seen')` or reduced-motion → render nothing. Else: fixed `inset-0 z-[200] bg-ink flex flex-col items-center justify-center gap-6`, body scroll locked while visible; sequence: logo img (the Navbar's logo asset) `opacity 0→1, scale 0.9→1, 0.5s` → gold dimension rule `w-24→w-48 scaleX` draw 0.6s with the two end ticks → hold 0.2s → whole overlay `y: 0→'-100%', 0.7s EASE` → set the session flag + unmount (drive via a small state machine of timeouts; total ≤ 1.9s; cleanup all timers on unmount).
**PageTransition curtain (binding):** keep the exported component name/props. New behavior: on route EXIT a fixed ink panel with a 1px gold top hairline sweeps up from bottom (`y: '100%'→0`, 0.45s EASE); on ENTER it continues (`y: 0→'-100%'`, 0.5s, delay 0.05s) revealing the new page; page content itself keeps a fast opacity fade under it. Implementation freedom: panel can live inside each PageTransition instance (exit animation renders the panel via AnimatePresence). Reduced-motion: previous opacity-only behavior. First-paint skip behavior preserved (no curtain on initial load — the IntroReveal owns that moment).

**Steps:** failing tests (IntroReveal: renders when no flag, sets flag + honors existing flag, reduced-motion renders nothing; PageTransition: API unchanged — as prop renders tag, reduced-motion opacity path) → implement → App.jsx mount → full suite (App.routes transitions still pass) + build → visual check (fresh session shows intro once; route changes sweep the curtain; back/forward fine) → commit `feat(motion): branded intro reveal and curtain page transitions`.

---

### Task 5: Navbar Logo + About Slider

**Files:** Modify `src/components/common/Navbar.jsx` (+chrome.test if class-asserted), `src/pages/About.jsx` (+staticPages.test).

**Binding:**
1. Navbar logo: `h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-gold-accent/50 hover:ring-gold-accent transition-shadow` (restores the production-era ring + size; wordmark stays; bar height stays h-16 — the logo may overflow the bar bottom by design? NO — keep it inside: bump bar to `h-18` [4.5rem, token exists] and adjust pages' pt-28 → they already clear 7rem, fine).
2. About: after the opening statement section, insert a full-bleed `<section className="relative h-[55vh] min-h-[380px] overflow-hidden">` containing `<CineSlider interval={5500} slides={[slider01, slider02, slider03].map((src,i)=>({src, alt:'КСМ Строй — обекти'}))} />` (no captions — pure imagery; images already imported by About? if slider03 was dropped in B10, re-import from src/assets/images/). Wrap two other section images in `<Parallax strength={24}>`.

**Steps:** failing/updated tests (logo ring class present; About renders 3 slider images) → implement → suite + build → visual check (logo visible over both light and dark navbar states — the ring reads on plaster AND ink; About slider crossfades) → commit `feat(design): prominent navbar logo and About cinematic slider`.

---

### Task 6: Cleanup, Verification, Push

**Steps:**
1. Swiper removal: `grep -rn "swiper" src/ --include="*.jsx" --include="*.js"` — if empty: `npm uninstall swiper`, remove the `'swiper'` manualChunks entry in vite.config.js.
2. Full gates: `npm test` (all green), `npm run build`, `npx eslint .` (≤ 28 problems baseline), `grep -ril "tracer" dist/assets/ || echo CLEAN`, `node scripts/validate-maps.mjs`.
3. Puppeteer sweep (fresh profile per check): intro plays once then never again in-session; hero slider advances + captions crossfade; curtain sweeps on nav to /projects; About slider runs; 390px no horizontal scroll on /, /about, /projects; reduced-motion emulation (`page.emulateMediaFeatures prefers-reduced-motion: reduce`): no intro, no autoplay, static images.
4. Lighthouse mobile on / — perf must stay ≥ 0.78 and LCP ≤ 5s (slider adds weight; first slide must load eagerly, others `loading="lazy"` — verify CineSlider does this; if not, fix in place).
5. `git push origin redesign`. Commit `chore: remove swiper, Act II verification`.
