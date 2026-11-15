import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../test/gsap'
import { mockMatchMedia } from '../test/media'
import Facade from './Facade'
import FloorPanel from './FloorPanel'
import FloorSheet from './FloorSheet'
import { loadSurfaces } from './loadSurfaces'
import { buildModel, floorKey } from './model'
import { PLANS } from './plans'
import { snapshotData } from './testing'

// The facade's motion as a floor turns hot (spec §5.7; extract §4.20, §4.21,
// §4.25; ruling C9.10): the lens moving from floor to floor and its tint, the
// edge panel sliding in and out from its block's edge, the phone's sheet
// rising and dropping away, and their plans drawing or crossfading
// (planMotion.js, its own tests). The engine useMotionNow() hands over is a
// recording stand-in (src/test/gsap.js); the facade's intro, through
// useMotion, never loads. A desktop with a mouse, as in Facade.test.jsx.

vi.mock('../motion/runtime', () => ({ loadMotion: () => new Promise(() => {}), getMotion: () => null, scheduleInit: () => {} }))
let motion = null
vi.mock('../motion/useMotionNow', () => ({ default: () => () => motion }))

const MODEL = buildModel(snapshotData())
const floorOf = (block, floor) => MODEL.floors.get(floorKey(block, floor))
const recorder = recordingMotion()
// What a tween or a step was, without its targets (elements, compared on their own).
const shape = ({ method, from, vars }) => (from ? { method, from, vars } : { method, vars })

beforeAll(() => loadSurfaces())

let restore
beforeEach(() => {
  recorder.reset()
  motion = recorder.motion
  restore = mockMatchMedia({ fine: true })
})
afterEach(() => {
  motion = null
  restore()
  vi.unstubAllGlobals()
})

describe('the edge panel', () => {
  const renderPanel = (side, floor) => {
    const props = { side, plan: PLANS[side], onOpenFloor: vi.fn(), onUnit: vi.fn() }
    const view = render(<FloorPanel {...props} floor={floor} />)
    return { ...view, show: (next) => view.rerender(<FloorPanel {...props} floor={next} />) }
  }

  it('slides in from block А’s edge over 0.45 s expo.out, drawing its plan, and out over 0.35 s expo.in', () => {
    const { show } = renderPanel('А', null)
    expect(recorder.tweens).toHaveLength(0)

    show(floorOf('А', 5))
    const panel = document.querySelector('aside.fxp--a')
    const [slide, outlines, fills] = recorder.tweens
    expect(slide.targets).toBe(panel)
    expect(shape(slide)).toEqual({
      method: 'fromTo',
      from: { xPercent: -102, visibility: 'visible' },
      vars: { xPercent: 0, duration: 0.45, ease: 'expo.out', clearProps: 'transform,visibility' },
    })
    // The plan draws as it comes (planMotion.js).
    expect([...outlines.targets]).toEqual([...panel.querySelectorAll('.u-shape')])
    expect(outlines.vars).toMatchObject({ duration: 0.5, ease: 'expo.out' })
    expect(fills.vars).toMatchObject({ duration: 0.3, delay: 0.12 })

    recorder.reset()
    show(null)
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toBe(panel)
    expect(shape(recorder.tweens[0])).toEqual({
      method: 'fromTo',
      from: { xPercent: 0, visibility: 'visible' },
      vars: { xPercent: -102, duration: 0.35, ease: 'expo.in', clearProps: 'transform,visibility' },
    })
    // The slide it cut short goes first.
    expect(slide.kill).toHaveBeenCalled()
  })

  it('slides from block Б’s edge, on the right', () => {
    const { show } = renderPanel('Б', null)
    show(floorOf('Б', 6))
    expect(recorder.tweens[0].from).toEqual({ xPercent: 102, visibility: 'visible' })
    recorder.reset()
    show(null)
    expect(recorder.tweens[0].vars).toMatchObject({ xPercent: 102, duration: 0.35, ease: 'expo.in' })
  })

  it('crossfades a new floor’s fills over 0.15 s while it stays open, with no slide', () => {
    const { show } = renderPanel('А', floorOf('А', 5))
    recorder.reset()

    show(floorOf('А', 6))
    expect(recorder.tweens.map(shape)).toEqual([
      { method: 'set', vars: { clearProps: 'strokeDasharray,strokeDashoffset' } },
      { method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' } },
    ])
  })
})

describe('the phone’s sheet', () => {
  const renderSheet = (floor) => {
    const props = { plan: PLANS['А'], anchor: null, onClose: vi.fn(), onStep: vi.fn(), onOpen: vi.fn(), onUnit: vi.fn() }
    const view = render(<FloorSheet {...props} floor={floor} />)
    return { ...view, show: (next) => view.rerender(<FloorSheet {...props} floor={next} />) }
  }

  it('rises from the screen’s foot over 0.5 s expo.out, drawing its plan, and drops away over 0.35 s expo.in', () => {
    const { show } = renderSheet(null)
    show(floorOf('А', 3))
    const sheet = screen.getByRole('region', { name: 'Избран етаж' })
    const [rise, outlines] = recorder.tweens
    expect(rise.targets).toBe(sheet)
    expect(shape(rise)).toEqual({
      method: 'fromTo',
      from: { yPercent: 105, visibility: 'visible' },
      vars: { yPercent: 0, duration: 0.5, ease: 'expo.out', clearProps: 'transform,visibility' },
    })
    expect([...outlines.targets]).toEqual([...sheet.querySelectorAll('.u-shape')])

    recorder.reset()
    show(floorOf('А', 4))
    expect(recorder.tweens.map(shape)[1]).toEqual({ method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' } })

    recorder.reset()
    show(null)
    expect(recorder.tweens).toHaveLength(1)
    expect(shape(recorder.tweens[0])).toEqual({
      method: 'fromTo',
      from: { yPercent: 0, visibility: 'visible' },
      vars: { yPercent: 105, duration: 0.35, ease: 'expo.in', clearProps: 'transform,visibility' },
    })
  })
})

describe('the lens', () => {
  const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })
  const box = (node) => Object.fromEntries(['x', 'y', 'width', 'height'].map((name) => [name, Number(node.getAttribute(name))]))

  it('lands on the first hot floor at once, its tint fading in over 0.2 s, then moves floor to floor over 0.25 s power2.out', () => {
    render(<Facade model={MODEL} mode="full" onOpenFloor={vi.fn()} />)
    const hole = document.querySelector('.fx__hole')
    const tint = document.querySelector('.fx__tint')
    const highlight = document.querySelector('.fx__hl')
    const lensTweens = () => recorder.tweens.filter(({ targets }) => targets === tint || (Array.isArray(targets) && targets.includes(hole)))

    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    expect(lensTweens().map(shape)).toEqual([
      { method: 'fromTo', from: { attr: { 'fill-opacity': 0 } }, vars: { attr: { 'fill-opacity': 0.2 }, duration: 0.2, ease: 'power2.out', overwrite: 'auto' } },
    ])
    const onFive = box(hole)
    expect(onFive.width).toBeGreaterThan(0)

    recorder.reset()
    fireEvent.pointerOver(rail('А', 6), { pointerType: 'mouse' })
    const [move] = lensTweens()
    expect(lensTweens()).toHaveLength(1)
    expect(move.targets).toEqual([hole, tint, highlight])
    expect(move.from).toEqual({ attr: onFive })
    const { onUpdate, onComplete, ...vars } = move.vars
    expect(vars).toEqual({ attr: box(hole), duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
    expect(box(hole)).not.toEqual(onFive)
    expect([typeof onUpdate, typeof onComplete]).toEqual(['function', 'function'])
  })

  // The engine's ticker outlives the page: a lens still moving when the
  // facade goes (a link followed within 0.25 s of a hover) must not throw
  // from its last frames.
  it('lets a lens still moving finish quietly once the facade has gone', () => {
    const { unmount } = render(<Facade model={MODEL} mode="full" onOpenFloor={vi.fn()} />)
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    fireEvent.pointerOver(rail('А', 6), { pointerType: 'mouse' })
    const move = recorder.tweens.find(({ targets }) => Array.isArray(targets) && targets.some((node) => node.classList.contains('fx__hole')))

    unmount()
    expect(() => move.vars.onUpdate()).not.toThrow()
    expect(() => move.vars.onComplete()).not.toThrow()
  })
})
