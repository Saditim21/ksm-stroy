import { useRef, useState } from 'react'

export default function useZoomPan({ minScale = 1, maxScale = 8 } = {}) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const drag = useRef(null)

  const onWheel = (e) => {
    setTransform((t) => {
      const scale = Math.min(maxScale, Math.max(minScale, t.scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2)))
      return scale === 1 ? { x: 0, y: 0, scale: 1 } : { ...t, scale }
    })
  }
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true
    drag.current.x = e.clientX
    drag.current.y = e.clientY
    setTransform((t) => (t.scale === 1 ? t : { ...t, x: t.x + dx, y: t.y + dy }))
  }
  const onPointerUp = () => { drag.current = null }
  const reset = () => setTransform({ x: 0, y: 0, scale: 1 })
  const wasDrag = () => Boolean(drag.current?.moved)

  return { transform, reset, wasDrag, handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp } }
}
