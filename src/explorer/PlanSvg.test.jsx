import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import floors from '../data/maps/golden-residence.floors.json'
import { planFor } from './geometry'
import { buildModel } from './model'
import PlanSvg from './PlanSvg'
import { snapshotData } from './testing'

// One renderer for every plan (spec §7.4; extract §4.22), here in its mini
// mode, the edge panel's and the sheet's: Блок А's typical plan with floor
// 5's units from the sheets snapshot.

const PLAN = planFor(floors, 'А')
const unitsOf = (key) => buildModel(snapshotData()).floors.get(key).units
const groups = (svg) => [...svg.querySelectorAll('g[data-suffix]')]
const group = (svg, suffix) => svg.querySelector(`g[data-suffix="${suffix}"]`)

describe('PlanSvg, mini', () => {
  it('draws the 12 units, each with its status, its label and its outline', () => {
    const { container } = render(<PlanSvg plan={PLAN} units={unitsOf('А-5')} mode="mini" />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveClass('plan', 'plan--mini')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(groups(svg)).toHaveLength(12)
    for (const g of groups(svg)) expect(g.dataset.status).toMatch(/^(available|reserved|sold)$/)
    expect(group(svg, '01').dataset.status).toBe('sold')
    expect(group(svg, '02').dataset.status).toBe('available')
    expect(group(svg, '06').dataset.status).toBe('reserved')
    expect(group(svg, '01').querySelector('.u-label')).toHaveTextContent(/^501$/)
    expect(group(svg, '01').querySelector('.u-shape')).toHaveAttribute('pathLength', '1')
  })

  // The viewBox is the union of the block's 12 units, padded 4 in mini.
  it('crops to the block’s apartments, padded 4', () => {
    const { container } = render(<PlanSvg plan={PLAN} units={unitsOf('А-5')} mode="mini" />)
    const [x, y, w, h] = container.querySelector('svg').getAttribute('viewBox').split(' ').map(Number)
    const points = PLAN.shapes.flatMap((shape) => shape.polygons[0])
    expect(x).toBe(Math.min(...points.map(([px]) => px)) - 4)
    expect(y).toBe(Math.min(...points.map(([, py]) => py)) - 4)
    expect(x + w).toBe(Math.max(...points.map(([px]) => px)) + 4)
    expect(y + h).toBe(Math.max(...points.map(([, py]) => py)) + 4)
  })

  // Spec §7.4, §7.9: blocked (and unknown) fill at 0.1 under a dashed outline.
  it('shows the dashed outline of a blocked unit, and of no other', () => {
    const units = unitsOf('А-5').map((unit) => (unit.suffix === '03' ? { ...unit, status: 'blocked', statusText: 'Блокиран' } : unit))
    const { container } = render(<PlanSvg plan={PLAN} units={units} mode="mini" />)
    const svg = container.querySelector('svg')
    const shown = (g) => {
      const outline = g.querySelector('path.u-blocked')
      return Boolean(outline) && outline.style.display !== 'none'
    }

    expect(group(svg, '03').dataset.status).toBe('blocked')
    expect(shown(group(svg, '03'))).toBe(true)
    expect(groups(svg).filter(shown)).toHaveLength(1)
  })

  // Spec §7.4: a unit the sheet does not have gets no fill and no label.
  it('leaves a suffix missing from the sheet unfilled and unlabelled', () => {
    const units = unitsOf('А-5').filter((unit) => unit.suffix !== '07')
    const { container } = render(<PlanSvg plan={PLAN} units={units} mode="mini" />)
    const g = group(container.querySelector('svg'), '07')

    expect(g.dataset.status).toBe('none')
    expect(g.querySelector('.u-label').textContent).toBe('')
    expect(g.querySelector('.u-fill')).toHaveAttribute('fill', 'none')
  })

  // Reserved and sold fill with patterns, which each plan defines for itself.
  it('gives two plans on one page their own pattern ids', () => {
    const { container } = render(
      <>
        <PlanSvg plan={PLAN} units={unitsOf('А-5')} mode="mini" />
        <PlanSvg plan={PLAN} units={unitsOf('А-6')} mode="mini" />
      </>,
    )
    const ids = [...container.querySelectorAll('pattern')].map((pattern) => pattern.id)

    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
    const [first, second] = container.querySelectorAll('svg')
    const fillOf = (svg, suffix) => group(svg, suffix).querySelector('.u-fill').getAttribute('fill')
    expect(fillOf(first, '06')).toMatch(/^url\(#.+\)$/)
    expect(fillOf(first, '06')).not.toBe(fillOf(second, '06'))
    // Each plan's fill names its own pattern.
    expect(first.contains(document.getElementById(fillOf(first, '06').slice(5, -1)))).toBe(true)
    expect(second.contains(document.getElementById(fillOf(second, '06').slice(5, -1)))).toBe(true)
  })

  // A unit of the mini plan opens the stage on it (spec §7.3).
  it('hands a clicked unit to onUnit', () => {
    const onUnit = vi.fn()
    const { container } = render(<PlanSvg plan={PLAN} units={unitsOf('А-5')} mode="mini" onUnit={onUnit} />)

    fireEvent.click(group(container.querySelector('svg'), '02').querySelector('.u-hit'))
    expect(onUnit).toHaveBeenCalledTimes(1)
    expect(onUnit.mock.calls[0][0]).toMatchObject({ label: 'А 502', suffix: '02' })
  })
})
