import { render, screen, waitFor } from '@testing-library/react'
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
import Home from './Home'

// whileInView (DimensionLine, Reveal) and AnimatedNumber observe intersections —
// jsdom has no IntersectionObserver, so stub it as the other suites do.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

const renderHome = () =>
  render(
    <MemoryRouter>
      <ApartmentProvider><Home /></ApartmentProvider>
    </MemoryRouter>,
  )

test('hero leads with the live availability thesis', async () => {
  renderHome()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Изберете своя дом')
  await waitFor(() => expect(screen.getByText(/свободни апартамента/)).toBeInTheDocument())
})

test('both project cards link to their pages with live counts', async () => {
  renderHome()
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /Golden Residence/i })).toHaveAttribute('href', '/projects/golden-residence')
  })
  expect(screen.getByRole('link', { name: /Многофамилна/i })).toHaveAttribute('href', '/projects/mnogofamilna-sgrada')
})

test('primary CTA goes to Продажби', () => {
  renderHome()
  expect(screen.getByRole('link', { name: 'Разгледайте сградите' })).toHaveAttribute('href', '/projects')
})
