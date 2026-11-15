import { useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import Seam from '../../components/ui/Seam'
import { GR_FACTS } from '../../config/facts'
import { useAvailability } from '../../data/availability/useAvailability'
import Facade from '../../explorer/Facade'
import { buildModel } from '../../explorer/model'
import StaleNotice from '../../explorer/StaleNotice'
import useReveals from '../../motion/useReveals'

// Golden Residence floor by floor, Home's teaser, #etazhi (spec §6.11, §8.1
// #5; extract §4.13): the hinge, the facade in compact mode, the free
// apartments of every floor on its block's edge, the stale-data notice when
// spec §9 calls for it (the teaser speaks for Home), then the two ways into
// the explorer: „Визуално“ and „По критерии“.
//
// A floor opens on the Golden Residence page, at the explorer, which reads
// the floor from the address once the plan stage comes (ruling F11: the hash
// goes then, for the page's own jump). The headings and the seam reveal as
// everywhere (useReveals); the markup is the final state.

const GR = '/projects/golden-residence'

export default function TeaserSection() {
  const ref = useRef(null)
  useReveals(ref)
  const { data } = useAvailability()
  const model = useMemo(() => buildModel(data), [data])
  const navigate = useNavigate()
  const openFloor = useCallback((block, floor) => navigate(`${GR}?floor=${block}-${floor}#explorer`), [navigate])

  return (
    <section ref={ref} className="sec teaser" id="etazhi" aria-labelledby="teaser-h">
      <div className="hinge">
        <h2 className="h2" id="teaser-h" data-split="">
          Golden Residence, <em>етаж</em> по етаж
        </h2>
        <p className="lead" data-fade="">
          Цифрите са свободните апартаменти в&nbsp;момента: блок&nbsp;А вляво, блок&nbsp;Б вдясно. Посочете етаж, кликнете,
          за да видите плана му.
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
