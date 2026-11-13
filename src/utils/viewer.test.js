import { fitRect, halfInView, wrapIndex } from './viewer'

// From golden-residence src/utils/viewer.test.js @944bb03.

const expectRect = (actual, expected) => {
  for (const key of ['left', 'top', 'width', 'height']) expect(actual[key]).toBeCloseTo(expected[key], 3)
}

test('wrapIndex wraps around both ends', () => {
  expect(wrapIndex(0, 12)).toBe(0)
  expect(wrapIndex(11, 12)).toBe(11)
  expect(wrapIndex(12, 12)).toBe(0)
  expect(wrapIndex(-1, 12)).toBe(11)
  expect(wrapIndex(25, 12)).toBe(1)
  expect(wrapIndex(-13, 12)).toBe(11)
})

test('fitRect fits a landscape picture to the width between the gutters, centred', () => {
  expectRect(fitRect({ width: 1920, height: 760 }, { width: 1440, height: 900 }, { x: 32, y: 70 }),
    { left: 32, top: (900 - 1376 * 760 / 1920) / 2, width: 1376, height: 1376 * 760 / 1920 })
})

test('fitRect fits a portrait picture to the height between 70 px margins, centred', () => {
  expectRect(fitRect({ width: 1202, height: 1600 }, { width: 1440, height: 900 }, { x: 32, y: 70 }),
    { left: (1440 - 1202 * 0.475) / 2, top: 70, width: 1202 * 0.475, height: 760 })
})

test('fitRect on a phone uses its gutters', () => {
  expectRect(fitRect({ width: 1920, height: 760 }, { width: 390, height: 844 }, { x: 16, y: 70 }),
    { left: 16, top: (844 - 358 * 760 / 1920) / 2, width: 358, height: 358 * 760 / 1920 })
})

test('fitRect shows the whole picture even when that means enlarging it (contain)', () => {
  expectRect(fitRect({ width: 640, height: 400 }, { width: 1440, height: 900 }, { x: 32, y: 70 }),
    { left: 112, top: 70, width: 1216, height: 760 })
})

test('fitRect never returns a negative size', () => {
  const rect = fitRect({ width: 1920, height: 760 }, { width: 40, height: 100 }, { x: 32, y: 70 })
  expect(rect.width).toBe(0)
  expect(rect.height).toBe(0)
})

test('halfInView: at least half of the rectangle lies inside the viewport height', () => {
  expect(halfInView({ top: 100, height: 400 }, 900)).toBe(true)
  expect(halfInView({ top: -200, height: 400 }, 900)).toBe(true)
  expect(halfInView({ top: -201, height: 400 }, 900)).toBe(false)
  expect(halfInView({ top: 700, height: 400 }, 900)).toBe(true)
  expect(halfInView({ top: 701, height: 400 }, 900)).toBe(false)
  expect(halfInView({ top: 1000, height: 400 }, 900)).toBe(false)
  expect(halfInView({ top: 0, height: 0 }, 900)).toBe(false)
  expect(halfInView(null, 900)).toBe(false)
})
