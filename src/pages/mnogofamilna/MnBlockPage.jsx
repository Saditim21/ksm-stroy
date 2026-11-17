import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InquirySection from '../../components/inquiry/InquirySection'
import Button from '../../components/ui/Button'
import Seam from '../../components/ui/Seam'
import { availabilityPreload } from '../../data/availability/useAvailability'
import { MN_FACTS } from '../../data/mnogofamilna/facts'
import { blockFacade } from '../../explorer/blockFacade'
import { ExplorerProvider } from '../../explorer/ExplorerContext'
import { Dated } from '../../explorer/ExplorerSection'
import Facade from '../../explorer/Facade'
import { FloorCounts } from '../../explorer/FloorFacts'
import { facadeOf } from '../../explorer/geometry'
import { planFor } from '../../explorer/planGeometry'
import { MN_PROJECT } from '../../explorer/projects/mn'
import useExplorer from '../../explorer/useExplorer'
import useHotFloor from '../../explorer/useHotFloor'
import useMotion from '../../motion/useMotion'
import { preloadWithDocument } from '../../utils/documentPreloads'
import { DISPLAY_FONT_PRELOADS } from '../../utils/fontLinks'
import FloorRows from './FloorRows'
import { MN_INQUIRY } from './inquiry'
import './mn-block.css'

// A Многофамилна block page, /projects/mnogofamilna-sgrada/block-a and
// block-b (spec M3 §6.5; the concept's mnogofamilna-block-a.html, its css
// and js): one template for both blocks, Б mirrored by its root's class
// (mbp--b, mn-block.css), its facade on the right, as the block stands.
// - The head, a hinge (Golden Residence's block page head, .bp, M3 §4.1):
//   the way back „Към Многофамилна сграда“ and the H1 „Многофамилна сграда,
//   блок *А*“ against the seam; the block's facts, its counts by status and
//   the date they are from after it.
// - Then #explorer, a split: in one half the block's own night facade, its
//   crop, its rail and its lit floors (Facade.jsx in block mode,
//   blockFacade.jsx), pinned from 901 px, where motion plays, while the
//   floors scroll in the other, a row a floor, from 10 down to 2
//   (FloorRows.jsx); under the facade what lights, and as of when, the
//   concept's one sentence, as Многофамилна's opening says it (Dated).
//   How to open a floor the rows say; the main page's words on it
//   (FacadeCaption) do not fit here: the block's facade has no sheet, so a
//   phone's first tap shows no plan.
// - Then the inquiry (#kontakti, #zapitvane), in Многофамилна's words and
//   with its subjects, Многофамилна first and chosen (MN_INQUIRY).
// Its numbers are the dated snapshot of 01.12.2025 until Многофамилна's
// sheets are live (projects/mn.js), so the prerendered page shows them. The
// explorer's provider, Многофамилна's, writes the block's own floors bare in
// the address (?floor=7) and reads a deep link once the page has hydrated:
// it jumps to #explorer, and opens the plan stage and the unit panel.
//
// A row and its floor on the facade are one hot floor: the page's own
// (useHotFloor), which the facade shows and sets (its `hotState`) and the
// rows set too. Pointing at either, or the keyboard's focus on either, lights
// the floor on the facade and draws the row's brass rule. On a desktop with
// a hovering pointer, once the floors have come up past 30 % of the screen,
// the row across its middle is the hot floor while nothing is pointed at
// (one ScrollTrigger, useMotion: ruling PF15, the concept's
// mnogofamilna-block-a.js:123-136). A row's „Отворете плана“, or a unit of
// its plan, opens the stage, growing from the row's plan, and its close
// gives the focus back to the row's „Отворете плана“; a floor opened from
// the facade grows from its row's plan where the row is on the screen.
//
// The availability API and both display faces, which the title sets in the
// first viewport, are preloaded with the document the page is first loaded
// as, never again on a client-side visit (ruling C5.4).

const PRELOADS = [availabilityPreload, ...DISPLAY_FONT_PRELOADS]
const { perBlock, residentialFloors, perFloor, floors } = MN_FACTS
// A no-break space binds each count to its noun (M3 §4.5).
const FACTS = `${perBlock}\u00A0апартамента · ${residentialFloors}\u00A0етажа (${floors.min}–${floors.max}) · ${perFloor}\u00A0на етаж`
// The facade's picture is twice its stage, which takes a desktop's half less
// its gutters and its rail's room, and a phone's whole width shows the
// building's crop of the block (blockFacade.jsx, mn-block.css).
const SIZES = '(max-width: 900px) 170vw, calc(100vw - 340px)'
// Where the floors follow the reader: a hovering pointer, on a desktop.
const FINE = '(hover: hover) and (pointer: fine)'
const DESKTOP = `${FINE} and (min-width: 901px)`

// The way back's arrow, drawn as the actions' arrow is (Button), pointing back.
const BACK = (
  <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
    <path d="M18 5H2M6 1L2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

// An element's place on the screen, if any of it is on the screen.
function shown(element) {
  const rect = element?.getBoundingClientRect()
  return rect && rect.bottom > 0 && rect.top < window.innerHeight ? rect : null
}

function Head({ block }) {
  const { model, dated } = useExplorer()
  const counts = model?.blocks[block].counts
  return (
    <div className="bp hinge">
      <div className="bp__id">
        <Button to="/projects/mnogofamilna-sgrada" prefetch="intent" variant="link" className="bp__back">
          {BACK}
          Към Многофамилна сграда
        </Button>
        <h1 className="bp__title">
          <span className="line-mask">
            <span className="split-line">
              Многофамилна сграда, блок&nbsp;<em>{block}</em>
            </span>
          </span>
        </h1>
      </div>
      <div className="mbh">
        <p className="bp__facts">{FACTS}</p>
        <FloorCounts counts={counts} className="legend" />
        {dated ? <p className="small mbh__date">По данни към {dated}.</p> : null}
      </div>
      <Seam />
    </div>
  )
}

function Floors({ block }) {
  const { project, model, openFloor, railFocus, railFocused } = useExplorer()
  const own = useMemo(() => blockFacade(project, block, SIZES), [project, block])
  const { shape } = facadeOf(own.facade.map)
  const isFloor = useCallback((key) => shape.has(key), [shape])
  const hotState = useHotFloor({ compact: true, isFloor })
  const { hot, setHot, clearHot } = hotState
  const ref = useRef(null)
  const rowsRef = useRef(null)
  // The floor whose row crosses the middle of a desktop's screen, or null.
  const [middle, setMiddle] = useState(null)
  // The rows' plan: the block's typical floor, its numbers and its floors'
  // words, the project's plans' data (ruling PF3), as plans.js would give
  // them, which the rows draw without the drawing; plans.js itself, which
  // loads the plans the dialogs draw, stays with them (surfaces.js).
  const plan = useMemo(() => {
    const { floors: map, unitNumber, floorMeta } = project.plans
    return { ...planFor(map, block), unitNumber, floorMeta }
  }, [project, block])

  useMotion(ref, ({ ScrollTrigger }) => {
    if (!window.matchMedia(FINE).matches) return
    const rows = rowsRef.current
    const pick = () => {
      let key = null
      if (window.matchMedia(DESKTOP).matches && rows.getBoundingClientRect().top < window.innerHeight * 0.3) {
        const line = window.innerHeight * 0.55
        for (const row of rows.children) {
          const { top, bottom } = row.getBoundingClientRect()
          if (top <= line && bottom > line) key = row.dataset.k
        }
      }
      setMiddle(key)
    }
    ScrollTrigger.create({ trigger: rows, start: 'top bottom', end: 'bottom top', onUpdate: pick, onLeave: pick, onLeaveBack: pick })
  })

  // The middle row is the hot floor while nothing else is: a floor pointed
  // at, focused or tapped keeps it, and the middle row comes back once it
  // lets go.
  useEffect(() => {
    if (hot && hot.source !== 'scroll') return
    if (middle && hot?.key !== middle) setHot(middle, 'scroll')
    else if (!middle && hot) clearHot()
  }, [hot, middle, setHot, clearHot])

  // A row's floor, or a unit of it, grows from the row's plan, and gives the
  // focus back to the row's „Отворете плана“ (ruling C7.2).
  const openRow = (row, unitLabel) => openFloor(block, Number(row.dataset.k.split('-')[1]), unitLabel, {
    fromRect: row.querySelector('.mbr__plan svg').getBoundingClientRect(),
    opener: row.querySelector('.mbr__go'),
  })
  // A floor opened from the facade grows from its row's plan where the row
  // is on the screen; its rail takes the focus back.
  const openFromFacade = (letter, floor, unitLabel, meta) => openFloor(letter, floor, unitLabel, {
    ...meta,
    fromRect: meta?.fromRect ?? shown(rowsRef.current?.querySelector(`[data-k="${letter}-${floor}"] .mbr__plan svg`)),
  })
  // A stage that closes with no opener gives the focus to its floor's rail:
  // this block's (the facade has no other).
  const asked = useMemo(() => railFocus && { block, floor: railFocus.floor }, [railFocus, block])

  return (
    <section ref={ref} className="mbl split" id="explorer" aria-labelledby="mbl-h">
      <h2 className="sr-only" id="mbl-h">
        Етажи и&nbsp;апартаменти
      </h2>
      <Seam />
      <div className="mbl__pin">
        <Facade
          project={own}
          model={model}
          mode="block"
          initialBlock={block}
          hotState={hotState}
          focusRail={asked}
          onOpenFloor={openFromFacade}
          onRailFocused={railFocused}
        />
        <p className="mbl__cap">
          <Dated>Светят етажите със свободни апартаменти</Dated>
        </p>
      </div>
      <FloorRows project={project} model={model} block={block} plan={plan} hotState={hotState} onOpen={openRow} rowsRef={rowsRef} />
    </section>
  )
}

export default function MnBlockPage({ block }) {
  preloadWithDocument(PRELOADS)
  return (
    <ExplorerProvider project={MN_PROJECT} routeBlock={block}>
      <div className={block === 'Б' ? 'mbp mbp--b' : 'mbp'}>
        <Head block={block} />
        <Floors block={block} />
        <InquirySection page="mnogofamilna" {...MN_INQUIRY} />
      </div>
    </ExplorerProvider>
  )
}
