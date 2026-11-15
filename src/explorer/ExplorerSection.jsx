import { useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import RollingNumber from '../components/ui/RollingNumber'
import Seam from '../components/ui/Seam'
import StatusCount from '../components/ui/StatusCount'
import { STATUS_ORDER } from '../components/ui/status'
import { PROJECT_BLOCKS } from '../config/blocks'
import { GR_FACTS } from '../config/facts'
import { useAvailability } from '../data/availability/useAvailability'
import useReveals from '../motion/useReveals'
import Facade from './Facade'
import { buildModel } from './model'
import StaleNotice from './StaleNotice'

// The explorer's section, #explorer (spec §7, §8.2 #3; extract §4.19): the
// hinged head, „Изберете *апартамент*“ against the seam and the free
// apartments now beside it, the counts of the four statuses, the stale-data
// notice where spec §9 calls for it, then the facade in full mode. Every
// count is `—` until the data arrives (the free count rolls in once, through
// RollingNumber), never a zero. The heading rises line by line as the
// section comes into view (useReveals); the markup is the final state.
//
// For now a floor opens on its block's page, the legacy one, at that floor;
// the plan stage comes with the explorer's next step.

const BLOCK_PAGE = Object.fromEntries(PROJECT_BLOCKS['golden-residence'].map(({ id, letter }) => [letter, `/projects/golden-residence/${id}`]))

export default function ExplorerSection({ headingLevel = 2, initialBlock = 'А' }) {
  const ref = useRef(null)
  useReveals(ref)
  const { data } = useAvailability()
  const model = useMemo(() => buildModel(data), [data])
  const navigate = useNavigate()
  const openFloor = useCallback((block, floor) => navigate(`${BLOCK_PAGE[block]}?floor=${floor}`), [navigate])
  const Heading = `h${headingLevel}`

  return (
    <section ref={ref} className="explorer" id="explorer" aria-labelledby="ex-h">
      {/* The hinge's halves are boxes of their own, as the concept's are
          (golden-residence.html:131-144): the lead keeps its measure inside
          the half's padding, and the right half has room for the two ways
          in, „Визуално“ and „По критерии“, which come with the list. */}
      <div className="hinge explorer__head">
        <div>
          <Heading className="h2" id="ex-h" data-split="">
            Изберете <em>апартамент</em>
          </Heading>
        </div>
        <div>
          <p className="lead">
            Свободните апартаменти в&nbsp;момента, по данни от таблиците на КСМ Строй:{' '}
            <b>
              <RollingNumber value={model ? model.totals.available : null} />
            </b>{' '}
            от {GR_FACTS.apartments}.
          </p>
        </div>
        <Seam />
      </div>
      <div className="explorer__legend">
        <ul className="legend" aria-label="Всички апартаменти по статус">
          {STATUS_ORDER.map((status) => (
            <li key={status}>
              <StatusCount status={status} count={model ? model.totals[status] : null} />
            </li>
          ))}
        </ul>
      </div>
      <StaleNotice className="explorer__notice" />
      <Facade model={model} mode="full" initialBlock={initialBlock} onOpenFloor={openFloor} />
    </section>
  )
}
