import '@testing-library/jest-dom/vitest'

// jsdom has no IntersectionObserver; framer-motion's whileInView (used by the
// DimensionLine/Reveal primitives) needs one to mount without throwing. Real
// browsers always have it, so a no-op stub here just closes a jsdom gap —
// suites that need finer control (e.g. AnimatedNumber) override it locally
// and restore afterwards, which still works fine on top of this default.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = NoopIntersectionObserver
  window.IntersectionObserver = NoopIntersectionObserver
}
