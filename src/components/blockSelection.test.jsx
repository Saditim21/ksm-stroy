import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => mockNavigate,
}))

import GoldenResidenceBlockSelection from './GoldenResidenceBlockSelection'
import MnogofamilnaBlockSelection from './MnogofamilnaBlockSelection'

// whileInView (Reveal, DimensionLine) needs IntersectionObserver, which jsdom lacks.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = NoopIntersectionObserver
globalThis.IntersectionObserver = NoopIntersectionObserver

beforeEach(() => {
  mockNavigate.mockClear()
})

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('GoldenResidenceBlockSelection', () => {
  test('renders both block panels', () => {
    renderWithRouter(<GoldenResidenceBlockSelection />)
    expect(screen.getByRole('button', { name: /Разгледайте Блок А/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Разгледайте Блок Б/ })).toBeInTheDocument()
  })

  test('clicking the block A panel navigates to /projects/golden-residence/block-a', () => {
    renderWithRouter(<GoldenResidenceBlockSelection />)
    fireEvent.click(screen.getByRole('button', { name: /Разгледайте Блок А/ }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects/golden-residence/block-a')
  })

  test('Enter key on the focused block A panel navigates to block-a', () => {
    renderWithRouter(<GoldenResidenceBlockSelection />)
    const panel = screen.getByRole('button', { name: /Разгледайте Блок А/ })
    panel.focus()
    fireEvent.keyDown(panel, { key: 'Enter' })
    expect(mockNavigate).toHaveBeenCalledWith('/projects/golden-residence/block-a')
  })

  test('Space key on the focused block B panel navigates to block-b', () => {
    renderWithRouter(<GoldenResidenceBlockSelection />)
    const panel = screen.getByRole('button', { name: /Разгледайте Блок Б/ })
    panel.focus()
    fireEvent.keyDown(panel, { key: ' ' })
    expect(mockNavigate).toHaveBeenCalledWith('/projects/golden-residence/block-b')
  })

  test('heading reads Изберете блок', () => {
    renderWithRouter(<GoldenResidenceBlockSelection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Изберете')
    expect(heading.querySelector('em')).toHaveTextContent('блок')
  })
})

describe('MnogofamilnaBlockSelection', () => {
  test('renders both block panels', () => {
    renderWithRouter(<MnogofamilnaBlockSelection />)
    expect(screen.getByRole('button', { name: /Разгледайте Блок А/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Разгледайте Блок Б/ })).toBeInTheDocument()
  })

  test('clicking the block A panel navigates to /projects/mnogofamilna-sgrada/block-a', () => {
    renderWithRouter(<MnogofamilnaBlockSelection />)
    fireEvent.click(screen.getByRole('button', { name: /Разгледайте Блок А/ }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects/mnogofamilna-sgrada/block-a')
  })

  test('Enter key on the focused block A panel navigates to block-a', () => {
    renderWithRouter(<MnogofamilnaBlockSelection />)
    const panel = screen.getByRole('button', { name: /Разгледайте Блок А/ })
    panel.focus()
    fireEvent.keyDown(panel, { key: 'Enter' })
    expect(mockNavigate).toHaveBeenCalledWith('/projects/mnogofamilna-sgrada/block-a')
  })

  test('Space key on the focused block B panel navigates to block-b', () => {
    renderWithRouter(<MnogofamilnaBlockSelection />)
    const panel = screen.getByRole('button', { name: /Разгледайте Блок Б/ })
    panel.focus()
    fireEvent.keyDown(panel, { key: ' ' })
    expect(mockNavigate).toHaveBeenCalledWith('/projects/mnogofamilna-sgrada/block-b')
  })

  test('heading reads Изберете вход', () => {
    renderWithRouter(<MnogofamilnaBlockSelection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Изберете')
    expect(heading.querySelector('em')).toHaveTextContent('вход')
  })
})
