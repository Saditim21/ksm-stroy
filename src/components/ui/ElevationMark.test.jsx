import { render, screen } from '@testing-library/react'
import ElevationMark from './ElevationMark'

// The elevation mark (spec §3.3): an SVG ▽ (in neither font), „етаж n“, and the
// кота only where the drawings give one (Golden Residence А1 is +3,06).

test('floor 1 at +3,06', () => {
  const { container } = render(<ElevationMark floor={1} elevation={3.06} />)
  expect(screen.getByText('етаж 1')).toBeInTheDocument()
  expect(screen.getByText('кота +3,06')).toBeInTheDocument()
  const mark = container.querySelector('svg')
  expect(mark).toHaveAttribute('aria-hidden', 'true')
  expect(mark).toHaveAttribute('focusable', 'false')
})

test('no elevation, no кота: it is never invented', () => {
  const { container } = render(<ElevationMark floor={8} />)
  expect(container).toHaveTextContent(/^етаж 8$/)
  expect(container.textContent).not.toMatch(/кота/)
})

test('the кота is bg-BG with two decimals', () => {
  render(<><ElevationMark floor={8} elevation={24} /><ElevationMark floor={3} elevation={8.7} /></>)
  expect(screen.getByText('кота +24,00')).toBeInTheDocument()
  expect(screen.getByText('кота +8,70')).toBeInTheDocument()
})

// scripts/fonts/REPORT.md: the display face's + ± − are light strokes.
test('the кота is set in the text face whatever the row’s face', () => {
  render(<ElevationMark floor={1} elevation={3.06} className="font-display" />)
  expect(screen.getByText('кота +3,06')).toHaveClass('font-text')
})

test('the zero level reads ±0,00 and a level below it −3,00, as on drawings', () => {
  render(<><ElevationMark floor={0} elevation={0} /><ElevationMark floor={-1} elevation={-3} /></>)
  expect(screen.getByText('кота ±0,00')).toBeInTheDocument()
  expect(screen.getByText('кота −3,00')).toBeInTheDocument()
})

test('numbers take lining tabular figures, and className reaches the mark', () => {
  const { container } = render(<ElevationMark floor={2} className="text-stone" />)
  expect(container.firstChild).toHaveClass('nums', 'text-stone')
})
