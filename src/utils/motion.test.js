import { EASE, fadeUp, fadeUpChild, stagger, viewportOnce, hoverZoom } from './motion'

test('EASE is the luxe cubic-bezier tuple', () => {
  expect(EASE).toEqual([0.22, 1, 0.36, 1])
})

test('fadeUp reveals from 24px below', () => {
  expect(fadeUp.initial).toEqual({ opacity: 0, y: 24 })
  expect(fadeUp.animate.opacity).toBe(1)
  expect(fadeUp.animate.y).toBe(0)
  expect(fadeUp.animate.transition.ease).toEqual(EASE)
})

test('stagger produces container variants with configurable child delay', () => {
  expect(stagger().animate.transition.staggerChildren).toBe(0.08)
  expect(stagger(0.2).animate.transition.staggerChildren).toBe(0.2)
})

test('viewportOnce triggers once at 30%', () => {
  expect(viewportOnce).toEqual({ once: true, amount: 0.3 })
})

test('hoverZoom is the 1.04 slow zoom', () => {
  expect(hoverZoom.scale).toBe(1.04)
  expect(hoverZoom.transition.duration).toBe(0.8)
})
