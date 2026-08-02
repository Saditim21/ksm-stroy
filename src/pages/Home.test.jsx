import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Controllable useReducedMotion: framer-motion's real hook lazily caches a
// matchMedia read jsdom doesn't implement, so mocking the hook is the
// deterministic per-test knob (same pattern as CineSlider.test.jsx). It
// defaults to false, i.e. the animated path every other test here exercises.
let mockReduced = false
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useReducedMotion: () => mockReduced }
})

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

beforeEach(() => {
  mockReduced = false
})

test('hero leads with the live availability thesis', async () => {
  renderHome()
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1).toHaveTextContent('Изберете своя дом')
  // Split into masked word runs, but still exactly one gold accent.
  expect(h1.querySelectorAll('span.overflow-hidden').length).toBeGreaterThan(0)
  expect(h1.querySelectorAll('em')).toHaveLength(1)
  await waitFor(() => expect(screen.getByText(/свободни апартамента/)).toBeInTheDocument())
})

// Regression: SplitLines' animated path ends every word with a nbsp, its
// plain-text fallback does not — the accent has to bring its own separator or
// the reduced-motion headline reads "своя дометаж по етаж" (seen in Chrome).
test('reduced motion renders the headline as plain, correctly spaced text', () => {
  mockReduced = true
  renderHome()
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.textContent.replace(/\s+/g, ' ')).toBe('Изберете своя дом етаж по етаж.')
  expect(h1.querySelectorAll('span.overflow-hidden')).toHaveLength(0)
  expect(h1.querySelectorAll('em')).toHaveLength(1)
})

// CineSlider keeps only the active slide mounted, so the three production
// images can only be proven one autoplay tick at a time. Fake timers step the
// 6500ms interval; the alts double as the accessible names of each render.
test('the hero slider cycles through all three production slides', () => {
  vi.useFakeTimers()
  try {
    renderHome()
    expect(screen.getByAltText('Многофамилна жилищна сграда')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(6500)
    })
    expect(screen.getByAltText('Golden Residence')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(6500)
    })
    expect(screen.getByAltText('Голдън Резиденс')).toBeInTheDocument()
  } finally {
    vi.useRealTimers()
  }
})

test('the marquee strip runs between the projects duo and the services grid', () => {
  renderHome()
  // Two copies are laid out back-to-back for the seamless loop; the second is
  // aria-hidden, so asserting on the first is enough.
  const strip = screen.getAllByText(/Голдън Резиденс · Многофамилна сграда · София · КСМ Строй ·/)[0]
  expect(strip).toBeInTheDocument()

  const services = document.querySelector('#services-section')
  const projectsLink = screen.getByRole('link', { name: /Golden Residence/i })
  expect(services.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  expect(projectsLink.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

// Two of the three service photos are the same files the hero reel uses, so
// they get the hero's /public 640/1024/1600 ladder instead of the bundled
// desktop originals (001.webp 172KB, photo-4.webp 220KB) — a phone was
// downloading a full-width frame for a card that is a third of a desktop row.
// 003.webp has no ladder generated, so it stays a plain bundled src.
test('the two service photos that have a responsive ladder use it, at services-grid sizes', () => {
  renderHome()
  const withLadder = ['Жилищно Строителство', 'Ремонти и Реновация']
  withLadder.forEach((title) => {
    const img = screen.getByAltText(title)
    expect(img.getAttribute('srcset')).toMatch(/640w/)
    expect(img.getAttribute('srcset')).toMatch(/1024w/)
    expect(img.getAttribute('sizes')).toBe('(max-width: 768px) 100vw, 33vw')
    expect(img.getAttribute('src')).toMatch(/^\/images\/home\//)
  })

  const noLadder = screen.getByAltText('Комерсиално Строителство')
  expect(noLadder.getAttribute('srcset')).toBeNull()
  expect(noLadder.getAttribute('src')).toBeTruthy()
})
