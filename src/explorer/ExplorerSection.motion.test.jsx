import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'
import { loadUnitList } from './loadUnitList'
import { snapshotAvailability } from './testing'

// The switch between „Визуално“ and „По критерии“ with motion (spec §5.7,
// §7.8; extract §4.19; the concept's gr.js:79-93): Flip records the views and
// the tabs' underline before the switch, then plays them from there, 0.7 s
// expo.inOut for the views and the underline's own 0.25 s, while the panel
// coming in rises 26 px over 0.7 s expo.out, 0.12 s late; ScrollTrigger
// measures again once the views have settled. Without motion it switches at
// once, and Flip never loads. Flip and the motion engine are recording
// stand-ins (loadFlip and useMotionNow mocked).

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))

let motion = null
vi.mock('../motion/useMotionNow', () => ({ default: () => () => motion }))

const Flip = {
  getState: vi.fn((targets) => ({ targets, listHidden: document.querySelector('.views > [data-view="list"]').hidden })),
  from: vi.fn(() => ({ kill() {} })),
}
const loadFlip = vi.fn(() => Promise.resolve(Flip))
vi.mock('../motion/flip', () => ({ loadFlip: () => loadFlip() }))

function renderSection() {
  render(
    <MemoryRouter initialEntries={['/projects/golden-residence']}>
      <Routes>
        <Route path="*" element={<ExplorerProvider routeBlock={null}><ExplorerSection /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

const tab = (name) => screen.getByRole('tab', { name })
const views = () => document.querySelector('section#explorer .views')
const bar = () => document.querySelector('section#explorer .toggle__bar')
const panel = (view) => document.querySelector(`section#explorer .views > [data-view="${view}"]`)

beforeAll(() => loadUnitList())

beforeEach(() => {
  availability = snapshotAvailability()
  motion = {
    gsap: { fromTo: vi.fn(() => ({ kill() {} })), to: vi.fn(() => ({ kill() {} })), set: vi.fn() },
    ScrollTrigger: { refresh: vi.fn() },
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('the switch with motion', () => {
  it('records the views and the underline before the switch, then flips them from there', async () => {
    renderSection()
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(Flip.from).toHaveBeenCalledTimes(2))

    expect(Flip.getState).toHaveBeenCalledTimes(1)
    const [state] = Flip.getState.mock.results.map((result) => result.value)
    expect(state.targets).toEqual([views(), bar()])
    // Recorded while „Визуално“ was still on show.
    expect(state.listHidden).toBe(true)
    expect(panel('list').hidden).toBe(false)

    const [[viewsState, viewsVars], [barState, barVars]] = Flip.from.mock.calls
    expect(viewsState).toBe(state)
    expect(viewsVars).toEqual({ targets: views(), duration: 0.7, ease: 'expo.inOut', scale: false, simple: true, onComplete: expect.any(Function) })
    expect(barState).toBe(state)
    expect(barVars).toEqual({ targets: bar(), duration: 0.25, ease: 'power2.out', scale: false, simple: true })

    // ScrollTrigger measures again once the views have settled.
    expect(motion.ScrollTrigger.refresh).not.toHaveBeenCalled()
    viewsVars.onComplete()
    expect(motion.ScrollTrigger.refresh).toHaveBeenCalledTimes(1)
  })

  it('raises the panel coming in, 26 px over 0.7 s expo.out, 0.12 s late', async () => {
    renderSection()
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(motion.gsap.fromTo).toHaveBeenCalled())
    expect(motion.gsap.fromTo).toHaveBeenCalledWith(
      panel('list'),
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: 0.12, clearProps: 'opacity,transform' },
    )

    fireEvent.click(tab('Визуално'))
    await waitFor(() => expect(motion.gsap.fromTo).toHaveBeenCalledTimes(2))
    expect(motion.gsap.fromTo.mock.calls[1][0]).toBe(panel('visual'))
  })
})

// Ruling C8.8: a switch waits for Flip (and the list) before the tab
// changes. Meanwhile the tab it left is still selected; a click on it, or an
// arrow back to it, calls the waiting switch off, so the view stays, and the
// focus is on the selected tab. Flip arrives late here, shared by every call,
// as loadFlip() shares one promise.
describe('a switch still waiting', () => {
  let arrive
  beforeEach(() => {
    const late = new Promise((resolve) => {
      arrive = () => resolve(Flip)
    })
    loadFlip.mockImplementation(() => late)
  })
  afterEach(() => {
    loadFlip.mockImplementation(() => Promise.resolve(Flip))
  })

  // Every promise the switches wait on settles before a macrotask; React's
  // updates are flushed inside act.
  const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))
  const settles = async () => {
    arrive()
    await flush()
  }

  it('is called off by a click on the tab still selected', async () => {
    renderSection()
    fireEvent.click(tab('По критерии'))
    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(tab('Визуално'))
    await settles()

    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    expect(panel('visual').hidden).toBe(false)
    expect(panel('list').hidden).toBe(true)
    expect(Flip.getState).not.toHaveBeenCalled()
    expect(Flip.from).not.toHaveBeenCalled()
  })

  it('is called off by an arrow back, the focus on the tab that stays selected', async () => {
    renderSection()
    tab('Визуално').focus()
    fireEvent.keyDown(tab('Визуално'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab('По критерии'))
    fireEvent.keyDown(tab('По критерии'), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tab('Визуално'))
    await settles()

    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Визуално')).toHaveAttribute('tabindex', '0')
    expect(document.activeElement).toBe(tab('Визуално'))
    expect(panel('list').hidden).toBe(true)
    expect(Flip.getState).not.toHaveBeenCalled()
  })

  // Without a switch waiting, the selected tab asks for nothing.
  it('switches once Flip is in when nothing calls it off, and a click on the selected tab then does nothing', async () => {
    renderSection()
    fireEvent.click(tab('По критерии'))
    await settles()
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(Flip.getState).toHaveBeenCalledTimes(1)

    fireEvent.click(tab('По критерии'))
    await flush()
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true')
    expect(Flip.getState).toHaveBeenCalledTimes(1)
    expect(loadFlip).toHaveBeenCalledTimes(1)
  })
})

describe('the switch without motion', () => {
  it('switches at once, and never loads Flip', async () => {
    motion = null
    renderSection()
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(panel('list').hidden).toBe(false)
    expect(loadFlip).not.toHaveBeenCalled()
    expect(Flip.getState).not.toHaveBeenCalled()
  })
})
