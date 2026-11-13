import { act, renderHook } from '@testing-library/react'
import useCoarsePointer from './useCoarsePointer'

// From golden-residence src/hooks/useCoarsePointer.test.js @944bb03.

let realMatchMedia
beforeEach(() => { realMatchMedia = window.matchMedia })
afterEach(() => { window.matchMedia = realMatchMedia })

test('is true on a touch screen and follows changes', () => {
  let onChange
  const mq = { matches: true, addEventListener: vi.fn((_, fn) => { onChange = fn }), removeEventListener: vi.fn() }
  window.matchMedia = vi.fn(() => mq)
  const { result, unmount } = renderHook(() => useCoarsePointer())
  expect(window.matchMedia).toHaveBeenCalledWith('(pointer: coarse)')
  expect(result.current).toBe(true)
  mq.matches = false
  act(() => onChange())
  expect(result.current).toBe(false)
  unmount()
  expect(mq.removeEventListener).toHaveBeenCalledWith('change', onChange)
})

test('is false where matchMedia is missing', () => {
  window.matchMedia = undefined
  const { result } = renderHook(() => useCoarsePointer())
  expect(result.current).toBe(false)
})
