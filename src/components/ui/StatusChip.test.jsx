import { render, screen } from '@testing-library/react'
import StatusChip from './StatusChip'

// StatusChip (spec §7.9, Ruling R1): the status's 16 px swatch, with its
// pattern and glyph, and its label. Colour never stands alone: the label is
// always there.

const chipOf = (label) => screen.getByText(label)

test.each([
  ['available', 'Свободен', 'sw--free'],
  ['reserved', 'Резервиран', 'sw--reserved'],
  ['sold', 'Продаден', 'sw--sold'],
  ['blocked', 'Блокиран', 'sw--blocked'],
])('%s reads „%s“ beside its swatch (%s)', (status, label, look) => {
  render(<StatusChip status={status} />)
  const chip = chipOf(label)
  expect(chip).toHaveTextContent(new RegExp(`^${label}$`))
  expect(chip).toHaveClass('st')
  const swatch = chip.querySelector('.sw')
  expect(swatch).toHaveClass(look)
  expect(swatch).toHaveAttribute('data-status', status)
  expect(swatch).toHaveAttribute('aria-hidden', 'true')
})

test('unknown reads „Няма информация“ beside the blocked look', () => {
  render(<StatusChip status="unknown" />)
  const swatch = chipOf('Няма информация').querySelector('.sw')
  expect(swatch).toHaveClass('sw--blocked')
  expect(swatch).toHaveAttribute('data-status', 'unknown')
})

// Ruling R1: an unknown status shows the text the owner wrote in the sheet
// (the unit's statusText), as production does.
test('unknown shows the unit’s own status text when it is given', () => {
  render(<StatusChip status="unknown" text="Скоро" />)
  expect(screen.getByText('Скоро')).toBeInTheDocument()
  expect(screen.queryByText('Няма информация')).toBeNull()
})

test('unknown with blank text falls back to „Няма информация“', () => {
  render(<StatusChip status="unknown" text="  " />)
  expect(screen.getByText('Няма информация')).toBeInTheDocument()
})

test('a known status keeps its own label whatever the text', () => {
  render(<StatusChip status="sold" text="Продадени" />)
  expect(screen.getByText('Продаден')).toBeInTheDocument()
  expect(screen.queryByText('Продадени')).toBeNull()
})

test('a value outside the five, a name on Object.prototype included, reads as unknown', () => {
  render(<><StatusChip status="constructor" /><StatusChip status={undefined} text="В строеж" /></>)
  expect(screen.getByText('Няма информация')).toBeInTheDocument()
  expect(screen.getByText('В строеж')).toBeInTheDocument()
})
