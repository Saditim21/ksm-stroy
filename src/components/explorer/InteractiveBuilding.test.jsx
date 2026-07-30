import { render, screen, fireEvent } from '@testing-library/react'
import InteractiveBuilding, { floorKey } from './InteractiveBuilding'

const image = { src: 'x.webp', width: 1000, height: 500 }
const shapes = [
  { type: 'floor', block: 'А', floor: 1, polygons: [[[0, 400], [1000, 400], [1000, 500], [0, 500]]] },
  { type: 'floor', block: 'А', floor: 2, polygons: [[[0, 300], [1000, 300], [1000, 400], [0, 400]], [[0, 0], [10, 0], [10, 10], [0, 10]]] },
]
const summaries = {
  'А:1': { available: 2, reserved: 1, sold: 3, total: 6, color: 'available' },
  'А:2': { available: 0, reserved: 0, sold: 6, total: 6, color: 'sold' },
}

test('floorKey composes block and floor', () => {
  expect(floorKey(shapes[0])).toBe('А:1')
})

test('renders one polygon element per polygon, colored by summary', () => {
  const { container } = render(
    <InteractiveBuilding image={image} shapes={shapes} summaries={summaries} hoveredFloor={null} onHoverFloor={() => {}} onSelectFloor={() => {}} />,
  )
  const polys = container.querySelectorAll('polygon')
  expect(polys).toHaveLength(3) // floor 1: 1 polygon, floor 2: 2 polygons
  expect(polys[0].getAttribute('data-status')).toBe('available')
  expect(polys[1].getAttribute('data-status')).toBe('sold')
})

test('hover reports floor key and shows tooltip with counts', () => {
  const onHoverFloor = vi.fn()
  const { container } = render(
    <InteractiveBuilding image={image} shapes={shapes} summaries={summaries} hoveredFloor="А:1" onHoverFloor={onHoverFloor} onSelectFloor={() => {}} />,
  )
  fireEvent.pointerEnter(container.querySelectorAll('polygon')[0], { clientX: 10, clientY: 10 })
  expect(onHoverFloor).toHaveBeenCalledWith('А:1')
  expect(screen.getByText(/2 свободни/)).toBeInTheDocument()
  expect(screen.getByText(/1 резервирани/)).toBeInTheDocument()
})

test('click selects the floor shape', () => {
  const onSelectFloor = vi.fn()
  const { container } = render(
    <InteractiveBuilding image={image} shapes={shapes} summaries={summaries} hoveredFloor={null} onHoverFloor={() => {}} onSelectFloor={onSelectFloor} />,
  )
  fireEvent.click(container.querySelectorAll('polygon')[0])
  expect(onSelectFloor).toHaveBeenCalledWith(shapes[0])
})

test('keyboard: Enter on focused floor selects it', () => {
  const onSelectFloor = vi.fn()
  const { container } = render(
    <InteractiveBuilding image={image} shapes={shapes} summaries={summaries} hoveredFloor={null} onHoverFloor={() => {}} onSelectFloor={onSelectFloor} />,
  )
  fireEvent.keyDown(container.querySelectorAll('polygon')[0], { key: 'Enter' })
  expect(onSelectFloor).toHaveBeenCalledWith(shapes[0])
})
