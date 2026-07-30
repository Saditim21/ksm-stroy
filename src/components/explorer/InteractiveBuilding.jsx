import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { polygonToPoints } from '../../utils/buildingMaps'

// Availability colors — the ONLY meaning of green/amber/red on the site.
const FILL = {
  available: '16,185,129',
  reserved: '245,158,11',
  sold: '239,68,68',
  unknown: '156,163,175',
}
const EMPTY = { available: 0, reserved: 0, sold: 0, total: 0, color: 'unknown' }

export const floorKey = (shape) => `${shape.block}:${shape.floor}`

export default function InteractiveBuilding({ image, shapes, summaries, hoveredFloor, onHoverFloor, onSelectFloor }) {
  const [tooltip, setTooltip] = useState(null) // { x, y, shape }
  const [introDone, setIntroDone] = useState(false)
  const lastPointerType = useRef('mouse')
  const armed = useRef(null) // touch: first tap arms/highlights, second tap opens

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return setIntroDone(true)
    const t = setTimeout(() => setIntroDone(true), 2800)
    return () => clearTimeout(t)
  }, [])

  const maxFloor = Math.max(...shapes.map((s) => s.floor), 1)
  const summaryFor = (shape) => summaries[floorKey(shape)] ?? EMPTY

  const activate = (shape, e) => {
    onHoverFloor?.(floorKey(shape))
    setTooltip({ x: e.clientX, y: e.clientY, shape })
  }
  const deactivate = () => {
    onHoverFloor?.(null)
    setTooltip(null)
    armed.current = null
  }
  const handleClick = (shape, e) => {
    if (lastPointerType.current === 'touch' && armed.current !== floorKey(shape)) {
      armed.current = floorKey(shape)
      activate(shape, e)
      return
    }
    onSelectFloor?.(shape)
  }

  return (
    <div className="relative select-none" onPointerLeave={(e) => { if (e.pointerType === 'touch') return; deactivate() }}>
      <img src={image.src} width={image.width} height={image.height} alt="" className="block h-auto w-full" />
      <svg viewBox={`0 0 ${image.width} ${image.height}`} className="absolute inset-0 h-full w-full" aria-label="Интерактивна фасада">
        {shapes.map((shape) => {
          const { color } = summaryFor(shape)
          const isHot = hoveredFloor === floorKey(shape)
          const rgb = FILL[color]
          return shape.polygons.map((poly, j) => (
            <motion.polygon
              key={`${floorKey(shape)}:${j}`}
              points={polygonToPoints(poly)}
              data-status={color}
              role="button"
              tabIndex={j === 0 ? 0 : -1}
              aria-label={`Блок ${shape.block}, етаж ${shape.floor}`}
              className="cursor-pointer outline-none"
              style={{ fill: `rgb(${rgb})`, stroke: `rgb(${rgb})`, strokeWidth: image.width / 900 }}
              initial={{ fillOpacity: 0, strokeOpacity: 0 }}
              animate={
                isHot
                  ? { fillOpacity: 0.45, strokeOpacity: 0.9 }
                  : introDone
                    ? { fillOpacity: 0, strokeOpacity: 0 }
                    : {
                        fillOpacity: [0, 0.35, 0],
                        strokeOpacity: [0, 0.7, 0],
                        transition: { delay: (maxFloor - shape.floor) * 0.12, duration: 0.9 },
                      }
              }
              transition={{ duration: 0.18 }}
              onPointerDown={(e) => { lastPointerType.current = e.pointerType }}
              onPointerEnter={(e) => e.pointerType !== 'touch' && activate(shape, e)}
              onPointerMove={(e) => e.pointerType !== 'touch' && isHot && setTooltip({ x: e.clientX, y: e.clientY, shape })}
              onFocus={() => onHoverFloor?.(floorKey(shape))}
              onBlur={() => onHoverFloor?.(null)}
              onClick={(e) => handleClick(shape, e)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectFloor?.(shape)}
            />
          ))
        })}
      </svg>
      {tooltip && (() => {
        const s = summaryFor(tooltip.shape)
        return (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-sm shadow-lg"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            <div className="font-semibold text-neutral-900">Блок {tooltip.shape.block} · Етаж {tooltip.shape.floor}</div>
            <div className="mt-0.5 flex gap-2 text-neutral-600">
              <span className="text-emerald-600">{s.available} свободни</span>
              <span className="text-amber-600">{s.reserved} резервирани</span>
              <span className="text-red-600">{s.sold} продадени</span>
            </div>
          </div>
        )
      })()}
      {!introDone && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/70 px-4 py-1.5 text-sm text-white">
          Изберете етаж
        </div>
      )}
    </div>
  )
}
