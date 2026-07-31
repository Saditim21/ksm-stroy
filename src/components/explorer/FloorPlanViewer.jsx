import { motion } from 'framer-motion'
import { polygonToPoints, polygonCentroid, unitKeyForShape } from '../../utils/buildingMaps'
import { statusOf, matchesFilter } from '../../utils/availability'
import useZoomPan from './useZoomPan'

const FILL = {
  available: '16,185,129',
  reserved: '245,158,11',
  sold: '239,68,68',
  unknown: '156,163,175',
}

export default function FloorPlanViewer({ image, mapShapes, blockLetter, unitFloorNumber, unitsIndex, filter, selectedUnit, onSelectUnit }) {
  const { transform, reset, zoomIn, zoomOut, wasDrag, handlers } = useZoomPan()

  const resolved = mapShapes.map((shape) => {
    const key = unitKeyForShape(shape, blockLetter, unitFloorNumber)
    const apartment = unitsIndex.get(key)
    return { shape, key, apartment, status: apartment ? statusOf(apartment.status) : 'unknown' }
  })
  const hasFilter = Boolean(filter && (filter.onlyAvailable || filter.type || filter.minArea != null || filter.maxArea != null))

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      // Until the user actually zooms in there is nothing to pan, so let the
      // page scroll vertically under the finger.
      style={{ touchAction: transform.scale === 1 ? 'pan-y' : 'none' }}
      {...handlers}
    >
      <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}>
        <div className="relative">
          <img src={image.src} width={image.width} height={image.height} alt="Архитектурен план" className="block h-auto w-full" draggable={false} />
          <svg viewBox={`0 0 ${image.width} ${image.height}`} className="absolute inset-0 h-full w-full">
            {resolved.map(({ shape, key, apartment, status }) =>
              shape.polygons.map((poly, j) => {
                const dimmed = hasFilter && !matchesFilter(apartment, filter)
                const isSelected = selectedUnit === key
                const rgb = dimmed ? FILL.unknown : FILL[status]
                const c = polygonCentroid(poly)
                return (
                  <g key={`${key}:${j}`}>
                    <motion.polygon
                      points={polygonToPoints(poly)}
                      data-status={status}
                      data-dimmed={String(dimmed)}
                      className="cursor-pointer"
                      style={{ fill: `rgb(${rgb})`, stroke: `rgb(${rgb})`, strokeWidth: image.width / 500 }}
                      animate={{ fillOpacity: dimmed ? 0.08 : isSelected ? 0.55 : 0.28, strokeOpacity: dimmed ? 0.2 : 0.9 }}
                      whileHover={dimmed ? undefined : { fillOpacity: 0.45 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => !wasDrag() && onSelectUnit?.(apartment, key)}
                    />
                    {j === 0 && (
                      <text
                        x={c.x} y={c.y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={image.width / 55}
                        className="pointer-events-none fill-neutral-900 font-semibold"
                        style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.85)', strokeWidth: image.width / 300 }}
                      >
                        {apartment?.apartment ?? '—'}
                      </text>
                    )}
                  </g>
                )
              }),
            )}
          </svg>
        </div>
      </div>
      {/* Zoom cluster — always visible so touch users have a way in; the
          pointer handlers above must not treat a button press as a pan. */}
      <div
        className="absolute right-2 top-2 flex items-start gap-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {transform.scale !== 1 && (
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded bg-neutral-900/70 px-3 text-xs text-white"
          >
            Нулирай изгледа
          </button>
        )}
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Намали"
          className="flex h-11 w-11 items-center justify-center rounded bg-neutral-900/70 text-xl leading-none text-white"
        >
          −
        </button>
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Увеличи"
          className="flex h-11 w-11 items-center justify-center rounded bg-neutral-900/70 text-xl leading-none text-white"
        >
          +
        </button>
      </div>
    </div>
  )
}
