import { render, screen } from '@testing-library/react'
import TracerPage from './TracerPage'

test('tracer renders mode buttons and empty state', () => {
  render(<TracerPage />)
  expect(screen.getByText('draw')).toBeInTheDocument()
  expect(screen.getByText('band')).toBeInTheDocument()
  expect(screen.getByText(/Изберете изображение/)).toBeInTheDocument()
})

// The panel is a flex column as tall as the screen, which scrolls: its own
// scroll boxes, the shapes list and the map JSON, keep their heights on a
// short window rather than shrink first (final review, W18).
test('keeps the panel’s scroll boxes from shrinking in its column', () => {
  render(<TracerPage />)
  const panel = screen.getByPlaceholderText('map JSON').parentElement
  expect(panel).toHaveClass('flex-col', 'overflow-y-auto')
  const boxes = [...panel.children].filter((child) => child.tagName === 'TEXTAREA' || child.classList.contains('overflow-y-auto'))
  expect(boxes).toHaveLength(2)
  for (const box of boxes) expect(box).toHaveClass('shrink-0')
})
