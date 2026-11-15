import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import Facade from './Facade'
import { loadSurfaces } from './loadSurfaces'
import { buildModel } from './model'
import { snapshotData } from './testing'

// The facade (spec §7.2, §7.3; extract §4.20, §4.21): the free count of each
// floor on its block's outer edge, the edge panel with the floor's plan, and
// the first tap that only previews. A desktop with a mouse: matchMedia answers
// a fine pointer, and no phone width. The panels' chunk (surfaces.js) is in
// before the first render, as on a facade the page has scrolled near.

const MODEL = buildModel(snapshotData())
const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })
const panel = (side) => document.querySelector(`.fxp--${side}`)
const floorPath = (key) => document.querySelector(`.fx__floor[data-k="${key}"]`)

beforeAll(() => loadSurfaces())

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
  render(<Facade model={MODEL} mode="full" onOpenFloor={onOpenFloor} {...props} />)
  return onOpenFloor
}

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

  it('stop at the top and the bottom floor', () => {
    renderFacade()
    act(() => rail('А', 8).focus())
    fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(rail('А', 8))
    act(() => rail('Б', 1).focus())
    fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(rail('Б', 1))
  })
})

// Review Focus 3: a touch screen at desktop width. The first tap previews,
// the second opens, and a touch never counts as hovering.
describe('touch at desktop width', () => {
  it('a touch tap at desktop width previews first', () => {
    const onOpenFloor = renderFacade()
    const floor = floorPath('А-5')

    fireEvent.pointerOver(floor, { pointerType: 'touch' })
    expect(panel('a')).not.toHaveAttribute('data-open')

    fireEvent.pointerDown(floor, { pointerType: 'touch' })
    fireEvent.click(floor)
    expect(panel('a')).toHaveAttribute('data-open')
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
    expect(onOpenFloor).not.toHaveBeenCalled()

    fireEvent.pointerDown(floor, { pointerType: 'touch' })
    fireEvent.click(floor)
    expect(onOpenFloor).toHaveBeenCalledTimes(1)
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })

  it('takes a pen tap on a rail the same way, and a tap on another floor previews that one', () => {
    const onOpenFloor = renderFacade()

    fireEvent.pointerDown(rail('А', 5), { pointerType: 'pen' })
    act(() => rail('А', 5).focus())
    fireEvent.click(rail('А', 5))
    expect(onOpenFloor).not.toHaveBeenCalled()
    expect(document.querySelector('.fx')).not.toHaveClass('is-kbd')

    fireEvent.pointerDown(rail('А', 4), { pointerType: 'pen' })
    fireEvent.click(rail('А', 4))
    expect(onOpenFloor).not.toHaveBeenCalled()
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 4')
  })

  it('opens at once on a mouse click', () => {
    const onOpenFloor = renderFacade()
    fireEvent.pointerDown(floorPath('Б-2'), { pointerType: 'mouse' })
    fireEvent.click(floorPath('Б-2'))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['Б', 2])
  })
})

describe('compact mode (spec §7.2)', () => {
  it('names the floor in the caption with its counts, and opens on a click', () => {
    const onOpenFloor = renderFacade({ mode: 'compact' })
    const caption = document.querySelector('.fx__cap')

    expect(document.querySelector('.fx')).toHaveClass('fx--compact')
    expect(document.querySelector('.fxp')).toBeNull()
    expect(caption).toHaveAttribute('aria-live', 'polite')
    expect(text(caption)).toBe('Посочете етаж: свободните, резервираните и продадените апартаменти на него. Кликнете, за да отворите плана му.')

    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    expect(text(caption.querySelector('.t'))).toBe('Блок А · етаж 5')
    expect(caption.querySelector('.t em')).toHaveTextContent('етаж 5')
    expect([...caption.querySelectorAll('.st')].map(text)).toEqual(['4 свободни', '2 резервирани', '6 продадени', '0 блокирани'])

    fireEvent.click(rail('А', 5))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['А', 5])
  })
})

// Spec §7.5: on a phone one block shows at a time; the first tap brings up
// the sheet, whose stepper walks the block's floors, and the second opens.
describe('phones (spec §7.5)', () => {
  const sheet = () => document.querySelector('.sheet')
  beforeEach(() => {
    window.matchMedia('(max-width: 900px)').matches = true
  })
  const tap = (element) => {
    fireEvent.pointerDown(element, { pointerType: 'touch' })
    fireEvent.click(element)
  }

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

  it('opens the floor from the sheet’s „Отворете плана“', () => {
    const onOpenFloor = renderFacade()
    tap(floorPath('Б-2'))
    fireEvent.click(within(sheet()).getByRole('button', { name: 'Отворете плана' }))
    expect(onOpenFloor.mock.calls[0].slice(0, 2)).toEqual(['Б', 2])
    expect(onOpenFloor.mock.calls[0][3]).toMatchObject({ opener: expect.any(HTMLElement) })
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
    render(<FreshFacade model={MODEL} mode="full" onOpenFloor={() => {}} />)

    expect(document.querySelector('.fxp')).toBeNull()
    fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
    expect(rail('А', 5)).toHaveClass('is-hot')
    expect(observers).toHaveLength(1)
    expect(observers[0].options.rootMargin).toBe('0px 0px 600px 0px')

    act(() => observers[0].report([{ isIntersecting: true }]))
    await waitFor(() => expect(panel('a')).toHaveAttribute('data-open'))
    expect(text(panel('a').querySelector('.fxp__title'))).toBe('Блок А · Етаж 5')
  })

  it('never loads in compact mode', async () => {
    const observers = observeByHand()
    vi.resetModules()
    const { default: FreshFacade } = await import('./Facade')
    render(<FreshFacade model={MODEL} mode="compact" onOpenFloor={() => {}} />)

    fireEvent.pointerEnter(document.querySelector('.fx'), { pointerType: 'mouse' })
    expect(observers).toHaveLength(0)
    expect((await import('./loadSurfaces')).loadedSurfaces()).toBeNull()
  })
})
