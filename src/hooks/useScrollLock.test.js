import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import useScrollLock from './useScrollLock'
import { setLenis } from '../utils/lenis'

// From golden-residence src/hooks/useScrollLock.test.js @944bb03.

afterEach(() => {
  setLenis(null)
})

// Two overlays at once, such as a unit's panel over the mobile menu: closing
// the inner one must not set Lenis scrolling under the outer one.
test('two overlapping locks: releasing the inner one keeps Lenis stopped', () => {
  const stop = vi.fn()
  const start = vi.fn()
  setLenis({ stop, start })

  const outer = renderHook(() => useScrollLock())
  const inner = renderHook(() => useScrollLock())
  expect(stop).toHaveBeenCalledTimes(1)

  inner.unmount()
  expect(start).not.toHaveBeenCalled()
  expect(document.documentElement.style.overflow).toBe('hidden')

  outer.unmount()
  expect(start).toHaveBeenCalledTimes(1)
})

// The menu and a unit's panel can close in one commit (a link in the panel
// navigates away). Whatever order React runs their cleanups in, <html> must
// end up as it was before either opened.
test('two locks released in one commit leave <html> as it was', () => {
  const root = document.documentElement
  root.style.overflow = 'auto'
  const { unmount } = renderHook(() => {
    useScrollLock()
    useScrollLock('#1F3A63')
  })
  expect(root.style.overflow).toBe('hidden')

  unmount()
  expect(root.style.overflow).toBe('auto')
  expect(root.style.backgroundColor).toBe('')
  root.style.overflow = ''
})

// The overlay opened first can close first: the one still open keeps its
// colour on <html>.
test('a lock released out of order hands <html> to the one still held', () => {
  const root = document.documentElement
  const first = renderHook(() => useScrollLock('#F6F5F1'))
  const second = renderHook(() => useScrollLock('#1F3A63'))
  expect(root.style.backgroundColor).toBe('rgb(31, 58, 99)')

  first.unmount()
  expect(root.style.backgroundColor).toBe('rgb(31, 58, 99)')
  expect(root.style.overflow).toBe('hidden')

  second.unmount()
  expect(root.style.backgroundColor).toBe('')
  expect(root.style.overflow).toBe('')
})

test('calls stop on Lenis when mounted', () => {
  const stop = vi.fn()
  const start = vi.fn()
  setLenis({ stop, start })

  renderHook(() => useScrollLock())
  expect(stop).toHaveBeenCalledOnce()
})

test('calls start on unmount', () => {
  const stop = vi.fn()
  const start = vi.fn()
  const lenis = { stop, start }
  setLenis(lenis)

  const { unmount } = renderHook(() => useScrollLock())
  unmount()
  expect(start).toHaveBeenCalledOnce()
})

test('sets and restores html overflow', () => {
  const originalOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'auto'

  const stop = vi.fn()
  const start = vi.fn()
  setLenis({ stop, start })

  const { unmount } = renderHook(() => useScrollLock())
  expect(document.documentElement.style.overflow).toBe('hidden')

  unmount()
  expect(document.documentElement.style.overflow).toBe('auto')

  document.documentElement.style.overflow = originalOverflow
})

test('works when Lenis is not available', () => {
  const originalOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'auto'

  const { unmount } = renderHook(() => useScrollLock())
  expect(document.documentElement.style.overflow).toBe('hidden')

  unmount()
  expect(document.documentElement.style.overflow).toBe('auto')

  document.documentElement.style.overflow = originalOverflow
})

test('paints the page background while locked when given a colour, and restores it', () => {
  const root = document.documentElement
  root.style.backgroundColor = ''
  const { unmount } = renderHook(() => useScrollLock('#F6F5F1'))
  expect(root.style.backgroundColor).toBe('rgb(246, 245, 241)')
  unmount()
  expect(root.style.backgroundColor).toBe('')
})

test('leaves the page background alone without a colour', () => {
  const root = document.documentElement
  root.style.backgroundColor = 'rgb(1, 2, 3)'
  const { unmount } = renderHook(() => useScrollLock())
  expect(root.style.backgroundColor).toBe('rgb(1, 2, 3)')
  unmount()
  expect(root.style.backgroundColor).toBe('rgb(1, 2, 3)')
  root.style.backgroundColor = ''
})
