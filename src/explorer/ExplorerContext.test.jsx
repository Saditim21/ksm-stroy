import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExplorerProvider } from './ExplorerContext'
import { GR_PROJECT } from './projects/gr'
import { snapshotAvailability } from './testing'
import useExplorer from './useExplorer'

// The explorer's provider (ExplorerContext.jsx) with motion allowed: a floor
// opened from a mini plan's unit opens the unit panel once the plan has grown,
// 820 ms on (extract §4.23). Ruling C8.2: stepping the floor or switching the
// block before then calls that unit off, as opening another floor, another
// unit or closing the stage does.
//
// What only matters here is the address: the dialogs' chunk never loads, and
// motion is a stand-in that takes any call (useMotionNow mocked), or none
// where a case turns it off.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))
vi.mock('./loadSurfaces', () => ({ loadSurfaces: () => new Promise(() => {}), loadedSurfaces: () => null }))
const anything = new Proxy(function stand() {}, {
  get: (_, key) => (key === 'then' ? undefined : anything),
  apply: () => anything,
})
let motionOn = true
vi.mock('../motion/useMotionNow', () => ({ default: () => () => (motionOn ? { gsap: anything, ScrollTrigger: anything } : null) }))

function Probe() {
  const explorer = useExplorer()
  const { search } = useLocation()
  return (
    <>
      <button type="button" onClick={() => explorer.openFloor('А', 5, 'А 502')}>plan</button>
      <button type="button" onClick={() => explorer.setFloor(6)}>up</button>
      <button type="button" onClick={() => explorer.setBlock('Б')}>block</button>
      <output data-testid="where">{decodeURIComponent(search)}</output>
    </>
  )
}

function renderProvider() {
  render(
    <MemoryRouter initialEntries={['/projects/golden-residence']}>
      <Routes>
        <Route path="*" element={<ExplorerProvider project={GR_PROJECT} routeBlock={null}><Probe /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

const where = () => screen.getByTestId('where').textContent
const press = (name) => fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  availability = snapshotAvailability()
  vi.useFakeTimers()
})
afterEach(() => {
  motionOn = true
  vi.useRealTimers()
})

describe('the unit a mini plan opens, 820 ms on', () => {
  it('opens once the plan has grown', () => {
    renderProvider()
    press('plan')
    expect(where()).toBe('?floor=А-5')
    act(() => vi.advanceTimersByTime(819))
    expect(where()).toBe('?floor=А-5')
    act(() => vi.advanceTimersByTime(1))
    expect(where()).toBe('?floor=А-5&unit=А+502')
  })

  // Ruling C9.13: with no plan to grow, nothing waits.
  it('opens with its floor at once, without motion', () => {
    motionOn = false
    renderProvider()
    press('plan')
    expect(where()).toBe('?floor=А-5&unit=А+502')
  })

  it('is called off by a step of the floor before then', () => {
    renderProvider()
    press('plan')
    act(() => vi.advanceTimersByTime(400))
    press('up')
    expect(where()).toBe('?floor=А-6')
    act(() => vi.advanceTimersByTime(1000))
    expect(where()).toBe('?floor=А-6')
  })

  it('is called off by the block switch before then', () => {
    renderProvider()
    press('plan')
    act(() => vi.advanceTimersByTime(400))
    press('block')
    expect(where()).toBe('?floor=Б-5')
    act(() => vi.advanceTimersByTime(1000))
    expect(where()).toBe('?floor=Б-5')
  })
})
