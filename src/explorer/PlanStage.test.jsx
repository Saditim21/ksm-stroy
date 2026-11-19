import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../test/gsap'
import { planBox } from './planGeometry'
import { buildModel } from './model'
import { loadPlans } from './plans'
import PlanStage from './PlanStage'
import { GR_PROJECT } from './projects/gr'
import { named, snapshotData } from './testing'

// The plan stage (spec §7.6; extract §4.23): a floor's full plan, its counts,
// the key to the patterns and the table of its units, over the page. Block А,
// floor 5 of the sheets snapshot unless a case says otherwise. No motion
// unless a case puts in a recording stand-in for the engine: the stage is
// there at once.

// The motion engine as useMotionNow() hands it over.
let motion = null
vi.mock('../motion/useMotionNow', () => ({ default: () => () => motion }))

const MODEL = buildModel(snapshotData(), GR_PROJECT)
// Golden Residence's plans, as the surfaces have them once they have loaded.
let PLANS
beforeAll(async () => {
  PLANS = await loadPlans(GR_PROJECT)
})
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const stage = (name = 'Блок А · Етаж 5') => screen.getByRole('dialog', { name: named(name) })
const rows = (dialog = stage()) => within(dialog.querySelector('tbody')).getAllByRole('row')

function renderStage(props = {}) {
  const handlers = { onClose: vi.fn(), onFloor: vi.fn(), onBlock: vi.fn(), onUnit: vi.fn() }
  const view = render(<PlanStage project={GR_PROJECT} plans={PLANS} model={MODEL} block="А" floor={5} fromRect={null} {...handlers} {...props} />)
  return { ...handlers, ...view }
}

afterEach(() => {
  motion = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the bar', () => {
  it('is a modal dialog named for its floor, with the floor’s apartments and its free ones', () => {
    renderStage()

    expect(stage()).toHaveAttribute('aria-modal', 'true')
    expect(stage().querySelector('.ps__title em')).toHaveTextContent(/^Етаж 5$/)
    expect(text(stage().querySelector('.ps__meta'))).toBe('12 апартамента · 4 свободни')
  })

  // Spec §9: the кота only where the drawings give it, А1 at +3,06.
  it('gives the кота on floor 1', () => {
    renderStage({ floor: 1 })
    expect(text(stage('Блок А · Етаж 1').querySelector('.ps__meta'))).toBe('кота +3,06 · 12 апартамента · 9 свободни')
  })

  it('steps a floor up and down, and stops at the bottom and the top', () => {
    const { onFloor, rerender } = renderStage()

    fireEvent.click(within(stage()).getByRole('button', { name: 'По-горен етаж' }))
    expect(onFloor).toHaveBeenLastCalledWith(6)
    fireEvent.click(within(stage()).getByRole('button', { name: 'По-долен етаж' }))
    expect(onFloor).toHaveBeenLastCalledWith(4)
    expect(text(stage().querySelector('.ps__step output'))).toBe('етаж 5')
    expect(stage().querySelector('.ps__step output')).toHaveAttribute('aria-live', 'polite')

    rerender(<PlanStage project={GR_PROJECT} plans={PLANS} model={MODEL} block="А" floor={1} fromRect={null} onClose={vi.fn()} onFloor={onFloor} onBlock={vi.fn()} onUnit={vi.fn()} />)
    expect(within(stage('Блок А · Етаж 1')).getByRole('button', { name: 'По-долен етаж' })).toBeDisabled()
    rerender(<PlanStage project={GR_PROJECT} plans={PLANS} model={MODEL} block="А" floor={8} fromRect={null} onClose={vi.fn()} onFloor={onFloor} onBlock={vi.fn()} onUnit={vi.fn()} />)
    expect(within(stage('Блок А · Етаж 8')).getByRole('button', { name: 'По-горен етаж' })).toBeDisabled()
  })

  it('switches to the other block, the pressed one doing nothing', () => {
    const { onBlock } = renderStage()
    const blocks = within(stage()).getByRole('group', { name: 'Блок' })

    expect(within(blocks).getByRole('button', { name: /^Блок\sА$/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(within(blocks).getByRole('button', { name: /^Блок\sА$/ }))
    expect(onBlock).not.toHaveBeenCalled()
    fireEvent.click(within(blocks).getByRole('button', { name: /^Блок\sБ$/ }))
    expect(onBlock).toHaveBeenCalledWith('Б')
  })

  it('closes on Escape and on „Към сградата“', () => {
    const { onClose } = renderStage()

    fireEvent.keyDown(stage(), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(within(stage()).getByRole('button', { name: 'Към сградата' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // Spec §7.6: PageUp and PageDown step floors, except inside the table.
  it('steps floors on PageUp and PageDown, but not inside the table', () => {
    const { onFloor } = renderStage()

    fireEvent.keyDown(stage(), { key: 'PageUp' })
    expect(onFloor).toHaveBeenLastCalledWith(6)
    fireEvent.keyDown(stage(), { key: 'PageDown' })
    expect(onFloor).toHaveBeenLastCalledWith(4)
    fireEvent.keyDown(rows()[3], { key: 'PageUp' })
    expect(onFloor).toHaveBeenCalledTimes(2)
  })
})

describe('the plan and the table', () => {
  it('lists the floor’s 12 units in suffix order, each row named from its unit', () => {
    renderStage()
    const list = rows()

    expect(list).toHaveLength(12)
    expect(list.map((row) => text(row.querySelector('.uid')))).toEqual(Array.from({ length: 12 }, (_, i) => `А 5${String(i + 1).padStart(2, '0')}`))
    expect(within(stage().querySelector('tbody')).getByRole('row', { name: named('А 501 2-стаен 62,18 м² Продаден') })).toBe(list[0])
    expect(list[0]).toHaveAttribute('tabindex', '0')
    expect(list[0]).toHaveClass('is-sold')
    expect(list[1]).not.toHaveClass('is-sold')
  })

  it('counts the floor and keys its patterns with the status legend', () => {
    renderStage()

    expect([...stage().querySelectorAll('.ps__counts .st')].map(text)).toEqual(['4 свободни', '2 резервирани', '6 продадени', '0 блокирани'])
    expect(text(within(stage()).getByRole('list', { name: 'Легенда' }))).toBe('Свободен Резервиран Продаден Блокиран')
    expect(text(stage().querySelector('.ps__hint'))).toBe('Посочете апартамент на плана или в списъка. ▲ ▼ сменят етажа, без да се връщате.')
  })

  // Ruling C8.4: the counts, the key and the table scroll together (on a
  // phone, explorer.css), the hint stays under them, outside the scroller,
  // always in view.
  it('keeps the hint out of what scrolls: the counts, the key and the table', () => {
    renderStage()
    const side = stage().querySelector('.ps__side')
    const scroller = side.querySelector('.ps__scroll')
    expect([...side.children].map((child) => child.className)).toEqual(['ps__scroll', 'ps__hint'])
    const [counts, legend, list] = scroller.children
    expect(scroller.children).toHaveLength(3)
    expect(counts).toHaveClass('ps__counts')
    expect(legend).toHaveClass('ps__legend')
    expect(list).toHaveClass('ps__list')
  })

  // Spec §7.4: the stage's plan is interactive, its units buttons named as
  // every unit list names them, and its drawing under them.
  it('draws the plan over its drawing, each unit a button that opens it', () => {
    const { onUnit } = renderStage()
    const plan = within(stage()).getByRole('group', { name: 'План на етажа, блок А' })

    expect(plan).toHaveClass('plan', 'plan--stage')
    expect(plan.querySelector('image.drawing')).toHaveAttribute('href', '/img/plan-a-1200.webp')
    const unit = within(plan).getByRole('button', { name: named('А 502, 3-стаен, 101,48 м², Свободен') })
    fireEvent.keyDown(unit, { key: 'Enter' })
    expect(onUnit).toHaveBeenLastCalledWith('А 502')
    fireEvent.click(within(plan).getByRole('button', { name: /^А 506,/ }))
    expect(onUnit).toHaveBeenLastCalledWith('А 506')
  })

  it('opens a unit from its row, on a click, Enter or Space', () => {
    const { onUnit } = renderStage()

    fireEvent.click(rows()[2])
    expect(onUnit).toHaveBeenLastCalledWith('А 503')
    fireEvent.keyDown(rows()[3], { key: 'Enter' })
    expect(onUnit).toHaveBeenLastCalledWith('А 504')
    fireEvent.keyDown(rows()[4], { key: ' ' })
    expect(onUnit).toHaveBeenLastCalledWith('А 505')
    expect(onUnit).toHaveBeenCalledTimes(3)
  })

  // Spec §7.6: hovering a row or a unit highlights both, and the inspector
  // shows the unit.
  it('marks a unit hot on the plan while its row is hovered, and the row while the unit is', () => {
    renderStage()
    const plan = stage().querySelector('svg.plan')

    fireEvent.pointerOver(rows()[2], { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-suffix="03"]')).toHaveAttribute('data-hot')
    expect(plan.querySelectorAll('g[data-hot]')).toHaveLength(1)
    expect(plan).toHaveAttribute('data-has-hot')
    expect(rows()[2]).toHaveClass('is-hot')
    const inspector = stage().querySelector('.ps__inspect')
    expect(inspector).toHaveAttribute('data-on')
    expect(text(inspector.querySelector('.serif'))).toBe('А 503')
    expect([...inspector.querySelectorAll('dt')].map(text)).toEqual(['Вид', 'Обща площ', 'Изложение', 'Статус'])
    expect([...inspector.querySelectorAll('dd')].map(text)).toEqual(['3-стаен', '107,24 м²', '—', 'Свободен'])

    fireEvent.pointerLeave(stage().querySelector('tbody'), { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-hot]')).toBeNull()
    expect(inspector).not.toHaveAttribute('data-on')

    fireEvent.pointerOver(plan.querySelector('g[data-suffix="07"] .u-hit'), { pointerType: 'mouse' })
    expect(plan.querySelector('g[data-suffix="07"]')).toHaveAttribute('data-hot')
    expect(rows()[6]).toHaveClass('is-hot')
  })
})

describe('as a dialog', () => {
  it('holds the page still while it is open, on umber', () => {
    const { unmount } = renderStage()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.backgroundColor).toBe('var(--umber)')
    unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })

  // Spec §7.6: focus moves to „Към сградата“ after 30 ms without motion.
  it('moves the focus to „Към сградата“, and keeps Tab inside', () => {
    vi.useFakeTimers()
    renderStage()
    act(() => vi.advanceTimersByTime(30))
    const close = within(stage()).getByRole('button', { name: 'Към сградата' })
    expect(document.activeElement).toBe(close)

    // From the last stop (the last row), Tab goes round to the first.
    act(() => rows()[11].focus())
    fireEvent.keyDown(rows()[11], { key: 'Tab' })
    expect(document.activeElement).toBe(within(stage()).getByRole('button', { name: /^Блок\sА$/ }))
    fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(rows()[11])
  })

  // Spec §7.7: under the unit panel the stage is inert and hidden, and its
  // keys wait.
  it('is inert and hidden under the unit panel, its keys off', () => {
    const { onClose, onFloor } = renderStage({ covered: true })
    const dialog = document.querySelector('.ps')

    expect(dialog).toHaveAttribute('inert')
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.keyDown(document.body, { key: 'PageUp' })
    expect(onClose).not.toHaveBeenCalled()
    expect(onFloor).not.toHaveBeenCalled()
  })

  // Before the data: the floor's plan and `—`, never a zero.
  it('reads „—“ until the data arrives', () => {
    renderStage({ model: null })

    expect(text(stage().querySelector('.ps__meta'))).toBe('12 апартамента · — свободни')
    expect([...stage().querySelectorAll('.ps__counts .st')].map(text)).toEqual(['— свободни', '— резервирани', '— продадени', '— блокирани'])
    expect(stage().querySelector('tbody').children).toHaveLength(0)
    expect(stage().querySelectorAll('svg.plan g[data-suffix]')).toHaveLength(12)
  })
})

// Spec §5.7 → extract §4.23: with motion, the mini plan grows into the
// stage's (the morph). Its clone, the ghost, lands where the stage's units
// are, and its sizes are set for that place, as the concept sets its clone's
// line for the target (explorer.js:664): the stage's 1 px outline as it
// lands, thinner while it is small, never thickened by its growth. Nothing
// measures it again while it grows: a ResizeObserver would read its scaled
// box, the size it starts at.
describe('the morph', () => {
  // The stage's plan fills 1000 × 700 px at (24, 120); the mini plan it grows
  // from was 300 × 200 px at (1100, 400).
  const STAGE = { left: 24, top: 120, width: 1000, height: 700 }
  const FROM = { left: 1100, top: 400, width: 300, height: 200 }
  const rect = ({ left, top, width, height }) => ({ left, top, width, height, x: left, y: top, right: left + width, bottom: top + height })

  it('sets the ghost’s lines for where it lands, and leaves them so as it grows', () => {
    const observers = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) {
        this.callback = callback
        this.targets = []
        observers.push(this)
      }

      observe(target) {
        this.targets.push(target)
      }

      unobserve() {}

      disconnect() {}
    })
    const timeline = { fromTo: () => timeline, to: () => timeline, set: () => timeline, kill() {} }
    motion = {
      gsap: {
        set: vi.fn(),
        timeline: () => timeline,
        fromTo: () => ({ kill() {} }),
        // The close's afterimage fades at once, and goes.
        to: (target, vars) => {
          vars.onComplete?.()
          return { kill() {} }
        },
      },
    }
    // Inside the ghost, its own scaled box: the mini plan's size and place.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
      return rect(this.closest('.ps__ghost') ? FROM : STAGE)
    })

    renderStage({ fromRect: rect(FROM) })
    const ghost = document.querySelector('.ps__ghost svg')
    const full = planBox(PLANS['А'], 14)
    const scale = Math.min(STAGE.width / full.w, STAGE.height / full.h)
    const sizes = () => ['--fs', '--hs', '--lw', '--dash'].map((name) => ghost.style.getPropertyValue(name))
    const landing = [`${10 / scale}px`, `${3 / scale}px`, `${1 / scale}px`, `${4 / scale} ${3 / scale}`]

    expect(ghost).toHaveClass('plan--mini')
    expect(sizes()).toEqual(landing)
    // It grows from the mini plan's place, scaled down to the mini plan's
    // width there.
    const mini = planBox(PLANS['А'], 4)
    const startWidth = mini.w * Math.min(FROM.width / mini.w, FROM.height / mini.h)
    expect(motion.gsap.set).toHaveBeenCalledWith(ghost.parentElement, expect.objectContaining({ scale: startWidth / (mini.w * scale) }))

    for (const observer of observers) observer.callback(observer.targets.map((target) => ({ target })))
    expect(sizes()).toEqual(landing)
    expect(observers.flatMap((observer) => observer.targets)).not.toContain(ghost)
  })
})

// The way in and the way out with motion (extract §4.23; ruling C9.13), with
// a recording stand-in for the engine (src/test/gsap.js): the morph's
// timeline, the 0.35 s fade where no mini plan grows, a new block's or a new
// floor's change, the focus once the stage is in, and the afterimage of its
// close.
describe('the motion', () => {
  const STAGE = { left: 24, top: 120, width: 1000, height: 700 }
  const FROM = { left: 1100, top: 400, width: 300, height: 200 }
  const rect = ({ left, top, width, height }) => ({ left, top, width, height, x: left, y: top, right: left + width, bottom: top + height })
  const recorder = recordingMotion()
  const shape = ({ method, from, vars, position }) => (from ? { method, from, vars, position } : { method, vars, position })
  beforeEach(() => {
    recorder.reset()
    motion = recorder.motion
  })

  it('morphs: the ground comes up over 0.45 s while the mini plan travels 0.8 s expo.inOut, then the stage comes in over it from 0.55 s', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
      return rect(this.closest('.ps__ghost') ? FROM : STAGE)
    })
    renderStage({ fromRect: rect(FROM) })
    const root = stage()
    const svg = root.querySelector('.ps__plan svg')
    const ghost = document.querySelector('.ps__ghost')
    const drawing = svg.querySelector('.drawing')
    const rest = [root.querySelector('.ps__bar'), root.querySelector('.ps__side')]
    expect(drawing).not.toBeNull()

    // Before the first paint the stage's plan, bar, side and drawing wait unseen.
    const sets = recorder.tweens.filter(({ method }) => method === 'set')
    expect(sets.find(({ targets }) => targets === svg).vars).toEqual({ opacity: 0, pointerEvents: 'none' })
    expect(sets.find(({ targets }) => Array.isArray(targets)).targets).toEqual(rest)
    expect(sets.find(({ targets }) => Array.isArray(targets)).vars).toEqual({ opacity: 0 })
    expect(sets.find(({ targets }) => targets === drawing).vars).toEqual({ opacity: 0 })

    expect(recorder.timelines).toHaveLength(1)
    const [morph] = recorder.timelines
    expect(morph.steps.map(({ targets }) => targets)).toEqual([root, ghost, svg, ghost, rest, svg, drawing])
    expect(morph.steps.map(shape)).toEqual([
      { method: 'fromTo', from: { backgroundColor: 'rgba(26, 23, 20, 0)' }, vars: { backgroundColor: 'rgba(26, 23, 20, 1)', duration: 0.45, ease: 'power2.out' }, position: 0 },
      { method: 'to', vars: { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'expo.inOut' }, position: 0 },
      { method: 'to', vars: { opacity: 1, duration: 0.25, ease: 'power1.inOut' }, position: 0.55 },
      { method: 'to', vars: { opacity: 0, duration: 0.25, ease: 'power1.inOut' }, position: 0.55 },
      { method: 'to', vars: { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, position: 0.55 },
      { method: 'set', vars: { pointerEvents: 'auto' }, position: 0.8 },
      { method: 'to', vars: { opacity: 0.6, duration: 0.4, ease: 'power2.out' }, position: 0.6 },
    ])
    expect(recorder.tweens.some(({ method, vars }) => method === 'fromTo' && vars.duration === 0.35)).toBe(false)

    // Once it has landed, it takes off what it set, and the ghost goes.
    recorder.tweens.length = 0
    act(() => morph.vars.onComplete())
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toEqual([root, svg, ...rest, drawing])
    expect(recorder.tweens[0].vars).toEqual({ clearProps: 'opacity,backgroundColor,pointerEvents' })
    expect(document.querySelector('.ps__ghost')).toBeNull()
  })

  it('fades in over 0.35 s power2.out where no mini plan grows into it, as a deep link or a rail opens it', () => {
    renderStage()
    expect(recorder.timelines).toHaveLength(0)
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toBe(stage())
    expect(shape(recorder.tweens[0])).toEqual({ method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' }, position: undefined })
    expect(document.querySelector('.ps__ghost')).toBeNull()
  })

  it('fades a new block’s plan in over 0.35 s, and crossfades a new floor’s fills', () => {
    const { rerender, onClose, onFloor, onBlock, onUnit } = renderStage()
    const props = { project: GR_PROJECT, plans: PLANS, model: MODEL, fromRect: null, onClose, onFloor, onBlock, onUnit }
    recorder.reset()

    rerender(<PlanStage {...props} block="Б" floor={5} />)
    const svg = stage('Блок Б · Етаж 5').querySelector('.ps__plan svg')
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toBe(svg)
    expect(shape(recorder.tweens[0])).toEqual({ method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'opacity' }, position: undefined })

    recorder.reset()
    rerender(<PlanStage {...props} block="Б" floor={6} />)
    expect(recorder.tweens.map(shape)).toEqual([
      { method: 'set', vars: { clearProps: 'strokeDasharray,strokeDashoffset' }, position: undefined },
      { method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.15, ease: 'none', clearProps: 'opacity' }, position: undefined },
    ])
  })

  it('moves the focus to „Към сградата“ once it is in, at 700 ms', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    renderStage()
    const close = within(stage()).getByRole('button', { name: 'Към сградата' })
    act(() => vi.advanceTimersByTime(699))
    expect(close).not.toHaveFocus()
    act(() => vi.advanceTimersByTime(1))
    expect(close).toHaveFocus()
  })

  it('leaves its last frame to fade over 0.3 s power2.in as it closes', () => {
    const { unmount } = renderStage()
    recorder.reset()
    unmount()
    expect(recorder.tweens).toHaveLength(1)
    const [afterimage] = recorder.tweens
    expect(afterimage.targets).toHaveClass('ps')
    expect(afterimage.targets).toHaveAttribute('aria-hidden', 'true')
    expect(afterimage.vars).toEqual({ opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: expect.any(Function) })
    afterimage.vars.onComplete()
    expect(document.querySelector('.ps')).toBeNull()
  })
})

// Polish spec §5: the plan stage keeps the dark values in the light theme,
// its drawings and labels made for its dark ground.
it('stays dark in both themes', () => {
  renderStage()
  expect(document.querySelector('.ps')).toHaveClass('dark')
})
