import { useEffect, useState } from 'react'

// Where matchMedia is missing (jsdom, so every test by default; a prerender) the
// query is simply not matched.
const list = (query) => (typeof window !== 'undefined' ? window.matchMedia?.(query) : undefined)

// Whether a media query matches, following changes while the page is open, such
// as a tablet docking to a keyboard and trackpad or a window resized past a
// breakpoint. From golden-residence src/hooks/useMediaQuery.js @944bb03.
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => list(query)?.matches === true)
  useEffect(() => {
    const mq = list(query)
    if (!mq?.addEventListener) return undefined
    const update = () => setMatches(mq.matches)
    // The state is for the previous query when `query` changed, and for the
    // moment of the first render when the setting changed since.
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}
