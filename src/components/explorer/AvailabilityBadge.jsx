import { statusOf } from '../../utils/availability'

const STYLES = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved: 'bg-amber-50 text-amber-700 border-amber-200',
  sold: 'bg-red-50 text-red-700 border-red-200',
  unknown: 'bg-plaster text-graphite border-concrete',
}
const LABELS = { available: 'Свободен', reserved: 'Резервиран', sold: 'Продаден', unknown: 'Няма данни' }

export default function AvailabilityBadge({ status }) {
  const s = statusOf(status)
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[s]}`}>
      {LABELS[s]}
    </span>
  )
}
