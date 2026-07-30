import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ApartmentPanel from './ApartmentPanel'

const apartment = {
  apartment: 'А 301', вид: '2-стаен', built: '54.36', ideal: '7.82',
  total: '62.18', изложение: 'Юг', status: 'Свободен', цена: '',
}
const renderPanel = (apt) => render(<MemoryRouter><ApartmentPanel apartment={apt} onClose={() => {}} /></MemoryRouter>)

test('renders apartment details and status badge', () => {
  renderPanel(apartment)
  expect(screen.getByText('А 301')).toBeInTheDocument()
  expect(screen.getByText('2-стаен')).toBeInTheDocument()
  expect(screen.getByText(/62\.18/)).toBeInTheDocument()
  expect(screen.getByText('Юг')).toBeInTheDocument()
  expect(screen.getByText('Свободен')).toBeInTheDocument()
})

test('CTA links to contact with encoded apartment id', () => {
  renderPanel(apartment)
  expect(screen.getByRole('link', { name: /запитване/i }))
    .toHaveAttribute('href', '/contact?apartment=%D0%90%20301')
})

test('price row only when цена present', () => {
  renderPanel(apartment)
  expect(screen.queryByText(/Цена/)).not.toBeInTheDocument()
  renderPanel({ ...apartment, цена: '95 000 €' })
  expect(screen.getByText('95 000 €')).toBeInTheDocument()
})

test('renders nothing without apartment', () => {
  const { container } = renderPanel(null)
  expect(container).toBeEmptyDOMElement()
})
