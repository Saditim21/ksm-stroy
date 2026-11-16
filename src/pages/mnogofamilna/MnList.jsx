import { useCallback, useEffect, useRef, useState } from 'react'
import Seam from '../../components/ui/Seam'
import { loadedUnitList, loadUnitList } from '../../explorer/loadUnitList'
import useExplorer from '../../explorer/useExplorer'
import useReveals from '../../motion/useReveals'

// „Всички 144 апартамента“, #spisak (spec M3 §6.2 #3; the concept's
// mnogofamilna.html:102-109): the explorer's „По критерии“ list as a section
// of its own, since the opening is already the visual way in. The hinge's
// heading and lead are in the HTML, the lead saying how old the numbers are
// and that the sold ones stay in the list; the list (UnitList.jsx, its
// filters, its table, the live meta „144 от 144 · 16 свободни“) is a lazy
// chunk (loadUnitList.js, ruling C8.5), which loads
// - as the section nears the screen;
// - at once when the section takes the focus: „По критерии“ glides here and
//   focuses it (glideToHash), as a keyboard does reaching it;
// - at once on a ?view=list landing, which the explorer's provider lands
//   here (ExplorerContext.jsx).
// It takes the room kept for it (mn.css), so nothing visible moves when it
// lands. Its rows open their units in the unit panel, each row the opener
// the panel gives the focus back to (ruling C8.1: Safari and Firefox on a
// Mac focus no row they click). A list that failed to load is tried again as
// the section nears once more.
//
// The heading rises line by line, the lead fades in and the seam draws as
// the section comes into view (useReveals); the markup is the final state.

// How far below the screen the list starts to load.
const NEAR = '0px 0px 600px 0px'

// The row of the list that names `label` (UnitList.jsx).
const rowOf = (section, label) => [...section.querySelectorAll('tr.row')].find((row) => row.querySelector('.uid')?.textContent === label)

export default function MnList() {
  const ref = useRef(null)
  useReveals(ref)
  const { project, model, dated, view, openUnit } = useExplorer()
  const [list, setList] = useState(loadedUnitList)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(() => {
    if (list) return
    loadUnitList().then(
      (module) => {
        if (mounted.current) setList(module)
      },
      (error) => console.error('[explorer] the list did not load:', error),
    )
  }, [list])

  // As the section nears the screen.
  useEffect(() => {
    if (list) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) load()
    }, { rootMargin: NEAR })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [list, load])

  // A ?view=list landing.
  useEffect(() => {
    if (view === 'list') load()
  }, [view, load])

  const UnitList = list?.default
  const toUnit = (label) => openUnit(label, rowOf(ref.current, label))

  return (
    <section ref={ref} className="sec mnl" id="spisak" aria-labelledby="mnl-h" onFocus={load}>
      <div className="hinge">
        <h2 className="h2" id="mnl-h" data-split="">
          Всички <em>{project.total}</em> апартамента
        </h2>
        <p className="lead" data-fade="">
          {dated ? `По данни към ${dated}. ` : null}Продадените остават в&nbsp;списъка.
        </p>
        <Seam draw />
      </div>
      <div className="mnl__list">{UnitList ? <UnitList project={project} model={model} onUnit={toUnit} /> : null}</div>
    </section>
  )
}
