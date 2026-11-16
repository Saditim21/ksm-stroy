import { useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import Seam from '../../components/ui/Seam'
import StatusCount from '../../components/ui/StatusCount'
import { STATUS_ORDER } from '../../components/ui/status'
import { GR_FACTS } from '../../config/facts'
import { useAvailability } from '../../data/availability/useAvailability'
import Facade from '../../explorer/Facade'
import { loadSurfaces } from '../../explorer/loadSurfaces'
import { buildModel } from '../../explorer/model'
import { GR_PROJECT } from '../../explorer/projects/gr'
import StaleNotice from '../../explorer/StaleNotice'
import useReveals from '../../motion/useReveals'

// Golden Residence floor by floor, Home's teaser, #etazhi (spec §6.11, §8.1
// #5; extract §4.13): the hinge, the facade in compact mode, the free
// apartments of every floor on its block's edge, the stale-data notice when
// spec §9 calls for it (the teaser speaks for Home), then the two ways into
// the explorer: „Визуално“ and „По критерии“. The facade, the model and the
// notice are Golden Residence's (GR_PROJECT), with no explorer around them.
// The compact facade's caption is the teaser's own (spec §7.2): a live
// region that names the floor a pointer, the keyboard or a first tap is on,
// „Блок А · *етаж 5*“, with its counts, else the hint.
//
// A floor opens on the Golden Residence page by its floor alone
// (/projects/golden-residence?floor=А-5, ruling F11): the page jumps to its
// explorer and opens the floor's plan stage (spec §7.10). The stage's chunk
// (surfaces.js) and Golden Residence's plans, which Home's compact facade
// never needs, start loading with the click, beside the page's own, so the
// stage need not wait for them after the doors. The headings and the seam
// reveal as everywhere (useReveals); the markup is the final state.

const GR = '/projects/golden-residence'

// A no-break space after the one-letter „и“ (spec §3.3).
const HINT = 'Посочете етаж: свободните, резервираните и\u00a0продадените апартаменти на него. Кликнете, за да отворите плана му.'

// The caption of `floor`, the facade's hot floor (model.js), or the hint.
function caption(floor) {
  if (!floor) return <span className="hint">{HINT}</span>
  return (
    <>
      <span className="t">
        Блок&nbsp;{floor.block} · <em>етаж {floor.floor}</em>
      </span>
      {STATUS_ORDER.map((status) => (
        <StatusCount key={status} status={status} count={floor.counts ? floor.counts[status] : null} />
      ))}
    </>
  )
}

export default function TeaserSection() {
  const ref = useRef(null)
  useReveals(ref)
  const { data } = useAvailability()
  const model = useMemo(() => buildModel(data, GR_PROJECT), [data])
  const navigate = useNavigate()
  const openFloor = useCallback((block, floor) => {
    // The page's provider loads them again, and says so, if this load fails.
    loadSurfaces(GR_PROJECT).catch(() => {})
    navigate(`${GR}?floor=${block}-${floor}`)
  }, [navigate])

  return (
    <section ref={ref} className="sec teaser" id="etazhi" aria-labelledby="teaser-h">
      <div className="hinge">
        <h2 className="h2" id="teaser-h" data-split="">
          Golden Residence, <em>етаж</em> по етаж
        </h2>
        <p className="lead" data-fade="">
          Цифрите са свободните апартаменти в&nbsp;момента: блок&nbsp;А&nbsp;вляво, блок&nbsp;Б&nbsp;вдясно. Посочете етаж, кликнете,
          за да видите плана&nbsp;му.
        </p>
        <Seam draw />
      </div>
      <Facade project={GR_PROJECT} model={model} mode="compact" caption={caption} onOpenFloor={openFloor} />
      <StaleNotice project={GR_PROJECT} className="teaser__notice" />
      <nav className="ways" aria-label="Два начина да изберете апартамент">
        <Seam />
        <Link to={`${GR}#explorer`} prefetch="intent">
          <span className="serif">Визуално</span> <span className="small">Изберете етаж от фасадата</span>
        </Link>
        <Link to={`${GR}?view=list#explorer`} prefetch="intent">
          <span className="serif">По критерии</span>{' '}
          <span className="small">
            Всички {GR_FACTS.apartments} апартамента в&nbsp;списък с&nbsp;филтри
          </span>
        </Link>
      </nav>
    </section>
  )
}
