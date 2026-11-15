import { render, screen, within } from '@testing-library/react'
import StatusLegend from './StatusLegend'

// The key to the status looks (spec §7.9): labels only, in the order
// available, reserved, sold, blocked; `statuses` picks others.

test('defaults to the four known statuses, in their order', () => {
  render(<StatusLegend />)
  const legend = screen.getByRole('list', { name: 'Легенда' })
  expect(within(legend).getAllByRole('listitem').map((item) => item.textContent))
    .toEqual(['Свободен', 'Резервиран', 'Продаден', 'Блокиран'])
  expect(legend.textContent.replace(/\s+/g, ' ').trim()).toBe('Свободен Резервиран Продаден Блокиран')
  expect(legend).toHaveClass('legend')
  expect([...legend.querySelectorAll('.sw')].map((swatch) => swatch.dataset.status)).toEqual(['available', 'reserved', 'sold', 'blocked'])
})

test('statuses picks the entries and their order', () => {
  render(<StatusLegend statuses={['sold', 'available']} />)
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Продаден', 'Свободен'])
})
