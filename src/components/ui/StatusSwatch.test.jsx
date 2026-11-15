import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import StatusSwatch, { StatusGlyph } from './StatusSwatch'

// A status's swatch (spec §7.9; the concept's core.js:24-29 and
// diptych.css:255-270): 16 × 16, its colour with a pattern and a 10 × 10
// glyph, never colour alone. Decoration beside a word, so hidden from
// assistive technology.

const swatchOf = (status) => render(<StatusSwatch status={status} />).container.firstElementChild

it.each([
  ['available', 'sw--free', 'M1.6 5.3l2.2 2.2 4.6-4.9'],
  ['reserved', 'sw--reserved', 'M5 2.9v2.3l1.6 1'],
  ['sold', 'sw--sold', 'M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4'],
  ['blocked', 'sw--blocked', 'M2 5h6'],
])('draws %s as its look (%s) and its glyph, one path', (status, look, d) => {
  const swatch = swatchOf(status)

  expect(swatch).toHaveClass('sw', look)
  expect(swatch).toHaveAttribute('data-status', status)
  expect(swatch).toHaveAttribute('aria-hidden', 'true')
  const svg = swatch.querySelector('svg')
  expect(svg).toHaveAttribute('viewBox', '0 0 10 10')
  const paths = svg.querySelectorAll('path')
  expect(paths).toHaveLength(1)
  expect(paths[0]).toHaveAttribute('d', d)
})

it('draws the reserved clock’s face as a circle of r 3.7', () => {
  expect(swatchOf('reserved').querySelector('circle')).toHaveAttribute('r', '3.7')
})

// Spec §7.9: unknown looks blocked.
it('draws unknown, and a value outside the five, as blocked', () => {
  const unknown = swatchOf('unknown')
  expect(unknown).toHaveClass('sw--blocked')
  expect(unknown).toHaveAttribute('data-status', 'unknown')
  expect(unknown.querySelector('path')).toHaveAttribute('d', 'M2 5h6')
  expect(swatchOf('constructor')).toHaveAttribute('data-status', 'unknown')
})

// The facade's rails mark a floor with the bare glyph (spec §7.2).
it('gives the bare glyph for a rail', () => {
  const { container } = render(<StatusGlyph status="sold" className="g" />)
  const svg = container.firstElementChild
  expect(svg).toHaveClass('g')
  expect(svg).toHaveAttribute('aria-hidden', 'true')
  expect(svg.querySelector('path')).toHaveAttribute('d', 'M2.6 2.6l4.8 4.8M7.4 2.6L2.6 7.4')
})
