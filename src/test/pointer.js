import { act, createEvent, fireEvent } from '@testing-library/react'

// A press and its click, in the order a browser sends them (Chrome 157, logged
// in the Task 6 review). jsdom moves no focus on a press, so these do what the
// browser's mousedown does: the pressed button takes the focus, and a press
// on anything that takes none takes the focus off whatever had it.
//
// - A mouse: pointerdown, then the mousedown that moves the focus, then
//   pointerup and the click. Its hover is the test's to send.
// - A finger: it enters, presses, lets go and leaves (pointerover and
//   pointerenter, pointerdown, pointerup, pointerout and pointerleave). The
//   compatibility mousedown, and with it the focus, come after that, then the
//   click.
//
// A pen comes either way, depending on the system: `focusOnPress` moves the
// focus with the press, as a mouse does.

function focusFrom(element) {
  const target = element.closest('button, a[href], input, select, textarea, [tabindex]')
  act(() => {
    if (target) target.focus()
    else document.activeElement?.blur?.()
  })
}

/** A mouse click: the focus moves with the press, before the pointerup. */
export function mouseClick(element) {
  fireEvent.pointerDown(element, { pointerType: 'mouse' })
  focusFrom(element)
  fireEvent.pointerUp(element, { pointerType: 'mouse' })
  fireEvent.click(element)
}

// The browser's pair, over then enter (out then leave). React makes its own
// enter and leave events from pointerover and pointerout; Testing Library's
// pointerEnter and pointerLeave send the pair the other way round.
function cross(element, pointerType, [bubbling, own]) {
  fireEvent[bubbling](element, { pointerType })
  fireEvent(element, createEvent[own](element, { pointerType }))
}

/** A tap: the focus moves after the pointer leaves, or with the press when `focusOnPress`. */
export function tap(element, pointerType = 'touch', { focusOnPress = false } = {}) {
  cross(element, pointerType, ['pointerOver', 'pointerEnter'])
  fireEvent.pointerDown(element, { pointerType })
  if (focusOnPress) focusFrom(element)
  fireEvent.pointerUp(element, { pointerType })
  cross(element, pointerType, ['pointerOut', 'pointerLeave'])
  if (!focusOnPress) focusFrom(element)
  fireEvent.click(element)
}
