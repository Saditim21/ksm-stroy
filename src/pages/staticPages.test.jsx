import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from './About'
import Blog from './Blog'

// whileInView (DimensionLine, Reveal) and AnimatedNumber observe intersections —
// jsdom has no IntersectionObserver by default; src/test/setup.js already stubs
// a no-op globally, so no per-file setup is needed here (neither page pulls
// useSiteAvailability/ApartmentProvider, unlike Home/Projects).
//
// Blog.jsx is the site's real "Обекти" (completed-projects) gallery — nav
// labels it Обекти — not a text blog. The never-wired blogData.js article
// fixtures were deleted in Task 11.

test('About opens with the "Строим от" thesis', () => {
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Строим от')
})

test('About has "Разгледайте обектите" link pointing to /blog', () => {
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  )
  const link = screen.getByRole('link', { name: /Разгледайте обектите/i })
  expect(link).toHaveAttribute('href', '/blog')
})

test('Blog leads with the "Завършени обекти" heading', () => {
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>,
  )
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1).toHaveTextContent('Завършени')
  expect(h1.querySelector('em')).toHaveTextContent('обекти')
})

test('Blog renders real completed-project titles', () => {
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>,
  )
  expect(screen.getByText('Айвазовски Парк')).toBeInTheDocument()
})
