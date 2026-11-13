import { gsap, ScrollTrigger } from '../utils/gsap'

// Copied from the Golden Residence landing (src/test/media.js @944bb03).
//
// jsdom has no window.matchMedia, so by default every component sees motion as
// not allowed and no fine or coarse pointer. A test that needs any of those
// installs this mock and calls the returned restore() when it is done.
//
// It answers queries that mention prefers-reduced-motion, pointer: fine or
// pointer: coarse; any other query (min-width, orientation) does not match.
// Each query gets one list for the life of the mock, so a test can fetch it
// with window.matchMedia(query), set `matches` and dispatch a `change` event,
// the way a browser does when the visitor changes the setting.
export function mockMatchMedia({ reduce = false, fine = false, coarse = false } = {}) {
  const had = Object.prototype.hasOwnProperty.call(window, 'matchMedia')
  const previous = window.matchMedia
  const lists = new Map()
  const answer = (query) => {
    if (query.includes('prefers-reduced-motion')) return /prefers-reduced-motion:\s*reduce/.test(query) === reduce
    if (query.includes('pointer: fine')) return fine
    if (query.includes('pointer: coarse')) return coarse
    return false
  }
  window.matchMedia = (query) => {
    if (!lists.has(query)) lists.set(query, mediaList(query, answer(query)))
    return lists.get(query)
  }
  // src/utils/gsap.js skips ScrollTrigger in a window without matchMedia; this
  // window has one now. A second registration is a no-op.
  gsap.registerPlugin(ScrollTrigger)
  return function restore() {
    if (had) window.matchMedia = previous
    else delete window.matchMedia
  }
}

// A plain object rather than a class, so a test can copy one with a spread and
// override `matches` (for example to answer a min-width query).
function mediaList(media, matches) {
  const listeners = new Set()
  return {
    media,
    matches,
    onchange: null,
    addEventListener: (type, fn) => { if (type === 'change') listeners.add(fn) },
    removeEventListener: (type, fn) => { if (type === 'change') listeners.delete(fn) },
    dispatchEvent: (event) => {
      listeners.forEach((fn) => fn(event))
      return true
    },
  }
}
