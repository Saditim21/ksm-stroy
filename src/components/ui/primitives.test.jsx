import { render, screen } from '@testing-library/react'
import { MemoryRouter, Link } from 'react-router-dom'
import DimensionLine from './DimensionLine'
import DisplayHeading from './DisplayHeading'
import Reveal from './Reveal'
import AnimatedNumber from './AnimatedNumber'
import Button from './Button'

test('DimensionLine renders eyebrow label and rule with end ticks', () => {
  const { container } = render(<DimensionLine label="Продажби" />)
  expect(screen.getByText('Продажби')).toBeInTheDocument()
  expect(container.querySelectorAll('[data-tick]')).toHaveLength(2)
  expect(container.querySelector('[data-rule]')).toBeInTheDocument()
})

test('DisplayHeading renders requested tag with display font class', () => {
  render(<DisplayHeading as="h1" size="hero">Изберете своя <em>дом</em></DisplayHeading>)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.className).toMatch(/font-display/)
  expect(h1.querySelector('em')).toHaveTextContent('дом')
})

test('Reveal renders children', () => {
  render(<Reveal><p>съдържание</p></Reveal>)
  expect(screen.getByText('съдържание')).toBeInTheDocument()
})

test('AnimatedNumber shows the final value', async () => {
  render(<AnimatedNumber value={128} />)
  expect(await screen.findByText('128')).toBeInTheDocument()
})

test('Button variants render as link or button with gold styling', () => {
  render(
    <MemoryRouter>
      <Button as={Link} to="/projects" variant="gold">Разгледайте сградите</Button>
    </MemoryRouter>,
  )
  const link = screen.getByRole('link', { name: 'Разгледайте сградите' })
  expect(link).toHaveAttribute('href', '/projects')
  expect(link.className).toMatch(/bg-gold-accent/)
  render(<Button variant="ghost">Още</Button>)
  expect(screen.getByRole('button', { name: 'Още' }).className).toMatch(/border-concrete|border-ink/)
})
