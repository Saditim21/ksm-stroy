import { render, screen } from '@testing-library/react'
import { createRoutesStub } from 'react-router'
import { expect, test } from 'vitest'
import Navbar from './Navbar'

// The prerender renders /about as /about/ (trailing slash) and the browser
// hydrates it at /about. Both must mark the same link active, or the first
// client render differs from the HTML (hydration error #418).
test.each(['/about', '/about/'])('marks За нас as the current page at %s', (url) => {
  const Stub = createRoutesStub([{ path: '/about', Component: Navbar }])
  render(<Stub initialEntries={[url]} />)

  const [desktopLink] = screen.getAllByRole('link', { name: 'За нас' })
  expect(desktopLink).toHaveClass('text-gold-400')
  expect(desktopLink).not.toHaveClass('text-platinum-300')
})
