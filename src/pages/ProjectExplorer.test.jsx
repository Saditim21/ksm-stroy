import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'

// No network in tests — every fetch returns null so the context uses fallback data.
vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 96, available: 60, reserved: 6, sold: 30 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider } from '../context/ApartmentContext'
import ProjectExplorer from './ProjectExplorer'

// Stands in for the browser Back button inside MemoryRouter.
function BackButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>назад-в-историята</button>
}

function renderAt(path, { history = [path], index } = {}) {
  return render(
    <ApartmentProvider>
      <MemoryRouter initialEntries={history} initialIndex={index ?? history.length - 1}>
        <BackButton />
        <Routes>
          <Route path="/projects" element={<div>Списък проекти</div>} />
          <Route path="/projects/golden-residence/:block" element={<ProjectExplorer projectId="golden-residence" />} />
          <Route path="/projects/mnogofamilna-sgrada/:block" element={<ProjectExplorer projectId="mnogofamilna-sgrada" />} />
        </Routes>
      </MemoryRouter>
    </ApartmentProvider>,
  )
}

const floorButtons = () => screen.queryAllByText(/^Етаж \d+$/)

test('Golden Residence facade view lists 8 floors and renders the render image', async () => {
  const { container } = renderAt('/projects/golden-residence/block-a')
  await waitFor(() => expect(floorButtons()).toHaveLength(8))

  const img = container.querySelector('img')
  expect(img).toBeInTheDocument()
  expect(img.getAttribute('src')).toContain('building-2.webp')
  // 16 traced facade bands (2 blocks x 8 floors)
  expect(container.querySelectorAll('svg polygon')).toHaveLength(16)
  expect(screen.getByText('Блок А')).toBeInTheDocument()
})

test('Golden Residence shows garage and parking grids on the facade view', async () => {
  renderAt('/projects/golden-residence/block-a')
  await waitFor(() => expect(floorButtons()).toHaveLength(8))
  expect(screen.getByText(/Гаражи/)).toBeInTheDocument()
  expect(screen.getByText('Паркоместа')).toBeInTheDocument()
})

test('?floor=N opens the floor view with the plan and the unit list', async () => {
  renderAt('/projects/golden-residence/block-a?floor=3')
  await waitFor(() => expect(screen.getByAltText('Архитектурен план')).toBeInTheDocument())
  expect(screen.getByRole('heading', { name: 'Етаж 3' })).toBeInTheDocument()
  // once in the sidebar list, once as the label on the plan polygon
  expect(screen.getAllByText('А 301')).toHaveLength(2)
})

test('Многофамилна facade lists floors 2–10 and has no garage grids', async () => {
  renderAt('/projects/mnogofamilna-sgrada/block-a')
  await waitFor(() => expect(floorButtons()).toHaveLength(9))
  expect(floorButtons()[0]).toHaveTextContent('Етаж 10')
  expect(screen.queryByText('Паркоместа')).not.toBeInTheDocument()
})

test('Многофамилна floor 10 resolves units А-901… via the unitFloor offset', async () => {
  renderAt('/projects/mnogofamilna-sgrada/block-a?floor=10')
  await waitFor(() => expect(screen.getByAltText('Архитектурен план')).toBeInTheDocument())
  expect(screen.getAllByText('А-901')).toHaveLength(2)
  expect(screen.queryAllByText('—')).toHaveLength(0)
})

test('an unknown block redirects to the projects list', async () => {
  renderAt('/projects/golden-residence/block-z')
  await waitFor(() => expect(screen.getByText('Списък проекти')).toBeInTheDocument())
})

// Regression: summing every sheet key meant Многофамилна сграда counted the 7
// garage/parking rows under key 0 as apartments (151 instead of 144,
// +5 free / +2 sold).
test('header stats count only apartments on configured floors', async () => {
  renderAt('/projects/mnogofamilna-sgrada/block-a')
  await waitFor(() => expect(floorButtons()).toHaveLength(9))

  const statsBar = screen.getByText('общо 144').parentElement
  expect(within(statsBar).getByText('16')).toBeInTheDocument() // свободни
  expect(within(statsBar).getByText('6')).toBeInTheDocument() // резервирани
  expect(within(statsBar).getByText('122')).toBeInTheDocument() // продадени
  // the garage rows on floor key 0 must not leak into the counters
  expect(screen.queryByText('общо 151')).not.toBeInTheDocument()
})

// Regression: the selection only cleared through "Всички етажи", so a browser
// Back — or jumping to another floor — left the drawer showing a unit that is
// no longer on screen.
test('the apartment drawer closes when the floor changes or Back is pressed', async () => {
  renderAt('/projects/golden-residence/block-a?floor=3', {
    history: ['/projects/golden-residence/block-a', '/projects/golden-residence/block-a?floor=3'],
  })
  await waitFor(() => expect(screen.getByAltText('Архитектурен план')).toBeInTheDocument())

  fireEvent.click(screen.getByRole('button', { name: /А 301/ }))
  expect(screen.getByText('Изпратете запитване')).toBeInTheDocument()

  // browser Back -> facade; the drawer must not survive it
  fireEvent.click(screen.getByText('назад-в-историята'))
  await waitFor(() => expect(floorButtons()).toHaveLength(8))
  await waitFor(() => expect(screen.queryByText('Изпратете запитване')).not.toBeInTheDocument())

  // and opening another floor must not resurrect the previous selection
  fireEvent.click(screen.getByText('Етаж 5').closest('button'))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Етаж 5' })).toBeInTheDocument())
  expect(screen.queryByText('Изпратете запитване')).not.toBeInTheDocument()
  expect(screen.queryByText('А 301')).not.toBeInTheDocument()
})
