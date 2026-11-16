import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The surfaces' chunk preloads what the first switch to „По критерии“ waits
// for (spec §12, ruling C8.6): once it is in, the browser's next idle moment
// starts the list's chunk (listChunk.js), and Flip where motion may play
// (the motion gate's `js` on <html>, spec §5.2). Nothing of it waits in a
// route's first-load JS: it runs as the chunk loads, and the switch takes
// both loaders from here (ExplorerSection.jsx).
//
// The list's chunk and Flip's loader are stand-ins that count their loads,
// set up afresh with a fresh module registry for each test (vi.doMock: a
// module mocked once stays loaded across vi.resetModules); the browser's
// idle callbacks run by hand.
const loads = { list: 0, flip: 0, failFlip: false }

let idle
beforeEach(() => {
  vi.resetModules()
  Object.assign(loads, { list: 0, flip: 0, failFlip: false })
  vi.doMock('./listChunk', () => {
    loads.list += 1
    return { default: () => null, recordSwitch: () => () => {} }
  })
  vi.doMock('../motion/flip', () => ({
    loadFlip: () => {
      loads.flip += 1
      return loads.failFlip ? Promise.reject(new Error('offline')) : Promise.resolve({})
    },
  }))
  idle = []
  vi.stubGlobal('requestIdleCallback', (callback) => idle.push(callback))
})
afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.classList.remove('js')
})

// A dynamic import settles over a few turns of the event loop.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('the surfaces’ preload', () => {
  it('starts the list’s chunk and Flip at the first idle moment after the chunk is in', async () => {
    document.documentElement.classList.add('js')
    await import('./surfaces')
    expect(idle).toHaveLength(1)
    expect(loads).toMatchObject({ list: 0, flip: 0 })

    idle.shift()()
    await vi.waitFor(() => expect(loads.list).toBe(1))
    expect(loads.flip).toBe(1)
  })

  it('leaves Flip alone where motion may not play', async () => {
    await import('./surfaces')
    idle.shift()()
    await vi.waitFor(() => expect(loads.list).toBe(1))
    expect(loads.flip).toBe(0)
  })

  // The list it starts is the one the switch asks for: loadList() is that
  // chunk's import, so the module loads once. Flip's loader is flip.js's
  // own, which shares one load.
  it('loads the list’s chunk once, for the preload and the switch, and hands the switch Flip’s loader', async () => {
    const surfaces = await import('./surfaces')
    idle.shift()()
    const [first, second] = await Promise.all([surfaces.loadList(), surfaces.loadList()])
    expect(second).toBe(first)
    expect(loads.list).toBe(1)
    expect(surfaces.loadFlip).toBe((await import('../motion/flip')).loadFlip)
  })

  // Safari has no requestIdleCallback: the next macrotask then. A failed
  // preload is quiet; the switch loads again and reports its own failure.
  it('waits for the next macrotask where the browser has no idle callback, and stays quiet when a load fails', async () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    document.documentElement.classList.add('js')
    loads.failFlip = true
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      await import('./surfaces')
      expect(loads.list).toBe(0)
      await vi.waitFor(() => expect(loads.list).toBe(1))
      expect(loads.flip).toBe(1)
      await settle()
      expect(unhandled).not.toHaveBeenCalled()
    } finally {
      process.off('unhandledRejection', unhandled)
    }
  })
})
