import { PRIMARY_PHONE } from '../config/site'
import { useAvailability } from '../data/availability/useAvailability'

// The stale-data notice (spec §9; ruling F15): the one place that decides
// when a page says its availability may be old, and how. It shows when a
// Golden Residence slot holds the data built into the site (origin
// 'built-in', the fallback included), or when the store has no data at all
// ('error'): never a fake zero without a word. Never while the data loads,
// nor in the prerendered page, which has no data yet, only `—`. The
// explorer and Home's teaser carry it, so Home never shows the built-in
// counts without it.
export default function StaleNotice({ className = '' }) {
  const { status, origin } = useAvailability()
  const builtIn = Object.values(origin?.['golden-residence'] ?? {}).includes('built-in')
  if (status !== 'error' && !builtIn) return null
  return (
    <p className={`stale ${className}`.trim()}>
      Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация:{' '}
      <a className="stale__tel" href={`tel:${PRIMARY_PHONE.tel}`}>
        {PRIMARY_PHONE.label}
      </a>
      .
    </p>
  )
}
