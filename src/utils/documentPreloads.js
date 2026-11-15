import { preload } from 'react-dom'

// A page's preloads for the document it is first loaded as (ruling C4.10):
// the files its first viewport needs at once, such as the display faces of a
// title, or the availability API behind a count.
//
// A route's `links` export would put them in the head on every client-side
// visit too: React Router inserts a page's links each time it shows the page.
// The page's files are known by then (a font already applied, the API read
// within the minute), the browser has nothing to fetch, and a few seconds
// later Chrome warns that each was "preloaded but not used", after any
// return to the page by a link or by Back.
//
// So the page asks React for them while it is prerendered, where there is no
// document: React writes them into the head of the page's HTML. In the
// browser this does nothing: the head has them on the first load, and a
// later visit has the files already. A page calls it as it renders:
//
//   export default function Page() {
//     preloadWithDocument([availabilityPreload, ...DISPLAY_FONT_PRELOADS])
//     ...
//   }
//
// Each link is a route `links` entry: { href, as, type?, crossOrigin? }.
export function preloadWithDocument(links) {
  if (typeof document !== 'undefined') return
  for (const { href, as, type, crossOrigin } of links) preload(href, { as, type, crossOrigin })
}
