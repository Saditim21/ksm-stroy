import { act, renderHook } from '@testing-library/react'
import useMediaQuery from './useMediaQuery'
import { mockMatchMedia } from '../test/media'

// From golden-residence src/hooks/useMediaQuery.test.js @944bb03.

const MD = '(min-width: 768px)'

let restore
afterEach(() => {
  restore?.()
  restore = undefined
})

test('returns whether the query matches now', () => {
  restore = mockMatchMedia({ fine: true })
  expect(renderHook(() => useMediaQuery('(pointer: fine)')).result.current).toBe(true)
  expect(renderHook(() => useMediaQuery('(pointer: coarse)')).result.current).toBe(false)
})

// The mock answers min-width with false; a test sets the one list it needs.
test('answers an arbitrary query', () => {
  restore = mockMatchMedia()
  window.matchMedia(MD).matches = true
  const { result } = renderHook(() => useMediaQuery(MD))
  expect(result.current).toBe(true)
})

test('follows change events and stops listening on unmount', () => {
  restore = mockMatchMedia()
  const mq = window.matchMedia(MD)
  const remove = vi.spyOn(mq, 'removeEventListener')
  const { result, unmount } = renderHook(() => useMediaQuery(MD))
  expect(result.current).toBe(false)
  act(() => {
    mq.matches = true
    mq.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(true)
  act(() => {
    mq.matches = false
    mq.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(false)
  unmount()
  expect(remove).toHaveBeenCalledWith('change', expect.any(Function))
})

test('switches to the new query when it changes', () => {
  restore = mockMatchMedia()
  window.matchMedia(MD).matches = true
  const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), { initialProps: { query: MD } })
  expect(result.current).toBe(true)
  rerender({ query: '(orientation: portrait)' })
  expect(result.current).toBe(false)
})

test('is false where matchMedia is missing', () => {
  const { result } = renderHook(() => useMediaQuery(MD))
  expect(result.current).toBe(false)
})
