import { PRIMARY_PHONE } from '../config/site'
import { useAvailability } from '../data/availability/useAvailability'

// The stale-data notice (spec §9; M3 §5.3; ruling F15): the one place that
// decides when a page says its availability may be old, and how. It takes the
// page's project (projects/gr.js, projects/mn.js) and shows when a slot of
// that project holds the data built into the site (origin 'built-in', the
// fallback included), or when the store has no data at all ('error'): never a
// fake zero without a word. Never while the data loads, nor in the
// prerendered page, which has no data yet, only `—`. And never over dated
// numbers (project.dated): dated is not stale, the date says how old they
// are (Многофамилна's snapshot). The explorer and Home's teaser carry it, so
// Home never shows the built-in counts without it.
export default function StaleNotice({ project, className = '' }) {
  const snapshot = useAvailability()
  const { status, origin } = snapshot
  const builtIn = Object.values(origin?.[project.id] ?? {}).includes('built-in')
  if ((status !== 'error' && !builtIn) || project.dated(snapshot)) return null
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
