import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { mockMatchMedia } from '../../test/media'
import RollingNumber from './RollingNumber'

// RollingNumber (plan Task 7, spec §5.4): `—` until the count arrives, then
// one digit column per place, each placed on its digit by CSS (--d). It rolls
// only when the value changes after it mounted, the first number after `—`
// included, and never under reduced motion. Screen readers get the plain
// number from an sr-only span.
//
// jsdom has no Web Animations API: these tests give Element.prototype a
// stand-in `animate`, and without matchMedia motion is off.

const srText = (container) => container.querySelector('.sr-only')?.textContent
const columns = (container) => [...container.querySelectorAll('[data-digit]')]
const digitsOf = (container) => columns(container).map((col) => col.style.getPropertyValue('--d'))

let animate
let restoreMedia
beforeEach(() => {
  animate = vi.fn(() => ({ cancel: vi.fn() }))
  Element.prototype.animate = animate
  Element.prototype.getAnimations = () => []
})
afterEach(() => {
  delete Element.prototype.animate
  delete Element.prototype.getAnimations
  restoreMedia?.()
  restoreMedia = undefined
})

const allowMotion = () => { restoreMedia = mockMatchMedia() }
// The keyframes of each roll: where each column's strip starts, relative to
// the digit the column now shows.
const rolls = () => animate.mock.calls.map(([keyframes]) => keyframes[0].transform)

test('null renders `—` at tabular width, and no number for screen readers', () => {
  const { container } = render(<RollingNumber value={null} />)
  expect(container).toHaveTextContent(/^—$/)
  const placeholder = container.querySelector('[data-placeholder]')
  expect(placeholder).toHaveTextContent('—')
  expect(placeholder.closest('.nums')).not.toBeNull()
  expect(placeholder).toHaveClass('min-w-[2ch]')
  expect(srText(container)).toBeUndefined()
})

test('re-rendered with a number, the sr-only span carries the plain value', () => {
  const { container, rerender } = render(<RollingNumber value={null} />)
  rerender(<RollingNumber value={69} />)
  expect(srText(container)).toBe('69')
  expect(digitsOf(container)).toEqual(['6', '9'])
  expect(container.querySelector('[data-placeholder]')).toBeNull()
  // What is drawn is for the eye only.
  expect(columns(container)[0].closest('[aria-hidden="true"]')).not.toBeNull()
})

// The window is a one-digit-tall flex row. Stretched to that height, a column
// would be one digit tall, and its --d tenths would move it by tenths of a
// digit; it must keep the height of its ten digits.
test('the columns keep their full height inside the one-digit window', () => {
  const { container } = render(<RollingNumber value={75} />)
  expect(columns(container)[0].parentElement).toHaveClass('h-[1em]', 'overflow-hidden', 'items-start')
})

test('the page text holds the real number only: the 0–9 strips are drawn by CSS', () => {
  const { container } = render(<RollingNumber value={146} />)
  expect(container.textContent).toBe('146')
  expect(container.querySelectorAll('.roll-strip')).toHaveLength(3)
})

test('under no motion the digits are static: placed on their digits, never animated', () => {
  const { container, rerender } = render(<RollingNumber value={null} />)
  rerender(<RollingNumber value={69} />)
  rerender(<RollingNumber value={70} />)
  expect(digitsOf(container)).toEqual(['7', '0'])
  expect(srText(container)).toBe('70')
  expect(animate).not.toHaveBeenCalled()
})

test('under reduced motion the digits are static too', () => {
  restoreMedia = mockMatchMedia({ reduce: true })
  const { rerender } = render(<RollingNumber value={34} />)
  rerender(<RollingNumber value={37} />)
  expect(animate).not.toHaveBeenCalled()
})

test('with motion, the mount never rolls: a first render is not a change', () => {
  allowMotion()
  render(<RollingNumber value={69} />)
  expect(animate).not.toHaveBeenCalled()
})

test('with motion, the first number after `—` rolls each column in from 0, 60 ms apart', () => {
  allowMotion()
  const { container, rerender } = render(<RollingNumber value={null} />)
  rerender(<RollingNumber value={69} />)
  expect(rolls()).toEqual(['translateY(60%)', 'translateY(90%)'])
  const strips = [...container.querySelectorAll('.roll-strip')]
  animate.mock.calls.forEach(([keyframes, options], i) => {
    expect(animate.mock.contexts[i]).toBe(strips[i])
    expect(keyframes[1].transform).toBe('translateY(0)')
    expect(options).toMatchObject({ duration: 1200, delay: i * 60, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' })
  })
})

test('with motion, a live update rolls only the columns that changed, from the digit they showed', () => {
  allowMotion()
  const { container, rerender } = render(<RollingNumber value={34} />)
  rerender(<RollingNumber value={37} />)
  expect(digitsOf(container)).toEqual(['3', '7'])
  expect(animate).toHaveBeenCalledTimes(1)
  expect(animate.mock.contexts[0]).toBe(container.querySelectorAll('.roll-strip')[1])
  expect(rolls()).toEqual(['translateY(30%)'])
  rerender(<RollingNumber value={27} />)
  expect(rolls().at(-1)).toBe('translateY(-10%)')
})

test('with motion, a change in the number of digits rebuilds the columns and rolls each from 0', () => {
  allowMotion()
  const { container, rerender } = render(<RollingNumber value={34} />)
  const before = columns(container)
  rerender(<RollingNumber value={128} />)
  expect(digitsOf(container)).toEqual(['1', '2', '8'])
  expect(columns(container)[0]).not.toBe(before[0])
  expect(rolls()).toEqual(['translateY(10%)', 'translateY(20%)', 'translateY(80%)'])
})

test('switching reduced motion on cancels a roll in flight', () => {
  allowMotion()
  const running = { cancel: vi.fn() }
  Element.prototype.getAnimations = function getAnimations() {
    return this.classList.contains('roll-strip') ? [running] : []
  }
  const { rerender } = render(<RollingNumber value={34} />)
  rerender(<RollingNumber value={37} />)
  running.cancel.mockClear()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  act(() => {
    reduce.matches = true
    reduce.dispatchEvent(new Event('change'))
  })
  expect(running.cancel).toHaveBeenCalled()
})

test('a label follows the number, read as its own word, and className reaches the whole', () => {
  const { container } = render(<RollingNumber value={12} label="свободни апартамента" className="text-count" />)
  expect(container.textContent).toBe('12 свободни апартамента')
  expect(container.firstChild).toHaveClass('text-count')
})
