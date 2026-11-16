import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../test/gsap'
import { buildModel } from './model'
import { snapshotData } from './testing'
import UnitPanel from './UnitPanel'

// The unit panel (spec §7.7; extract §4.24): one apartment over the stage,
// its plan cropped on it, its figures, and what it offers by its status. Block
// А, floor 3 here holds one unit of each status, as a sheet may write them
// (the sheets snapshot for block Б).

// The motion engine as useMotionNow() hands it over: none, unless a case
// puts in a recording stand-in.
let motion = null
vi.mock('../motion/useMotionNow', () => ({ default: () => () => motion }))

const row = (unit, status, extra = {}) => ({
  unit,
  floor: '3',
  type: '2-стаен',
  area: { built: '54.36', ideal: '7.82', total: '62.18' },
  exposure: 'Юг',
  status,
  price: '',
  ...extra,
})

function model() {
  const data = snapshotData()
  data['golden-residence']['block-a'] = [
    row('А 301', 'Продадени'),
    row('А 302', 'Свободен', { exposure: '', type: '3-стаен', area: { built: '88.75', ideal: '12.73', total: '101.48' } }),
    row('А 303', 'Резервиран'),
    row('А 304', 'Скоро'),
    row('А 305', 'Блокиран', { price: '95 000 €' }),
  ]
  return buildModel(data)
}

const MODEL = model()
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const panel = (name) => screen.getByRole('dialog', { name })
const inquiry = (dialog) => within(dialog).queryAllByRole('button', { name: /запитване/i })
const fact = (dialog, term) => [...dialog.querySelectorAll('.up__dl > div')].find((pair) => text(pair.querySelector('dt')) === term)

function renderPanel(unitId, props = {}) {
  const handlers = { onClose: vi.fn(), onStep: vi.fn(), onInquire: vi.fn() }
  const view = render(<UnitPanel model={MODEL} unitId={unitId} {...handlers} {...props} />)
  return { ...handlers, ...view }
}

afterEach(() => {
  motion = null
  vi.useRealTimers()
})

describe('what a unit offers (spec §7.7)', () => {
  it('says a sold unit is sold, and offers no inquiry', () => {
    renderPanel('А 301')
    const dialog = panel('А 301')

    expect(within(dialog).getByText('Този апартамент е продаден. Свободните на етажа са оцветени в зелено.')).toBeInTheDocument()
    // Spec §3.3: each one-letter word bound to the word after it.
    expect(dialog.textContent).toContain('апартамент е\u00a0продаден')
    expect(dialog.textContent).toContain('оцветени в\u00a0зелено')
    expect(inquiry(dialog)).toHaveLength(0)
    expect(within(dialog).queryByRole('button', { name: 'Попитайте за апартамента' })).toBeNull()
  })

  it('says a blocked unit is not offered, and offers nothing', () => {
    renderPanel('А 305')
    const dialog = panel('А 305')

    expect(within(dialog).getByText('Този апартамент не се предлага в момента.')).toBeInTheDocument()
    expect(dialog.textContent).toContain('предлага в\u00a0момента')
    expect(inquiry(dialog)).toHaveLength(0)
    expect(within(dialog).queryByRole('button', { name: 'Попитайте за апартамента' })).toBeNull()
    expect(dialog.querySelector('.up__actions')).toBeNull()
  })

  it('offers a free unit „Изпратете запитване“, which hands the unit on', () => {
    const { onInquire } = renderPanel('А 302')
    const dialog = panel('А 302')

    const action = within(dialog).getByRole('button', { name: 'Изпратете запитване' })
    expect(action).toHaveClass('btn--solid')
    fireEvent.click(action)
    expect(onInquire).toHaveBeenCalledTimes(1)
    expect(onInquire.mock.calls[0][0]).toMatchObject({ label: 'А 302', status: 'available' })
  })

  // Ruling R1: a status the rules do not know reads as the sheet wrote it.
  it('asks about a reserved unit and about one of a status the rules do not know', () => {
    const { onInquire, unmount } = renderPanel('А 303')
    fireEvent.click(within(panel('А 303')).getByRole('button', { name: 'Попитайте за апартамента' }))
    expect(onInquire.mock.calls[0][0]).toMatchObject({ label: 'А 303' })
    unmount()

    renderPanel('А 304')
    const dialog = panel('А 304')
    expect(within(dialog).getByRole('button', { name: 'Попитайте за апартамента' })).toBeInTheDocument()
    expect(text(dialog.querySelector('.up__sub .st'))).toBe('Скоро')
    expect(text(fact(dialog, 'Статус').querySelector('dd'))).toBe('Скоро')
  })
})

describe('the unit (spec §7.7)', () => {
  it('names the panel for the unit, with its block, floor and type, and its status', () => {
    renderPanel('А 302')
    const dialog = panel('А 302')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.querySelector('.up__id em')).toHaveTextContent(/^302$/)
    expect(text(dialog.querySelector('.up__sub'))).toBe('Блок А · етаж 3 · 3-стаен Свободен')
  })

  it('gives the areas in м², and „няма данни в таблицата“ for an empty exposure', () => {
    renderPanel('А 301')
    const dialog = panel('А 301')

    expect(text(fact(dialog, 'Застроена площ').querySelector('dd'))).toBe('54,36 м²')
    expect(fact(dialog, 'Застроена площ').querySelector('dd small')).toHaveTextContent('м²')
    expect(text(fact(dialog, 'Идеални части').querySelector('dd'))).toBe('7,82 м²')
    expect(text(fact(dialog, 'Обща площ').querySelector('dd'))).toBe('62,18 м²')
    expect(text(fact(dialog, 'Вид').querySelector('dd'))).toBe('2-стаен')
    expect(text(fact(dialog, 'Изложение').querySelector('dd'))).toBe('Юг')
    expect(fact(dialog, 'Цена')).toBeUndefined()

    renderPanel('А 302')
    expect(text(fact(panel('А 302'), 'Изложение').querySelector('dd'))).toBe('няма данни в таблицата')
    expect(fact(panel('А 302'), 'Изложение').querySelector('dd').textContent).toBe('няма данни в\u00a0таблицата')
  })

  it('gives the price where the sheet has one', () => {
    renderPanel('А 305')
    expect(text(fact(panel('А 305'), 'Цена').querySelector('dd'))).toBe('95 000 €')
  })

  // Spec §7.7: the left half, the floor's plan cropped on the unit.
  it('crops the floor’s plan on the unit, outlined, and says so', () => {
    renderPanel('А 302')
    const dialog = panel('А 302')
    const plan = dialog.querySelector('svg.plan')

    expect(plan).toHaveClass('plan--crop')
    expect(plan).toHaveAttribute('aria-hidden', 'true')
    expect(plan).toHaveAttribute('data-has-focus')
    expect(plan.querySelector('g[data-suffix="02"]')).toHaveAttribute('data-focus')
    expect(plan.querySelectorAll('g[data-focus]')).toHaveLength(1)
    expect(plan.querySelector('image.drawing')).toHaveAttribute('href', '/img/plan-a-1200.webp')
    expect(text(dialog.querySelector('.up__cap'))).toBe('План на етаж 3, блок А. А 302 е очертан.')
    expect(dialog.querySelector('.up__cap').textContent).toContain('А 302 е\u00a0очертан')
  })

  it('steps to the previous and the next unit on the floor, round from either end', () => {
    const { onStep, unmount } = renderPanel('А 301')
    const nav = within(panel('А 301')).getByRole('navigation', { name: 'Апартаменти на етажа' })
    const [previous, next] = within(nav).getAllByRole('button')

    expect(text(previous)).toBe('А 305')
    expect(text(next)).toBe('А 302')
    fireEvent.click(previous)
    expect(onStep).toHaveBeenLastCalledWith(-1)
    fireEvent.click(next)
    expect(onStep).toHaveBeenLastCalledWith(1)
    unmount()

    renderPanel('А 305')
    const [, last] = within(within(panel('А 305')).getByRole('navigation')).getAllByRole('button')
    expect(text(last)).toBe('А 301')
  })
})

describe('as a dialog', () => {
  it('closes on Escape, which goes no further', () => {
    const outside = vi.fn()
    document.addEventListener('keydown', outside)
    const parent = vi.fn()
    const handlers = { onClose: vi.fn(), onStep: vi.fn(), onInquire: vi.fn() }
    render(
      <div onKeyDown={parent}>
        <UnitPanel model={MODEL} unitId="А 302" {...handlers} />
      </div>,
    )

    fireEvent.keyDown(within(panel('А 302')).getByRole('button', { name: 'Затворете' }), { key: 'Escape' })
    expect(handlers.onClose).toHaveBeenCalledTimes(1)
    expect(outside).not.toHaveBeenCalled()
    expect(parent).not.toHaveBeenCalled()
    document.removeEventListener('keydown', outside)
  })

  it('closes on its × and on its backdrop, but not on a click inside', () => {
    const { onClose } = renderPanel('А 302')
    const dialog = panel('А 302')

    fireEvent.click(dialog.querySelector('.up__r'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Затворете' }))
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // The action takes the focus (20 ms without motion), else the close.
  it('moves the focus to its action, or to the close where it offers none', () => {
    vi.useFakeTimers()
    const { unmount } = renderPanel('А 302')
    act(() => vi.advanceTimersByTime(20))
    expect(document.activeElement).toBe(within(panel('А 302')).getByRole('button', { name: 'Изпратете запитване' }))
    unmount()

    renderPanel('А 301')
    act(() => vi.advanceTimersByTime(20))
    expect(document.activeElement).toBe(within(panel('А 301')).getByRole('button', { name: 'Затворете' }))
  })

  it('holds the page still while it is open, on umber', () => {
    const { unmount } = renderPanel('А 302')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.backgroundColor).toBe('rgb(26, 23, 20)')
    unmount()
    expect(document.documentElement.style.overflow).toBe('')
  })
})

// With motion, a step fades the details out first, then asks for the unit
// (extract §4.24). A panel closed during that fade asks for nothing, and a
// clone of its last frame fades out where it was (0.25 s).
it('drops a step still fading out when it closes, and leaves its last frame to fade', () => {
  const tweens = []
  const timeline = { fromTo: () => timeline, kill() {} }
  motion = {
    gsap: {
      timeline: () => timeline,
      fromTo: () => ({ kill() {} }),
      to: (target, vars) => {
        const tween = { target, vars, kill: vi.fn() }
        tweens.push(tween)
        return tween
      },
    },
  }
  const { onStep, unmount } = renderPanel('А 301')
  const details = panel('А 301').querySelector('.up__r')

  const nav = within(panel('А 301')).getByRole('navigation', { name: 'Апартаменти на етажа' })
  fireEvent.click(within(nav).getAllByRole('button')[1])
  const [fade] = tweens
  expect(fade.target).toBe(details)
  expect(fade.vars).toMatchObject({ opacity: 0, duration: 0.12 })
  expect(onStep).not.toHaveBeenCalled()

  unmount()
  expect(fade.kill).toHaveBeenCalled()
  expect(onStep).not.toHaveBeenCalled()
  const [, afterimage] = tweens
  expect(afterimage.target).toHaveClass('up')
  expect(afterimage.target).toHaveAttribute('aria-hidden', 'true')
  expect(afterimage.target).not.toHaveAttribute('role')
  expect(afterimage.vars).toMatchObject({ opacity: 0, duration: 0.25, ease: 'power2.in' })
  afterimage.vars.onComplete()
  expect(document.querySelector('.up')).toBeNull()
})

// The way in with motion (extract §4.24; ruling C9.13), before the first
// paint: the panel fades in over 0.3 s while its halves open outward from the
// seam, 0.7 s expo.inOut from 0.05 s, and the seam draws over 0.6 s; once in,
// it takes off what it set. A step's arrival fades the next unit's details
// in over 0.25 s.
it('opens with the halves parting from the seam over 0.7 s, the panel fading in over 0.3 s, the seam drawing over 0.6 s', () => {
  const recorder = recordingMotion()
  motion = recorder.motion
  try {
    const { rerender, onClose, onStep, onInquire } = renderPanel('А 301')
    const dialog = panel('А 301')
    const left = dialog.querySelector('.up__l')
    const right = dialog.querySelector('.up__r')
    const seam = dialog.querySelector('.up__box > .seam')
    expect(seam).not.toBeNull()

    expect(recorder.timelines).toHaveLength(1)
    const [opening] = recorder.timelines
    expect(opening.steps.map(({ targets }) => targets)).toEqual([dialog, left, right, seam])
    expect(opening.steps.map(({ method, from, vars, position }) => ({ method, from, vars, position }))).toEqual([
      { method: 'fromTo', from: { opacity: 0 }, vars: { opacity: 1, duration: 0.3, ease: 'power2.out' }, position: 0 },
      { method: 'fromTo', from: { clipPath: 'inset(0% 0% 0% 100%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' }, position: 0.05 },
      { method: 'fromTo', from: { clipPath: 'inset(0% 100% 0% 0%)' }, vars: { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.inOut' }, position: 0.05 },
      { method: 'fromTo', from: { scaleY: 0 }, vars: { scaleY: 1, duration: 0.6, ease: 'expo.out' }, position: 0 },
    ])
    act(() => opening.vars.onComplete())
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toEqual([dialog, left, right, seam])
    expect(recorder.tweens[0].vars).toEqual({ clearProps: 'opacity,clipPath,transform' })

    recorder.reset()
    rerender(<UnitPanel model={MODEL} unitId="А 302" onClose={onClose} onStep={onStep} onInquire={onInquire} />)
    expect(recorder.timelines).toHaveLength(0)
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0].targets).toBe(panel('А 302').querySelector('.up__r'))
    expect(recorder.tweens[0].from).toEqual({ opacity: 0 })
    expect(recorder.tweens[0].vars).toEqual({ opacity: 1, duration: 0.25, clearProps: 'opacity' })
  } finally {
    motion = null
  }
})
