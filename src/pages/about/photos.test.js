import { expect, it } from 'vitest'
import { WALL, WALL_CENTRE } from './photos'

// The wall's tiles (Wall.jsx) are darkened and small, so their files are too:
// none wider than 480 px (the group "wall" in scripts/images/sources.json),
// and the page's first load stays light (M4: an LCP of 2.5 s or less on a
// phone). The centre, which the zoom brings up to fill the screen, keeps the
// photograph's own ladder.
it('gives the wall’s tiles small files and its centre the full ladder', () => {
  expect(WALL).toHaveLength(35)
  WALL.forEach((image, i) => {
    expect(image, `tile ${i}`).toBeDefined()
    const largest = Math.max(...image.widths)
    if (i === WALL_CENTRE) expect(largest).toBeGreaterThanOrEqual(1400)
    else expect(largest, `tile ${i}, ${image.path}`).toBeLessThanOrEqual(480)
  })
})
