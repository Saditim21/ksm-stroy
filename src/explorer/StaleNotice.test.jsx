import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import StaleNotice from './StaleNotice'
import { LOADING, snapshotAvailability } from './testing'

// The stale-data notice (spec §9, ruling F15): one component owns its
// condition and its words, for the explorer and for Home's teaser. It shows
// when a Golden Residence slot holds the data built into the site, or the
// store has no data at all; never while the data loads, nor over live data.

let availability
vi.mock('../data/availability/useAvailability', () => ({ useAvailability: () => availability }))

const NOTICE = 'Наличността не се зареди. Показваме последните данни, които имаме; за актуална информация: +359 887 886 166.'
const shown = () => screen.queryByText((_, element) => element?.tagName === 'P' && element.textContent.replace(/\s+/g, ' ') === NOTICE)

beforeEach(() => {
  availability = snapshotAvailability()
})

it('stays away over live data', () => {
  const { container } = render(<StaleNotice />)
  expect(shown()).toBeNull()
  expect(container).toBeEmptyDOMElement()
})

it.each(['block-a', 'block-b', 'garages', 'parking'])('shows when the %s slot is built-in', (slot) => {
  availability = snapshotAvailability({ [slot]: 'built-in' })
  render(<StaleNotice />)
  expect(shown()).toBeInTheDocument()
})

it('shows over the data built into the site, and when there is no data at all', () => {
  availability = { ...snapshotAvailability('built-in'), status: 'fallback' }
  const { unmount } = render(<StaleNotice />)
  expect(shown()).toBeInTheDocument()
  unmount()

  availability = { status: 'error', data: null, origin: null, updatedAt: null }
  render(<StaleNotice />)
  expect(shown()).toBeInTheDocument()
})

// The prerendered page and the read under way have no data yet: `—`, not a
// warning.
it.each([
  ['idle', { ...LOADING, status: 'idle' }],
  ['loading', LOADING],
])('stays away while the store is %s', (_, state) => {
  availability = state
  render(<StaleNotice />)
  expect(shown()).toBeNull()
})

it('links the phone, and takes a class of its section', () => {
  availability = snapshotAvailability({ parking: 'built-in' })
  render(<StaleNotice className="explorer__notice" />)
  expect(screen.getByRole('link', { name: '+359 887 886 166' })).toHaveAttribute('href', 'tel:+359887886166')
  expect(shown()).toHaveClass('stale', 'explorer__notice')
})
