import { useSyncExternalStore } from 'react'

// Nothing changes once hydration is done, so there is nothing to subscribe to.
const subscribe = () => () => {}
const afterHydration = () => true
const onServerAndWhileHydrating = () => false

// Whether the page has hydrated: false in the prerendered HTML and in the
// first client render, which must reproduce that HTML; true from the moment
// hydration is done, and from the first render of anything that mounts after
// it, such as the page a link opens.
//
// A view whose state comes from the browser alone renders that state only once
// this is true (spec §6.2): the query of a deep link
// (/projects/golden-residence/block-a?floor=3&unit=…, /contact?apartment=…)
// is not in the prerendered HTML, which was built without one.
export default function useHydrated() {
  return useSyncExternalStore(subscribe, afterHydration, onServerAndWhileHydrating)
}
