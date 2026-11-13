import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import useScrollLock from './useScrollLock'
import { setLenis, clearLenis } from '../utils/lenis'

// From golden-residence src/hooks/useScrollLock.test.js @944bb03.

afterEach(() => {
  clearLenis(null)
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
