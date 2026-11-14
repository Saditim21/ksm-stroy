import { useSyncExternalStore } from 'react'
import { getServerSnapshot, getSnapshot, subscribe } from './store'

// A data route preloads the API from its `links` (spec §6.4):
//   export const links = () => [availabilityPreload]
export { availabilityPreload } from './store'

/**
 * Live availability, from store.js: { status, data, updatedAt }.
 * - status: 'idle' in the prerendered HTML and while hydrating, then
 *   'loading', then 'ready' (live rows), 'fallback' (the data built into the
 *   site) or 'error' (no data at all).
 * - data: null until it loads, then
 *   { 'golden-residence': { 'block-a', 'block-b', garages, parking },
 *     'mnogofamilna-sgrada': { 'block-a', 'block-b' } }, each slot a list of
 *   rows, or null when it has no live rows (a Многофамилна block without a
 *   sheet shows its dated data).
 * - updatedAt: when the live rows were read (ISO), or null.
 */
export function useAvailability() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
