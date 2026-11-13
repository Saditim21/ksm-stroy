import { act, renderHook } from '@testing-library/react'
import useMotionAllowed from './useMotionAllowed'
import { mockMatchMedia } from '../test/media'

// From golden-residence src/hooks/useMotionAllowed.test.js @944bb03.

let restore
afterEach(() => {
  restore?.()
  restore = undefined
  delete navigator.connection
})

const setConnection = (value) =>
  Object.defineProperty(navigator, 'connection', { configurable: true, value })

test('motion allowed when reduced motion is off and no saveData', () => {
  restore = mockMatchMedia()
  const { result } = renderHook(() => useMotionAllowed())
  expect(result.current).toBe(true)
})

test('motion not allowed when reduced motion is on', () => {
  restore = mockMatchMedia({ reduce: true })
  const { result } = renderHook(() => useMotionAllowed())
  expect(result.current).toBe(false)
})

test('motion not allowed when saveData is on', () => {
  restore = mockMatchMedia()
  setConnection({ saveData: true })
  const { result } = renderHook(() => useMotionAllowed())
  expect(result.current).toBe(false)
})

// jsdom has no matchMedia: every component test runs static by default.
test('motion not allowed where matchMedia is missing', () => {
  const { result } = renderHook(() => useMotionAllowed())
  expect(result.current).toBe(false)
})

// Switching reduced motion on stops the motion without a reload.
test('follows a reduced-motion change while the page is open', () => {
  restore = mockMatchMedia()
  const { result } = renderHook(() => useMotionAllowed())
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  expect(result.current).toBe(true)
  act(() => {
    mq.matches = true
    mq.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(false)
  act(() => {
    mq.matches = false
    mq.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(true)
})

test('follows the data saver switching on', () => {
  restore = mockMatchMedia()
  const conn = Object.assign(new EventTarget(), { saveData: false })
  setConnection(conn)
  const { result } = renderHook(() => useMotionAllowed())
  expect(result.current).toBe(true)
  act(() => {
    conn.saveData = true
    conn.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(false)
})

test('stops listening on unmount', () => {
  restore = mockMatchMedia()
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const remove = vi.spyOn(mq, 'removeEventListener')
  const { unmount } = renderHook(() => useMotionAllowed())
  unmount()
  expect(remove).toHaveBeenCalledWith('change', expect.any(Function))
})
