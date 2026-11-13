import { useRef } from 'react'

// A horizontal swipe through pointer events, from golden-residence
// src/hooks/useSwipe.js @944bb03. The element using it sets
// `touch-action: pan-y` (Tailwind `touch-pan-y`), so the browser keeps vertical
// scrolling to itself and cancels the pointer when it takes over: a scroll
// never turns into a swipe. A move counts only when it is at least `threshold`
// px and more horizontal than vertical.
export default function useSwipe(onSwipe, threshold = 40) {
  const start = useRef(null)
  const swiped = useRef(false)

  const handlers = {
    onPointerDown(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      start.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      swiped.current = false
    },
    onPointerUp(event) {
      const from = start.current
      start.current = null
      if (!from || from.id !== event.pointerId) return
      const dx = event.clientX - from.x
      const dy = event.clientY - from.y
      if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return
      // A touch swipe has no click after it, so only a mouse or pen swipe
      // sets the flag; otherwise it would swallow a later keyboard Enter.
      if (event.pointerType !== 'touch') swiped.current = true
      onSwipe(dx < 0 ? 1 : -1)
    },
    onPointerCancel() {
      start.current = null
    },
  }

  // A mouse drag ends with a click on whatever is under the pointer; the caller
  // asks here whether that click finished a swipe and should be ignored.
  const takeSwipe = () => {
    const was = swiped.current
    swiped.current = false
    return was
  }

  return { handlers, takeSwipe }
}
