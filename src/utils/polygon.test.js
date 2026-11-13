import { IDENTITY, transformPolygon, toPoints, centroid } from './polygon'

test('the identity leaves an outline where it is', () => {
  const square = [[0, 0], [10, 0], [10, 10], [0, 10]]
  expect(transformPolygon(square)).toEqual(square)
  expect(transformPolygon(square, IDENTITY)).toEqual(square)
})

test('a plan transform scales, then shifts: x′ = s·x + tx, y′ = s·y + ty', () => {
  const [[x, y]] = transformPolygon([[500, 400]], { s: 1.004, tx: -3, ty: -1.5 })
  expect(x).toBeCloseTo(499)
  expect(y).toBeCloseTo(400.1)
})

test('points are written for an SVG polygon, rounded to hundredths', () => {
  expect(toPoints([[1, 2], [3.456, 4.001]])).toBe('1,2 3.46,4')
})

test('the centroid is the area centre, not the mean of the vertices', () => {
  expect(centroid([[0, 0], [10, 0], [10, 10], [0, 10]])).toEqual([5, 5])
  // Extra vertices along the right edge would drag a vertex mean to x 7.5.
  const [cx, cy] = centroid([[0, 0], [10, 0], [10, 2], [10, 4], [10, 6], [10, 8], [10, 10], [0, 10]])
  expect(cx).toBeCloseTo(5)
  expect(cy).toBeCloseTo(5)
  const [tx, ty] = centroid([[0, 0], [6, 0], [0, 6]])
  expect(tx).toBeCloseTo(2)
  expect(ty).toBeCloseTo(2)
})

test('a flat outline falls back to the mean of its points', () => {
  expect(centroid([[0, 0], [4, 0], [8, 0]])).toEqual([4, 0])
})
