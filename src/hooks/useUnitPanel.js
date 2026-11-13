import { useRef, useState } from 'react'

// Which unit's panel is open and where focus goes when it closes, from
// golden-residence src/hooks/useUnitPanel.js @944bb03.
// preventScroll: a hand-off from the panel (to the contact form, say) may
// already be scrolling the page.
export default function useUnitPanel() {
  const [open, setOpen] = useState(null)
  const openerRef = useRef(null)
  const openUnit = (unit, el) => {
    openerRef.current = el
    setOpen(unit)
  }
  const closeUnit = () => {
    setOpen(null)
    openerRef.current?.focus({ preventScroll: true })
  }
  return { open, openUnit, closeUnit }
}
