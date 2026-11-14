import { useMemo, useSyncExternalStore } from 'react'

// Where matchMedia is missing (jsdom, so every test by default) the query is
// simply not matched.
const list = (query) => (typeof window !== 'undefined' ? window.matchMedia?.(query) : undefined)

// The prerender runs with no window, so the HTML has every query unmatched.
// Hydration renders this same answer; the browser's own follows at once.
const serverSnapshot = () => false

// The query as a store React subscribes to: the browser's MediaQueryList for
// it, fetched on first use (never on the server) and kept, rather than built
// anew on every render.
function mediaStore(query) {
  let mq // undefined until first use, then the list, or null without matchMedia
  const current = () => {
    if (mq === undefined) mq = list(query) ?? null
    return mq
  }
  return {
    subscribe(onChange) {
      const target = current()
      if (!target?.addEventListener) return () => {}
      target.addEventListener('change', onChange)
      return () => target.removeEventListener('change', onChange)
    },
    getSnapshot: () => current()?.matches === true,
  }
}

// Whether a media query matches, following changes while the page is open, such
// as a tablet docking to a keyboard and trackpad or a window resized past a
// breakpoint. From golden-residence src/hooks/useMediaQuery.js @944bb03, on
// useSyncExternalStore so that it hydrates (spec §6.2): false on the server
// and while hydrating, then the browser's answer.
//
// Layout and markup chosen by media belong in CSS media queries, never here:
// this answer changes right after hydration (spec §6.2).
export default function useMediaQuery(query) {
  const store = useMemo(() => mediaStore(query), [query])
  return useSyncExternalStore(store.subscribe, store.getSnapshot, serverSnapshot)
}
