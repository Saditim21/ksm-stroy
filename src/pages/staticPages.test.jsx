import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from './About'
import Blog from './Blog'
import slider01 from '../assets/images/slider01.webp'
import slider02 from '../assets/images/slider02.webp'
import slider03 from '../assets/images/slider03.webp'

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

// CineSlider keeps only the active slide mounted at rest, so its three images
// can only be proven one autoplay tick at a time (same pattern as
// Home.test.jsx's hero-slider test). All three slides share one alt (pure
// imagery, no captions) — and mid-crossfade the exiting slide is still in the
// DOM under fake timers (its exit animation never resolves) — so assert by
// src among all alt matches rather than assuming a single element.
test('About renders the cinematic slider cycling through all 3 slide images', () => {
  vi.useFakeTimers()
  try {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )
    const alt = 'КСМ Строй — обекти'
    const hasSrc = (src) => screen.getAllByAltText(alt).some((img) => img.getAttribute('src') === src)

    expect(hasSrc(slider01)).toBe(true)
    act(() => {
      vi.advanceTimersByTime(5500)
    })
    expect(hasSrc(slider02)).toBe(true)
    act(() => {
      vi.advanceTimersByTime(5500)
    })
    expect(hasSrc(slider03)).toBe(true)
  } finally {
    vi.useRealTimers()
  }
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
