import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../services/googleSheets', () => ({
  fetchApartmentData: vi.fn(async () => null),
  fetchGarageData: vi.fn(async () => null),
  calculateStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  calculateGarageStats: vi.fn(() => ({ total: 0, available: 0, reserved: 0, sold: 0 })),
  clearCache: vi.fn(),
}))

import { ApartmentProvider } from '../context/ApartmentContext'
import Projects from './Projects'

// whileInView (DimensionLine, Reveal) and AnimatedNumber observe intersections —
// jsdom has no IntersectionObserver, so stub it as the other suites do.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

const renderProjects = () =>
  render(
    <MemoryRouter>
      <ApartmentProvider><Projects /></ApartmentProvider>
    </MemoryRouter>,
  )

test('the landing heading leads with Изберете сграда', () => {
  renderProjects()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Изберете')
})

test('both project names render', () => {
  renderProjects()
  expect(screen.getByText('Многофамилна жилищна сграда')).toBeInTheDocument()
  expect(screen.getByText('Golden Residence')).toBeInTheDocument()
})

test('both panels expose a Разгледайте сградата button', () => {
  renderProjects()
  const buttons = screen.getAllByRole('button', { name: 'Разгледайте сградата' })
  expect(buttons).toHaveLength(2)
})
