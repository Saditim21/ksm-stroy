import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import { mouseClick, tap } from '../test/pointer'
import Facade from './Facade'
import { loadSurfaces } from './loadSurfaces'
import { buildModel } from './model'
import { GR_PROJECT } from './projects/gr'
import { snapshotData } from './testing'
import useHotFloor from './useHotFloor'

// The facade (spec §7.2, §7.3; extract §4.20, §4.21): the free count of each
// floor on its block's outer edge, the edge panel with the floor's plan, and
// the first tap that only previews. A desktop with a mouse: matchMedia answers
// a fine pointer, and no phone width. The panels' chunk (surfaces.js) is in
// before the first render, as on a facade the page has scrolled near.

const MODEL = buildModel(snapshotData(), GR_PROJECT)
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })
const panel = (side) => document.querySelector(`.fxp--${side}`)
const floorPath = (key) => document.querySelector(`.fx__floor[data-k="${key}"]`)

beforeAll(() => loadSurfaces(GR_PROJECT))

let restore
beforeEach(() => {
  restore = mockMatchMedia({ fine: true })
})
afterEach(() => {
  restore()
  vi.unstubAllGlobals()
})

function renderFacade(props = {}) {
  const onOpenFloor = vi.fn()
  render(<Facade project={GR_PROJECT} model={MODEL} mode="full" onOpenFloor={onOpenFloor} {...props} />)
  return onOpenFloor
}

// The block names over the facade. Golden Residence's markup has them side
// by side, as it always had (M3 §6.4: its output unchanged); a project that
// asks (namesApart, Многофамилна's) has them apart in the page's text too.
it('keeps Golden Residence’s block names side by side, and a project’s apart where it asks', () => {
  const { unmount } = render(<Facade project={GR_PROJECT} model={MODEL} mode="full" />)
  const names = () => [document.querySelector('.fx__bname--a'), document.querySelector('.fx__bname--b')]
  let [a, b] = names()
  expect(a.nextSibling).toBe(b)
  expect(a.parentNode.textContent).toContain('Блок\u00A0АБлок\u00A0Б')
  unmount()

  render(<Facade project={{ ...GR_PROJECT, facade: { ...GR_PROJECT.facade, namesApart: true } }} model={MODEL} mode="full" />)
  ;[a, b] = names()
  expect(a.nextSibling.nodeType).toBe(Node.TEXT_NODE)
  expect(a.nextSibling.nextSibling).toBe(b)
  expect(a.parentNode.textContent).toContain('Блок\u00A0А Блок\u00A0Б')
})

describe('the rails (spec §7.2)', () => {
  it('are 16 buttons, eight a block, each named for its floor’s counts, each holding its floor as text of its own', () => {
    renderFacade()
    const rails = screen.getAllByRole('button', { name: /^Блок [АБ], етаж \d/ })

    expect(rails).toHaveLength(16)
    expect(rail('А', 5)).toHaveAccessibleName('Блок А, етаж 5: 4 свободни, 2 резервирани, 6 продадени, 0 блокирани. Enter отваря плана.')
    expect(rail('Б', 6)).toHaveAccessibleName('Блок Б, етаж 6: 0 свободни, 0 резервирани, 12 продадени, 0 блокирани. Enter отваря плана.')
    for (const block of ['А', 'Б']) {
      for (const floor of [1, 2, 3, 4, 5, 6, 7, 8]) expect(within(rail(block, floor)).getByText(`етаж ${floor}`)).toBeInTheDocument()
    }
  })

  it('show each floor’s free count, a zero dimmed, and the floor’s status glyph', () => {
    renderFacade()

    expect(rail('А', 5).querySelector('.n')).toHaveTextContent(/^4$/)
    expect(rail('Б', 6).querySelector('.n')).toHaveTextContent(/^0$/)
    expect(rail('Б', 6)).toHaveClass('is-zero')
    expect(rail('А', 5)).not.toHaveClass('is-zero')
    expect(rail('А', 5)).toHaveAttribute('data-colour', 'available')
    expect(rail('Б', 6)).toHaveAttribute('data-colour', 'sold')
    expect(rail('А', 5).querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  // Spec §9: before the data, `—` and a name with no counts, never a zero.
  it('read „—“ before the data, and name the floor without counts', () => {
    renderFacade({ model: null })

    expect(rail('А', 5).querySelector('.n')).toHaveTextContent(/^—$/)
    expect(rail('А', 5)).toHaveAccessibleName('Блок А, етаж 5. Enter отваря плана.')
    expect(rail('А', 5)).not.toHaveClass('is-zero')
  })
})

describe('the edge panel (spec §7.3)', () => {
  it('slides in for a floor the mouse points at, with its counts and the range of the free areas', () => {
    renderFacade()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })

    const a = panel('a')
    expect(a).toHaveAttribute('data-open')
    expect(panel('b')).not.toHaveAttribute('data-open')
    expect(text(a.querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(a.querySelector('.fxp__title em')).toHaveTextContent('Етаж 5')
    expect(text(a.querySelector('.fxp__meta'))).toBe('12 апартамента')
    expect(within(a).getByText((_, element) => element?.matches('.st') && text(element) === '4 свободни')).toBeInTheDocument()
    expect(text(a.querySelector('.fxp__range'))).toBe('свободни от 63,51 до 108,56 м²')
    expect(a.querySelectorAll('.fxp__plan g[data-suffix]')).toHaveLength(12)
    expect(within(a).getByRole('button', { name: 'Отворете плана' })).toBeInTheDocument()
    expect(document.querySelector('.fx')).toHaveClass('is-hot')
    expect(rail('А', 5)).toHaveClass('is-hot')
  })

  it('says a sold-out floor is sold out', () => {
    renderFacade()
    fireEvent.pointerOver(rail('Б', 6), { pointerType: 'mouse' })

    expect(panel('b')).toHaveAttribute('data-open')
    expect(panel('a')).not.toHaveAttribute('data-open')
    expect(panel('b').querySelector('.fxp__soldout')).toHaveTextContent('Разпродаден етаж')
  })

  // Spec §9, §14.6: the кота only where the drawings give it, А1 at +3,06.
  it('gives the кота only where the drawings do', () => {
    renderFacade()
    fireEvent.pointerOver(floorPath('А-1'), { pointerType: 'mouse' })
    expect(text(panel('a').querySelector('.fxp__meta'))).toBe('кота +3,06 · 12 апартамента')

    fireEvent.pointerOver(floorPath('А-2'), { pointerType: 'mouse' })
    expect(text(panel('a').querySelector('.fxp__meta'))).toBe('12 апартамента')
  })

  it('opens the floor from „Отворете плана“, and the floor with a unit from the plan', () => {
    const onOpenFloor = renderFacade()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })

    fireEvent.click(within(panel('a')).getByRole('button', { name: 'Отворете плана' }))
    expect(onOpenFloor.mock.calls[0].slice(0, 3)).toEqual(['А', 5, undefined])
    expect(onOpenFloor.mock.calls[0][3]).toMatchObject({ opener: expect.any(HTMLElement) })

    fireEvent.click(panel('a').querySelector('g[data-suffix="02"] .u-hit'))
    expect(onOpenFloor.mock.calls[1].slice(0, 3)).toEqual(['А', 5, 'А 502'])
  })

  // Ruling C7.2: the stage gives the focus back to what opened it. The panel's
  // plan is hidden from assistive technology, so a floor opened from it hands
  // on the floor's rail, with the plan's place for the stage to grow from.
  it('hands on the floor’s rail, and the plan’s place, for a floor opened from the plan', () => {
    const onOpenFloor = renderFacade()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    fireEvent.click(panel('a').querySelector('g[data-suffix="02"] .u-hit'))

    const [, , , meta] = onOpenFloor.mock.calls[0]
    expect(meta.opener).toBe(rail('А', 5))
    expect(meta.fromRect).toEqual(panel('a').querySelector('.fxp__plan svg').getBoundingClientRect())
  })

  // Spec §7.2: leaving the facade and its panel clears the hot floor after
  // 320 ms; entering the panel cancels that.
  it('closes 320 ms after the mouse leaves, unless it enters the panel', () => {
    vi.useFakeTimers()
    try {
      renderFacade()
      const stage = document.querySelector('.fx__stage')
      fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
      fireEvent.pointerLeave(stage, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(300))
      fireEvent.pointerEnter(panel('a'), { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(400))
      expect(panel('a')).toHaveAttribute('data-open')

      fireEvent.pointerLeave(panel('a'), { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(319))
      expect(panel('a')).toHaveAttribute('data-open')
      act(() => vi.advanceTimersByTime(1))
      expect(panel('a')).not.toHaveAttribute('data-open')
      expect(document.querySelector('.fx')).not.toHaveClass('is-hot')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('the keys on a rail (spec §7.2)', () => {
  it('show the focused floor, move up and across, clear on Escape and open on Enter', () => {
    const onOpenFloor = renderFacade()

    act(() => rail('А', 5).focus())
    expect(panel('a')).toHaveAttribute('data-open')
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(document.querySelector('.fx')).toHaveClass('is-kbd')

    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(rail('А', 6))
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 6')

    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(rail('Б', 6))
    expect(panel('b')).toHaveAttribute('data-open')
    expect(panel('a')).not.toHaveAttribute('data-open')

    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(panel('b')).not.toHaveAttribute('data-open')
    expect(document.activeElement).toBe(rail('Б', 6))

    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['Б', 6])
  })

  // Some browsers still send Space's click on its keyup.
  it('open once on Space, even with the click a browser sends after it', () => {
    const onOpenFloor = renderFacade()
    act(() => rail('А', 3).focus())
    fireEvent.keyDown(document.activeElement, { key: ' ' })
    fireEvent.click(document.activeElement)
    fireEvent.keyUp(document.activeElement, { key: ' ' })
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 3])
  })

  // Ruling C7.1: the floor opens in place, and the stage takes the focus
  // before Space's keyup comes, which then never reaches the facade. The next
  // mouse click on a floor is a click of its own.
  it('take a mouse click after Space opened a floor whose stage took the focus before the keyup', () => {
    const onOpenFloor = renderFacade()
    const elsewhere = document.body.appendChild(document.createElement('button'))
    try {
      act(() => rail('А', 3).focus())
      fireEvent.keyDown(document.activeElement, { key: ' ' })
      act(() => elsewhere.focus())
      fireEvent.keyUp(elsewhere, { key: ' ' })

      mouseClick(floorPath('Б-2'))
      expect(onOpenFloor).toHaveBeenCalledTimes(2)
      expect(onOpenFloor.mock.calls[1].slice(0, 2)).toEqual(['Б', 2])
    } finally {
      elsewhere.remove()
    }
  })

  // Enter's own click never comes (its keydown is prevented): a click after
  // it is another click.
  it('take a click on the rail Enter opened', () => {
    const onOpenFloor = renderFacade()
    act(() => rail('А', 3).focus())
    fireEvent.keyDown(document.activeElement, { key: 'Enter' })
    mouseClick(rail('А', 3))
    expect(onOpenFloor).toHaveBeenCalledTimes(2)
  })

  it('stop at the top and the bottom floor', () => {
    renderFacade()
    act(() => rail('А', 8).focus())
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(rail('А', 8))
    act(() => rail('Б', 1).focus())
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(rail('Б', 1))
  })

  // A mouse press on a rail let go outside the stage sends the stage neither
  // a pointerup nor a click (the Task 6 review's drag-off case).
  it('still move the hot floor after a mouse press let go outside the stage', () => {
    vi.useFakeTimers()
    try {
      renderFacade()
      fireEvent.pointerOver(rail('Б', 6), { pointerType: 'mouse' })
      fireEvent.pointerDown(rail('Б', 6), { pointerType: 'mouse' })
      act(() => rail('Б', 6).focus())
      fireEvent.pointerLeave(document.querySelector('.fx__stage'), { pointerType: 'mouse' })
      fireEvent.pointerUp(document.body, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(600))
      expect(panel('b')).not.toHaveAttribute('data-open')

      fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(rail('Б', 5))
      expect(panel('b')).toHaveAttribute('data-open')
      expect(text(panel('b').querySelector('.fxp__title'))).toBe('Блок Б · Етаж 5')
      expect(document.querySelector('.fx')).toHaveClass('is-kbd')
    } finally {
      vi.useRealTimers()
    }
  })

  // Tab may come from anywhere on the page, whatever pressed the facade before.
  it('make the rail that Tab reaches from outside the facade hot, as the keyboard’s, after a tap on the facade', () => {
    renderFacade()
    tap(floorPath('Б-2'))
    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => rail('А', 8).focus())

    expect(panel('a')).toHaveAttribute('data-open')
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 8')
    expect(document.querySelector('.fx')).toHaveClass('is-kbd')
  })
})

// Review Focus 3: a touch screen at desktop width. The first tap previews,
// the second opens, and a touch never counts as hovering. The presses come in
// Chrome's order (src/test/pointer.js): a finger's tap focuses a rail after
// its pointerup, and that focus is not the keyboard's.
describe('touch at desktop width', () => {
  it('a touch tap at desktop width previews first', () => {
    const onOpenFloor = renderFacade()
    const floor = floorPath('А-5')

    fireEvent.pointerOver(floor, { pointerType: 'touch' })
    expect(panel('a')).not.toHaveAttribute('data-open')

    tap(floor)
    expect(panel('a')).toHaveAttribute('data-open')
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(onOpenFloor).not.toHaveBeenCalled()

    tap(floor)
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })

  it('previews a rail on the first touch tap, though the tap focuses it, and opens it on the second', () => {
    const onOpenFloor = renderFacade()

    tap(rail('А', 5))
    expect(document.activeElement).toBe(rail('А', 5))
    expect(panel('a')).toHaveAttribute('data-open')
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(rail('А', 5)).toHaveClass('is-hot')
    expect(document.querySelector('.fx')).not.toHaveClass('is-kbd')
    expect(onOpenFloor).not.toHaveBeenCalled()

    tap(rail('А', 5))
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })

  it('takes a pen tap on a rail the same way, whichever side of the pointerup it focuses, and a tap on another floor previews that one', () => {
    const onOpenFloor = renderFacade()

    tap(rail('А', 5), 'pen', { focusOnPress: true })
    expect(onOpenFloor).not.toHaveBeenCalled()
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(document.querySelector('.fx')).not.toHaveClass('is-kbd')

    tap(rail('А', 4), 'pen')
    expect(onOpenFloor).not.toHaveBeenCalled()
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 4')
    expect(document.querySelector('.fx')).not.toHaveClass('is-kbd')

    tap(rail('А', 4), 'pen', { focusOnPress: true })
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 4])
  })

  // Spec §7.3: entering a panel cancels the close. A finger has left the panel
  // (its pointerleave) before its press takes the focus off the rail it had
  // tapped. A tap off the building and the panels, even on the caption under
  // the building, leaves them.
  it('keeps the panel through a tap inside it, after a tap on a rail, and closes it for a tap off the building and the panels', () => {
    vi.useFakeTimers()
    try {
      renderFacade()
      tap(rail('А', 5))
      tap(panel('a').querySelector('.fxp__title'))
      act(() => vi.advanceTimersByTime(600))
      expect(panel('a')).toHaveAttribute('data-open')
      expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')

      tap(rail('Б', 6))
      expect(panel('b')).toHaveAttribute('data-open')
      tap(document.querySelector('.fx__cap'))
      act(() => vi.advanceTimersByTime(319))
      expect(panel('b')).toHaveAttribute('data-open')
      act(() => vi.advanceTimersByTime(1))
      expect(panel('b')).not.toHaveAttribute('data-open')
      expect(document.querySelector('.fx')).not.toHaveClass('is-hot')
    } finally {
      vi.useRealTimers()
    }
  })

  it('previews another floor tapped on the building after a rail, and opens it on the second tap', () => {
    const onOpenFloor = renderFacade()

    tap(rail('А', 5))
    tap(floorPath('А-3'))
    expect(document.activeElement).toBe(document.body)
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 3')
    expect(onOpenFloor).not.toHaveBeenCalled()

    tap(floorPath('А-3'))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 3])
  })

  it('opens at once on a mouse click, on a floor or on a rail, whose focus is no keyboard’s', () => {
    const onOpenFloor = renderFacade()
    mouseClick(floorPath('Б-2'))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['Б', 2])

    fireEvent.pointerDown(rail('А', 7), { pointerType: 'mouse' })
    act(() => rail('А', 7).focus())
    expect(document.querySelector('.fx')).not.toHaveClass('is-hot')
    fireEvent.pointerUp(rail('А', 7), { pointerType: 'mouse' })
    fireEvent.click(rail('А', 7))
    expect(onOpenFloor).toHaveBeenCalledTimes(2)
    expect(onOpenFloor.mock.calls[1].slice(0, 2)).toEqual(['А', 7])
  })
})

// The compact caption's words are the page's (Home's teaser, whose test reads
// them, teaser.test.jsx): the facade sets them in its live region, for the
// floor that is hot, or for none.
describe('compact mode (spec §7.2)', () => {
  it('sets the page’s caption for the hot floor in a live region, and opens on a click', () => {
    const caption = (floor) => (floor ? `${floor.block}-${floor.floor}: ${floor.counts.available} свободни` : 'Посочете етаж')
    const onOpenFloor = renderFacade({ mode: 'compact', caption })
    const live = document.querySelector('.fx__cap')

    expect(document.querySelector('.fx')).toHaveClass('fx--compact')
    expect(document.querySelector('.fxp')).toBeNull()
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(text(live)).toBe('Посочете етаж')

    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    expect(text(live)).toBe('А-5: 4 свободни')

    fireEvent.click(rail('А', 5))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })
})

// Spec §7.5: on a phone one block shows at a time; the first tap brings up
// the sheet, whose stepper walks the block's floors, and the second opens.
// The taps come in Chrome's order (src/test/pointer.js).
describe('phones (spec §7.5)', () => {
  const sheet = () => document.querySelector('.sheet')
  beforeEach(() => {
    window.matchMedia('(max-width: 900px)').matches = true
  })

  // A finger's tap focuses the rail after its pointerup (the Task 6 review).
  it('shows the sheet on a first tap on a rail, though the tap focuses the rail, and opens the floor on the second', () => {
    const onOpenFloor = renderFacade()

    tap(rail('А', 5))
    expect(document.activeElement).toBe(rail('А', 5))
    expect(sheet()).toHaveAttribute('data-open')
    expect(text(sheet().querySelector('.sheet__title'))).toBe('Блок А · Етаж 5')
    expect(document.querySelector('.fx')).not.toHaveClass('is-kbd')
    expect(onOpenFloor).not.toHaveBeenCalled()

    tap(rail('А', 5))
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })

  it('shows a tapped floor in the sheet, steps through the block, opens on a second tap, and closes on ×', () => {
    const onOpenFloor = renderFacade()

    tap(rail('А', 5))
    expect(sheet()).toHaveAttribute('data-open')
    expect(sheet()).toHaveAttribute('role', 'region')
    expect(sheet()).toHaveAccessibleName('Избран етаж')
    expect(text(sheet().querySelector('.sheet__title'))).toBe('Блок А · Етаж 5')
    expect(text(sheet().querySelector('output'))).toBe('етаж 5')
    expect(panel('a')).not.toHaveAttribute('data-open')
    expect(onOpenFloor).not.toHaveBeenCalled()

    fireEvent.click(within(sheet()).getByRole('button', { name: 'По-горен етаж' }))
    expect(text(sheet().querySelector('.sheet__title'))).toBe('Блок А · Етаж 6')
    expect(rail('А', 6)).toHaveClass('is-hot')

    tap(rail('А', 6))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 6])

    tap(rail('А', 8))
    expect(within(sheet()).getByRole('button', { name: 'По-горен етаж' })).toBeDisabled()
    fireEvent.click(within(sheet()).getByRole('button', { name: 'Затворете' }))
    expect(sheet()).not.toHaveAttribute('data-open')
    expect(document.querySelector('.fx')).not.toHaveClass('is-hot')
  })

  // Ruling C7.2: the sheet's own button turns inert as the sheet gives way,
  // so the floor's rail is the opener the stage gives the focus back to.
  it('opens the floor from the sheet’s „Отворете плана“ and from its plan, handing on the floor’s rail', () => {
    const onOpenFloor = renderFacade()
    tap(floorPath('Б-2'))
    fireEvent.click(within(sheet()).getByRole('button', { name: 'Отворете плана' }))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['Б', 2])
    expect(onOpenFloor.mock.calls[0][3].opener).toBe(rail('Б', 2))
    expect(sheet()).toHaveAttribute('inert')

    tap(floorPath('Б-3'))
    fireEvent.click(sheet().querySelector('g[data-suffix="05"] .u-hit'))
    expect(onOpenFloor.mock.calls[1].slice(0, 3)).toEqual(['Б', 3, 'Б 305'])
    expect(onOpenFloor.mock.calls[1][3].opener).toBe(rail('Б', 3))
  })

  // The block switch shows the other block, keeping the floor that was hot.
  it('switches the block, keeping the hot floor', () => {
    renderFacade()
    tap(rail('А', 3))
    fireEvent.click(screen.getByRole('button', { name: /^Блок\sБ$/ }))

    expect(document.querySelector('.fx')).toHaveAttribute('data-block', 'Б')
    expect(screen.getByRole('button', { name: /^Блок\sБ$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(text(sheet().querySelector('.sheet__title'))).toBe('Блок Б · Етаж 3')
  })
})

// Spec §12: the panels and the sheet are a chunk of their own. The full
// facade loads it as it nears the screen (or is first pointed at, focused or
// touched); a floor already hot shows as it arrives. A fresh copy of the
// facade, so the chunk is not in yet.
describe('the panels’ chunk', () => {
  // An IntersectionObserver that reports what the test says.
  function observeByHand() {
    const observers = []
    vi.stubGlobal('IntersectionObserver', class {
      constructor(report, options) {
        this.report = report
        this.options = options
        observers.push(this)
      }
      observe() {}
      disconnect() {}
    })
    return observers
  }

  it('loads as the full facade nears the screen, and shows the floor that turned hot before', async () => {
    const observers = observeByHand()
    vi.resetModules()
    const { default: FreshFacade } = await import('./Facade')
    render(<FreshFacade project={GR_PROJECT} model={MODEL} mode="full" onOpenFloor={() => {}} />)

    expect(document.querySelector('.fxp')).toBeNull()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    expect(rail('А', 5)).toHaveClass('is-hot')
    expect(observers).toHaveLength(1)
    expect(observers[0].options.rootMargin).toBe('0px 0px 600px 0px')

    act(() => observers[0].report([{ isIntersecting: true }]))
    await waitFor(() => expect(panel('a')).toHaveAttribute('data-open'))
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
  })

  // Ruling C7.6: a chunk that fails to load (offline, a new deploy, or an
  // error inside it) leaves the facade working without its panels, and says
  // so on the console, where the smoke run hears it.
  it('says on the console when the chunk fails, and still opens floors', async () => {
    observeByHand()
    const failure = new Error('the chunk is gone')
    vi.resetModules()
    vi.doMock('./surfaces', () => {
      throw failure
    })
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { default: FreshFacade } = await import('./Facade')
      const onOpenFloor = vi.fn()
      render(<FreshFacade project={GR_PROJECT} model={MODEL} mode="full" onOpenFloor={onOpenFloor} />)

      fireEvent.pointerEnter(document.querySelector('.fx'), { pointerType: 'mouse' })
      await waitFor(() => expect(errors).toHaveBeenCalled())
      expect(String(errors.mock.calls[0][0])).toMatch(/facade/i)
      expect(document.querySelector('.fxp')).toBeNull()
      mouseClick(floorPath('А-4'))
      expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 4])
    } finally {
      vi.doUnmock('./surfaces')
      errors.mockRestore()
    }
  })

  it('never loads in block mode', async () => {
    const observers = observeByHand()
    vi.resetModules()
    const { default: FreshFacade } = await import('./Facade')
    render(<FreshFacade project={GR_PROJECT} model={MODEL} mode="block" initialBlock="Б" onOpenFloor={() => {}} />)

    fireEvent.pointerEnter(document.querySelector('.fx'), { pointerType: 'mouse' })
    expect(observers).toHaveLength(0)
    // Nothing loaded, nor on its way: a load the facade started would have
    // landed by now (the surfaces and Golden Residence's plans, its project's).
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect((await import('./loadSurfaces')).loadedSurfaces(GR_PROJECT)).toBeNull()
  })

  it('never loads in compact mode', async () => {
    const observers = observeByHand()
    vi.resetModules()
    const { default: FreshFacade } = await import('./Facade')
    render(<FreshFacade project={GR_PROJECT} model={MODEL} mode="compact" caption={() => null} onOpenFloor={() => {}} />)

    fireEvent.pointerEnter(document.querySelector('.fx'), { pointerType: 'mouse' })
    expect(observers).toHaveLength(0)
    // Nothing loaded, nor on its way: a load the facade started would have
    // landed by now (the surfaces and Golden Residence's plans, its project's).
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))
    expect((await import('./loadSurfaces')).loadedSurfaces(GR_PROJECT)).toBeNull()
  })
})

// Ruling C9.14: a rail asked to take the focus back (`focusRail`: a stage
// that closed with no opener) also turns the facade's phone block to that
// floor's block, as it renders. A desktop shows and answers both blocks, so
// there the turn is harmless: the rail takes the focus and its floor turns
// hot, as any rail's focus makes it; the block switch (hidden from 901 px)
// and the root's data-block follow, which only a phone reads
// (explorer.css.test.js); and the other block still answers.
it('gives a rail of the other block the focus back on a desktop, both blocks still answering', () => {
  const onRailFocused = vi.fn()
  const props = { project: GR_PROJECT, model: MODEL, mode: 'full', initialBlock: 'А', onOpenFloor: vi.fn(), onRailFocused }
  const { rerender } = render(<Facade {...props} />)
  const facade = document.querySelector('.fx')
  expect(facade).toHaveAttribute('data-block', 'А')

  rerender(<Facade {...props} focusRail={{ block: 'Б', floor: 3 }} />)
  expect(rail('Б', 3)).toHaveFocus()
  expect(onRailFocused).toHaveBeenCalledTimes(1)
  expect(panel('b')).toHaveAttribute('data-open')
  expect(text(panel('b').querySelector('.fxp__title'))).toBe('Блок Б · Етаж 3')
  expect(facade).toHaveAttribute('data-block', 'Б')
  expect(screen.getByRole('button', { name: /^Блок\sБ$/ })).toHaveAttribute('aria-pressed', 'true')

  fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
  expect(panel('a')).toHaveAttribute('data-open')
  expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
  expect(panel('b')).not.toHaveAttribute('data-open')
})

// A block page's facade (spec M3 §6.5; blockFacade.jsx): block mode, with no
// panels and no sheet, and a hot floor its page drives (`hotState`, the
// page's own useHotFloor()), which its rows set too: the facade shows it,
// and pointing at a floor sets it.
describe('block mode, its hot floor the page’s (spec M3 §6.5)', () => {
  function Page({ seen, ...props }) {
    const isFloor = (key) => /^[АБ]-\d$/.test(key)
    const hotState = useHotFloor({ compact: true, isFloor })
    seen.current = hotState
    return <Facade project={GR_PROJECT} model={MODEL} mode="block" hotState={hotState} {...props} />
  }

  it('shows the floor its page makes hot, and makes the floor pointed at its page’s', () => {
    const seen = { current: null }
    const onOpenFloor = vi.fn()
    render(<Page seen={seen} onOpenFloor={onOpenFloor} />)

    expect(document.querySelector('.fxp')).toBeNull()
    act(() => seen.current.setHot('А-6', 'kbd'))
    expect(rail('А', 6)).toHaveClass('is-hot')
    expect(document.querySelector('.fx')).toHaveClass('is-hot', 'is-kbd')

    fireEvent.pointerOver(rail('А', 3), { pointerType: 'mouse' })
    expect(seen.current.hot).toMatchObject({ key: 'А-3', source: 'mouse' })
    expect(rail('А', 6)).not.toHaveClass('is-hot')
    expect(document.querySelector('.fxp')).toBeNull()

    act(() => seen.current.clearHot())
    expect(document.querySelector('.fx')).not.toHaveClass('is-hot')

    fireEvent.click(rail('А', 3))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 3])
  })
})
