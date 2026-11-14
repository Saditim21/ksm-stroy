import { EASE_OUT, EASE_IN_OUT, EASE_FOLLOW, LINE_STAGGER, CHAR_STAGGER, MD_UP, CLIP_HIDDEN, CLIP_SHOWN, scrubDrift } from './motion'
import { gsap } from './gsap'

// From golden-residence src/utils/motion.test.js @944bb03.

test('the GSAP eases and staggers are the landing\'s', () => {
  expect(EASE_OUT).toBe('expo.out')
  expect(EASE_IN_OUT).toBe('expo.inOut')
  expect(EASE_FOLLOW).toBe('power3')
  expect(LINE_STAGGER).toBe(0.1)
  expect(CHAR_STAGGER).toBe(0.035)
})

// The one spelling of the md breakpoint, shared by every matchMedia caller.
test('MD_UP is the 768px md breakpoint', () => {
  expect(MD_UP).toBe('(min-width: 768px)')
})

// Outside the tests no other file spells the md query out, so a change of
// breakpoint is one edit.
test('no source file but motion.js spells the md query out', () => {
  const sources = import.meta.glob(['../**/*.{js,jsx}', '!../**/*.test.{js,jsx}', '!../test/**'], { query: '?raw', import: 'default', eager: true })
  // The glob reaches the whole of src/, not just this folder.
  expect(Object.keys(sources)).toEqual(expect.arrayContaining(['./motion.js', '../root.jsx', '../routes.js']))
  const spelled = Object.keys(sources).filter((path) => path !== './motion.js' && sources[path].includes('(min-width: 768px)'))
  expect(spelled).toEqual([])
})

// The clip-path pair every uncover reveal tweens between.
test('the clip constants are a bottom-up inset uncover', () => {
  expect(CLIP_HIDDEN).toBe('inset(100% 0% 0% 0%)')
  expect(CLIP_SHOWN).toBe('inset(0% 0% 0% 0%)')
})

test('scrubDrift scrubs a held-scale drift and merges the caller trigger', () => {
  const tween = {}
  const fromTo = vi.spyOn(gsap, 'fromTo').mockReturnValue(tween)
  try {
    const el = document.createElement('div')
    const frame = document.createElement('div')
    expect(scrubDrift(el, { trigger: frame, start: 'top bottom', end: 'bottom top' })).toBe(tween)
    expect(fromTo).toHaveBeenCalledTimes(1)
    expect(fromTo).toHaveBeenCalledWith(
      el,
      { yPercent: -6, scale: 1.14 },
      {
        yPercent: 6,
        scale: 1.14,
        ease: 'none',
        scrollTrigger: { scrub: true, trigger: frame, start: 'top bottom', end: 'bottom top' },
      },
    )
  } finally {
    fromTo.mockRestore()
  }
})

test('scrubDrift lets the caller turn scrub off or soften it', () => {
  const fromTo = vi.spyOn(gsap, 'fromTo').mockReturnValue({})
  try {
    scrubDrift(document.createElement('div'), { scrub: 0.5 })
    expect(fromTo.mock.calls[0][2].scrollTrigger).toEqual({ scrub: 0.5 })
  } finally {
    fromTo.mockRestore()
  }
})
