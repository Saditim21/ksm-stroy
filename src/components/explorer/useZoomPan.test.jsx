import { fireEvent, render, screen } from '@testing-library/react'
import useZoomPan from './useZoomPan'

// A plan the way the explorer wires the hook: the handlers on the stage, the
// units inside it, each selecting on click unless the gesture was a drag.
function Plan({ onSelect }) {
  const { transform, zoomIn, wasDrag, handlers } = useZoomPan()
  return (
    <div data-testid="stage" {...handlers}>
      <div
        data-testid="canvas"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        <svg>
          <polygon data-testid="unit" points="0,0 100,0 100,100" onClick={() => !wasDrag() && onSelect()} />
        </svg>
      </div>
      <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={zoomIn}>
        Увеличи
      </button>
    </div>
  )
}

function setup() {
  const onSelect = vi.fn()
  render(<Plan onSelect={onSelect} />)
  const stage = screen.getByTestId('stage')
  // jsdom has no pointer capture. This records it the way Chromium applies it:
  // once an element holds the capture, the rest of the gesture's pointer
  // events, and the click that ends it, are dispatched to that element.
  let holder = null
  stage.setPointerCapture = vi.fn(() => { holder = stage })
  stage.releasePointerCapture = vi.fn(() => { holder = null })
  const route = (target) => holder ?? target
  const at = (x, y, buttons = 1, pointerType = 'mouse') => ({ pointerId: 1, pointerType, clientX: x, clientY: y, buttons })

  // One press: down on `target`, the moves, up, then the click.
  const press = (target, moves = [], pointerType = 'mouse') => {
    fireEvent.pointerDown(target, at(0, 0, 1, pointerType))
    for (const [x, y] of moves) fireEvent.pointerMove(route(target), at(x, y, 1, pointerType))
    const [x, y] = moves.at(-1) ?? [0, 0]
    const end = route(target)
    fireEvent.pointerUp(end, at(x, y, 0, pointerType))
    holder = null // a pointerup releases the capture
    fireEvent.click(end)
  }

  const zoomIn = () => fireEvent.click(screen.getByRole('button', { name: 'Увеличи' }))
  const canvas = () => screen.getByTestId('canvas').style.transform
  return { onSelect, stage, unit: screen.getByTestId('unit'), press, zoomIn, canvas, at }
}

// Regression: useZoomPan captured the pointer on pointerdown. Chromium then
// sends the click to the capturing stage, so no unit's onClick ever ran.
test('a click on a unit reaches the unit: pointerdown captures nothing', () => {
  const { onSelect, stage, unit, press } = setup()

  press(unit)

  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).not.toHaveBeenCalled()
})

test('a click on a zoomed plan reaches the unit too', () => {
  const { onSelect, stage, unit, press, zoomIn } = setup()
  zoomIn()

  press(unit)

  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).not.toHaveBeenCalled()
})

test('a tap that drifts less than the drag threshold still selects, zoomed or not', () => {
  const { onSelect, stage, unit, press, zoomIn } = setup()

  press(unit, [[5, 4]], 'touch') // 6.4 px at scale 1: a finger's drift, nothing to pan
  expect(onSelect).toHaveBeenCalledTimes(1)

  zoomIn()
  press(unit, [[2, 2]]) // 2.8 px of a mouse on a zoomed plan: not yet a drag
  expect(onSelect).toHaveBeenCalledTimes(2)
  expect(stage.setPointerCapture).not.toHaveBeenCalled()
})

// Small units are tapped while zoomed, and a finger drifts more than a mouse
// (finding 8 of the M0 review: a 6 px drift selected nothing).
test('a touch tap that drifts 6 px on a zoomed plan selects the unit; a 12 px drift pans', () => {
  const { onSelect, stage, unit, press, zoomIn } = setup()
  zoomIn()

  press(unit, [[6, 0]], 'touch')
  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).not.toHaveBeenCalled()

  press(unit, [[12, 0]], 'touch')
  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).toHaveBeenCalledTimes(1)
})

// TAP_TOLERANCE: mouse 4 px, pen 6 px, touch 8 px, in a straight line. Each
// tap drifts diagonally just inside its tolerance, where |dx| + |dy| would
// already be past it.
test.each([
  ['mouse', [2, 3], [3, 3]], // 3.6 px taps, 4.2 px pans
  ['pen', [4, 4], [5, 4]], // 5.7 px taps, 6.4 px pans
  ['touch', [5, 6], [6, 6]], // 7.8 px taps, 8.5 px pans
])('on a zoomed plan a %s tap may drift %j and still select; %j pans', (pointerType, tap, pan) => {
  const { onSelect, stage, unit, press, zoomIn } = setup()
  zoomIn()

  press(unit, [tap], pointerType)
  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).not.toHaveBeenCalled()

  press(unit, [pan], pointerType)
  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).toHaveBeenCalledTimes(1)
})

test('a pan on a zoomed plan captures the pointer once it passes 4 px, and selects nothing', () => {
  const { onSelect, stage, unit, zoomIn, canvas, at } = setup()
  zoomIn()

  fireEvent.pointerDown(unit, at(0, 0))
  fireEvent.pointerMove(unit, at(3, 1))
  expect(stage.setPointerCapture).not.toHaveBeenCalled()

  fireEvent.pointerMove(unit, at(5, 1))
  expect(stage.setPointerCapture).toHaveBeenCalledTimes(1)
  expect(stage.setPointerCapture).toHaveBeenCalledWith(1)

  // Captured: the rest of the gesture and its click go to the stage.
  fireEvent.pointerMove(stage, at(40, 30))
  fireEvent.pointerUp(stage, at(40, 30, 0))
  fireEvent.click(stage)

  expect(stage.setPointerCapture).toHaveBeenCalledTimes(1)
  expect(canvas()).toContain('translate(40px, 30px)')
  expect(onSelect).not.toHaveBeenCalled()

  // The next plain click selects again.
  fireEvent.pointerDown(unit, at(0, 0))
  fireEvent.pointerUp(unit, at(0, 0, 0))
  fireEvent.click(unit)
  expect(onSelect).toHaveBeenCalledTimes(1)
})

test('a swipe at scale 1 captures nothing and selects nothing', () => {
  const { onSelect, stage, unit, press, canvas } = setup()

  press(unit, [[50, 50]])

  expect(stage.setPointerCapture).not.toHaveBeenCalled()
  expect(onSelect).not.toHaveBeenCalled()
  expect(canvas()).toContain('translate(0px, 0px)')
})

// Without a capture on pointerdown, a press can end outside the plan, where
// the stage never hears its pointerup. Leaving the plan ends the gesture, so a
// mouse that comes back with no button pressed does not drag the plan along.
test('a press that leaves the plan ends there: no pan follows the pointer afterwards', () => {
  const { stage, unit, zoomIn, canvas, at } = setup()
  zoomIn()

  fireEvent.pointerDown(unit, at(0, 0))
  fireEvent.pointerMove(unit, at(2, 1))
  fireEvent.pointerLeave(stage, at(2, 1))
  fireEvent.pointerMove(stage, at(60, 60, 0))

  expect(canvas()).toContain('translate(2px, 1px)')
})

test('a gesture the browser cancels ends there too', () => {
  const { stage, unit, zoomIn, canvas, at } = setup()
  zoomIn()

  fireEvent.pointerDown(unit, at(0, 0))
  fireEvent.pointerCancel(unit, at(0, 0))
  fireEvent.pointerMove(stage, at(60, 60, 0))

  expect(canvas()).toContain('translate(0px, 0px)')
})
