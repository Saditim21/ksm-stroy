import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Button from './Button'

// Button (plan Task 7): a router Link for `to`, an anchor for `href`, a
// <button> otherwise; primary ink on paper and paper on dusk, secondary a 1 px
// border in the text colour, the 2 px ui radius and a 44 px touch target.

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

test('to renders a router link; its name is its text, the drawn arrow is hidden', () => {
  inRouter(<Button to="/contact" arrow>Запитване</Button>)
  const link = screen.getByRole('link', { name: 'Запитване' })
  expect(link).toHaveAttribute('href', '/contact')
  const arrow = link.querySelector('svg')
  expect(arrow).toHaveAttribute('aria-hidden', 'true')
  expect(arrow).toHaveAttribute('focusable', 'false')
})

test('href renders a plain anchor, for tel: and other pages', () => {
  render(<Button href="tel:+359887886166" variant="secondary">Обадете се</Button>)
  expect(screen.getByRole('link', { name: 'Обадете се' })).toHaveAttribute('href', 'tel:+359887886166')
})

test('without to or href it is a button of type "button", or the type it is given', () => {
  const { rerender } = render(<Button>Покажи</Button>)
  expect(screen.getByRole('button', { name: 'Покажи' })).toHaveAttribute('type', 'button')
  rerender(<Button type="submit">Изпратете запитване</Button>)
  expect(screen.getByRole('button', { name: 'Изпратете запитване' })).toHaveAttribute('type', 'submit')
})

test('draws no arrow unless asked', () => {
  render(<Button>Покажи</Button>)
  expect(screen.getByRole('button').querySelector('svg')).toBeNull()
})

test.each([
  ['primary', 'paper', ['bg-ink', 'text-paper']],
  ['primary', 'dusk', ['bg-paper', 'text-ink']],
  ['secondary', 'paper', ['border', 'border-current', 'text-ink']],
  ['secondary', 'dusk', ['border', 'border-current', 'text-paper']],
])('%s on %s', (variant, tone, classes) => {
  render(<Button variant={variant} tone={tone}>Запитване</Button>)
  expect(screen.getByRole('button')).toHaveClass(...classes)
})

// The focus ring is the ground's text colour (decision of 2026-11-14): ink on
// paper and paper on dusk. A filled primary button's own label is the
// opposite colour, so a ring in currentColor vanished into the ground around
// it. Under forced colours the ring is the system's Highlight.
test.each([
  ['primary', 'paper', 'focus-visible:outline-ink'],
  ['primary', 'dusk', 'focus-visible:outline-paper'],
  ['secondary', 'paper', 'focus-visible:outline-ink'],
  ['secondary', 'dusk', 'focus-visible:outline-paper'],
  ['quiet', 'paper', 'focus-visible:outline-ink'],
  ['quiet', 'dusk', 'focus-visible:outline-paper'],
])('%s on %s takes its focus ring from the ground: %s', (variant, tone, ring) => {
  render(<Button variant={variant} tone={tone}>Запитване</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveClass(ring, 'forced-colors:focus-visible:outline-[color:Highlight]')
  expect(button.className).not.toMatch(tone === 'paper' ? /outline-paper/ : /outline-ink/)
})

test('primary on paper is the default', () => {
  render(<Button>Запитване</Button>)
  expect(screen.getByRole('button')).toHaveClass('bg-ink', 'text-paper')
})

test('quiet carries no ground and no border', () => {
  render(<Button variant="quiet">Вижте свободните на етажа</Button>)
  const button = screen.getByRole('button')
  expect(button.className).not.toMatch(/\bbg-|\bborder\b/)
})

test.each(['primary', 'secondary', 'quiet'])('%s has the ui radius and a 44 px minimum height', (variant) => {
  render(<Button variant={variant}>Запитване</Button>)
  expect(screen.getByRole('button')).toHaveClass('rounded-ui', 'min-h-[44px]')
})

test('passes className and other props through', () => {
  render(<Button href="/eu/plakat-ksm-stroy-a3.pdf" download className="w-full">Изтегли PDF</Button>)
  const link = screen.getByRole('link', { name: 'Изтегли PDF' })
  expect(link).toHaveClass('w-full')
  expect(link).toHaveAttribute('download')
})
