import { vi } from 'vitest'

// The motion runtime: the deferred load of the engine (engine.js, a stand-in
// here) and the idle queue every motion setup runs from.
const fakeMotion = vi.hoisted(() => ({ ScrollTrigger: { refresh: vi.fn() } }))
vi.mock('./engine.js', () => ({ default: fakeMotion }))

// A fresh runtime for every test: the memoised load and the queue are module
// state.
let runtime
let idle
beforeEach(async () => {
  vi.resetModules()
  runtime = await import('./runtime')
  fakeMotion.ScrollTrigger.refresh.mockReset()
  idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
})

afterEach(() => {
  delete document.readyState
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

// Runs one idle callback, as the browser does when it next has time.
const nextIdle = () => idle.shift()()

describe('loadMotion', () => {
  test('hands back the engine, which getMotion returns from then on', async () => {
    expect(runtime.getMotion()).toBeNull()
    await expect(runtime.loadMotion()).resolves.toBe(fakeMotion)
    expect(runtime.getMotion()).toBe(fakeMotion)
  })

  test('loads once, however many ask', () => {
    expect(runtime.loadMotion()).toBe(runtime.loadMotion())
  })

  // The engine is no part of the page's first load: until the window's load
  // event, it waits.
  test('waits for the window load event while the page is still loading', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    let loaded = false
    const load = runtime.loadMotion().then(() => { loaded = true })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(loaded).toBe(false)
    expect(runtime.getMotion()).toBeNull()

    delete document.readyState
    window.dispatchEvent(new Event('load'))
    await load
    expect(runtime.getMotion()).toBe(fakeMotion)
  })
})

// It waits for the page's largest paint too (spec M3/M4 §10, Home's step 1):
// its request starts once the browser has reported the page's
// largest-contentful-paint, so nothing of it is in the paint's way.
describe('loadMotion after the largest paint', () => {
  // A stand-in for the browser's PerformanceObserver, which reports
  // largest-contentful-paint entries when the test says so.
  let observers
  const report = () => {
    for (const observer of observers.filter((each) => each.type)) {
      observer.callback({ getEntries: () => [{ entryType: 'largest-contentful-paint' }] })
    }
  }
  beforeEach(() => {
    observers = []
    vi.stubGlobal('PerformanceObserver', class {
      static supportedEntryTypes = ['largest-contentful-paint', 'paint']
      constructor(callback) {
        this.callback = callback
        this.type = null
        observers.push(this)
      }
      observe({ type, buffered }) {
        this.type = type
        this.buffered = buffered
      }
      disconnect() {
        this.type = null
      }
    })
  })

  const settled = () => new Promise((resolve) => setTimeout(resolve, 20))

  test('waits for the largest paint after the load event', async () => {
    let loaded = false
    const load = runtime.loadMotion().then(() => { loaded = true })
    await settled()
    expect(loaded).toBe(false)
    expect(runtime.getMotion()).toBeNull()
    expect(observers.map(({ type, buffered }) => [type, buffered])).toEqual([['largest-contentful-paint', true]])

    report()
    await load
    expect(runtime.getMotion()).toBe(fakeMotion)
    // One report is enough: the observer lets go.
    expect(observers.every(({ type }) => type === null)).toBe(true)
  })

  // Buffered: a paint the browser reported before the load event counts,
  // once the load event has come.
  test('waits for the load event before it looks for the paint', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' })
    let loaded = false
    const load = runtime.loadMotion().then(() => { loaded = true })
    await settled()
    expect(observers).toEqual([])

    delete document.readyState
    window.dispatchEvent(new Event('load'))
    await settled()
    expect(loaded).toBe(false)
    report()
    await load
    expect(runtime.getMotion()).toBe(fakeMotion)
  })

  // A page loaded in a hidden tab, or a visitor's input before the first
  // paint, gets no report: the engine comes all the same, a little later.
  test('without a report, two seconds after the load event', async () => {
    vi.useFakeTimers()
    let loaded = false
    runtime.loadMotion().then(() => { loaded = true })
    await vi.advanceTimersByTimeAsync(1999)
    expect(loaded).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await vi.waitFor(() => expect(loaded).toBe(true))
    expect(observers.every(({ type }) => type === null)).toBe(true)
  })

  test('a browser that reports no largest paint loads it at the load event', async () => {
    PerformanceObserver.supportedEntryTypes = ['paint']
    await expect(runtime.loadMotion()).resolves.toBe(fakeMotion)
    expect(observers).toEqual([])
  })
})

describe('scheduleInit', () => {
  test('runs one task per idle callback, in order, then refreshes ScrollTrigger once', async () => {
    await runtime.loadMotion()
    const log = []
    fakeMotion.ScrollTrigger.refresh.mockImplementation(() => log.push('refresh'))
    runtime.scheduleInit(() => log.push('one'))
    runtime.scheduleInit(() => log.push('two'))
    runtime.scheduleInit(() => log.push('three'))
    expect(log).toEqual([])
    expect(idle).toHaveLength(1)

    nextIdle()
    expect(log).toEqual(['one'])
    nextIdle()
    nextIdle()
    expect(log).toEqual(['one', 'two', 'three', 'refresh'])
    expect(idle).toEqual([])
  })

  test('a task queued while the queue drains runs before the refresh', async () => {
    await runtime.loadMotion()
    const log = []
    fakeMotion.ScrollTrigger.refresh.mockImplementation(() => log.push('refresh'))
    runtime.scheduleInit(() => {
      log.push('one')
      runtime.scheduleInit(() => log.push('late'))
    })
    runtime.scheduleInit(() => log.push('two'))
    while (idle.length > 0) nextIdle()
    expect(log).toEqual(['one', 'two', 'late', 'refresh'])
  })

  test('every drained queue refreshes once', async () => {
    await runtime.loadMotion()
    runtime.scheduleInit(() => {})
    nextIdle()
    runtime.scheduleInit(() => {})
    runtime.scheduleInit(() => {})
    nextIdle()
    nextIdle()
    expect(fakeMotion.ScrollTrigger.refresh).toHaveBeenCalledTimes(2)
  })

  // Safari has no requestIdleCallback.
  test('without requestIdleCallback, each task waits for a 1 ms timeout', async () => {
    await runtime.loadMotion()
    vi.unstubAllGlobals()
    expect(globalThis.requestIdleCallback).toBeUndefined()
    vi.useFakeTimers()
    const log = []
    runtime.scheduleInit(() => log.push('one'))
    runtime.scheduleInit(() => log.push('two'))
    vi.advanceTimersByTime(0)
    expect(log).toEqual([])
    vi.advanceTimersByTime(1)
    expect(log).toEqual(['one'])
    vi.advanceTimersByTime(1)
    expect(log).toEqual(['one', 'two'])
    expect(fakeMotion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  // One broken section must not keep the rest of the page still. Its error
  // still surfaces, as an uncaught error from the idle callback.
  test('a task that throws does not stop the queue', async () => {
    await runtime.loadMotion()
    const log = []
    runtime.scheduleInit(() => { throw new Error('broken section') })
    runtime.scheduleInit(() => log.push('next'))
    expect(nextIdle).toThrow('broken section')
    nextIdle()
    expect(log).toEqual(['next'])
    expect(fakeMotion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  test('before the engine has loaded there is nothing to refresh', () => {
    const log = []
    runtime.scheduleInit(() => log.push('task'))
    expect(nextIdle).not.toThrow()
    expect(log).toEqual(['task'])
    expect(fakeMotion.ScrollTrigger.refresh).not.toHaveBeenCalled()
  })
})
