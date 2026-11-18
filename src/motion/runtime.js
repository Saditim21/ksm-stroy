// The motion runtime (spec §5.1). The engine, GSAP and Lenis (engine.js), is
// a deferred chunk: it loads once the page has loaded and painted its largest
// paint, and never sits in a route's first-load JS. Components queue their
// motion through useMotion, and the setups run from an idle queue, one per
// idle period, with one ScrollTrigger.refresh() when the queue drains.

/** @typedef {typeof import('./engine.js').default} Motion */

/** @type {Promise<Motion> | null} */
let loading = null
/** @type {Motion | null} */
let motion = null

// Resolves once the window has fired `load`, at once if it already has.
function pageLoaded() {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
}

// How long after `load` the engine waits at most for the browser's report of
// the largest paint.
const PAINT_WAIT_MS = 2000

// Resolves once the page's largest paint is on the screen (spec M3/M4 §10,
// Home's step 1): at the browser's first largest-contentful-paint report
// after `load` (buffered: a paint before it counts). Every page's first
// viewport paints in one frame, so that is its largest paint (measured in
// M4 Task 8). At `load` where the browser makes no such report, and two
// seconds after it at the latest: a page loaded in a hidden tab gets none.
function largestPaint() {
  const LCP = 'largest-contentful-paint'
  if (!globalThis.PerformanceObserver?.supportedEntryTypes?.includes(LCP)) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer)
      observer.disconnect()
      resolve()
    }
    const timer = setTimeout(done, PAINT_WAIT_MS)
    const observer = new PerformanceObserver(done)
    observer.observe({ type: LCP, buffered: true })
  })
}

// Loads the engine, once. The first caller is the first useMotion or
// SmoothScroll effect after hydration; the import waits for the window's
// `load` event, then for the page's largest paint, so its request never
// competes with what the page paints first.
/** @returns {Promise<Motion>} */
export function loadMotion() {
  if (!loading) {
    loading = pageLoaded()
      .then(largestPaint)
      .then(() => import('./engine.js'))
      .then((module) => {
        motion = module.default
        return motion
      })
  }
  return loading
}

// The engine once it has loaded; null until then.
/** @returns {Motion | null} */
export function getMotion() {
  return motion
}

const queue = []
let draining = false

// Safari has no requestIdleCallback: it gets the next macrotask instead.
function whenIdle(callback) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(callback)
  else setTimeout(callback, 1)
}

// Runs `task` when the browser is next idle, after the tasks queued before
// it, one task per idle period. Once the queue drains, ScrollTrigger
// re-measures once for all of them.
/** @param {() => void} task */
export function scheduleInit(task) {
  queue.push(task)
  if (draining) return
  draining = true
  whenIdle(runNext)
}

function runNext() {
  const task = queue.shift()
  try {
    task()
  } finally {
    // A task that throws still leaves the queue running; its error surfaces
    // from this callback as an uncaught error.
    if (queue.length > 0) {
      whenIdle(runNext)
    } else {
      draining = false
      motion?.ScrollTrigger.refresh()
    }
  }
}
