import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExplorerProvider } from './ExplorerContext'
import { GR_PROJECT } from './projects/gr'
import { snapshotAvailability } from './testing'
import useExplorer from './useExplorer'

// The dialogs' chunk (surfaces.js) when its load fails (offline, a dropped
// request): the provider says so on the console, ends a deep link's landing
// (the EU row's hold goes), and shows nothing. A later open asks for the
// chunk again (loadSurfaces lets a failed load be tried again), so the next
// floor or unit opens its dialog, the same floor or unit again included
// (FR9), not only after a reload.
//
// Here the chunk's load fails once, then loads a stand-in for the dialogs
// that names the floor and the unit the address asks for.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))
const load = vi.hoisted(() => vi.fn())
vi.mock('./loadSurfaces', () => ({ loadSurfaces: load, loadedSurfaces: () => null }))
vi.mock('../motion/useMotionNow', () => ({ default: () => () => null }))

function ExplorerDialogs({ state }) {
  const { stage, unitId } = state
  return <div role="dialog" aria-label="dialogs">{`${stage ? `${stage.block}-${stage.floor}` : ''}${unitId ? ` ${unitId}` : ''}`}</div>
}

function Probe() {
  const explorer = useExplorer()
  const { search } = useLocation()
  return (
    <>
      <button type="button" onClick={() => explorer.openFloor('А', 5)}>А-5</button>
      <button type="button" onClick={() => explorer.openFloor('А', 6)}>А-6</button>
      <button type="button" onClick={() => explorer.openUnit('Б 204')}>Б 204</button>
      <output data-testid="where">{decodeURIComponent(search)}</output>
    </>
  )
}

function renderAt(entry) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="*" element={<ExplorerProvider project={GR_PROJECT} routeBlock={null}><Probe /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

const press = (name) => fireEvent.click(screen.getByRole('button', { name }))
const dialogs = () => screen.queryByRole('dialog', { name: 'dialogs' })
// Lets the chunk's promise settle and its state commit.
const settle = () => act(async () => {})

let errors
beforeEach(() => {
  availability = snapshotAvailability()
  load.mockReset()
  load.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ ExplorerDialogs })
  errors = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  errors.mockRestore()
})

describe('a dialogs chunk that failed to load', () => {
  it('ends a deep link’s landing, says so, and shows nothing', async () => {
    renderAt('/projects/golden-residence?floor=А-5')
    await settle()
    expect(load).toHaveBeenCalledTimes(1)
    expect(errors).toHaveBeenCalledWith('[explorer] the plan stage did not load:', expect.any(Error))
    expect(document.documentElement.hasAttribute('data-eu-hold')).toBe(false)
    expect(dialogs()).toBeNull()
  })

  it('is asked for again by the next floor opened, whose stage then shows', async () => {
    renderAt('/projects/golden-residence?floor=А-5')
    await settle()
    expect(dialogs()).toBeNull()

    press('А-6')
    await settle()
    expect(screen.getByTestId('where')).toHaveTextContent('?floor=А-6')
    expect(load).toHaveBeenCalledTimes(2)
    expect(dialogs()).toHaveTextContent('А-6')
  })

  // FR9 (M3 §11): the address already says ?floor=А-5, so opening А-5 again
  // changes nothing in it, and only a new ask can load the chunk.
  it('re-opening the same floor retries a failed surfaces load', async () => {
    renderAt('/projects/golden-residence?floor=А-5')
    await settle()
    expect(dialogs()).toBeNull()

    press('А-5')
    await settle()
    expect(screen.getByTestId('where')).toHaveTextContent('?floor=А-5')
    expect(load).toHaveBeenCalledTimes(2)
    expect(dialogs()).toHaveTextContent('А-5')
  })

  it('is asked for again by the next unit opened, whose panel then shows', async () => {
    renderAt('/projects/golden-residence?floor=А-5')
    await settle()

    press('Б 204')
    await settle()
    expect(load).toHaveBeenCalledTimes(2)
    expect(dialogs()).toHaveTextContent('А-5 Б 204')
  })

  // FR9 for a unit: a unit opened from a list's row or a block's square
  // (openUnit, Многофамилна's #spisak and #blokove) whose dialogs failed to
  // load. The address already says ?unit=Б 204, so opening Б 204 again
  // changes nothing in it, and only a new ask can load the chunk.
  it('re-opening the same unit retries a failed surfaces load', async () => {
    renderAt('/projects/golden-residence')
    await settle()

    press('Б 204')
    await settle()
    expect(load).toHaveBeenCalledTimes(1)
    expect(dialogs()).toBeNull()

    press('Б 204')
    await settle()
    // URLSearchParams writes the space as „+“.
    expect(screen.getByTestId('where')).toHaveTextContent('?unit=Б+204')
    expect(load).toHaveBeenCalledTimes(2)
    expect(dialogs()).toHaveTextContent('Б 204')
  })
})
