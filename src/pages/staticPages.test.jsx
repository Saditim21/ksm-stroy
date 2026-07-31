import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from './About'
import Blog from './Blog'
import { blogPosts } from '../data/blogData'

// whileInView (DimensionLine, Reveal) and AnimatedNumber observe intersections —
// jsdom has no IntersectionObserver by default; src/test/setup.js already stubs
// a no-op globally, so no per-file setup is needed here (neither page pulls
// useSiteAvailability/ApartmentProvider, unlike Home/Projects).

test('About opens with the "Строим от" thesis', () => {
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Строим от')
})

test('Blog leads with the "Новини от" heading', () => {
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Новини от')
})

test('Blog renders posts sourced from blogData.js', () => {
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>,
  )
  expect(screen.getByText(blogPosts[0].title)).toBeInTheDocument()
})
