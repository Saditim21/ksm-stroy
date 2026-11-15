import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExplorerProvider } from './ExplorerContext'
import ExplorerSection from './ExplorerSection'
import { snapshotAvailability } from './testing'

// Ruling C8.7: the list, „По критерии“, is a lazy chunk (loadUnitList.js).
// If it does not load on a ?view=list landing, the explorer goes back to
// „Визуално“ rather than leave „По критерии“ selected over an empty panel,
// and a later switch tries the list again. The network is a stand-in here:
// each load of the list fails while `network.down`, and loads the real list
// once it is up.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))

const network = vi.hoisted(() => ({ down: true, loads: 0 }))
vi.mock('./loadUnitList', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    loadedUnitList: actual.loadedUnitList,
    loadUnitList: () => {
      network.loads += 1
      return network.down ? Promise.reject(new Error('the list’s chunk did not load')) : actual.loadUnitList()
    },
  }
})

function Where() {
  const { pathname, search } = useLocation()
  return <output data-testid="where">{decodeURIComponent(`${pathname}${search}`)}</output>
}

function renderSection(url) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="*" element={<ExplorerProvider routeBlock={null}><ExplorerSection /><Where /></ExplorerProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}

const tab = (name) => screen.getByRole('tab', { name })
const panel = (view) => document.querySelector(`section#explorer .views > [data-view="${view}"]`)
const where = () => screen.getByTestId('where').textContent

let consoleError
beforeEach(() => {
  availability = snapshotAvailability()
  network.down = true
  network.loads = 0
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('a list that does not load', () => {
  it('goes back to „Визуално“ on a ?view=list landing, and a later switch tries again', async () => {
    renderSection('/projects/golden-residence?view=list')

    await waitFor(() => expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true'))
    expect(tab('По критерии')).toHaveAttribute('aria-selected', 'false')
    expect(where()).toBe('/projects/golden-residence')
    expect(panel('visual').hidden).toBe(false)
    expect(panel('list').hidden).toBe(true)
    expect(panel('list')).toBeEmptyDOMElement()
    expect(network.loads).toBe(1)
    expect(consoleError).toHaveBeenCalledWith('[explorer] the list did not load:', expect.any(Error))

    network.down = false
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(network.loads).toBe(2)
    expect(where()).toBe('/projects/golden-residence?view=list')
    expect(within(panel('list')).getByRole('group', { name: 'Статус' })).toBeInTheDocument()
  })

  // A switch from „Визуално“ waits for the list before the tab changes: one
  // that fails changes nothing, and the next one tries again.
  it('stays on „Визуално“ when a switch’s list fails, and loads it on the next', async () => {
    renderSection('/projects/golden-residence')
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1))
    expect(tab('Визуално')).toHaveAttribute('aria-selected', 'true')
    expect(where()).toBe('/projects/golden-residence')

    network.down = false
    fireEvent.click(tab('По критерии'))
    await waitFor(() => expect(tab('По критерии')).toHaveAttribute('aria-selected', 'true'))
    expect(network.loads).toBe(2)
  })
})
