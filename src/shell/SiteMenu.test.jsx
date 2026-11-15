import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { recordingMotion } from '../test/gsap'
import SiteMenu from './SiteMenu'

// The menu's live Golden Residence line (spec §6.4, §9): „—“ while the
// availability loads, then the free apartments of both blocks, never a fake
// zero. A file of its own, so the availability store, which every reader on
// a page shares, starts empty here: the shell's tests leave it loaded.
//
// Then its motion (extract §4.3; ruling C9.4), with a recording stand-in for
// the engine useMotionNow() hands over, and its Tab trap, the dialogs' shared
// one (src/utils/trapTab.js; ruling C9.12). Every other case runs without
// motion, as jsdom does.

let motion = null
vi.mock('../motion/useMotionNow', () => ({ default: () => () => motion }))

const row = (unit, status) => ({ unit, floor: '1', type: '2-стаен', area: { built: '', ideal: '', total: '' }, exposure: '', status, price: '' })

// What api/availability.js answers: two free apartments, one in each block.
const API_BODY = {
  updatedAt: '2026-11-15T08:00:00.000Z',
  sources: { BLOCK_A: 'ok', BLOCK_B: 'ok', GARAGES: 'ok', PARKING: 'ok', MNOGO_A: 'missing', MNOGO_B: 'missing' },
  projects: {
    'golden-residence': {
      'block-a': [row('А 101', 'Свободен'), row('А 102', 'Продадени')],
      'block-b': [row('Б 101', ''), row('Б 102', 'Резервиран'), row('Б 103', 'Блокиран')],
      garages: [],
      parking: [],
    },
    'mnogofamilna-sgrada': { 'block-a': null, 'block-b': null },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('reads „—“ until the availability arrives, then the free apartments of both blocks', async () => {
  let answer
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => {
    answer = resolve
  })))
  render(
    <MemoryRouter initialEntries={['/about']}>
      <SiteMenu id="site-menu" pathname="/about" onClose={() => {}} />
    </MemoryRouter>,
  )
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  expect(menu).toHaveTextContent('жк Левски Г · — свободни')

  await act(async () => answer({ ok: true, status: 200, json: async () => API_BODY }))
  await waitFor(() => expect(menu).toHaveTextContent('жк Левски Г · 2 свободни'))
})

// Ruling C4.8: one free apartment is „1 свободен“, the singular. A fresh copy
// of the menu, so its availability store starts empty again.
it('says „1 свободен“ when one apartment is free', async () => {
  vi.resetModules()
  const { default: FreshMenu } = await import('./SiteMenu')
  const goldenResidence = { ...API_BODY.projects['golden-residence'], 'block-b': [row('Б 101', 'Продадени')] }
  const oneFree = { ...API_BODY, projects: { ...API_BODY.projects, 'golden-residence': goldenResidence } }
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => oneFree })))
  render(
    <MemoryRouter initialEntries={['/about']}>
      <FreshMenu id="site-menu" pathname="/about" onClose={() => {}} />
    </MemoryRouter>,
  )
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  await waitFor(() => expect(menu).toHaveTextContent('жк Левски Г · 1 свободен'))
  expect(menu).not.toHaveTextContent('1 свободни')
})

// The menu, open on /about with the availability still loading, and its
// moving parts.
function renderMenu(onClose = vi.fn()) {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
  render(
    <MemoryRouter initialEntries={['/about']}>
      <button type="button">Отвън</button>
      <SiteMenu id="site-menu" pathname="/about" onClose={onClose} />
    </MemoryRouter>,
  )
  const menu = screen.getByRole('dialog', { name: 'Меню' })
  return {
    menu,
    onClose,
    first: within(menu).getByRole('link', { name: 'Начало' }),
    left: menu.querySelector('.menu__half--l'),
    right: menu.querySelector('.menu__half--r'),
    seam: menu.querySelector('.menu__seam'),
    items: [...menu.querySelectorAll('.menu__pages li, .menu__info > *')],
    close: within(menu).getByRole('button', { name: 'Затвори' }),
  }
}

describe('the motion', () => {
  const recorder = recordingMotion()
  beforeEach(() => {
    recorder.reset()
    motion = recorder.motion
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })
  afterEach(() => {
    motion = null
    vi.useRealTimers()
  })

  it('opens: the halves slide in over 0.75 s, the seam draws from 0.45 s, the items rise 26 px from 0.5 s, „Затвори“ fading in with them', () => {
    const { left, right, seam, items, close } = renderMenu()

    expect(recorder.timelines).toHaveLength(1)
    const [opening] = recorder.timelines
    expect(opening.steps).toEqual([
      { method: 'fromTo', targets: left, from: { yPercent: -100 }, vars: { yPercent: 0, duration: 0.75, ease: 'expo.inOut' }, position: 0 },
      { method: 'fromTo', targets: right, from: { yPercent: 100 }, vars: { yPercent: 0, duration: 0.75, ease: 'expo.inOut' }, position: 0 },
      { method: 'fromTo', targets: seam, from: { scaleY: 0 }, vars: { scaleY: 1, duration: 0.9, ease: 'expo.out' }, position: 0.45 },
      { method: 'fromTo', targets: items, from: { opacity: 0, y: 26 }, vars: { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.04 }, position: 0.5 },
      { method: 'fromTo', targets: close, from: { opacity: 0 }, vars: { opacity: 1, duration: 0.4, ease: 'expo.out' }, position: 0.5 },
    ])
    // The six pages, the four details and the EU line rise, item by item.
    expect(items).toHaveLength(11)
    expect(opening.steps[3].targets[0]).toBe(items[0])

    // Once in, it takes off what it set.
    opening.vars.onComplete()
    expect(recorder.tweens).toHaveLength(1)
    expect(recorder.tweens[0]).toMatchObject({ method: 'set', vars: { clearProps: 'transform,opacity' } })
    expect(recorder.tweens[0].targets).toEqual([left, right, seam, ...items, close])
  })

  it('moves the focus to the first page once the halves are in, at 650 ms', () => {
    const { first } = renderMenu()
    act(() => vi.advanceTimersByTime(649))
    expect(first).not.toHaveFocus()
    act(() => vi.advanceTimersByTime(1))
    expect(first).toHaveFocus()
  })

  it('closes: the items and „Затвори“ fade over 0.2 s, the halves slide back over 0.6 s from 0.05 s, then the header takes over', () => {
    const { left, right, items, close, first, onClose } = renderMenu()
    const [opening] = recorder.timelines

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(opening.kill).toHaveBeenCalled()
    expect(recorder.timelines).toHaveLength(2)
    const closing = recorder.timelines[1]
    expect(closing.steps).toEqual([
      { method: 'to', targets: [...items, close], vars: { opacity: 0, duration: 0.2 }, position: 0 },
      { method: 'to', targets: left, vars: { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, position: 0.05 },
      { method: 'to', targets: right, vars: { yPercent: 100, duration: 0.6, ease: 'expo.inOut' }, position: 0.05 },
    ])
    expect(onClose).not.toHaveBeenCalled()

    // A second Escape while it closes starts nothing more, and the focus,
    // which the halves were to give the first page, stays out.
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(recorder.timelines).toHaveLength(2)
    act(() => vi.advanceTimersByTime(1000))
    expect(first).not.toHaveFocus()

    closing.vars.onComplete()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('without motion, is there at once, focuses the first page at 50 ms and closes at once', () => {
    motion = null
    const { first, onClose } = renderMenu()
    expect(recorder.timelines).toHaveLength(0)
    act(() => vi.advanceTimersByTime(50))
    expect(first).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(recorder.timelines).toHaveLength(0)
  })
})

// The scroll lock hides the page's scrollbar and keeps its gutter
// (src/index.css: scrollbar-gutter), which then shows <html>'s background:
// umber while the menu is open, as its right half beside the strip.
it('paints the scrollbar’s strip umber while it is open', () => {
  renderMenu()
  expect(document.documentElement.style.overflow).toBe('hidden')
  expect(document.documentElement.style.backgroundColor).toBe('rgb(26, 23, 20)')
})

// The shared trap (src/utils/trapTab.js): from outside the menu, where the
// focus may still be while it opens, Tab goes in to its first stop and
// Shift+Tab to its last, „Затвори“.
it('takes Tab from outside the menu to its first stop, and Shift+Tab to its last', () => {
  const { first, close } = renderMenu()
  const outside = screen.getByRole('button', { name: 'Отвън' })

  act(() => outside.focus())
  expect(fireEvent.keyDown(outside, { key: 'Tab' })).toBe(false)
  expect(first).toHaveFocus()

  act(() => outside.focus())
  expect(fireEvent.keyDown(outside, { key: 'Tab', shiftKey: true })).toBe(false)
  expect(close).toHaveFocus()
})
