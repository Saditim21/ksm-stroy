import { useSyncExternalStore } from 'react'
import { getServerSnapshot, getSnapshot, subscribe } from './store'

// A data route preloads the API from its `links` (spec §6.4):
//   export const links = () => [availabilityPreload]
export { availabilityPreload } from './store'

/**
 * Live availability, from store.js: { status, data, origin, updatedAt }.
 * - status: 'idle' in the prerendered HTML and while hydrating, then
 *   'loading', then 'ready' (live rows in at least one slot), 'fallback' (only
 *   the data built into the site) or 'error' (no data at all).
 * - data: null until it loads, then
 *   { 'golden-residence': { 'block-a', 'block-b', garages, parking },
 *     'mnogofamilna-sgrada': { 'block-a', 'block-b' } }, each slot a list of
 *   rows, or null.
 * - origin: null until it loads, then the same shape, each slot 'live' (a
 *   sheet), 'built-in' (show these rows as dated) or null (no rows).
 *   - A Golden Residence slot always has rows: the built-in ones where the
 *     sheets gave none. It is null only if even those failed to load.
 *   - A Многофамилна block without a live sheet is null after a live read:
 *     show its dated data, which is static and prerendered (spec §6.4). Only
 *     the fallback carries it.
 * - updatedAt: when the live rows were read (ISO), or null.
 */
export function useAvailability() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
