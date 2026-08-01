import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// Controllable useReducedMotion mock (see motion2.test.jsx for the rationale:
// framer-motion's real hook lazily caches a matchMedia read jsdom doesn't
// implement, so mocking the hook directly is the deterministic per-test knob).
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

beforeEach(() => {
  mockReduced = false
})

// PageTransition caches a module-level "has the app painted yet" flag so the
// very first page of a session skips its own enter animation. Each test that
// cares about that first-paint state needs an isolated module instance —
// vi.resetModules() + a fresh dynamic import gives every such test its own
// `appHasPainted = false`, independent of test order (same idiom already used
// in src/services/googleSheets.test.js for module-level state).
async function freshPageTransition() {
  vi.resetModules()
  const mod = await import('./PageTransition')
  return mod.default
}

test('reduced motion: the exported API is unchanged — `as` renders the requested tag with children, rest props and className', async () => {
  mockReduced = true
  const PageTransition = await freshPageTransition()
  render(
    <PageTransition as="main" className="wrap" id="page-root">
      контент
    </PageTransition>,
  )
  const root = screen.getByText('контент')
  expect(root.tagName).toBe('MAIN')
  expect(root).toHaveClass('wrap')
  expect(root).toHaveAttribute('id', 'page-root')
})

test('reduced motion: renders no curtain panel (previous opacity-only behavior)', async () => {
  mockReduced = true
  const PageTransition = await freshPageTransition()
  const { container } = render(<PageTransition as="div">съдържание</PageTransition>)
  expect(container.querySelector('[data-curtain]')).not.toBeInTheDocument()
})

test('defaults `as` to div when not provided', async () => {
  mockReduced = true
  const PageTransition = await freshPageTransition()
  const { container } = render(<PageTransition>текст</PageTransition>)
  expect(container.querySelector('div')).toBeInTheDocument()
})

test('non-reduced motion: honors the `as` prop and renders the given tag', async () => {
  const PageTransition = await freshPageTransition()
  const { container } = render(<PageTransition as="section">секция</PageTransition>)
  expect(container.querySelector('section')).toBeInTheDocument()
  expect(screen.getByText('секция')).toBeInTheDocument()
})

test('a page mounting after the first (route navigation) renders the ink curtain panel with a gold hairline', async () => {
  const PageTransition = await freshPageTransition()
  // Consume the "first paint of the session" slot with an initial mount...
  render(<PageTransition as="main">начало</PageTransition>)
  // ...then mount again the way a route change would (a fresh instance).
  const { container } = render(<PageTransition as="main">втора страница</PageTransition>)

  const panel = container.querySelector('[data-curtain]')
  expect(panel).toBeInTheDocument()
  expect(panel.querySelector('.bg-gold-accent')).toBeInTheDocument()
})

test('the very first page of a session still mounts a curtain panel instance (so its later route-away exit can animate)', async () => {
  const PageTransition = await freshPageTransition()
  const { container } = render(<PageTransition as="main">първа страница</PageTransition>)
  expect(container.querySelector('[data-curtain]')).toBeInTheDocument()
})

// Regression: the curtain panel's `initial` prop used to be hardcoded to the
// "initial" variant (y: 0%, i.e. fully covering) regardless of first-paint
// state, while only `animate` was gated on `isFirstPage`. Framer Motion always
// animates from `initial` to `animate` on mount, so on the very first page of
// a *reload* (not a fresh session — sessionStorage's 'ksm-intro-seen' already
// set, so IntroReveal doesn't mount to hide it) the panel would visibly sweep
// from y:0% up to y:-100%: a full-viewport ink wipe with nothing masking it.
// The fix gates `initial` the same way as `animate` so the first page's panel
// starts already off-screen, with no mount-to-mount animation to see at all.
test('the first page of a session mounts its curtain panel already off-screen — no unmasked sweep on reload after the intro has already played', async () => {
  const PageTransition = await freshPageTransition()
  const { container } = render(<PageTransition as="main">начало</PageTransition>)
  const panel = container.querySelector('[data-curtain]')
  // A `fixed inset-0` element with no inline transform ("none") sits at its
  // layout position — fully covering the viewport. `translateY(-100%)` is the
  // off-screen resting position. The buggy version reads "none" here (still
  // covering); the fix must read translateY(-100%).
  expect(panel.style.transform).not.toBe('none')
  expect(panel.style.transform).toMatch(/translateY\(-100%\)/)
})
