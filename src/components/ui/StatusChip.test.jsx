import { render, screen } from '@testing-library/react'
import StatusChip from './StatusChip'

// StatusChip (plan Task 7, Ruling R1): a dot in the status colour and the
// status's label. Colour never stands alone: the label is always there.

const dotOf = (label) => screen.getByText(label).querySelector('[aria-hidden="true"]')

test.each([
  ['available', 'Свободен', 'bg-status-free'],
  ['reserved', 'Резервиран', 'bg-status-reserved'],
  ['sold', 'Продаден', 'bg-status-sold'],
  ['blocked', 'Блокиран', 'bg-status-blocked'],
])('%s reads „%s“ beside a %s dot', (status, label, colour) => {
  render(<StatusChip status={status} />)
  expect(screen.getByText(label)).toHaveTextContent(new RegExp(`^${label}$`))
  expect(dotOf(label)).toHaveClass('rounded-full', colour)
})

test('unknown reads „Няма информация“ beside a hollow dot', () => {
  render(<StatusChip status="unknown" />)
  const dot = dotOf('Няма информация')
  expect(dot).toHaveClass('rounded-full', 'border')
  expect(dot.className).not.toMatch(/bg-status/)
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
