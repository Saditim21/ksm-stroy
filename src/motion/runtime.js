// The motion runtime (spec §5.1). The engine, GSAP and Lenis (engine.js), is
// a deferred chunk: it loads once the page has, and never sits in a route's
// first-load JS. Components queue their motion through useMotion, and the
// setups run from an idle queue, one per idle period, with one
// ScrollTrigger.refresh() when the queue drains.

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

// Loads the engine, once. The first caller is the first useMotion or
// SmoothScroll effect after hydration; if the page has not loaded by then, the
// import waits for the window's `load` event.
/** @returns {Promise<Motion>} */
export function loadMotion() {
  if (!loading) {
    loading = pageLoaded()
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
