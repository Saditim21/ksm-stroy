import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import ResponsivePicture from '../components/ui/ResponsivePicture'
import StatusCount from '../components/ui/StatusCount'
import { STATUS_ORDER } from '../components/ui/status'
import { GR_FACTS } from '../config/facts'
import grImages from '../data/images/golden-residence.json'
import building from '../data/maps/golden-residence.building.json'
import useMotion from '../motion/useMotion'
import useMotionNow from '../motion/useMotionNow'
import FacadeRails from './FacadeRails'
import { FACADE, floorShapes } from './geometry'
import { loadedSurfaces, loadSurfaces } from './loadSurfaces'
import { floorKey } from './model'
import useHotFloor, { isPhone, useLastPress } from './useHotFloor'
import './explorer.css'

// The facade (spec §7.2; extract §4.20; the concept's explorer.js:215-555):
// the building cut out of its sky, a brass seam between the blocks, and on
// each block's outer edge the free apartments of every floor, as real
// buttons, the rails. A floor turns hot when the mouse points at it (its
// floor or its rail), when the keyboard focuses its rail, or on a first tap:
// the lens moves to it, the rest of the building dims, its count turns
// brass-l, and in full mode its block's edge panel (desktop) or the sheet
// (phones) shows it. Leaving the facade and its panel clears it after
// 320 ms. A mouse click, Enter or Space opens the floor (`onOpenFloor(block,
// floor, unitLabel?, { fromRect, opener })`); a touch or pen tap on a floor
// that is not hot only previews it, and the second tap opens it. Compact
// mode (Home) has no panel and no sheet: its caption names the hot floor.
//
// The layout is CSS only (explorer.css): a wrapper is the container the
// root's sizes measure, and a phone shows one block, cropped by the root's
// data-block. `model` is buildModel()'s, or null until the data arrives:
// every count reads `—` then, never a zero, and the facade works all the
// same. React renders the final state; GSAP (useMotionNow) only moves the
// lens, and the intro (useMotion) brings the picture, the seam and the
// counts in once, as the facade comes up from below. The hot floor's state
// is useHotFloor's, the rails FacadeRails'; the pointer and the keys are
// handled here, on the stage around them.
//
// The edge panels and the sheet are a chunk of their own (surfaces.js),
// which the full facade loads as it nears the screen, or when it is first
// pointed at, focused or touched, if that comes first; a floor that turns
// hot before then shows as they arrive. They are not in the prerendered
// HTML: nothing shows them until a floor is hot.

const SHAPES = floorShapes(building)
const SHAPE = new Map(SHAPES.map((shape) => [shape.key, shape]))
const isFloor = (key) => SHAPE.has(key)
const BLOCKS = ['А', 'Б']
// The picture is the cut-out facade: its sky is see-through, so it waits on
// the page's ground, not on a block of its colour.
const PICTURE = { ...grImages['facade-cut'], color: 'transparent' }
// The picture's width: the grid's (the stage's) on a desktop, 1200/628 of
// the stage on a phone, which shows one block.
const PICTURE_SIZES = '(max-width: 900px) 191vw, (max-width: 1150px) 860px, 76vw'
// How far below the screen the facade starts to load its surfaces.
const NEAR = '0px 0px 600px 0px'
const NO_LENS = { x: 0, y: 0, width: 0, height: 0 }
const lensOf = (key) => {
  const box = SHAPE.get(key)?.bbox
  return box ? { x: box.x, y: box.y, width: box.w, height: box.h } : NO_LENS
}
const readLens = (node) => Object.fromEntries(['x', 'y', 'width', 'height'].map((name) => [name, Number(node.getAttribute(name))]))

// A floor the data has not reached: its plan without statuses, `—` counts.
const PLACEHOLDERS = new Map(SHAPES.map(({ key, block, floor }) => [
  key,
  Object.freeze({ block, floor, units: [], counts: null, colour: 'unknown', minFree: null, maxFree: null }),
]))
const floorOf = (model, key) => model?.floors.get(key) ?? PLACEHOLDERS.get(key)

// A no-break space after the one-letter „и“ (spec §3.3).
const IDLE_CAPTION = 'Посочете етаж: свободните, резервираните и\u00a0продадените апартаменти на него. Кликнете, за да отворите плана му.'

export default function Facade({ model, mode = 'full', initialBlock = 'А', onOpenFloor }) {
  const compact = mode === 'compact'
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const railRefs = useRef(new Map())
  const holeRef = useRef(null)
  const tintRef = useRef(null)
  const hlRef = useRef(null)
  const maskId = `fx${useId().replace(/[^\w-]/g, '')}`
  const motionNow = useMotionNow()
  const [phoneBlock, setPhoneBlock] = useState(initialBlock === 'Б' ? 'Б' : 'А')
  const { hot, lens, setHot, clearHot, scheduleClose, cancelClose, giveWay } = useHotFloor({ compact, isFloor })
  // The press a click comes from (the stage's pointerdown): its pointer, and
  // the floor that was hot as it began. A touch or pen tap on any other floor
  // only previews it. The click spends it, so a click with no press of its
  // own (an assistive technology's) opens the floor, as Enter does.
  const stagePress = useRef(null)
  const lastPress = useLastPress()
  // A rail Space opened: the click a browser may still send it on Space's
  // keyup is not a second opening. Enter's own click never comes (its keydown
  // is prevented). Any blur ends it: the plan stage takes the focus before the
  // keyup, which then never reaches the facade, and the next click on a floor
  // is a click of its own (ruling C7.1).
  const keyed = useRef(false)
  const overPanel = useRef(false)
  // The panels and the sheet, once their chunk is in. Never at the first
  // render of the prerendered page: nothing has loaded them before it
  // hydrates.
  const [surfaces, setSurfaces] = useState(compact ? null : loadedSurfaces)
  const mounted = useRef(true)
  const needSurfaces = useCallback(() => {
    if (compact || surfaces) return
    loadSurfaces().then((module) => {
      if (mounted.current) setSurfaces(module)
    }, (error) => {
      // Offline, a new deploy replaced the chunk, or the chunk itself failed:
      // the facade still opens its floors, without the panel or the sheet,
      // and the console says why (ruling C7.6).
      console.error('[explorer] the facade’s panels did not load:', error)
    })
  }, [compact, surfaces])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // The surfaces load as the facade nears the screen.
  useEffect(() => {
    if (compact || surfaces) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) needSurfaces()
    }, { rootMargin: NEAR })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [compact, surfaces, needSurfaces])

  // The lens: from floor to floor over 0.25 s power2.out, from where it is,
  // and at once onto the first hot floor; its tint fades over 0.2 s.
  const lensShown = useRef({ key: null, hot: false })
  const lensMoving = useRef(null)
  useLayoutEffect(() => {
    const was = lensShown.current
    const now = { key: lens, hot: hot !== null }
    lensShown.current = now
    const motion = motionNow()
    if (!motion) return
    const { gsap } = motion
    if (now.key !== was.key && was.key && was.hot) {
      const nodes = [holeRef.current, tintRef.current, hlRef.current]
      gsap.fromTo(nodes, { attr: lensMoving.current ?? lensOf(was.key) }, {
        attr: lensOf(now.key),
        duration: 0.25,
        ease: 'power2.out',
        // Only the box: the tint's fade, on one of these, carries on.
        overwrite: 'auto',
        onUpdate: () => { lensMoving.current = readLens(holeRef.current) },
        onComplete: () => { lensMoving.current = null },
      })
    }
    if (now.hot !== was.hot) {
      gsap.fromTo(tintRef.current, { attr: { 'fill-opacity': was.hot ? 0.2 : 0 } }, { attr: { 'fill-opacity': now.hot ? 0.2 : 0 }, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
    }
  }, [lens, hot, motionNow])

  // The intro, once, as the facade comes up from below (extract §4.20): the
  // picture fades in, the seam draws down, the counts rise floor by floor. A
  // facade already on screen stays as it is.
  useMotion(rootRef, ({ gsap }) => {
    const root = rootRef.current
    if (!root || root.getBoundingClientRect().top < window.innerHeight) return
    const counts = [...root.querySelectorAll('.fx__cnt')].sort((a, b) => {
      const [first, second] = [SHAPE.get(a.dataset.k), SHAPE.get(b.dataset.k)]
      return first.floor - second.floor || first.block.localeCompare(second.block)
    })
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%', once: true } })
      .from(root.querySelector('.fx__pic'), { opacity: 0, duration: 1.2, ease: 'power2.out', clearProps: 'opacity' }, 0)
      .from(root.querySelector('.fx__seam'), { attr: { y2: 120 }, duration: 1.2, ease: 'expo.out' }, 0.2)
      .from(counts, { opacity: 0, y: 10, duration: 0.6, ease: 'expo.out', stagger: 0.03, clearProps: 'opacity,transform' }, 0.3)
  })

  const blockOf = (key) => SHAPE.get(key).block

  // Opens a floor; the sheet, if it shows it, gives way.
  const open = (key, unitLabel, meta) => {
    const { block, floor } = SHAPE.get(key)
    giveWay()
    onOpenFloor?.(block, floor, unitLabel, meta)
  }

  // What a floor opened from a rail or from the building hands on (ruling
  // F5): the plan of the panel or the sheet on show, and the floor's rail.
  const openFromFacade = (key) => {
    const plan = (hot?.on === 'sheet' ? document.querySelector('.sheet[data-open]') : rootRef.current?.querySelector('.fxp[data-open]'))
      ?.querySelector('svg.plan')
    open(key, undefined, { fromRect: plan?.getBoundingClientRect() ?? null, opener: railRefs.current.get(key) })
  }
  // A floor opened from a panel or the sheet (its button, or a unit of its
  // plan): the plan's place, and the floor's rail as the opener the stage
  // gives the focus back to. The plan is hidden from assistive technology,
  // and the sheet's button turns inert as the sheet gives way (ruling C7.2).
  const openFromSurface = (key, unitLabel, meta) => open(key, unitLabel, { fromRect: meta?.fromRect ?? null, opener: railRefs.current.get(key) })

  const keyOf = (event) => event.target.closest?.('[data-k]')?.dataset.k

  const onPointerDown = (event) => {
    stagePress.current = { pointer: event.pointerType || 'mouse', hot: hot?.key ?? null }
    needSurfaces()
  }
  // A press the browser takes for a scroll ends in no click.
  const onPointerCancel = () => {
    stagePress.current = null
  }
  // A mouse (or a pointer that hovers) makes a floor hot; a finger or a pen
  // never does by passing over it.
  const onPointerOver = (event) => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') return
    const key = keyOf(event)
    if (key) setHot(key, 'mouse')
  }
  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') scheduleClose()
  }
  const onClick = (event) => {
    const pressed = stagePress.current
    stagePress.current = null
    const key = keyOf(event)
    if (!key) return
    if (keyed.current) {
      keyed.current = false
      return
    }
    if ((pressed?.pointer === 'touch' || pressed?.pointer === 'pen') && pressed.hot !== key) {
      setHot(key, 'tap')
      return
    }
    openFromFacade(key)
  }
  // The keyboard's focus on a rail makes its floor hot. A pointer's press
  // focuses the rail too, a mouse's before its pointerup and a finger's after
  // it: that leaves the floor to the click.
  const onFocus = (event) => {
    needSurfaces()
    const key = event.target.closest?.('.fx__cnt')?.dataset.k
    if (key && lastPress.current.keyboard) setHot(key, 'kbd')
  }
  // Focus leaving the facade and its panels clears the floor, as the mouse
  // leaving does (not on a phone, whose sheet stays until it is closed). A
  // pointer's press on the building or in a panel takes the focus off a rail
  // without leaving them: a finger has already left the panel when its press
  // moves the focus.
  const onBlur = (event) => {
    keyed.current = false
    if (rootRef.current?.contains(event.relatedTarget) || overPanel.current || isPhone()) return
    const area = lastPress.current.target?.closest?.('.fx__stage, .fxp')
    if (area && rootRef.current?.contains(area)) return
    scheduleClose()
  }
  const onKeyDown = (event) => {
    const rail = event.target.closest?.('.fx__cnt')
    if (!rail) return
    const { block, floor } = SHAPE.get(rail.dataset.k)
    let next = null
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      keyed.current = event.key === ' '
      openFromFacade(rail.dataset.k)
      return
    }
    if (event.key === 'Escape') {
      clearHot()
      return
    }
    if (event.key === 'ArrowUp') next = floorKey(block, Math.min(GR_FACTS.floors, floor + 1))
    if (event.key === 'ArrowDown') next = floorKey(block, Math.max(1, floor - 1))
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !isPhone()) next = floorKey(event.key === 'ArrowLeft' ? 'А' : 'Б', floor)
    if (next && next !== rail.dataset.k) {
      event.preventDefault()
      railRefs.current.get(next)?.focus()
    }
  }
  const onKeyUp = () => {
    // After any click the key sent.
    setTimeout(() => {
      keyed.current = false
    })
  }

  // A phone shows one block: the switch keeps the floor that was hot, in the
  // other block, and the stage comes back up from .4 over 0.4 s.
  const switchBlock = (block) => {
    if (block === phoneBlock) return
    const keep = hot ? SHAPE.get(hot.key).floor : null
    setPhoneBlock(block)
    clearHot()
    motionNow()?.gsap.fromTo(stageRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' })
    if (keep && isPhone()) setHot(floorKey(block, keep), 'tap')
  }

  // The edge panel: entering it keeps the floor; leaving it (not a finger)
  // clears it after 320 ms.
  const panelEnter = () => {
    overPanel.current = true
    cancelClose()
  }
  const panelLeave = (event) => {
    overPanel.current = false
    if (event.pointerType !== 'touch') scheduleClose()
  }

  const hotFloor = hot ? floorOf(model, hot.key) : null
  const lensRect = lensOf(lens)
  const lensColour = lens ? floorOf(model, lens).colour : 'unknown'
  const rootClass = ['fx', compact && 'fx--compact', hot && 'is-hot', hot?.source === 'kbd' && 'is-kbd'].filter(Boolean).join(' ')

  return (
    <div className="fx-wrap">
      <div ref={rootRef} className={rootClass} data-block={phoneBlock} onPointerEnter={needSurfaces} onFocus={onFocus} onBlur={onBlur}>
        <div className="fxm">
          <div className="seg" role="group" aria-label="Блок">
            {BLOCKS.map((block) => (
              <button key={block} type="button" aria-pressed={phoneBlock === block} onClick={() => switchBlock(block)}>
                Блок&nbsp;{block}
              </button>
            ))}
          </div>
          <span className="small">Докоснете етаж</span>
        </div>
        <div
          ref={stageRef}
          className="fx__stage"
          role="group"
          aria-label="Фасада на Golden Residence. Изберете етаж."
          onPointerDown={onPointerDown}
          onPointerCancel={onPointerCancel}
          onPointerOver={onPointerOver}
          onPointerLeave={onPointerLeave}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <p className="fx__bname fx__bname--a">Блок&nbsp;А</p>
          <p className="fx__bname fx__bname--b">Блок&nbsp;Б</p>
          <div className="fx__clip" aria-hidden="true">
            <div className="fx__frame">
              <ResponsivePicture image={PICTURE} alt="" sizes={PICTURE_SIZES} className="fx__pic" />
              <svg className="fx__svg" viewBox={`0 0 ${FACADE.width} ${FACADE.height}`} preserveAspectRatio="none" focusable="false">
                <defs>
                  <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width={FACADE.width + 20} height={FACADE.height + 20}>
                    <rect x="-10" y="-10" width={FACADE.width + 20} height={FACADE.height + 20} fill="#fff" />
                    <rect ref={holeRef} className="fx__hole" {...lensRect} fill="#000" />
                  </mask>
                </defs>
                <rect className="fx__dim" x="-10" y="-10" width={FACADE.width + 20} height={FACADE.height + 20} mask={`url(#${maskId})`} />
                <rect ref={tintRef} className="fx__tint" data-colour={lensColour} {...lensRect} fillOpacity={hot ? 0.2 : 0} />
                <rect ref={hlRef} className="fx__hl" {...lensRect} />
                <line className="fx__seam" x1={FACADE.seamX} y1="120" x2={FACADE.seamX} y2="520" />
                <g className="fx__floors">
                  {SHAPES.map(({ key, block, d }) => (
                    <path key={key} className="fx__floor" d={d} data-k={key} data-block={block} />
                  ))}
                </g>
              </svg>
            </div>
          </div>
          <FacadeRails model={model} hotKey={hot?.key ?? null} railRefs={railRefs} />
        </div>
        {compact ? (
          <p className="fx__cap" aria-live="polite">
            {hotFloor ? (
              <>
                <span className="t">
                  Блок&nbsp;{hotFloor.block} · <em>етаж {hotFloor.floor}</em>
                </span>
                {STATUS_ORDER.map((status) => (
                  <StatusCount key={status} status={status} count={hotFloor.counts ? hotFloor.counts[status] : null} />
                ))}
              </>
            ) : (
              <span className="hint">{IDLE_CAPTION}</span>
            )}
          </p>
        ) : (
          <>
            <p className="fx__cap">
              Цифрите отстрани са <b>свободните апартаменти</b> на всеки етаж.{' '}
              <span className="cap-desk">Посочете етаж, кликнете, за да отворите плана му.</span>
              <span className="cap-phone">Докоснете етаж, за да видите плана му; второ докосване го отваря.</span>
            </p>
            {surfaces ? BLOCKS.map((block) => (
              <surfaces.FloorPanel
                key={block}
                side={block}
                floor={hot?.on === 'panel' && blockOf(hot.key) === block ? hotFloor : null}
                plan={surfaces.PLANS[block]}
                onOpenFloor={(b, f, unit, meta) => open(floorKey(b, f), unit, meta)}
                onUnit={(unit, meta) => openFromSurface(floorKey(unit.block, unit.floor), unit.label, meta)}
                onPointerEnter={panelEnter}
                onPointerLeave={panelLeave}
              />
            )) : null}
          </>
        )}
      </div>
      {surfaces ? (
        <surfaces.FloorSheet
          floor={hot?.on === 'sheet' ? hotFloor : null}
          plan={surfaces.PLANS[lens ? blockOf(lens) : phoneBlock]}
          anchor={stageRef}
          onClose={clearHot}
          onStep={(step) => {
            if (!hot) return
            const { block, floor } = SHAPE.get(hot.key)
            setHot(floorKey(block, Math.min(GR_FACTS.floors, Math.max(1, floor + step))), 'tap')
          }}
          onOpen={(meta) => hot && openFromSurface(hot.key, undefined, meta)}
          onUnit={(unit, meta) => openFromSurface(floorKey(unit.block, unit.floor), unit.label, meta)}
        />
      ) : null}
    </div>
  )
}
