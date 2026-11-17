import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import RollingNumber from '../components/ui/RollingNumber'
import Seam from '../components/ui/Seam'
import StatusCount from '../components/ui/StatusCount'
import { STATUS_ORDER } from '../components/ui/status'
import useMotionNow from '../motion/useMotionNow'
import useReveals from '../motion/useReveals'
import { Dated, FacadeCaption } from './captions'
import Facade from './Facade'
import { loadSurfaces } from './loadSurfaces'
import { loadedUnitList, loadUnitList } from './loadUnitList'
import StaleNotice from './StaleNotice'
import useExplorer from './useExplorer'
import ViewTabs from './ViewTabs'

// The explorer's section, #explorer (spec §7, §8.2 #3; extract §4.19): the
// hinged head, „Изберете *апартамент*“ against the seam and, beside it, the
// two ways in, „Визуално“ and „По критерии“ (ViewTabs), over the free
// apartments now; the counts of the four statuses, the stale-data notice
// where spec §9 calls for it, then the views: the facade in full mode, or the
// list (UnitList). Every count is `—` until the data arrives (the free count
// rolls in once, through RollingNumber), never a zero. The heading rises line
// by line as the section comes into view (useReveals); the markup is the
// final state.
//
// It sits inside the page's ExplorerProvider (ExplorerContext.jsx), whose
// project and model it shows: the facade's floors open their plan stage in
// place (openFloor), the list's rows their unit (openUnit), and the facade
// takes the floor whose rail the provider asks to focus as a stage closes
// (railFocus).
//
// - The view is the address's ?view (useExplorerState), read once the page
//   has hydrated: the prerendered HTML is „Визуално“'s.
// - Both panels are in the page, the facade's first, so the list's „етаж 3“
//   comes after the rails' own (the availability contract clicks the first).
//   The panel not on show is hidden; the facade keeps its state there, with
//   no floor hot.
// - `initialBlock` is a block page's letter (spec §7.11): its facade and its
//   list start on that block. On the Golden Residence page there is none:
//   the facade starts on А, the list on both.
// - The list is a lazy chunk (loadUnitList.js, ruling C8.5): it loads on the
//   first switch to it, or on a ?view=list landing, and usually before
//   either, as the surfaces' chunk preloads it (surfaces.js, ruling C8.6). It
//   stays once shown. If it fails on a landing, the explorer goes back to
//   „Визуално“, never an empty panel, and a later switch tries again (ruling
//   C8.7).
// - The switch (spec §5.7, §7.8; the concept's gr.js:79-93): Flip (a lazy
//   chunk of its own, whose loader the surfaces' chunk hands over, with the
//   list's, surfaces.js) records the views and the tabs' underline before
//   it, then plays them from there, both in the list's chunk (recordSwitch,
//   viewMotion.js), out of the first-load JS: 0.7 s expo.inOut for the views
//   and the underline's own 0.25 s, while the panel coming in rises 26 px
//   over 0.7 s expo.out, 0.12 s late; ScrollTrigger measures the page again
//   once the views have settled. Without motion it switches at once; without
//   Flip (its load failed) too.

// The tabs' and the panels' ids (ViewTabs.jsx): a page has one explorer, as
// it has one #explorer.
const ID = 'ex'

// The facade's captions live in captions.jsx, which the Многофамилна pages
// import without this section; they stay exported from here too.
export { Dated, FacadeCaption }
const caption = () => <FacadeCaption />

export default function ExplorerSection({ headingLevel = 2, initialBlock }) {
  const ref = useRef(null)
  useReveals(ref)
  const { project, model, view, setView, openFloor, openUnit, railFocus, railFocused } = useExplorer()
  const motionNow = useMotionNow()
  const Heading = `h${headingLevel}`

  // The list's module once it is in, and whether the list has been on show:
  // from then on it stays in its panel, filters and all.
  const [list, setList] = useState(loadedUnitList)
  const [listShown, setListShown] = useState(false)
  if (view === 'list' && !listShown) setListShown(true)
  const listWanted = view === 'list'
  useEffect(() => {
    if (!listWanted || list) return undefined
    let live = true
    loadUnitList().then(
      (module) => {
        if (live) setList(module)
      },
      (error) => {
        console.error('[explorer] the list did not load:', error)
        if (live) setView('visual')
      },
    )
    return () => {
      live = false
    }
  }, [listWanted, list, setView])

  // What the views showed at the last commit, and what plays a switch's
  // Flip, recorded before its commit (recordSwitch) and played after it.
  const layout = useRef({ view, list: Boolean(list) })
  const flip = useRef(null)

  // A switch waits for what it shows (the list, and Flip where motion plays),
  // then records the views and the underline and changes the address. A
  // later switch overtakes one still waiting, a click on the tab still
  // selected or an arrow back to it too (ViewTabs passes them on, ruling
  // C8.8); with no switch waiting, that tab asks for nothing.
  const waiting = useRef(null)
  const switchTo = (next) => {
    if (next === view && !waiting.current) return
    waiting.current = next
    const motion = motionNow()
    Promise.all([
      motion ? loadSurfaces().then((surfaces) => surfaces.loadFlip()).catch(() => null) : null,
      next === 'list' ? loadUnitList() : null,
    ]).then(
      ([Flip, module]) => {
        if (waiting.current !== next) return
        waiting.current = null
        if (module) setList(module)
        if (next === layout.current.view) return
        if (Flip && motionNow()) flip.current = loadedUnitList()?.recordSwitch(Flip, ref.current, next)
        setView(next)
      },
      (error) => {
        if (waiting.current === next) waiting.current = null
        console.error('[explorer] the list did not load:', error)
      },
    )
  }

  // After a commit that changed what the views show: the switch's Flip, or
  // (no Flip recorded, or the list arriving after its view) ScrollTrigger
  // measuring the page again. Nothing without motion.
  useLayoutEffect(() => {
    const was = layout.current
    const now = { view, list: Boolean(list) }
    layout.current = now
    const switched = was.view !== now.view
    if (!switched && (was.list === now.list || now.view !== 'list')) return
    const play = switched ? flip.current : null
    if (switched) flip.current = null
    const motion = motionNow()
    if (!motion) return
    const refresh = () => motion.ScrollTrigger.refresh()
    if (play) play(motion.gsap, refresh)
    else refresh()
  }, [view, list, motionNow])

  const UnitList = listShown ? list?.default : null

  return (
    <section ref={ref} className="explorer" id="explorer" aria-labelledby="ex-h">
      {/* The hinge's halves are boxes of their own, as the concept's are
          (golden-residence.html:131-144): the lead keeps its measure inside
          the half's padding, under the two ways in. */}
      <div className="hinge explorer__head">
        <div>
          <Heading className="h2" id="ex-h" data-split="">
            Изберете <em>апартамент</em>
          </Heading>
        </div>
        <div>
          <ViewTabs value={view} onChange={switchTo} idBase={ID} />
          <p className="lead">
            Свободните апартаменти в&nbsp;момента, по данни от таблиците на КСМ&nbsp;Строй:{' '}
            <b>
              <RollingNumber value={model ? model.totals.available : null} />
            </b>{' '}
            от {project.total}.
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
      <StaleNotice project={project} className="explorer__notice" />
      <div className="views">
        <div id={`${ID}-visual`} role="tabpanel" aria-labelledby={`${ID}-tab-visual`} data-view="visual" hidden={view !== 'visual'}>
          <Facade
            project={project}
            model={model}
            mode="full"
            initialBlock={initialBlock}
            active={view === 'visual'}
            focusRail={railFocus}
            onOpenFloor={openFloor}
            onRailFocused={railFocused}
            caption={caption}
          />
        </div>
        <div id={`${ID}-list`} role="tabpanel" aria-labelledby={`${ID}-tab-list`} data-view="list" hidden={view !== 'list'}>
          {UnitList ? <UnitList project={project} model={model} block={initialBlock} onUnit={openUnit} /> : null}
        </div>
      </div>
    </section>
  )
}
