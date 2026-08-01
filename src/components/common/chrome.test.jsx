import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// Footer renders DimensionLine, which uses framer-motion's whileInView and
// therefore needs IntersectionObserver — absent in jsdom.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = NoopIntersectionObserver
  window.IntersectionObserver = NoopIntersectionObserver
}

const wrap = (ui, initialEntries = ['/']) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)

test('navbar logo carries the prominent gold ring treatment', () => {
  wrap(<Navbar />)
  const logo = screen.getByAltText('KSM Stroy Logo')
  expect(logo.className).toMatch(/ring-2/)
  expect(logo.className).toMatch(/ring-gold-accent\/50/)
  expect(logo.className).toMatch(/hover:ring-gold-accent/)
  expect(logo.className).toMatch(/rounded-full/)
})

test('navbar renders all primary links', () => {
  wrap(<Navbar />)
  for (const label of ['Начало', 'За нас', 'Продажби', 'Контакти']) {
    expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
  }
})

test('navbar links are dark-on-light at scroll-top on non-Home routes', () => {
  wrap(<Navbar />, ['/projects'])
  const link = screen.getAllByRole('link', { name: 'Продажби' })[0]
  expect(link.className).toMatch(/text-ink/)
  expect(link.className).not.toMatch(/text-plaster/)
})

test('navbar links stay light-on-dark at scroll-top on Home', () => {
  wrap(<Navbar />, ['/'])
  const link = screen.getAllByRole('link', { name: 'Продажби' })[0]
  expect(link.className).toMatch(/text-plaster/)
  expect(link.className).not.toMatch(/text-ink/)
})

test('navbar starts transparent and becomes solid after scroll', () => {
  wrap(<Navbar />)
  const nav = screen.getByRole('navigation')
  expect(nav.className).toMatch(/bg-transparent/)
  Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
  fireEvent.scroll(window)
  expect(nav.className).toMatch(/bg-plaster/)
})

test('mobile menu opens with aria-expanded', () => {
  wrap(<Navbar />)
  const burger = screen.getByRole('button', { name: /меню/i })
  expect(burger).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(burger)
  expect(burger).toHaveAttribute('aria-expanded', 'true')
})

test('mobile menu locks body scroll while open and restores it on close', () => {
  document.body.style.overflow = ''
  wrap(<Navbar />)
  const burger = screen.getByRole('button', { name: /меню/i })
  fireEvent.click(burger)
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.click(burger)
  expect(document.body.style.overflow).not.toBe('hidden')
})

test('mobile menu closes on Escape', () => {
  wrap(<Navbar />)
  const burger = screen.getByRole('button', { name: /меню/i })
  fireEvent.click(burger)
  expect(burger).toHaveAttribute('aria-expanded', 'true')
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(burger).toHaveAttribute('aria-expanded', 'false')
})

test('footer shows brand, navigation and current year', () => {
  wrap(<Footer />)
  expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument()
  expect(screen.getByText('Навигация')).toBeInTheDocument()
  expect(screen.getByText('Контакти')).toBeInTheDocument()
})
