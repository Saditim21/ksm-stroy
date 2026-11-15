// Keeps Tab inside a modal dialog (spec §11): from its last stop Tab goes
// round to its first, and Shift+Tab from its first to its last; from outside
// the dialog (the focus not yet moved in, or lost to <body> when the control
// that had it was disabled), Tab goes to its first stop. Call it with the
// keydown event of a Tab and the dialog's root.

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function trapTab(event, root) {
  const stops = [...root.querySelectorAll(FOCUSABLE)]
  if (stops.length === 0) return
  const first = stops[0]
  const last = stops[stops.length - 1]
  const active = document.activeElement
  if (!root.contains(active)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
