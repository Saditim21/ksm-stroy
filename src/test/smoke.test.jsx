import { render, screen } from '@testing-library/react'

test('test environment renders JSX', () => {
  render(<div>проба</div>)
  expect(screen.getByText('проба')).toBeInTheDocument()
})
