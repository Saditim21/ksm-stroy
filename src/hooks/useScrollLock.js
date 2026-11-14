import { useEffect } from 'react'
import { acquireScrollLock, releaseScrollLock } from '../utils/lenis'

// A modal overlay must not scroll the page. From golden-residence
// src/hooks/useScrollLock.js @944bb03: it stops Lenis while it runs and hides
// the page's overflow. Locks can overlap; src/utils/lenis.js counts them, so
// Lenis starts again only when the last one is released.
//
// `background`: hiding the overflow hides the scrollbar, and where the page
// keeps the scrollbar's gutter (`scrollbar-gutter: stable`, which stops the
// page shifting sideways when the scrollbar goes) that strip shows the html
// background. An overlay in another colour passes its own colour, which <html>
// takes while the lock holds; one that matches the page passes none.
//
// <html> is saved once, by the first lock, and restored once, by the last.
// Each lock saving and restoring for itself goes wrong when two are released
// in one commit (the menu and a unit's panel closing on one navigation): the
// second to run its cleanup puts back the `hidden` the first one left.
// `holders` keeps each held lock's colour, in the order they were taken; the
// newest lock with a colour paints <html>.
const holders = []
let saved = null

function paint(root) {
  let colour
  for (let i = holders.length - 1; i >= 0 && !colour; i -= 1) colour = holders[i]
  root.style.backgroundColor = colour ?? saved.background
}

export default function useScrollLock(background) {
  useEffect(() => {
    const root = document.documentElement
    if (holders.length === 0) {
      saved = { overflow: root.style.overflow, background: root.style.backgroundColor }
      root.style.overflow = 'hidden'
    }
    holders.push(background)
    paint(root)
    acquireScrollLock()

    return () => {
      holders.splice(holders.lastIndexOf(background), 1)
      if (holders.length === 0) {
        root.style.overflow = saved.overflow
        root.style.backgroundColor = saved.background
        saved = null
      } else {
        paint(root)
      }
      releaseScrollLock()
    }
  }, [background])
}
