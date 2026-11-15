import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import StatusCount from './StatusCount'

// A count of one status (spec §7.9): the swatch, then „n word“, the word
// singular only for 1; `—` until the count is known.

const text = (element) => element.textContent.replace(/\s+/g, ' ').trim()
const countOf = (status, count) => render(<StatusCount status={status} count={count} />).container.firstElementChild

it.each([
  ['available', 1, '1 свободен'],
  ['available', 2, '2 свободни'],
  ['available', 0, '0 свободни'],
  ['reserved', 1, '1 резервиран'],
  ['sold', 115, '115 продадени'],
  ['blocked', 1, '1 блокиран'],
  ['blocked', 0, '0 блокирани'],
])('%s %i reads „%s“', (status, count, words) => {
  const element = countOf(status, count)
  expect(text(element)).toBe(words)
  expect(element).toHaveClass('st')
  expect(element.querySelector('b')).toHaveTextContent(new RegExp(`^${count}$`))
  expect(element.querySelector('.sw')).toHaveAttribute('data-status', status)
})

it('reads „—“ until the count is known', () => {
  expect(text(countOf('available', null))).toBe('— свободни')
  expect(text(countOf('sold', undefined))).toBe('— продадени')
})
