import { renderHook } from '@testing-library/react'
import useSwipe from './useSwipe'

// golden-residence @944bb03 tested useSwipe only through its GalleryViewer,
// which is not ported, so the hook gets its own tests here.

const at = (x, y, { id = 1, type = 'touch', button = 0 } = {}) => ({ pointerId: id, pointerType: type, button, clientX: x, clientY: y })

function setup(threshold) {
  const onSwipe = vi.fn()
  const { result } = renderHook(() => useSwipe(onSwipe, threshold))
  const gesture = (from, to, options) => {
    result.current.handlers.onPointerDown(at(...from, options))
    result.current.handlers.onPointerUp(at(...to, options))
  }
  return { onSwipe, result, gesture }
}

test('a swipe to the left steps forward, to the right back', () => {
  const { onSwipe, gesture } = setup()
  gesture([200, 100], [120, 110])
  gesture([120, 100], [200, 90])
  expect(onSwipe.mock.calls).toEqual([[1], [-1]])
})

test('a move shorter than the threshold (40 px unless given) is no swipe', () => {
  const { onSwipe, gesture } = setup()
  gesture([200, 100], [161, 100])
  expect(onSwipe).not.toHaveBeenCalled()
  gesture([200, 100], [160, 100])
  expect(onSwipe).toHaveBeenCalledTimes(1)

  const short = setup(20)
  short.gesture([200, 100], [179, 100])
  expect(short.onSwipe).toHaveBeenCalledWith(1)
})

test('a move no more horizontal than vertical is no swipe', () => {
  const { onSwipe, gesture } = setup()
  gesture([200, 100], [140, 160])
  expect(onSwipe).not.toHaveBeenCalled()
  gesture([200, 100], [140, 159])
  expect(onSwipe).toHaveBeenCalledTimes(1)
})

// The browser cancels the pointer when it takes a vertical scroll over
// (touch-action: pan-y), so a scroll never turns into a swipe.
test('a cancelled pointer is no swipe', () => {
  const { onSwipe, result } = setup()
  result.current.handlers.onPointerDown(at(200, 100))
  result.current.handlers.onPointerCancel()
  result.current.handlers.onPointerUp(at(100, 100))
  expect(onSwipe).not.toHaveBeenCalled()
})

test('another pointer lifting is not the swipe\'s end', () => {
  const { onSwipe, result } = setup()
  result.current.handlers.onPointerDown(at(200, 100, { id: 1 }))
  result.current.handlers.onPointerUp(at(100, 100, { id: 2 }))
  expect(onSwipe).not.toHaveBeenCalled()
})

test('a mouse button other than the main one starts no swipe', () => {
  const { onSwipe, gesture } = setup()
  gesture([200, 100], [100, 100], { type: 'mouse', button: 2 })
  expect(onSwipe).not.toHaveBeenCalled()
  gesture([200, 100], [100, 100], { type: 'mouse', button: 0 })
  expect(onSwipe).toHaveBeenCalledWith(1)
})

// A mouse drag ends with a click on whatever is under the pointer; a touch
// swipe has none, so its flag would swallow a later keyboard Enter.
test('takeSwipe owns up to a mouse or pen swipe once, and never to a touch swipe or a tap', () => {
  const { result, gesture } = setup()
  gesture([200, 100], [100, 100], { type: 'mouse' })
  expect(result.current.takeSwipe()).toBe(true)
  expect(result.current.takeSwipe()).toBe(false)

  gesture([200, 100], [100, 100], { type: 'pen' })
  expect(result.current.takeSwipe()).toBe(true)

  gesture([200, 100], [100, 100], { type: 'touch' })
  expect(result.current.takeSwipe()).toBe(false)

  gesture([200, 100], [200, 100], { type: 'mouse' })
  expect(result.current.takeSwipe()).toBe(false)
})
