import { act, renderHook } from '@testing-library/react'
import useFinePointer from './useFinePointer'
import { mockMatchMedia } from '../test/media'

// From golden-residence src/hooks/useFinePointer.test.js @944bb03.

let restore
afterEach(() => {
  restore?.()
  restore = undefined
})

test('is true for a mouse or trackpad and follows changes', () => {
  restore = mockMatchMedia({ fine: true })
  const { result, unmount } = renderHook(() => useFinePointer())
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
  expect(result.current).toBe(true)
  const remove = vi.spyOn(mq, 'removeEventListener')
  act(() => {
    mq.matches = false
    mq.dispatchEvent(new Event('change'))
  })
  expect(result.current).toBe(false)
  unmount()
  expect(remove).toHaveBeenCalledWith('change', expect.any(Function))
})

test('is false on a touch screen', () => {
  restore = mockMatchMedia({ coarse: true })
  const { result } = renderHook(() => useFinePointer())
  expect(result.current).toBe(false)
})

test('is false where matchMedia is missing', () => {
  const { result } = renderHook(() => useFinePointer())
  expect(result.current).toBe(false)
})
