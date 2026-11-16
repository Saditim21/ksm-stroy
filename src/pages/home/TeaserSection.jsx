import { useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { useAvailability } from '../../data/availability/useAvailability'
import Facade from '../../explorer/Facade'
import { loadSurfaces } from '../../explorer/loadSurfaces'
import { buildModel } from '../../explorer/model'
import StaleNotice from '../../explorer/StaleNotice'
import useReveals from '../../motion/useReveals'

// Golden Residence floor by floor, Home's teaser, #etazhi (spec §6.11, §8.1
// #5; extract §4.13): the hinge, the facade in compact mode, the free
// apartments of every floor on its block's edge, the stale-data notice when
// spec §9 calls for it (the teaser speaks for Home), then the two ways into
// the explorer: „Визуално“ and „По критерии“.
//
// A floor opens on the Golden Residence page by its floor alone
// (/projects/golden-residence?floor=А-5, ruling F11): the page jumps to its
// explorer and opens the floor's plan stage (spec §7.10). The stage's chunk
// (surfaces.js), which Home's compact facade never needs, starts loading
// with the click, beside the page's own, so the stage need not wait for it
// after the doors. The headings and the seam reveal as everywhere
// (useReveals); the markup is the final state.

const GR = '/projects/golden-residence'

export default function TeaserSection() {
  const ref = useRef(null)
  useReveals(ref)
  const { data } = useAvailability()
  const model = useMemo(() => buildModel(data), [data])
  const navigate = useNavigate()
  const openFloor = useCallback((block, floor) => {
    // The page's provider loads it again, and says so, if this load fails.
    loadSurfaces().catch(() => {})
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
      <Facade model={model} mode="compact" onOpenFloor={openFloor} />
      <StaleNotice className="teaser__notice" />
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
