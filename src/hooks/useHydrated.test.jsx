import { render } from '@testing-library/react'
import useHydrated from './useHydrated'

// Hydration itself is in hydration.test.jsx: false in the server HTML and
// during hydration, true right after.

// The page a link opens mounts after hydration: it renders its browser-only
// content at once, with no placeholder frame first.
test('is true from the first render of anything that mounts after hydration', () => {
  const renders = []
  function Page() {
    renders.push(useHydrated())
    return null
  }
  render(<Page />)
  expect(renders).toEqual([true])
})
