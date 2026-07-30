import { render, fireEvent } from '@testing-library/react'
import FloorPlanViewer from './FloorPlanViewer'

const image = { src: 'plan.webp', width: 1000, height: 800 }
const mapShapes = [
  { type: 'apartment', unitSuffix: '01', polygons: [[[0, 0], [100, 0], [100, 100], [0, 100]]] },
  { type: 'apartment', unitSuffix: '02', polygons: [[[100, 0], [200, 0], [200, 100], [100, 100]]] },
  { type: 'apartment', unitSuffix: '99', polygons: [[[200, 0], [300, 0], [300, 100], [200, 100]]] },
]
const unitsIndex = new Map([
  ['А301', { apartment: 'А 301', вид: '2-стаен', total: '62.18', status: 'Свободен' }],
  ['А302', { apartment: 'А 302', вид: '3-стаен', total: '101.48', status: 'Продаден' }],
])
const props = {
  image, mapShapes, blockLetter: 'А', unitFloorNumber: 3, unitsIndex,
  filter: {}, selectedUnit: null, onSelectUnit: () => {},
}

test('colors shapes by apartment status; unmatched units are unknown', () => {
  const { container } = render(<FloorPlanViewer {...props} />)
  const polys = container.querySelectorAll('polygon')
  expect(polys[0].getAttribute('data-status')).toBe('available')
  expect(polys[1].getAttribute('data-status')).toBe('sold')
  expect(polys[2].getAttribute('data-status')).toBe('unknown') // А399 not in data
})

test('labels show apartment numbers from the sheet data', () => {
  const { container } = render(<FloorPlanViewer {...props} />)
  const labels = [...container.querySelectorAll('text')].map((t) => t.textContent)
  expect(labels).toContain('А 301')
  expect(labels).toContain('—') // unmatched unit
})

test('filter dims non-matching apartments', () => {
  const { container } = render(<FloorPlanViewer {...props} filter={{ onlyAvailable: true }} />)
  const polys = container.querySelectorAll('polygon')
  expect(polys[0].getAttribute('data-dimmed')).toBe('false')
  expect(polys[1].getAttribute('data-dimmed')).toBe('true')
})

test('click reports the apartment row and normalized id', () => {
  const onSelectUnit = vi.fn()
  const { container } = render(<FloorPlanViewer {...props} onSelectUnit={onSelectUnit} />)
  fireEvent.click(container.querySelectorAll('polygon')[0])
  expect(onSelectUnit).toHaveBeenCalledWith(unitsIndex.get('А301'), 'А301')
})

test('drag gesture does not select apartment (regression: wasDrag guard)', () => {
  const onSelectUnit = vi.fn()
  const { container } = render(<FloorPlanViewer {...props} onSelectUnit={onSelectUnit} />)
  // Target the component's outer div (has handlers attached, not RTL wrapper)
  const componentDiv = container.querySelector('div.relative.overflow-hidden.rounded-lg')
  const polygon = container.querySelectorAll('polygon')[0]

  // Simulate drag: pointerDown → pointerMove(+50px) → pointerUp → click
  fireEvent.pointerDown(componentDiv, { clientX: 0, clientY: 0, pointerId: 1 })
  fireEvent.pointerMove(componentDiv, { clientX: 50, clientY: 50, pointerId: 1 })
  fireEvent.pointerUp(componentDiv)
  fireEvent.click(polygon)

  // Should NOT call onSelectUnit because wasDrag() should be true
  expect(onSelectUnit).not.toHaveBeenCalled()
})

test('plain click without drag selects apartment (regression: wasDrag guard)', () => {
  const onSelectUnit = vi.fn()
  const { container } = render(<FloorPlanViewer {...props} onSelectUnit={onSelectUnit} />)
  const polygon = container.querySelectorAll('polygon')[0]

  // Plain click without drag
  fireEvent.click(polygon)

  // Should call onSelectUnit because wasDrag() should be false
  expect(onSelectUnit).toHaveBeenCalledWith(unitsIndex.get('А301'), 'А301')
})
