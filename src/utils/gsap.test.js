import { vi } from 'vitest'
import { mockMatchMedia } from '../test/media'

// src/utils/gsap.js registers GSAP's plugins once, on import, where it can.
// See gsap.prerender.test.js for an import with no window at all.

// A fresh copy of src/utils/gsap.js for each test, with spies on the calls it
// makes on import. The libraries are imported first, so the spies sit on the
// very instances the fresh module registers with.
async function importFresh() {
  vi.resetModules()
  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  const { SplitText } = await import('gsap/SplitText')
  const { useGSAP } = await import('@gsap/react')
  const registerPlugin = vi.spyOn(gsap, 'registerPlugin')
  const config = vi.spyOn(ScrollTrigger, 'config')
  const module = await import('./gsap')
  return { module, lib: { gsap, ScrollTrigger, SplitText, useGSAP }, registerPlugin, config }
}

let restore
afterEach(() => {
  restore?.()
  restore = undefined
  vi.restoreAllMocks()
})

test('exports the libraries\' own gsap, ScrollTrigger, SplitText and useGSAP', async () => {
  const { module, lib } = await importFresh()
  expect(module.gsap).toBe(lib.gsap)
  expect(module.ScrollTrigger).toBe(lib.ScrollTrigger)
  expect(module.SplitText).toBe(lib.SplitText)
  expect(module.useGSAP).toBe(lib.useGSAP)
})

// jsdom has no matchMedia, and registering ScrollTrigger calls it at once.
test('in a window without matchMedia it registers useGSAP and SplitText, but not ScrollTrigger', async () => {
  const { lib, registerPlugin, config } = await importFresh()
  expect(registerPlugin.mock.calls).toEqual([[lib.useGSAP, lib.SplitText]])
  expect(config).not.toHaveBeenCalled()
})

test('in a browser it also registers ScrollTrigger, which ignores mobile address-bar resizes', async () => {
  restore = mockMatchMedia()
  const { lib, registerPlugin, config } = await importFresh()
  expect(registerPlugin.mock.calls).toEqual([[lib.useGSAP, lib.SplitText], [lib.ScrollTrigger]])
  expect(config.mock.calls).toEqual([[{ ignoreMobileResize: true }]])
})
