# Site-Wide "Refined Luxury" Redesign Implementation Plan (Plan B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every page of ksmstroy.bg a distinctive, cohesive "refined luxury" visual identity — editorial Cyrillic serif typography, plaster/charcoal/balcony-gold palette, an architectural dimension-line signature motif, full-bleed renders, and one disciplined motion grammar — without changing any functionality delivered by Plan A.

**Architecture:** A token layer (fonts, Tailwind theme, motion presets) feeds a small set of design primitives (`DimensionLine`, `DisplayHeading`, `Reveal`, `AnimatedNumber`, `Button`), which every page then consumes. Pages are restyled one task at a time — chrome (Navbar/Footer) first, then Home, Продажби landing, block selection, explorer polish, Контакти, За нас/Blog — each independently reviewable, each leaving the 88-test suite green.

**Tech Stack:** React 19, Vite 7, Tailwind 3, Framer Motion 12 (`useReducedMotion`), Google Fonts (Inter — already loaded; Playfair Display cyrillic — added here), Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-07-30-visual-redesign-apartment-explorer-design.md` §6 (design language + pages) and §8 (`srcset` was deferred from Plan A — implemented here in Task 11). Plan A (complete) is `docs/superpowers/plans/2026-07-30-apartment-explorer.md`.

## Design Direction (binding for every task)

**Subject grounding.** KSM Строй sells apartments in two buildings it built itself. Its two unfair assets: genuinely good architectural renders, and live per-apartment availability (Plan A). The design's job: make the buildings feel real and the data feel alive. The visual language borrows from the architect's own material — plan drawings, dimension lines, the anodized gold of the real balcony panels.

**Tokens (exact values — never improvise):**

| Token | Value | Use |
|---|---|---|
| `plaster` | `#F6F5F1` | page background (NOT warm cream — a plaster/concrete white) |
| `ink` | `#1B1A17` | primary text; dark section backgrounds |
| `graphite` | `#57544E` | secondary text |
| `gold` | `#C7A032` | THE accent: dimension lines, numbers, CTA backgrounds, active states (from the building's balcony panels) |
| `gold-deep` | `#A8862A` | gold hover states |
| `concrete` | `#DEDBD4` | hairline borders and rules on plaster |
| emerald/amber/red 500 | (existing) | EXCLUSIVELY availability semantics — never decorative |

**Type:** Playfair Display (`wght@400;500;600;1,400;1,500` — regular AND italic, `cyrillic` subset) = display headlines and large numbers only. Inter = everything else. Display headlines: tight leading (1.05–1.12), one accent word per headline set in `<em>` (Playfair italic renders it in gold via CSS). Eyebrows: Inter 600, uppercase, `tracking-[0.18em]`, 12px, graphite.

**Signature motif — the dimension line:** a 1px gold horizontal rule with 6px vertical ticks at both ends (an architect's dimension marker) that draws itself left-to-right when scrolled into view. It appears with the eyebrow above every section heading, and nowhere else decorative. Implemented once as `DimensionLine` (Task 2); every page uses that component — never a hand-rolled imitation.

**Layout grammar:** full-bleed renders with content low-left; asymmetric editorial sections (eyebrow+heading left column, body right column on desktop); charcoal (`ink`) bands for the stats strip and footer; hairline `concrete` borders on plaster instead of card shadows. Rounded corners: `rounded-2xl` for images/panels, none for hairlines. NO gold gradients, NO glow shadows, NO card grids with drop shadows (delete `shadow-luxury*`/`shadow-gold-glow*` usages as pages are touched).

**Motion grammar (the only allowed moves):** easing `[0.22, 1, 0.36, 1]` (exported as `EASE`); scroll reveal = `opacity 0→1, y 24→0, 0.6s` once per element; hero orchestration (Task 5 only) = image scale `1.06→1` 1.6s + headline lines staggered 80ms + dimension line draw + counters; image hover = `scale 1.04` 0.8s; hero idle = Ken Burns `scale 1→1.08` 18s alternate. Everything gated by `useReducedMotion()` — reduced users get opacity-only, no transforms, no Ken Burns.

**Copy register:** Bulgarian, sentence case, plain verbs, specific over clever. CTAs say what happens: "Разгледайте сградите", "Изпратете запитване". The hero's thesis is the live data: *availability, updated live*.

## Global Constraints

- All work on branch `redesign`. NEVER commit or push to `main`.
- Functionality frozen: Plan A behavior, routes, data flow, and all 88 existing tests must remain green after every task. Restyle-only tasks must not change component logic or props.
- No new npm dependencies. `.jsx`/`.js` only.
- Every page keeps its `SEO` component usage and Bulgarian copy (rewrite copy only where a task explicitly provides the new text).
- Availability colors (emerald/amber/red) remain exclusively semantic.
- `prefers-reduced-motion` respected in every animated component (via framer-motion's `useReducedMotion`).
- Tailwind classes for new tokens: `bg-plaster`, `text-ink`, `text-graphite`, `text-gold`, `bg-gold`, `border-concrete` etc. (defined in Task 1). Legacy token classes (`primary-*`, `gold-*` scale, `shadow-luxury*`) remain defined so untouched pages keep working; each page task removes its own usages.
- Commits: conventional subject + trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Windows; use the Bash tool (Git Bash) for shell commands.

## File Structure

```
index.html                              # MODIFY: add Playfair Display cyrillic+italic (Task 1)
tailwind.config.js                      # MODIFY: new tokens, display font, easing, keyframes (Task 1)
src/index.css                           # MODIFY: body defaults, selection, focus ring (Task 1)
src/utils/motion.js                     # NEW: EASE, fadeUp, stagger, viewportOnce presets (Task 1)
src/components/ui/DimensionLine.jsx     # NEW: signature motif (Task 2)
src/components/ui/DisplayHeading.jsx    # NEW: Playfair display with gold-italic accent (Task 2)
src/components/ui/Reveal.jsx            # NEW: scroll-reveal wrapper (Task 2)
src/components/ui/AnimatedNumber.jsx    # NEW: count-up number (Task 2)
src/components/ui/Button.jsx            # NEW: gold / ghost / dark variants (Task 2)
src/components/common/Navbar.jsx        # REWRITE (Task 3)
src/components/common/Footer.jsx        # REWRITE (Task 3)
src/hooks/useSiteAvailability.js        # NEW: live totals across both projects (Task 4)
src/pages/Home.jsx                      # REWRITE (Task 5)
src/components/ui/HeroCarousel.jsx      # DELETE in Task 5 (replaced by in-page hero)
src/pages/Projects.jsx                  # RESTYLE (Task 6)
src/components/GoldenResidenceBlockSelection.jsx  # RESTYLE (Task 7)
src/components/MnogofamilnaBlockSelection.jsx     # RESTYLE (Task 7)
src/pages/ProjectExplorer.jsx + src/components/explorer/*  # STYLING-ONLY POLISH (Task 8)
src/pages/Contact.jsx                   # RESTYLE, logic untouched (Task 9)
src/pages/About.jsx                     # RESTYLE (Task 10)
src/pages/Blog.jsx                      # RESTYLE (Task 10)
src/utils/animations.js                 # DELETE in Task 11 once no consumers remain
src/App.jsx                             # MODIFY: unified page transition (Task 11)
```

---

### Task 1: Design Foundations (fonts, tokens, motion presets)

**Files:**
- Modify: `index.html` (font links, ~line 57–60)
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Create: `src/utils/motion.js`
- Test: `src/utils/motion.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces (used by every later task):
  - Tailwind classes: `bg-plaster`, `bg-ink`, `text-ink`, `text-graphite`, `text-gold`, `text-gold-deep`, `bg-gold`, `hover:bg-gold-deep`, `border-concrete`, `font-display` (Playfair), `tracking-eyebrow`, `animate-kenburns`.
  - `src/utils/motion.js` exports: `EASE` (array), `fadeUp` (variants `{initial, animate}`), `fadeUpChild`, `stagger(delayChildren?)` (container variants), `viewportOnce` (`{once: true, amount: 0.3}`), `hoverZoom` (`{scale: 1.04, transition: {duration: 0.8, ease: EASE}}`).

- [ ] **Step 1: Load Playfair Display (cyrillic + italic) in `index.html`**

Next to the existing Inter preload block (index.html:57–60), add the same preload pattern for:
```html
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap&subset=cyrillic" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap&subset=cyrillic" rel="stylesheet"></noscript>
```

- [ ] **Step 2: Extend `tailwind.config.js` theme**

Inside `theme.extend.colors` add (keep every existing color — legacy pages still use them until their tasks):
```js
        plaster: '#F6F5F1',
        ink: '#1B1A17',
        graphite: '#57544E',
        // gold scale already exists; add the two redesign aliases:
        'gold-accent': '#C7A032',
        'gold-deep': '#A8862A',
        concrete: '#DEDBD4',
```
Note: `text-gold`/`bg-gold` in this plan's class recipes mean the NEW accent — since `gold` is already a scale object, the redesign classes are `text-gold-accent`, `bg-gold-accent`, `hover:bg-gold-deep`. Every recipe below writes them explicitly as `gold-accent`.

Inside `theme.extend` also add:
```js
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      letterSpacing: { eyebrow: '0.18em' },
      transitionTimingFunction: { luxe: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        // keep existing keyframes; add:
        kenburns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.08)' } },
      },
      animation: {
        // keep existing; add:
        kenburns: 'kenburns 18s ease-in-out infinite alternate',
      },
```
(`fontFamily` replaces the existing block — note it drops the old `serif`/`display: Inter` entries; grep `font-serif|font-display` first: `grep -rn "font-serif\|font-display" src/` — update any legacy usage sites to `font-display` semantics or leave `serif` mapped to Playfair too if hits exist; record what you found in the report.)

- [ ] **Step 3: Base styles in `src/index.css`**

In the `@layer base` (or top of file after the Tailwind directives — match the file's existing structure), set:
```css
@layer base {
  body {
    @apply bg-plaster text-ink antialiased;
  }
  ::selection {
    background: #c7a03233;
  }
  :focus-visible {
    outline: 2px solid #c7a032;
    outline-offset: 2px;
  }
}
```
Do not remove existing rules (scrollbar hiding etc.).

- [ ] **Step 4: Write the failing test for motion presets**

`src/utils/motion.test.js`:
```js
import { EASE, fadeUp, fadeUpChild, stagger, viewportOnce, hoverZoom } from './motion'

test('EASE is the luxe cubic-bezier tuple', () => {
  expect(EASE).toEqual([0.22, 1, 0.36, 1])
})

test('fadeUp reveals from 24px below', () => {
  expect(fadeUp.initial).toEqual({ opacity: 0, y: 24 })
  expect(fadeUp.animate.opacity).toBe(1)
  expect(fadeUp.animate.y).toBe(0)
  expect(fadeUp.animate.transition.ease).toEqual(EASE)
})

test('stagger produces container variants with configurable child delay', () => {
  expect(stagger().animate.transition.staggerChildren).toBe(0.08)
  expect(stagger(0.2).animate.transition.staggerChildren).toBe(0.2)
})

test('viewportOnce triggers once at 30%', () => {
  expect(viewportOnce).toEqual({ once: true, amount: 0.3 })
})

test('hoverZoom is the 1.04 slow zoom', () => {
  expect(hoverZoom.scale).toBe(1.04)
  expect(hoverZoom.transition.duration).toBe(0.8)
})
```

- [ ] **Step 5: Run to verify failure** — `npm test` → FAIL (cannot resolve `./motion`).

- [ ] **Step 6: Implement `src/utils/motion.js`**

```js
// The redesign's single motion grammar (see plan "Design Direction").
export const EASE = [0.22, 1, 0.36, 1]

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const fadeUpChild = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const stagger = (staggerChildren = 0.08) => ({
  initial: {},
  animate: { transition: { staggerChildren } },
})

export const viewportOnce = { once: true, amount: 0.3 }

export const hoverZoom = { scale: 1.04, transition: { duration: 0.8, ease: EASE } }
```

- [ ] **Step 7: Verify** — `npm test` (all green incl. existing 88) and `npm run build` (font links + tailwind compile fine). Load `npm run dev` and confirm in the served HTML that the Playfair stylesheet link is present.

- [ ] **Step 8: Commit**

```bash
git add index.html tailwind.config.js src/index.css src/utils/motion.js src/utils/motion.test.js
git commit -m "feat(design): redesign tokens, Playfair Display cyrillic, motion presets

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Design Primitives

**Files:**
- Create: `src/components/ui/DimensionLine.jsx`, `src/components/ui/DisplayHeading.jsx`, `src/components/ui/Reveal.jsx`, `src/components/ui/AnimatedNumber.jsx`, `src/components/ui/Button.jsx`
- Test: `src/components/ui/primitives.test.jsx`

**Interfaces:**
- Consumes: `EASE`, `fadeUp`, `viewportOnce` from Task 1.
- Produces (used by Tasks 3–11):
  - `<DimensionLine label="Продажби" />` — eyebrow text + self-drawing gold dimension rule. Props: `label` (string, required), `dark` (bool — light text for ink backgrounds), `className`.
  - `<DisplayHeading as="h2" size="section|hero" className>` children — Playfair heading; `<em>` children render italic gold (accent word).
  - `<Reveal as="div" delay={0} className>` — whileInView fadeUp wrapper (reduced-motion → opacity only).
  - `<AnimatedNumber value={128} className />` — counts 0→value on first view (reduced-motion → static).
  - `<Button variant="gold|ghost|dark" as={Link|'button'|'a'} ...rest>` — the only CTA styles.

- [ ] **Step 1: Write the failing tests**

`src/components/ui/primitives.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import DimensionLine from './DimensionLine'
import DisplayHeading from './DisplayHeading'
import Reveal from './Reveal'
import AnimatedNumber from './AnimatedNumber'
import Button from './Button'

test('DimensionLine renders eyebrow label and rule with end ticks', () => {
  const { container } = render(<DimensionLine label="Продажби" />)
  expect(screen.getByText('Продажби')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-tick]')).toHaveLength(2)
  expect(container.querySelector('[data-rule]')).toBeInTheDocument()
})

test('DisplayHeading renders requested tag with display font class', () => {
  render(<DisplayHeading as="h1" size="hero">Изберете своя <em>дом</em></DisplayHeading>)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.className).toMatch(/font-display/)
  expect(h1.querySelector('em')).toHaveTextContent('дом')
})

test('Reveal renders children', () => {
  render(<Reveal><p>съдържание</p></Reveal>)
  expect(screen.getByText('съдържание')).toBeInTheDocument()
})

test('AnimatedNumber shows the final value', async () => {
  render(<AnimatedNumber value={128} />)
  expect(await screen.findByText('128')).toBeInTheDocument()
})

test('Button variants render as link or button with gold styling', () => {
  render(
    <MemoryRouter>
      <Button as={Link} to="/projects" variant="gold">Разгледайте сградите</Button>
    </MemoryRouter>,
  )
  const link = screen.getByRole('link', { name: 'Разгледайте сградите' })
  expect(link).toHaveAttribute('href', '/projects')
  expect(link.className).toMatch(/bg-gold-accent/)
  render(<Button variant="ghost">Още</Button>)
  expect(screen.getByRole('button', { name: 'Още' }).className).toMatch(/border-concrete|border-ink/)
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (modules missing).

- [ ] **Step 3: Implement the five primitives**

`src/components/ui/DimensionLine.jsx`:
```jsx
import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// The redesign's signature: an architect's dimension line under a small
// uppercase eyebrow. Draws itself left-to-right when scrolled into view.
export default function DimensionLine({ label, dark = false, className = '' }) {
  const reduce = useReducedMotion()
  const tickColor = 'bg-gold-accent'
  return (
    <div className={`mb-4 ${className}`}>
      <div className={`text-xs font-semibold uppercase tracking-eyebrow ${dark ? 'text-plaster/70' : 'text-graphite'}`}>
        {label}
      </div>
      <div className="mt-2 flex h-[7px] w-24 items-center" aria-hidden="true">
        <span data-tick className={`h-[7px] w-px ${tickColor}`} />
        <motion.span
          data-rule
          className="h-px flex-1 origin-left bg-gold-accent"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        <span data-tick className={`h-[7px] w-px ${tickColor}`} />
      </div>
    </div>
  )
}
```

`src/components/ui/DisplayHeading.jsx`:
```jsx
// Playfair display heading; <em> children become the gold italic accent word.
const SIZES = {
  hero: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05]',
  section: 'text-3xl sm:text-4xl lg:text-5xl leading-[1.12]',
  sub: 'text-2xl sm:text-3xl leading-[1.15]',
}

export default function DisplayHeading({ as: Tag = 'h2', size = 'section', className = '', children }) {
  return (
    <Tag className={`font-display font-medium [&_em]:font-normal [&_em]:italic [&_em]:text-gold-accent ${SIZES[size]} ${className}`}>
      {children}
    </Tag>
  )
}
```

`src/components/ui/Reveal.jsx`:
```jsx
import { motion, useReducedMotion } from 'framer-motion'
import { EASE, viewportOnce } from '../../utils/motion'

export default function Reveal({ as = 'div', delay = 0, className = '', children }) {
  const reduce = useReducedMotion()
  const M = motion[as] ?? motion.div
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}
```

`src/components/ui/AnimatedNumber.jsx`:
```jsx
import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

export default function AnimatedNumber({ value, duration = 1.2, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 1 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView || reduce) { setDisplay(value); return }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduce])

  return <span ref={ref} className={className}>{display}</span>
}
```

`src/components/ui/Button.jsx`:
```jsx
const VARIANTS = {
  gold: 'bg-gold-accent text-ink hover:bg-gold-deep',
  ghost: 'border border-concrete text-ink hover:border-ink',
  dark: 'bg-ink text-plaster hover:bg-black',
}

export default function Button({ as: Tag = 'button', variant = 'gold', className = '', children, ...rest }) {
  return (
    <Tag
      className={`inline-flex min-h-[44px] items-center justify-center px-7 py-3 text-sm font-semibold transition-colors duration-300 ease-luxe ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass** — `npm test` → all green. (jsdom note: `useInView` never fires in jsdom; `AnimatedNumber`'s `findByText('128')` passes only via the effect's `inView || reduce` path — if the test can't observe 128, render the final value immediately when `typeof IntersectionObserver === 'undefined'`: add `const canObserve = typeof IntersectionObserver !== 'undefined'` and treat `!canObserve` like `reduce`. Implement that guard — jsdom lacks IntersectionObserver and several existing tests stub it globally, so the guard must check for the stub too: run the test, and if it fails, apply the guard until green. Document which path fired in your report.)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DimensionLine.jsx src/components/ui/DisplayHeading.jsx src/components/ui/Reveal.jsx src/components/ui/AnimatedNumber.jsx src/components/ui/Button.jsx src/components/ui/primitives.test.jsx
git commit -m "feat(design): dimension-line signature and display/reveal/number/button primitives

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 3: Navbar + Footer

**Files:**
- Rewrite: `src/components/common/Navbar.jsx` (keep the same nav links/routes — read the current file first and carry over the exact link list and the `Logo`/logo image import it uses)
- Rewrite: `src/components/common/Footer.jsx` (carry over the real contact data/links from the current file — phone, address, email, social — do not invent new data)
- Test: `src/components/common/chrome.test.jsx`

**Interfaces:**
- Consumes: `DimensionLine` (footer section labels), Task 1 tokens.
- Produces: same-named default exports consumed by `App.jsx` (no App changes needed).

**Design (binding):**
- Navbar: fixed top, starts transparent over the page (`bg-transparent`), becomes `bg-plaster/90 backdrop-blur border-b border-concrete` after `window.scrollY > 24` (listener with cleanup). Height `h-16`. Left: logo image at `h-9 w-9` + wordmark "КСМ Строй" in `font-display text-lg text-ink` (white `text-plaster` while transparent over the dark hero — drive via the same scrolled boolean: unscrolled = light text, scrolled = ink text). Right: nav links in Inter 500 14px with a gold underline that draws on hover/active: `relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold-accent after:transition-transform after:duration-300 hover:after:scale-x-100` (+ `after:scale-x-100` when `location.pathname` matches). Mobile: burger → full-screen `bg-ink text-plaster` overlay menu with links in `font-display text-3xl`, staggered fadeUp on open, close on link click. `aria-expanded` on the burger.
- Footer: `bg-ink text-plaster`. Three columns on desktop (brand + one-line mission; "Навигация" links; "Контакти" with the real phone/email/address), each column headed by `<DimensionLine dark label="..." />`. Bottom strip: hairline `border-t border-plaster/10`, © line "© {new Date().getFullYear()} КСМ Строй. Всички права запазени." No gradients, no icon grids.

- [ ] **Step 1: Read the current files** — `src/components/common/Navbar.jsx` and `Footer.jsx`; list (in your report) the exact nav links, logo import, and footer contact data you are carrying over.

- [ ] **Step 2: Write the failing tests**

`src/components/common/chrome.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

test('navbar renders all primary links', () => {
  wrap(<Navbar />)
  for (const label of ['Начало', 'За нас', 'Продажби', 'Контакти']) {
    expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
  }
})

test('navbar becomes solid after scroll', () => {
  wrap(<Navbar />)
  const nav = screen.getByRole('navigation')
  expect(nav.className).toMatch(/bg-transparent/)
  fireEvent.scroll(window, { target: { scrollY: 100 } })
  // jsdom: set scrollY manually before dispatch
})

test('mobile menu opens with aria-expanded', () => {
  wrap(<Navbar />)
  const burger = screen.getByRole('button', { name: /меню/i })
  expect(burger).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(burger)
  expect(burger).toHaveAttribute('aria-expanded', 'true')
})

test('footer shows brand, navigation and current year', () => {
  wrap(<Footer />)
  expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument()
  expect(screen.getByText('Навигация')).toBeInTheDocument()
  expect(screen.getByText('Контакти')).toBeInTheDocument()
})
```
For the scroll test in jsdom: `Object.defineProperty(window, 'scrollY', { value: 100, writable: true }); fireEvent.scroll(window)` then assert `nav.className` matches `/bg-plaster/`. Write it that way.

- [ ] **Step 3: Run to verify failure**, **Step 4: Implement both components** per the Design block (carrying over links/data from Step 1), **Step 5: Run all tests green** (`npm test` — the existing suite must stay green; `App.routes.test.jsx` renders the real Navbar/Footer, so watch it), **Step 6: Visual check** — `npm run dev`, load `/` and `/projects`, confirm: transparent over hero → solid on scroll, underline draw on hover, mobile overlay at 390px, footer columns with dimension lines.

- [ ] **Step 7: Commit**

```bash
git add src/components/common/Navbar.jsx src/components/common/Footer.jsx src/components/common/chrome.test.jsx
git commit -m "feat(design): redesigned navbar with scroll state and editorial footer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `useSiteAvailability` Hook (live totals for the hero + landing)

**Files:**
- Create: `src/hooks/useSiteAvailability.js`
- Test: `src/hooks/useSiteAvailability.test.jsx`

**Interfaces:**
- Consumes: `useApartments()` (`getProjectFloorData`), `PROJECTS` config, `summarizeFloor`.
- Produces: `useSiteAvailability(): { available, total, byProject: { [projectId]: { available, total, name } }, loading }` — counts ONLY configured residential floors (mnogo floor 0 garages excluded by construction, same rule Plan A's stats fix established).

- [ ] **Step 1: Write the failing test**

`src/hooks/useSiteAvailability.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider } from '../context/ApartmentContext'
import useSiteAvailability from './useSiteAvailability'

function Probe() {
  const { available, total, byProject, loading } = useSiteAvailability()
  if (loading) return <div>loading</div>
  return (
    <div>
      <div data-testid="total">{total}</div>
      <div data-testid="available">{available}</div>
      <div data-testid="mnogo-total">{byProject['mnogofamilna-sgrada'].total}</div>
    </div>
  )
}

test('sums fallback availability across both projects, excluding mnogo garages', async () => {
  render(<ApartmentProvider><Probe /></ApartmentProvider>)
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
  // Golden fallback = 192 apartments; mnogo residential fallback = 144 (NOT 151)
  expect(screen.getByTestId('mnogo-total')).toHaveTextContent('144')
  expect(Number(screen.getByTestId('total').textContent)).toBe(192 + 144)
  expect(Number(screen.getByTestId('available').textContent)).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: Implement**

`src/hooks/useSiteAvailability.js`:
```js
import { useMemo } from 'react'
import { useApartments } from '../context/ApartmentContext'
import { PROJECTS } from '../config/projects'
import { summarizeFloor } from '../utils/availability'

// Live availability across all configured residential floors of both
// projects — the number the hero leads with. Mnogo garage rows (floor
// key 0) are excluded because they are not in any project's floors config.
export default function useSiteAvailability() {
  const { getProjectFloorData, loading } = useApartments()

  return useMemo(() => {
    const byProject = {}
    let available = 0
    let total = 0
    for (const project of Object.values(PROJECTS)) {
      let pAvailable = 0
      let pTotal = 0
      for (const block of project.blocks) {
        const floorData = getProjectFloorData(project.id, block.id) || {}
        for (const floor of project.floors[block.id]) {
          const s = summarizeFloor(floorData[floor] ?? [])
          pAvailable += s.available
          pTotal += s.total
        }
      }
      byProject[project.id] = { available: pAvailable, total: pTotal, name: project.name }
      available += pAvailable
      total += pTotal
    }
    return { available, total, byProject, loading }
  }, [getProjectFloorData, loading])
}
```

- [ ] **Step 4: Run tests green** (verify the golden fallback total really is 192 — if the assertion fails, print the actual totals, confirm against `src/constants/apartmentFallbackData.js`, and correct the TEST constant, not the hook), **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: site-wide live availability hook for hero and landing

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Home Page (the orchestrated hero + editorial sections)

**Files:**
- Rewrite: `src/pages/Home.jsx`
- Delete: `src/components/ui/HeroCarousel.jsx` (and its import in Home; grep for other consumers first — expect none)
- Test: `src/pages/Home.test.jsx`

**Interfaces:**
- Consumes: `DimensionLine`, `DisplayHeading`, `Reveal`, `AnimatedNumber`, `Button`, `useSiteAvailability`, motion presets, `SEO` + `seoData` (keep existing SEO usage from current Home.jsx), existing images: hero uses `/images/golden-residence/building-2.webp` (public path, same as explorer); services images `img001`, `imgPhoto4`, `img003` (keep the current imports at Home.jsx:6–8).
- Produces: nothing consumed downstream.

**Page structure (binding — real copy included):**

1. **Hero** — full viewport (`relative h-[92vh] min-h-[560px] overflow-hidden bg-ink`):
   - Background: `<motion.img src="/images/golden-residence/building-2.webp" ...>` covering (`absolute inset-0 h-full w-full object-cover`), load animation `initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }}`, then class `animate-kenburns` (skip both when `useReducedMotion()`); dark legibility gradient overlay `bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10`.
   - Content block bottom-left (`absolute inset-x-0 bottom-0 pb-16 sm:pb-20`, container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`), staggered children (container `stagger(0.12)`, children `fadeUpChild`):
     - `<DimensionLine dark label="Строителна компания · София" />`
     - `<DisplayHeading as="h1" size="hero" className="max-w-3xl text-plaster">Изберете своя дом <em>етаж по етаж</em>.</DisplayHeading>`
     - Sub (Inter, `text-plaster/80 max-w-xl mt-5`): "Реална наличност на всеки апартамент — обновява се на живо от нашия отдел продажби."
     - Live trust line (`mt-8 flex items-center gap-3 text-plaster`): a pulsing gold dot (`<span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-accent opacity-60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-accent" /></span>` — wrap the ping in the reduced-motion check) + `<span className="font-display text-2xl"><AnimatedNumber value={available} /> свободни апартамента</span>` + `<span className="text-plaster/60 text-sm">в 2 сгради в момента</span>`.
     - CTA row (`mt-8 flex gap-4`): `<Button as={Link} to="/projects" variant="gold">Разгледайте сградите</Button>` and `<Button as={Link} to="/contact" variant="ghost" className="border-plaster/40 text-plaster hover:border-plaster">Свържете се с нас</Button>`.
2. **Projects duo** (`bg-plaster py-20 sm:py-28`): `<DimensionLine label="Активни продажби" />` + `<DisplayHeading>Две сгради, <em>реална</em> наличност.</DisplayHeading>` then two `<Reveal>` cards side-by-side (`grid lg:grid-cols-2 gap-6 mt-12`): each an overflow-hidden `rounded-2xl` link to its project (`/projects/golden-residence` and `/projects/mnogofamilna-sgrada`) with its render (`golden-residence/building-2.webp` public path; mnogo — import `sgrada1.webp` the same way `src/config/projects.js` does), `whileHover` zoom on the img via `hoverZoom`, dark bottom gradient, and overlaid: project name in `font-display text-2xl text-plaster`, availability line `{byProject[id].available} свободни от {byProject[id].total}` in `text-plaster/80 text-sm`, and a `text-gold-accent text-sm font-semibold` "Разгледайте →".
3. **Services** (`bg-plaster pb-20 sm:pb-28`): `<DimensionLine label="Какво правим" />` + heading "Строим, ремонтираме, <em>завършваме</em>." Keep the three services from current Home.jsx:12–28 (same images and text) but as editorial rows: `grid md:grid-cols-3 gap-6`, each `<Reveal>` = image (`aspect-[4/3] rounded-2xl object-cover w-full`) + title (`font-display text-xl mt-4`) + description (`text-graphite text-sm mt-2 leading-relaxed`). NO icon boxes, NO card borders.
4. **Stats band** (`bg-ink text-plaster py-20`): `<DimensionLine dark label="Числата" />` + 4 stats from current Home.jsx:30–35 in `grid grid-cols-2 lg:grid-cols-4 gap-10`, each: `<AnimatedNumber>`-driven number where numeric (`15`, `200`, `50`, `100`) with its suffix (`+`, `+`, `+`, `%`) in `font-display text-5xl text-gold-accent`, label below in `text-plaster/60 text-sm`. (Parse the numbers statically — write them as `{ value: 15, suffix: '+', label: 'Години опит' }` etc.)
5. **Closing CTA** (`bg-plaster py-24 text-center`): `<DisplayHeading>Готови ли сте да видите <em>своя</em> апартамент?</DisplayHeading>` + sub "Разгледайте свободните апартаменти или ни се обадете — отговаряме същия ден." + `<Button as={Link} to="/projects" variant="dark">Към сградите</Button>`.

- [ ] **Step 1: Write the failing test**

`src/pages/Home.test.jsx`:
```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider } from '../context/ApartmentContext'
import Home from './Home'

const renderHome = () =>
  render(
    <MemoryRouter>
      <ApartmentProvider><Home /></ApartmentProvider>
    </MemoryRouter>,
  )

test('hero leads with the live availability thesis', async () => {
  renderHome()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Изберете своя дом')
  await waitFor(() => expect(screen.getByText(/свободни апартамента/)).toBeInTheDocument())
})

test('both project cards link to their pages with live counts', async () => {
  renderHome()
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /Golden Residence/i })).toHaveAttribute('href', '/projects/golden-residence')
  })
  expect(screen.getByRole('link', { name: /Многофамилна/i })).toHaveAttribute('href', '/projects/mnogofamilna-sgrada')
})

test('primary CTA goes to Продажби', () => {
  renderHome()
  expect(screen.getByRole('link', { name: 'Разгледайте сградите' })).toHaveAttribute('href', '/projects')
})
```

- [ ] **Step 2: Run to verify failure**, **Step 3: Implement Home.jsx** per the structure above (single file, sections as local components inside it if that keeps it readable; keep `SEO` + structured data from the current file's top), **Step 4: Delete HeroCarousel** (`grep -rn "HeroCarousel" src/` must show no remaining consumers → `git rm src/components/ui/HeroCarousel.jsx`), **Step 5: All tests green + build passes**, **Step 6: Visual check** in dev — verify the orchestration order (image settles → lines rise → number counts), Ken Burns drift, both cards zoom on hover, 390px layout stacks cleanly.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.test.jsx
git rm src/components/ui/HeroCarousel.jsx
git commit -m "feat(design): orchestrated live-availability hero and editorial home page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Продажби Landing (Projects.jsx)

**Files:**
- Restyle: `src/pages/Projects.jsx` (post-Plan-A it is ~144 lines: header + two property cards + navigation handlers; keep ALL handlers, `SEO`, and `properties.js` data usage)
- Test: extend `src/pages/Projects.test.jsx` if it exists, else create with the render test below.

**Interfaces:**
- Consumes: primitives, `useSiteAvailability` (per-project counts), motion presets.
- Produces: nothing downstream.

**Design (binding):** page header (`bg-plaster pt-28 pb-12` to clear the fixed navbar): `<DimensionLine label="Продажби" />` + `<DisplayHeading as="h1">Изберете <em>сграда</em>.</DisplayHeading>` + one-line sub in `text-graphite`. Then the two projects as full-width alternating panels (`space-y-8 pb-24`): each panel `grid lg:grid-cols-5 rounded-2xl overflow-hidden border border-concrete bg-white` — render on 3 columns (`aspect-[16/10] lg:aspect-auto object-cover h-full w-full`, hover `hoverZoom`), info on 2 columns (`p-8 lg:p-12 flex flex-col justify-center`): project name `font-display text-3xl`, location/description from `properties.js`, live line `<span className="text-gold-accent font-display text-4xl"><AnimatedNumber value={byProject[id].available} /></span> <span className="text-graphite text-sm">свободни апартамента</span>`, `<Button variant="dark">Разгледайте сградата</Button>` wired to the existing navigation handler. Second panel reverses column order (`lg:[direction:rtl]` on the grid with `[direction:ltr]` on children, or an `lg:order-*` pair — use order classes).

- [ ] **Step 1: Write/extend the failing test** — render Projects inside MemoryRouter+ApartmentProvider (mock sheets service as in Task 5's test), assert: `heading level 1` contains "Изберете", both project names render, and two "Разгледайте сградата" buttons exist.
- [ ] **Step 2: Run to verify failure**, **Step 3: Restyle** (keep `openProject` handlers and card click targets identical — buttons AND panel image clicks navigate), **Step 4: Full suite green** (`App.routes.test.jsx` covers /projects rendering — must stay green), **Step 5: Visual check** dev: panels alternate, counts count up, hover zoom, mobile stack.
- [ ] **Step 6: Commit**

```bash
git add src/pages/Projects.jsx src/pages/Projects.test.jsx
git commit -m "feat(design): immersive alternating project panels on Продажби landing

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 7: Block Selection Pages

**Files:**
- Restyle: `src/components/GoldenResidenceBlockSelection.jsx`, `src/components/MnogofamilnaBlockSelection.jsx` (keep routes, `handleBlockSelect` targets `block-a`/`block-b`, and existing image imports; strip the gradient-text headers and glassmorphism buttons)
- Test: `src/components/blockSelection.test.jsx`

**Design (binding):** shared layout for both pages: `bg-plaster min-h-screen pt-28 pb-16`; header = `<DimensionLine label={projectName} />` + `<DisplayHeading as="h1">Изберете <em>вход</em>.</DisplayHeading>` (Golden uses "блок" instead of "вход": `Изберете <em>блок</em>.`). Below: two `<Reveal>` panels in `grid md:grid-cols-2 gap-6`: each `relative overflow-hidden rounded-2xl group cursor-pointer aspect-[4/5] md:aspect-[3/4]` with the block's existing background image (`object-cover w-full h-full`, `hoverZoom` on hover), bottom gradient `from-ink/80 to-transparent`, overlaid bottom-left: block name in `font-display text-4xl text-plaster` + apartment count line in `text-plaster/70 text-sm` (keep each page's real counts from the current files) + `text-gold-accent text-sm font-semibold` "Преглед на блока →" (МН: "Преглед на входа →" if the current copy says вход — carry over whichever noun the current page uses). Whole panel is the click target (keyboard: `role="button"` `tabIndex=0` Enter/Space → same handler).

- [ ] **Step 1: Read both current files**; record in the report the exact images, counts, and copy carried over.
- [ ] **Step 2: Failing tests** — for each page (MemoryRouter + mocked `useNavigate` via `vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mockNavigate }))`): renders both block panels; clicking panel А calls navigate with the page's `/projects/<project>/block-a` path; Enter key on a focused panel does the same.
- [ ] **Step 3: Implement**, **Step 4: All green + visual check** (hover zoom, focus ring visible, 390px stacks), **Step 5: Commit**

```bash
git add src/components/GoldenResidenceBlockSelection.jsx src/components/MnogofamilnaBlockSelection.jsx src/components/blockSelection.test.jsx
git commit -m "feat(design): editorial block selection pages

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Explorer Visual Polish (styling-only)

**Files:**
- Modify (classNames/layout ONLY — no logic, props, handlers, or test-behavior changes): `src/pages/ProjectExplorer.jsx`, `src/components/explorer/LiveStatsBar.jsx`, `src/components/explorer/AvailabilityLegend.jsx`, `src/components/explorer/AvailabilityBadge.jsx`, `src/components/explorer/ApartmentPanel.jsx`, `src/components/explorer/GarageGrid.jsx`, `src/components/explorer/FloorPlanViewer.jsx` (container/button classes only — not the SVG overlay logic)

**Design (binding):**
- Page: `bg-plaster pt-24` (clear fixed navbar); page header row becomes: back link in `text-graphite hover:text-ink text-sm`, `<DimensionLine label={project.name} />` above an `<DisplayHeading as="h1" size="sub">` title; `LiveStatsBar` moves under the heading on mobile (existing responsive wrap is fine — class tweaks only).
- All `shadow-luxury`/`shadow-lg` white cards in these files → `bg-white border border-concrete rounded-2xl` (no shadow). Floor-list buttons: `border-concrete`, hover `border-ink`, active floor `border-gold-accent bg-gold-accent/5` (replace the current `border-gold-500 bg-gold-50`). Legend/badge/stats typography: numbers in `font-display`, labels `text-graphite`. ApartmentPanel: header apartment number in `font-display text-3xl`; CTA becomes `<Button as={Link} variant="gold" ...>` — import the Task 2 Button; keep the exact `to` URL and label "Изпратете запитване" (the ApartmentPanel test asserts href and label — keep them identical). GarageGrid cells keep their availability colors (semantic) but drop rounded-lg → `rounded-md` and use `border-concrete` for unknown.
- Availability POLYGON colors, fills, opacities: UNTOUCHED (spec-locked in Plan A).

- [ ] **Step 1: Apply the restyle file-by-file**, running `npx vitest run src/components/explorer src/pages` after each file — the existing tests are the behavioral contract; zero test edits allowed EXCEPT class-assertion updates if a test asserted a legacy class (`grep -rn "gold-50\|shadow-luxury" src --include="*.test.jsx"` first; report any).
- [ ] **Step 2: Full suite green + build**, **Step 3: Visual check** both projects: facade page, floor view, panel, garages — confirm the explorer now visually matches Home/Продажби (plaster background, hairlines, display numbers).
- [ ] **Step 4: Commit**

```bash
git add src/pages/ProjectExplorer.jsx src/components/explorer/
git commit -m "style(explorer): align apartment explorer with the redesign system

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Контакти

**Files:**
- Restyle: `src/pages/Contact.jsx` (~530 lines post-Odoo-merge). LOGIC FROZEN: `useForm` config, `onSubmit`, `sendToOdoo`, EmailJS call, honeypot field (`company` — keep it rendered, hidden, registered exactly as-is), prefill `useEffect`, all `register(...)` names and validation rules. Restyle wrappers, labels, inputs, buttons, success/error states only.
- Test: existing `src/pages/Contact.test.jsx` must pass UNCHANGED (it asserts the prefill and the dual-payload submit — the behavioral contract).

**Design (binding):** `bg-plaster pt-28 pb-24`; header `<DimensionLine label="Контакти" />` + `<DisplayHeading as="h1">Да поговорим за <em>вашия</em> дом.</DisplayHeading>` + sub "Отговаряме в рамките на един работен ден." Two columns (`grid lg:grid-cols-5 gap-10 mt-12`): form on 3 (`bg-white border border-concrete rounded-2xl p-8`), contact info on 2 (no card — plain editorial list, each item with a small `text-graphite text-xs uppercase tracking-eyebrow` label above the value in `text-ink text-lg`; carry over the real phone/email/address/hours from the current file). Inputs: `w-full border-0 border-b border-concrete bg-transparent px-0 py-3 focus:border-gold-accent focus:ring-0 text-ink placeholder:text-graphite/60` (underline style — distinctive, calm); labels `text-xs font-semibold uppercase tracking-eyebrow text-graphite mb-1`. Submit: `<Button variant="gold" type="submit" disabled={isSubmitting}>` with the current submitting/submitted copy. Error text stays red, success state restyled to a `border border-emerald-200 bg-emerald-50` note (semantic green is allowed here — it reports a successful action, not decoration... it IS availability-adjacent; instead use `border-concrete bg-plaster` with a gold check icon and ink text — availability colors stay exclusive).

- [ ] **Step 1: Restyle** (JSX wrappers/classes only around the frozen logic), **Step 2: `npx vitest run src/pages/Contact.test.jsx` — green with ZERO test edits**, then full suite + build, **Step 3: Visual check** incl. `?apartment=А 301` prefill and a dry submit (validation errors show; don't actually send), **Step 4: Commit**

```bash
git add src/pages/Contact.jsx
git commit -m "style(contact): editorial contact page with underline form fields

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: За нас + Blog

**Files:**
- Restyle: `src/pages/About.jsx` (~884 lines), `src/pages/Blog.jsx` (~780 lines). Content (text, images, data arrays) carried over verbatim; structure and classes replaced. Both pages keep `SEO`.
- Test: `src/pages/staticPages.test.jsx` (new)

**Design (binding):**
- За нас: opening statement section (`bg-plaster pt-28 pb-16`): `<DimensionLine label="За нас" />` + `<DisplayHeading as="h1">Строим от <em>15 години</em>. Оставаме след това.</DisplayHeading>` + the page's existing intro paragraph in a `max-w-2xl text-graphite text-lg leading-relaxed`. Then reuse the page's existing content blocks (history, values, team/process — whatever the current file contains; read it first) as alternating editorial sections: image `rounded-2xl` one side, `DimensionLine`+`DisplayHeading size="sub"`+body the other, `<Reveal>` on each. Any icon-grid "values" become a simple two-column list with gold hairline separators (`divide-y divide-concrete`). Stats blocks reuse `AnimatedNumber` in the Task 5 stats-band style.
- Blog: header (`<DimensionLine label="Блог" />` + `<DisplayHeading as="h1">Новини от <em>обекта</em>.</DisplayHeading>`), posts as an editorial list (`divide-y divide-concrete`): each row `py-8 grid md:grid-cols-4 gap-6` — date in `text-graphite text-sm` column, title in `font-display text-2xl hover:text-gold-deep transition-colors` + excerpt `text-graphite` in the wide column, thumbnail `rounded-xl aspect-[4/3] object-cover` last column. Keep whatever read-more/detail behavior exists today unchanged.

- [ ] **Step 1: Read both files**; record content inventory carried over.
- [ ] **Step 2: Failing test** — `staticPages.test.jsx`: render each page in MemoryRouter (mock sheets service as in Task 5 if the page pulls context); assert h1 texts ("Строим от", "Новини от") and that at least one blog post title from `src/data/blogData.js` renders.
- [ ] **Step 3: Implement**, **Step 4: Full suite + build green, visual check both pages** (alternating sections, list rhythm, 390px), **Step 5: Commit**

```bash
git add src/pages/About.jsx src/pages/Blog.jsx src/pages/staticPages.test.jsx
git commit -m "feat(design): editorial За нас and Блог pages

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Global Transitions, `srcset`, Cleanup, Verification, Push

**Files:**
- Modify: `src/App.jsx` (page transition + PageLoader restyle), `src/components/ui/OptimizedImage.jsx` or hero/card images (srcset), `scripts/optimize-images.js` (check — see Step 2)
- Delete: `src/utils/animations.js` (after zero consumers)
- Modify: any file still importing `src/utils/animations.js`

- [ ] **Step 1: Unified page transition** — in `App.jsx`, wrap `<Routes>` pages consistently: keep `AnimatePresence mode="wait"`; ensure every page's root motion element uses the same variants (`opacity 0→1, 0.35s, EASE` — no slide, no scale; pages that no longer have a root motion element after their rewrite get a shared `<PageTransition>` wrapper component created here in `src/components/ui/PageTransition.jsx`, ~15 lines, wrapping `children` in `motion.div` with those variants; apply to all routed pages). Restyle `PageLoader` (App.jsx:21–28): plaster background, small gold dimension-line pulse instead of the blue spinner (`animate-pulse` on a 96px gold rule), "Зареждане…" in `text-graphite text-sm`.
- [ ] **Step 2: Responsive hero/card images (spec §8 deferred item)** — generate 640/1024/1600px webp variants of the two renders used above the fold: check `scripts/optimize-images.js` for an existing resize pipeline (sharp is installed); add sizes there or a small `scripts/generate-srcset.mjs` (sharp resize loop, ~30 lines — write it if needed), output to `public/images/golden-residence/building-2-{640,1024,1600}.webp` and `public/images/mnogofamilna/sgrada1-{640,1024,1600}.webp` (create dir; import-based images switch to public paths for srcset use). Update the Home hero `<img>`, Home project cards, and Продажби panels to `srcSet`/`sizes` (`sizes="(max-width: 768px) 100vw, 50vw"` for cards, `100vw` hero). The explorer's facade image stays as-is (Plan A locked its dims to the map JSONs).
- [ ] **Step 3: Delete `src/utils/animations.js`** — `grep -rn "utils/animations" src/` → update any straggler (expected: none after Tasks 5–10; if a page still imports it, that page task missed it — fix the import to `utils/motion.js` equivalents), then `git rm src/utils/animations.js`.
- [ ] **Step 4: Full verification** — `npm test` (all green), `npm run lint` (error count ≤ the Task-14 baseline of 244 — report the number), `npm run build`, `grep -ril "tracer" dist/assets/ || echo CLEAN` → CLEAN, `node scripts/validate-maps.mjs` → ALL UNITS MAPPED. `npm run preview` + curl 200 checks on `/`, `/about`, `/blog`, `/contact`, `/projects`, both explorer URLs.
- [ ] **Step 5: Lighthouse** — mobile, against `http://localhost:4173/` and `/projects/golden-residence/block-a`; record performance score + LCP vs the Plan A numbers (perf 0.88 / LCP 3.5s on the explorer route); the new hero must not push home LCP above 4s — if it does, add `fetchpriority="high"` to the hero img and re-measure. Record final numbers in the report.
- [ ] **Step 6: Push** — `git push origin redesign`. Report the result.
- [ ] **Step 7: Commit** (before push)

```bash
git add -A
git commit -m "feat(design): unified page transitions, responsive hero images, legacy animation cleanup

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Visual Acceptance (applies to every page task; reviewers gate on it)

1. Page background is `plaster`, primary text `ink` — no leftover `bg-primary-50`/`bg-gray-*` surfaces in the touched file.
2. Every section heading is `DisplayHeading` with a `DimensionLine` above it — no hand-rolled eyebrows, no gradient text, no `shadow-gold-glow`.
3. Exactly one `<em>` accent word per display headline.
4. Gold appears ONLY as: dimension lines, `<em>` accents, big numbers, CTA/active states. Emerald/amber/red appear ONLY as availability.
5. Motion: only the grammar moves (reveal, hover zoom, hero orchestration, underline draw); `useReducedMotion` honored in anything the task animated.
6. Mobile 390px: no horizontal scroll, tap targets ≥44px, text legible over images (gradient scrims present).
7. The touched page keeps its `SEO` component and all pre-existing routes/handlers.

## Execution Notes

- Tasks 1→2→3 are strictly sequential. Task 4 needs only Task 1. Tasks 5–10 each need 1+2 (+3 visually, +4 for 5–6) and are otherwise independent — but execute sequentially (shared files like index.css/tailwind config are touched only by Task 1, so conflicts are unlikely; sequential keeps review clean).
- Implementers must READ the current page file before rewriting it and carry over all real content (copy, images, data, SEO props) — the redesign changes presentation, not information.
- After every task: full suite + build. The 88 Plan A tests are a hard floor.


