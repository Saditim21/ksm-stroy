import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '../test/media'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'
import { loadSurfaces } from './loadSurfaces'
import { named, snapshotAvailability } from './testing'

// Ruling C8.10, at the stage itself: a floor opened from a mini plan's unit
// (the edge panel's, FloorPanel.jsx) opens the unit panel once the plan has
// grown, 820 ms on (extract §4.23). The stage's own ▲ and block switch reach
// the provider's setFloor and setBlock (ExplorerDialogs.jsx, ruling C8.2), so
// a step or a switch before then calls that unit off: the old floor's unit
// never opens over the new floor's stage. ExplorerContext.test.jsx calls the
// provider's setters directly; this goes through the stage's buttons.
//
// The real facade, edge panel and dialogs (the surfaces' chunk is in), on
// the sheets snapshot. Motion is a stand-in that takes any call
// (useMotionNow mocked), so the unit waits for the plan's growth as it does
// with motion; the reveals and entrances, which would load the real engine
// where motion is allowed, are out of the way.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))
const anything = new Proxy(function stand() {}, {
  get: (_, key) => (key === 'then' ? undefined : anything),
  apply: () => anything,
})
vi.mock('../motion/useMotionNow', () => ({ default: () => () => ({ gsap: anything, ScrollTrigger: anything }) }))
vi.mock('../motion/useMotion', () => ({ default: () => {} }))
vi.mock('../motion/useReveals', () => ({ default: () => {} }))

function Where() {
  const { pathname, search } = useLocation()
  return <output data-testid="where">{decodeURIComponent(`${pathname}${search}`)}</output>
}

const rail = (block, floor) => screen.getByRole('button', { name: new RegExp(`^Блок ${block}, етаж ${floor}[:.]`) })
const where = () => screen.getByTestId('where').textContent
const GR = '/projects/golden-residence'

// А-5's stage, opened from its edge panel's mini plan at the unit А 502: the
// stage at once, the unit to follow.
function openFromMiniPlan() {
  render(
    <MemoryRouter initialEntries={[GR]}>
      <Routes>
        <Route path="*" element={<ExplorerProvider routeBlock={null}><ExplorerSection /><Where /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
  fireEvent.pointerOver(rail('А', 5), { pointerType: 'mouse' })
  fireEvent.click(document.querySelector('.fxp--a g[data-suffix="02"] .u-hit'))
  expect(where()).toBe(`${GR}?floor=А-5`)
  return screen.getByRole('dialog', { name: named('Блок А · Етаж 5') })
}

let restoreMedia
beforeAll(() => loadSurfaces())
beforeEach(() => {
  availability = snapshotAvailability()
  restoreMedia = mockMatchMedia({ fine: true })
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  restoreMedia()
})

describe('the unit a mini plan opens, called off at the stage', () => {
  it('opens over the stage once the plan has grown, when nothing calls it off', () => {
    openFromMiniPlan()
    act(() => vi.advanceTimersByTime(820))
    expect(where()).toBe(`${GR}?floor=А-5&unit=А+502`)
    expect(screen.getByRole('dialog', { name: 'А 502' })).toBeInTheDocument()
  })

  it('never opens over the next floor’s stage after the stage’s ▲ within 820 ms', () => {
    const stage = openFromMiniPlan()
    act(() => vi.advanceTimersByTime(400))
    fireEvent.click(within(stage).getByRole('button', { name: 'По-горен етаж' }))
    expect(where()).toBe(`${GR}?floor=А-6`)

    act(() => vi.advanceTimersByTime(1000))
    expect(where()).toBe(`${GR}?floor=А-6`)
    expect(screen.queryByRole('dialog', { name: 'А 502' })).toBeNull()
    expect(screen.getByRole('dialog', { name: named('Блок А · Етаж 6') })).toBeInTheDocument()
  })

  it('never opens over the other block’s stage after the stage’s block switch within 820 ms', () => {
    const stage = openFromMiniPlan()
    act(() => vi.advanceTimersByTime(400))
    fireEvent.click(within(within(stage).getByRole('group', { name: 'Блок' })).getByRole('button', { name: /^Блок\sБ$/ }))
    expect(where()).toBe(`${GR}?floor=Б-5`)

    act(() => vi.advanceTimersByTime(1000))
    expect(where()).toBe(`${GR}?floor=Б-5`)
    expect(screen.queryByRole('dialog', { name: 'А 502' })).toBeNull()
    expect(screen.getByRole('dialog', { name: named('Блок Б · Етаж 5') })).toBeInTheDocument()
  })
})
