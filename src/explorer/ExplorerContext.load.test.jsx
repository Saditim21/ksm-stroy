import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExplorerProvider } from './ExplorerContext'
import { snapshotAvailability } from './testing'
import useExplorer from './useExplorer'

// The dialogs' chunk (surfaces.js) when its load fails (offline, a dropped
// request): the provider says so on the console, ends a deep link's landing
// (the EU row's hold goes), and shows nothing. A later open asks for the
// chunk again (loadSurfaces lets a failed load be tried again), so the next
// floor or unit opens its dialog, not only after a reload.
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
        <Route path="*" element={<ExplorerProvider routeBlock={null}><Probe /></ExplorerProvider>} />
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

  it('is asked for again by the next unit opened, whose panel then shows', async () => {
    renderAt('/projects/golden-residence?floor=А-5')
    await settle()

    press('Б 204')
    await settle()
    expect(load).toHaveBeenCalledTimes(2)
    expect(dialogs()).toHaveTextContent('А-5 Б 204')
  })
})
