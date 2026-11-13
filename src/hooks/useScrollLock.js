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
export default function useScrollLock(background) {
  useEffect(() => {
    acquireScrollLock()

    const root = document.documentElement
    const originalOverflow = root.style.overflow
    const originalBackground = root.style.backgroundColor
    root.style.overflow = 'hidden'
    if (background) root.style.backgroundColor = background

    return () => {
      root.style.overflow = originalOverflow
      if (background) root.style.backgroundColor = originalBackground
      releaseScrollLock()
    }
  }, [background])
}
