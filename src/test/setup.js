import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Merged from redesign v1 (src/test/setup.js @5cecebb) and the Golden
// Residence landing (src/test/setup.js @944bb03).

// Tests never read the developer's .env: blank the sheet URLs so no suite
// reaches Google Sheets and ApartmentContext falls back to the built-in data.
// Suites that need a URL stub their own.
for (const name of [
  'VITE_GOOGLE_SHEET_BLOCK_A', 'VITE_GOOGLE_SHEET_BLOCK_B',
  'VITE_GOOGLE_SHEET_GARAGES', 'VITE_GOOGLE_SHEET_PARKING',
  'VITE_GOOGLE_SHEET_MNOGO_A', 'VITE_GOOGLE_SHEET_MNOGO_B',
]) {
  vi.stubEnv(name, '')
}

// jsdom gaps that real browsers never have. Suites that need finer control
// replace these locally and restore them afterwards.
//
// window.matchMedia is deliberately left undefined, as jsdom ships it: motion
// code then sees no motion preference and renders its static final state.
// A suite that needs a media query installs src/test/media.js.
//
// Server-side suites (// @vitest-environment node) have no window.
if (typeof window !== 'undefined') {
  // framer-motion's whileInView and OptimizedImage's lazy loading observe
  // intersections.
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    class NoopIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    }
    globalThis.IntersectionObserver = NoopIntersectionObserver
    window.IntersectionObserver = NoopIntersectionObserver
  }

  if (typeof globalThis.ResizeObserver === 'undefined') {
    class NoopResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    globalThis.ResizeObserver = NoopResizeObserver
    window.ResizeObserver = NoopResizeObserver
  }

  // jsdom implements no media playback and no canvas.
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true, writable: true, value: vi.fn(() => Promise.resolve()),
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true, writable: true, value: vi.fn(),
  })
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    configurable: true, writable: true, value: () => null,
  })
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {}
  }

  // jsdom's window.scrollTo only logs "Not implemented". The router scrolls to
  // the top on every route change and the contact form after a send.
  window.scrollTo = () => {}
}
