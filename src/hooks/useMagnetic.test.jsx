import { useRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import useMagnetic from './useMagnetic'
import { mockMatchMedia } from '../test/media'
import { gsap } from '../utils/gsap'

// From golden-residence src/hooks/useMagnetic.test.jsx @944bb03, on a bare
// button: the landing's Button component is not ported (the design system
// comes next), so its two markup tests are not either.

// A ref that never holds an element: useMagnetic leaves it alone.
const NOT_MAGNETIC = { current: null }

function Magnet({ magnetic = true, children = 'Запитване', options }) {
  const ref = useRef(null)
  useMagnetic(magnetic ? ref : NOT_MAGNETIC, options)
  return (
    <button ref={ref} type="button">
      <span data-magnetic-inner>{children}</span>
    </button>
  )
}

let restore
afterEach(() => {
  restore?.()
  restore = undefined
  vi.restoreAllMocks()
})

const followed = (quickTo) => quickTo.mock.calls.map(([target, prop]) => [target.tagName, prop])

// quickTo hands back one setter per element and property; record them.
function recordSetters() {
  const setters = new Map()
  vi.spyOn(gsap, 'quickTo').mockImplementation((target, prop) => {
    const set = vi.fn()
    setters.set(`${target.tagName}.${prop}`, set)
    return set
  })
  return setters
}

// A 200x40 button at (100, 50): its centre is (200, 70).
const placeButton = () => {
  const button = screen.getByRole('button')
  button.getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 40, right: 300, bottom: 90, x: 100, y: 50 })
  return button
}

test('with a fine pointer and motion the button and its label follow the pointer', () => {
  restore = mockMatchMedia({ fine: true })
  const quickTo = vi.spyOn(gsap, 'quickTo')
  render(<Magnet />)
  expect(followed(quickTo)).toEqual([['BUTTON', 'x'], ['BUTTON', 'y'], ['SPAN', 'x'], ['SPAN', 'y']])
  quickTo.mock.calls.forEach(([, , vars]) => expect(vars).toEqual({ duration: 0.6, ease: 'power3' }))
  const button = screen.getByRole('button')
  expect(() => {
    fireEvent.pointerMove(button, { clientX: 30, clientY: 10 })
    fireEvent.pointerLeave(button)
  }).not.toThrow()
})

test('the button leans by 0.35 of the pointer\'s offset from its centre and its label by 0.15', () => {
  restore = mockMatchMedia({ fine: true })
  const setters = recordSetters()
  render(<Magnet />)
  fireEvent.pointerMove(placeButton(), { clientX: 260, clientY: 90 })
  // 60 px right of the centre and 20 px below it.
  expect(setters.get('BUTTON.x').mock.calls[0][0]).toBeCloseTo(21)
  expect(setters.get('BUTTON.y').mock.calls[0][0]).toBeCloseTo(7)
  expect(setters.get('SPAN.x').mock.calls[0][0]).toBeCloseTo(9)
  expect(setters.get('SPAN.y').mock.calls[0][0]).toBeCloseTo(3)
})

test('strength and inner set how far the button and its label lean', () => {
  restore = mockMatchMedia({ fine: true })
  const setters = recordSetters()
  render(<Magnet options={{ strength: 0.5, inner: 0.25 }} />)
  fireEvent.pointerMove(placeButton(), { clientX: 140, clientY: 50 })
  // 60 px left of the centre and 20 px above it.
  expect(setters.get('BUTTON.x')).toHaveBeenLastCalledWith(-30)
  expect(setters.get('BUTTON.y')).toHaveBeenLastCalledWith(-10)
  expect(setters.get('SPAN.x')).toHaveBeenLastCalledWith(-15)
  expect(setters.get('SPAN.y')).toHaveBeenLastCalledWith(-5)
})

test('on leaving, the button and its label spring back, and the next move stops the springs', () => {
  restore = mockMatchMedia({ fine: true })
  recordSetters()
  const kill = vi.fn()
  const to = vi.spyOn(gsap, 'to').mockReturnValue({ kill })
  render(<Magnet />)
  const button = placeButton()
  fireEvent.pointerLeave(button)
  // GSAP writes its defaults into a vars object it has tweened with before.
  const spring = expect.objectContaining({ x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' })
  expect(to.mock.calls.map(([target, vars]) => [target.tagName, vars])).toEqual([['BUTTON', spring], ['SPAN', spring]])
  fireEvent.pointerMove(button, { clientX: 200, clientY: 70 })
  expect(kill).toHaveBeenCalledTimes(2)
})

test('stops listening when it unmounts', () => {
  restore = mockMatchMedia({ fine: true })
  const setters = recordSetters()
  const { unmount } = render(<Magnet />)
  const button = placeButton()
  fireEvent.pointerMove(button, { clientX: 260, clientY: 90 })
  expect(setters.get('BUTTON.x')).toHaveBeenCalledTimes(1)
  unmount()
  fireEvent.pointerMove(button, { clientX: 260, clientY: 90 })
  expect(setters.get('BUTTON.x')).toHaveBeenCalledTimes(1)
})

test('nothing follows on a touch screen, under reduced motion or for a ref with no element', () => {
  const quickTo = vi.spyOn(gsap, 'quickTo')
  restore = mockMatchMedia({ coarse: true })
  const { unmount } = render(<Magnet />)
  unmount()
  restore()
  restore = mockMatchMedia({ fine: true, reduce: true })
  render(<Magnet />)
  restore()
  restore = mockMatchMedia({ fine: true })
  render(<Magnet magnetic={false}>Обикновен</Magnet>)
  expect(quickTo).not.toHaveBeenCalled()
})
