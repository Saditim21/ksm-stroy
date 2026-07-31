import { motion } from 'framer-motion'

const CELLS = [
  ['available', 'Свободни', 'text-emerald-600'],
  ['reserved', 'Резервирани', 'text-amber-600'],
  ['sold', 'Продадени', 'text-red-600'],
]

export default function LiveStatsBar({ stats }) {
  return (
    <div className="flex items-center gap-6 rounded-lg border border-concrete bg-white px-4 py-2">
      {CELLS.map(([key, label, cls]) => (
        <div key={key} className="text-center">
          <motion.div
            key={`${key}:${stats[key]}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-display text-xl ${cls}`}
          >
            {stats[key]}
          </motion.div>
          <div className="text-xs text-graphite">{label}</div>
        </div>
      ))}
      <div className="ml-auto text-sm text-graphite/70">общо {stats.total}</div>
    </div>
  )
}
