import { useRef, useState } from 'react'

// A tap on a touch screen always drifts a few pixels. When the plan cannot be
// panned (scale === 1) that drift must not be mistaken for a drag, otherwise the
// click that follows is swallowed and the apartment never opens.
const TAP_TOLERANCE = 10
const PAN_TOLERANCE = 3

export default function useZoomPan({ minScale = 1, maxScale = 8, step = 1.2 } = {}) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const drag = useRef(null)
  const lastMoved = useRef(false)

  // Single clamped scale path shared by the wheel and the on-screen buttons.
  // Rounding keeps zoom-in → zoom-out landing exactly back on 1 instead of
  // 1.0000000000000002, which would leave the view stuck in "zoomed" mode.
  const zoomBy = (factor) =>
    setTransform((t) => {
      const scale = Math.min(maxScale, Math.max(minScale, Math.round(t.scale * factor * 1000) / 1000))
      return scale === 1 ? { x: 0, y: 0, scale: 1 } : { ...t, scale }
    })

  const onWheel = (e) => zoomBy(e.deltaY < 0 ? step : 1 / step)
  const zoomIn = () => zoomBy(step)
  const zoomOut = () => zoomBy(1 / step)

  const onPointerDown = (e) => {
    lastMoved.current = false
    drag.current = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current.x = e.clientX
    drag.current.y = e.clientY

    const travelled =
      Math.abs(e.clientX - drag.current.startX) + Math.abs(e.clientY - drag.current.startY)
    const tolerance = transform.scale > 1 ? PAN_TOLERANCE : TAP_TOLERANCE
    if (travelled > tolerance) drag.current.moved = true

    setTransform((t) => (t.scale === 1 ? t : { ...t, x: t.x + dx, y: t.y + dy }))
  }
  const onPointerUp = () => {
    lastMoved.current = Boolean(drag.current?.moved)
    drag.current = null
  }
  const reset = () => setTransform({ x: 0, y: 0, scale: 1 })
  const wasDrag = () => lastMoved.current

  return {
    transform,
    reset,
    zoomIn,
    zoomOut,
    wasDrag,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp },
  }
}
