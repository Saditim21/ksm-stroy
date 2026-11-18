import { act, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { goOffline } from '../../tests/contracts/site'
import { loadedBy, renderPagesAt } from '../test/arrivals'
import { useFreshArrival } from './landingHold'

// Only an arrival afresh lands (M3/M4 spec §8, M4 Task 7): a link followed or
// an address typed. Back, Forward and a reload bring the visitor back to the
// place they left, which React Router's ScrollRestoration restores, and a
// landing's jump would take them off it (the Task 7 review: Home's
// „Визуално“, a scroll down to the gallery, another page, Back, and the page
// was back on the explorer). useFreshArrival() tells the two apart: by the
// page's arrival (src/root.jsx's PageFrame, src/shell/arrival.js) for the
// address it opened at, and by React Router's navigation for one it came to
// after; for the app's first page, by how the browser loaded the document.

// Each page notes each address it shows, and whether it lands there.
let seen
function Probe({ name }) {
  const fresh = useFreshArrival()
  const { search } = useLocation()
  useEffect(() => {
    seen.push(`${name}${search} ${fresh ? 'lands' : 'stays'}`)
  }, [name, search, fresh])
  return <p>Страница {name}</p>
}
const PAGES = ['a', 'b'].map((name) => ({ path: name, Component: () => <Probe name={name} />, handle: { header: 'solid' } }))
const shows = (name) => screen.findByText(`Страница ${name}`)

let restore
beforeEach(() => {
  seen = []
  restore = () => {}
  goOffline()
})
afterEach(() => restore())

it('lands on the first page when the browser loaded it afresh', async () => {
  restore = loadedBy('navigate')
  renderPagesAt('/a', PAGES)
  await shows('a')
  expect(seen).toEqual(['a lands'])
})

it.each(['reload', 'back_forward'])('stays on the first page when the browser’s load was a %s', async (type) => {
  restore = loadedBy(type)
  renderPagesAt('/a', PAGES)
  await shows('a')
  expect(seen).toEqual(['a stays'])
})

it('lands where a link brings a page, and stays where Back or Forward brings one', async () => {
  restore = loadedBy('navigate')
  const { router } = renderPagesAt('/a', PAGES)
  await shows('a')

  await act(() => router.navigate('/b'))
  await shows('b')
  await act(() => router.navigate(-1))
  await shows('a')
  await act(() => router.navigate(1))
  await shows('b')
  expect(seen).toEqual(['a lands', 'b lands', 'a stays', 'b stays'])
})

// On the page it opened at: an address a link brings lands, after a reload
// too; Back to the page's first address stays, though React Router gives it
// the key it had (here "default"), as it would to the first load.
it('lands where a link changes the address on the page, and stays where Back changes it back', async () => {
  restore = loadedBy('reload')
  const { router } = renderPagesAt('/a', PAGES)
  await shows('a')

  await act(() => router.navigate('/a?x=1'))
  expect(router.state.location.search).toBe('?x=1')
  await act(() => router.navigate(-1))
  expect(router.state.location.key).toBe('default')
  await act(() => router.navigate(1))
  expect(seen).toEqual(['a stays', 'a?x=1 lands', 'a stays', 'a?x=1 stays'])
})

// A component of a page rendered on its own, without the site's frame (a
// page's own test), goes by the document's load, as the first page does.
it('goes by the document’s load outside the site’s frame', async () => {
  for (const [type, way] of [['navigate', 'lands'], ['reload', 'stays']]) {
    restore()
    restore = loadedBy(type)
    seen = []
    const router = createMemoryRouter([{ path: '/a', Component: () => <Probe name="a" /> }], { initialEntries: ['/a'] })
    const { unmount } = render(<RouterProvider router={router} />)
    await shows('a')
    expect(seen).toEqual([`a ${way}`])
    unmount()
  }
})
