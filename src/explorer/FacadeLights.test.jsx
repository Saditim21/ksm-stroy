import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MN_SNAPSHOT_DATA } from '../data/mnogofamilna/snapshot'
import FacadeLights from './FacadeLights'
import { buildModel } from './model'
import { MN_PROJECT } from './projects/mn'

// Многофамилна's lights (spec M3 §6.3): over the night render with every
// window dark, the lit render shows through the band of each floor with at
// least one free apartment, in both blocks, as the model has it. Decoration
// only: the rails and the floors say the same to assistive technology.

const MN = 'mnogofamilna-sgrada'

// The snapshot with every apartment sold but `free` (labels, „А-102“).
function modelWithFree(free) {
  const data = {
    [MN]: Object.fromEntries(['block-a', 'block-b'].map((slot) => [
      slot,
      MN_SNAPSHOT_DATA[MN][slot].map((row) => ({ ...row, status: free.includes(row.unit) ? 'Свободен' : 'Продадени' })),
    ])),
  }
  return buildModel(data, MN_PROJECT)
}

const lit = (container) => [...container.querySelectorAll('[data-lit]')].map((floor) => floor.getAttribute('data-lit'))

describe('FacadeLights', () => {
  it('lights the floors with a free apartment, and only those', () => {
    // А-102 is on floor 2, Б-801 on floor 9 (the data numbers by level).
    const { container } = render(<FacadeLights model={modelWithFree(['А-102', 'Б-801'])} project={MN_PROJECT} />)

    expect(lit(container).sort()).toEqual(['А-2', 'Б-9'])
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('lights nothing where nothing is free', () => {
    const { container } = render(<FacadeLights model={modelWithFree([])} project={MN_PROJECT} />)

    expect(lit(container)).toEqual([])
  })

  // The snapshot of 01.12.2025: А-2, А-9 and Б-2–5, Б-7–9 have a free
  // apartment, each floor's band holding the lit render, which the browser
  // picks from its srcset and fetches with the page, at its lowest priority:
  // the first paint is the twin's, and the floors light 0.95 s on (spec M3/M4
  // §10, step 3).
  it('lights the snapshot’s nine floors, each band holding the lit render', () => {
    const { container } = render(<FacadeLights model={buildModel(MN_SNAPSHOT_DATA, MN_PROJECT)} project={MN_PROJECT} />)

    expect(lit(container).sort()).toEqual(['А-2', 'А-9', 'Б-2', 'Б-3', 'Б-4', 'Б-5', 'Б-7', 'Б-8', 'Б-9'])
    for (const floor of container.querySelectorAll('[data-lit]')) {
      const img = floor.querySelector('picture img')
      expect(img.getAttribute('src')).toMatch(/^\/img\/mn-dusk-\d+\.webp$/)
      expect(img.getAttribute('loading')).toBe('eager')
      expect(img.getAttribute('fetchpriority')).toBe('low')
      expect(floor.querySelector('source[type="image/avif"]').getAttribute('srcset')).toMatch(/\/img\/mn-dusk-800\.avif 800w/)
    }
  })

  // Bottom to top, both blocks of a floor together: the floors lit share a
  // step of the stagger, counted over the levels that light at all.
  it('steps the lit levels from the bottom, both blocks of a floor together', () => {
    const { container } = render(<FacadeLights model={buildModel(MN_SNAPSHOT_DATA, MN_PROJECT)} project={MN_PROJECT} />)
    const step = (key) => container.querySelector(`[data-lit="${key}"]`).style.getPropertyValue('--i')

    expect(['А-2', 'Б-2', 'Б-3', 'Б-4', 'Б-5', 'Б-7', 'Б-8', 'А-9', 'Б-9'].map(step)).toEqual(['0', '0', '1', '2', '3', '4', '5', '6', '6'])
  })

  it('lights nothing before the data', () => {
    const { container } = render(<FacadeLights model={null} project={MN_PROJECT} />)

    expect(lit(container)).toEqual([])
  })

  // Ruling PF9: a block page's facade shows its own block's lights only.
  it('a block filter renders only that block’s lit floors', () => {
    const { container } = render(<FacadeLights model={buildModel(MN_SNAPSHOT_DATA, MN_PROJECT)} project={MN_PROJECT} block="А" />)

    expect(lit(container).sort()).toEqual(['А-2', 'А-9'])
  })
})
