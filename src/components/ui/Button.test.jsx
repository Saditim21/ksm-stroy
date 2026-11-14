import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Button from './Button'

// Button (spec §6.1): Diptych's actions, the classes of src/styles/diptych.css.
// A router Link for `to`, an anchor for `href`, a <button> otherwise. Outline
// (the default) is a brass border with an ivory label; solid is an ivory fill
// with an onyx label; link is text with a brass underline. `sm` is the small
// size; `arrow` draws an arrow that assistive technology never reads.

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

test('to renders a router link, an outline action of the normal size', () => {
  inRouter(<Button to="/contact">Запитване</Button>)
  const link = screen.getByRole('link', { name: 'Запитване' })
  expect(link).toHaveAttribute('href', '/contact')
  expect(link).toHaveAttribute('data-variant', 'outline')
  expect(link).toHaveAttribute('data-size', 'md')
  expect(link).toHaveClass('btn')
  expect(link).not.toHaveClass('btn--solid', 'btn--sm', 'link')
})

test('href renders a plain anchor, for tel:, mailto: and files', () => {
  render(<Button href="/eu/plakat-ksm-stroy-a3.pdf">Отвори плаката</Button>)
  expect(screen.getByRole('link', { name: 'Отвори плаката' })).toHaveAttribute('href', '/eu/plakat-ksm-stroy-a3.pdf')
})

test('without to or href it is a button of type "button", or the type it is given', () => {
  const { rerender } = render(<Button>Покажи</Button>)
  expect(screen.getByRole('button', { name: 'Покажи' })).toHaveAttribute('type', 'button')
  rerender(<Button type="submit">Изпратете запитване</Button>)
  expect(screen.getByRole('button', { name: 'Изпратете запитване' })).toHaveAttribute('type', 'submit')
})

test('variant="solid" size="sm" is the small ivory fill', () => {
  render(<Button variant="solid" size="sm">Запитване</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'solid')
  expect(button).toHaveAttribute('data-size', 'sm')
  expect(button).toHaveClass('btn', 'btn--solid', 'btn--sm')
})

test('variant="link" is the underlined text action, with no box', () => {
  render(<Button variant="link">Изтегли PDF</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'link')
  expect(button).toHaveClass('link')
  expect(button).not.toHaveClass('btn')
})

test('an unknown variant or size falls back to the outline action of the normal size', () => {
  render(<Button variant="nope" size="xl">Запитване</Button>)
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('data-variant', 'outline')
  expect(button).toHaveAttribute('data-size', 'md')
  expect(button).toHaveClass('btn')
  expect(button).not.toHaveClass('btn--sm')
})

test('a name on Object.prototype is no variant either', () => {
  render(<Button variant="constructor">Запитване</Button>)
  expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')
})

test('arrow draws an arrow hidden from assistive technology; the name stays the text', () => {
  inRouter(<Button to="/projects/golden-residence" arrow>Изберете апартамент</Button>)
  const link = screen.getByRole('link', { name: 'Изберете апартамент' })
  const arrow = link.querySelector('svg[aria-hidden="true"]')
  expect(arrow).not.toBeNull()
  expect(arrow).toHaveClass('arr')
  expect(arrow).toHaveAttribute('focusable', 'false')
})

test('draws no arrow unless asked', () => {
  render(<Button>Покажи</Button>)
  expect(screen.getByRole('button').querySelector('svg')).toBeNull()
})

test('passes className and other props through', () => {
  render(<Button href="/eu/plakat-ksm-stroy-a3.pdf" download className="w-full">Изтегли PDF</Button>)
  const link = screen.getByRole('link', { name: 'Изтегли PDF' })
  expect(link).toHaveClass('btn', 'w-full')
  expect(link).toHaveAttribute('download')
})
