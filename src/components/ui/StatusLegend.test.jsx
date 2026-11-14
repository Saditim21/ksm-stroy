import { render, screen, within } from '@testing-library/react'
import StatusLegend from './StatusLegend'

test('defaults to the four known statuses, in their order', () => {
  render(<StatusLegend />)
  const legend = screen.getByRole('list', { name: 'Легенда' })
  expect(within(legend).getAllByRole('listitem').map((item) => item.textContent))
    .toEqual(['Свободен', 'Резервиран', 'Продаден', 'Блокиран'])
})

test('statuses picks the entries and their order', () => {
  render(<StatusLegend statuses={['sold', 'available']} />)
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Продаден', 'Свободен'])
})
