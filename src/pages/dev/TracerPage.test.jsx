import { render, screen } from '@testing-library/react'
import TracerPage from './TracerPage'

test('tracer renders mode buttons and empty state', () => {
  render(<TracerPage />)
  expect(screen.getByText('draw')).toBeInTheDocument()
  expect(screen.getByText('band')).toBeInTheDocument()
  expect(screen.getByText(/Изберете изображение/)).toBeInTheDocument()
})
