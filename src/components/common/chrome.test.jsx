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

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

test('navbar renders all primary links', () => {
  wrap(<Navbar />)
  for (const label of ['Начало', 'За нас', 'Продажби', 'Контакти']) {
    expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
  }
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

test('footer shows brand, navigation and current year', () => {
  wrap(<Footer />)
  expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument()
  expect(screen.getByText('Навигация')).toBeInTheDocument()
  expect(screen.getByText('Контакти')).toBeInTheDocument()
})
