import { useState } from 'react'
import { statusOf } from '../../utils/availability'
import AvailabilityBadge from './AvailabilityBadge'
import LiveStatsBar from './LiveStatsBar'

const CELL = {
  available: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100',
  reserved: 'border-amber-300 bg-amber-50 hover:bg-amber-100',
  sold: 'border-red-200 bg-red-50 text-neutral-400',
  unknown: 'border-neutral-200 bg-neutral-50',
}

export default function GarageGrid({ title, items = [] }) {
  const [selected, setSelected] = useState(null)
  const stats = items.reduce(
    (acc, it) => {
      const s = statusOf(it.status)
      if (acc[s] != null) acc[s]++
      acc.total++
      return acc
    },
    { available: 0, reserved: 0, sold: 0, total: 0 },
  )
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <LiveStatsBar stats={stats} />
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {items.map((item) => (
          <button
            key={item.number}
            onClick={() => setSelected(selected?.number === item.number ? null : item)}
            className={`rounded-lg border p-2 text-center text-xs font-medium transition ${CELL[statusOf(item.status)]}`}
          >
            {item.number}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg bg-neutral-50 p-3 text-sm">
          <span className="font-bold">{selected.number}</span>
          <span>{selected.type}</span>
          {selected.built && <span>Застроена: {selected.built} м²</span>}
          {selected.total && <span>Обща: {selected.total} м²</span>}
          <AvailabilityBadge status={selected.status} />
        </div>
      )}
    </section>
  )
}
