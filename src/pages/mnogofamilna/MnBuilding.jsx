import { useRef } from 'react'
import ResponsivePicture from '../../components/ui/ResponsivePicture'
import Seam from '../../components/ui/Seam'
import mnImages from '../../data/images/mnogofamilna.json'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import useReveals from '../../motion/useReveals'
import useWipes from '../../motion/useWipes'
import { bindAddress, formatArea, formatDecimal } from '../../utils/format'
import { TypeCounts } from './MnBlocks'

// The building, #sgradata (spec M3 §6.2 #4; the concept's
// mnogofamilna.html:111-131): a split on the seam. On the left the street
// perspective (production's photo-2), graded to the night palette by the
// page's stylesheet (mn.css); on the right the brochure's own line, „С
// магазини и подземни *гаражи*“, production's description
// (src/constants/properties.js:29) without its floors' sentence, which the
// data contradicts (spec M3 §2), the УПИ address, and the building's facts,
// derived from the dated snapshot (MN_FACTS, spec M3 §5.4): its blocks, its
// floors with apartments, its apartments and how many a floor, with the
// range of their areas, and its room types.
//
// The heading rises line by line and the copy fades in as the section comes
// into view (useReveals); the picture opens from the seam (useWipes, the
// page's own reveal); the markup is the final state.

// A no-break space binds what an address keeps together (bindAddress).
const ADDRESS = bindAddress('УПИ V-1344, кв. 33, ж.к. Връбница-1, гр. София')
const SIZES = '(max-width: 900px) 100vw, 50vw'

function Facts() {
  const { blocks, residentialFloors, floors, apartments, perBlock, perFloor, minArea, maxArea } = MN_FACTS
  return (
    <dl className="kv" data-fade="">
      <div>
        <dt>{blocks}</dt>
        <dd>блока, А&nbsp;и&nbsp;Б</dd>
      </div>
      <div>
        <dt>{residentialFloors}</dt>
        <dd>
          жилищни етажа във всеки блок, от {floors.min} до {floors.max}
        </dd>
      </div>
      <div>
        <dt>{apartments}</dt>
        <dd>
          апартамента, по {perBlock} в&nbsp;блок
        </dd>
      </div>
      <div>
        <dt>{perFloor}</dt>
        <dd>
          апартамента на етаж, от {formatDecimal(minArea)} до {formatArea(maxArea)}
        </dd>
      </div>
    </dl>
  )
}

export default function MnBuilding() {
  const ref = useRef(null)
  useReveals(ref)
  useWipes(ref)

  return (
    <section ref={ref} className="mns split" id="sgradata" aria-labelledby="mns-h">
      <Seam />
      <figure className="mns__media" data-wipe="l">
        <ResponsivePicture
          image={mnImages['mn-persp']}
          alt="Многофамилната сграда откъм улицата, визуализация"
          sizes={SIZES}
          className="mn-night"
        />
      </figure>
      <div className="mns__text">
        {/* Two lines, the second from „и“, which binds to its word (M3
            §4.5): written in, so the reveal's split lines, which read a
            no-break space as a space (SplitText), break where the landed
            heading does, and no word moves as the split is undone. */}
        <h2 className="h2" id="mns-h" data-split="">
          С&nbsp;магазини <br />
          и&nbsp;подземни <em>гаражи</em>
        </h2>
        <p className="mns__desc" data-fade="">
          Модерна многофамилна жилищна сграда с&nbsp;два блока (А&nbsp;и&nbsp;Б), гаражи и&nbsp;луксозни апартаменти
          в&nbsp;ж.к.&nbsp;Връбница-1. Част от апартаментите вече са продадени.
        </p>
        <p className="small mns__addr" data-fade="">
          {ADDRESS}
        </p>
        <Facts />
        <p className="mns__types" data-fade="">
          <TypeCounts types={MN_FACTS.types} />
        </p>
      </div>
    </section>
  )
}
