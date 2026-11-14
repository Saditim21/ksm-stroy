import { glideToHash, scrollToId } from './scroll'
import { setLenis } from './lenis'
import { EXPO_IN_OUT } from './motion'

// From golden-residence src/utils/scroll.test.js @944bb03, with Diptych's
// glide (spec §5.3) and the same-page link handler.

test('scrolls natively when Lenis is not running', () => {
  document.body.innerHTML = '<section id="contact"></section>'
  const el = document.getElementById('contact')
  el.scrollIntoView = vi.fn()
  scrollToId('contact')
  expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
})

test('ignores unknown ids', () => {
  document.body.innerHTML = ''
  expect(() => scrollToId('missing')).not.toThrow()
})

test('uses auto behavior when prefers-reduced-motion is set', () => {
  document.body.innerHTML = '<section id="contact"></section>'
  const el = document.getElementById('contact')
  el.scrollIntoView = vi.fn()

  const originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn(() => ({ matches: true }))

  scrollToId('contact')
  expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })

  delete window.matchMedia
  window.matchMedia = originalMatchMedia
})

describe('the target handed to Lenis', () => {
  // The section's top on the page, as a phone at DPR 3 laid out the landing's
  // contact form at 390x844, under a 4.5rem scroll padding.
  const setup = (top) => {
    document.body.innerHTML = '<section id="contact"></section>'
    const el = document.getElementById('contact')
    el.getBoundingClientRect = () => ({ top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top })
    document.documentElement.style.scrollPaddingTop = '72px'
    const scrollTo = vi.fn()
    setLenis({ scrollTo })
    return scrollTo
  }

  afterEach(() => {
    setLenis(null)
    document.documentElement.style.scrollPaddingTop = ''
  })

  test('is the section top less scroll-padding-top, since Lenis applies scroll padding only to an element', () => {
    const scrollTo = setup(1000)
    scrollToId('contact')
    expect(scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollTo).toHaveBeenCalledWith(928, expect.not.objectContaining({ offset: expect.anything() }))
  })

  // Lenis ends a glide when its rounded value meets the rounded target, and a
  // lerp only nears its target: one ending in exactly .5, neared from below,
  // never ends, and Lenis then rewrites the scroll position on every frame.
  test('is a whole pixel, so a glide to a half-pixel section top can end', () => {
    const scrollTo = setup(14388.5)
    scrollToId('contact')
    expect(scrollTo.mock.calls[0][0]).toBe(14317)
  })

  // Spec §5.3: an in-page jump glides 1.5 s on expo.inOut, as the concept's.
  test('is reached in a 1.5 s glide on expo.inOut', () => {
    const scrollTo = setup(1000)
    scrollToId('contact')
    expect(scrollTo).toHaveBeenCalledWith(928, expect.objectContaining({ duration: 1.5, easing: EXPO_IN_OUT }))
  })
})

// GSAP's expo.inOut as a function of time, for Lenis' easing.
test('EXPO_IN_OUT starts at 0, passes 0.5 halfway and ends at 1', () => {
  expect(EXPO_IN_OUT(0)).toBe(0)
  expect(EXPO_IN_OUT(0.5)).toBe(0.5)
  expect(EXPO_IN_OUT(1)).toBe(1)
  expect(EXPO_IN_OUT(0.25)).toBeCloseTo(2 ** -5 / 2)
  expect(EXPO_IN_OUT(0.75)).toBeCloseTo(1 - 2 ** -5 / 2)
})

// The one handler for a link to a section of the same page (spec §5.3).
// Button attaches it to every href that starts with #; its own tests follow
// a click through the router (src/components/ui/Button.test.jsx).
describe('glideToHash', () => {
  const click = (init = {}) => {
    const link = document.querySelector('a')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
    link.addEventListener('click', (e) => glideToHash(e), { once: true })
    link.dispatchEvent(event)
    return event
  }
  afterEach(() => {
    setLenis(null)
    document.body.innerHTML = ''
  })

  test('keeps a tabindex the target already has', () => {
    document.body.innerHTML = '<a href="#form">Запитване</a><form id="form" tabindex="0"></form>'
    expect(click().defaultPrevented).toBe(true)
    expect(document.getElementById('form').getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(document.getElementById('form'))
  })

  test('reads an encoded id', () => {
    document.body.innerHTML = '<a href="#%D0%B7%D0%B0%D0%BF%D0%B8%D1%82%D0%B2%D0%B0%D0%BD%D0%B5">Запитване</a><section id="запитване"></section>'
    const scrollTo = vi.fn()
    setLenis({ scrollTo })
    expect(click().defaultPrevented).toBe(true)
    expect(scrollTo).toHaveBeenCalledTimes(1)
  })

  // Nothing to glide to: the browser keeps the link.
  test('leaves a link whose target is not on the page, or a bare #, to the browser', () => {
    document.body.innerHTML = '<a href="#nowhere">Никъде</a>'
    expect(click().defaultPrevented).toBe(false)
    document.body.innerHTML = '<a href="#">Нагоре</a>'
    expect(click().defaultPrevented).toBe(false)
  })

  test('leaves a click with a modifier key, or another button, to the browser', () => {
    document.body.innerHTML = '<a href="#form">Запитване</a><form id="form"></form>'
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      expect(click(init).defaultPrevented, JSON.stringify(init)).toBe(false)
    }
    expect(document.getElementById('form').hasAttribute('tabindex')).toBe(false)
  })
})

test('re-measures the page before handing Lenis the element, so a jump right after the page grew is not clamped to the old bottom', () => {
  document.body.innerHTML = '<section id="contact"></section>'
  const resize = vi.fn()
  const scrollTo = vi.fn()
  setLenis({ dimensions: { resize }, scrollTo })
  try {
    scrollToId('contact')
    expect(resize).toHaveBeenCalledTimes(1)
    expect(resize.mock.invocationCallOrder[0]).toBeLessThan(scrollTo.mock.invocationCallOrder[0])
  } finally {
    setLenis(null)
  }
})

// On the landing, the hand-off to the form landed the section under the bar,
// and on a phone shorter than about 840px the property field it fills and
// focuses was below the fold. `reveal` names an element that must end on screen.
describe('revealing an element inside the section', () => {
  // jsdom's window is 1024x768.
  const rect = (top, height) => () => ({ top, bottom: top + height, left: 0, right: 0, width: 0, height, x: 0, y: top })
  const setup = (fieldTop) => {
    document.body.innerHTML = '<section id="contact"><input id="f-unit"></section>'
    document.getElementById('contact').getBoundingClientRect = rect(1000, 1200)
    document.getElementById('f-unit').getBoundingClientRect = rect(fieldTop, 44)
    document.documentElement.style.scrollPaddingTop = '72px'
  }

  afterEach(() => {
    setLenis(null)
    document.documentElement.style.scrollPaddingTop = ''
  })

  test('goes past the section top just far enough to show the element, 16px clear of the bottom', () => {
    setup(1700)
    const scrollTo = vi.fn()
    setLenis({ scrollTo })
    scrollToId('contact', { reveal: 'f-unit' })
    // 1700 + 44 + 16 - 768
    expect(scrollTo.mock.calls[0][0]).toBe(992)
  })

  test('stays at the section top when the element shows there', () => {
    setup(1500)
    const scrollTo = vi.fn()
    setLenis({ scrollTo })
    scrollToId('contact', { reveal: 'f-unit' })
    expect(scrollTo.mock.calls[0][0]).toBe(928)
  })

  test('never brings the element under the bar', () => {
    setup(1700)
    document.getElementById('f-unit').getBoundingClientRect = rect(1700, 900)
    const scrollTo = vi.fn()
    setLenis({ scrollTo })
    scrollToId('contact', { reveal: 'f-unit' })
    expect(scrollTo.mock.calls[0][0]).toBe(1628)
  })

  test('without Lenis, scrolls the window to the same place', () => {
    setup(1700)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    try {
      scrollToId('contact', { reveal: 'f-unit' })
      expect(scrollTo).toHaveBeenCalledWith({ top: 992, behavior: 'smooth' })
    } finally {
      scrollTo.mockRestore()
    }
  })
})

describe('a target that moves while Lenis glides', () => {
  // Lenis turns the element into a fixed y when scrollTo is called. This fake
  // records every call; whenever a call carries onComplete, it first moves the
  // target down by `shift` (the sheets arriving mid-glide), then completes.
  const setup = (shift) => {
    document.body.innerHTML = '<section id="contact"></section>'
    const el = document.getElementById('contact')
    let top = 1000
    el.getBoundingClientRect = () => ({ top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top })
    const lenis = {
      scrollTo: vi.fn((target, options = {}) => {
        if (!options.onComplete) return
        top += shift
        options.onComplete(lenis)
      }),
    }
    setLenis(lenis)
    return { el, lenis }
  }

  afterEach(() => setLenis(null))

  test('re-issues the jump once when the target moved, to where it is now', () => {
    const { lenis } = setup(6300)
    scrollToId('contact')
    expect(lenis.scrollTo).toHaveBeenCalledTimes(2)
    expect(lenis.scrollTo.mock.calls[0][0]).toBe(1000)
    expect(lenis.scrollTo.mock.calls[1][0]).toBe(7300)
  })

  test('does not re-issue the jump when the target stayed put', () => {
    const { lenis } = setup(0)
    scrollToId('contact')
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
  })

  test('ignores a move of a pixel or two', () => {
    const { lenis } = setup(2)
    scrollToId('contact')
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1)
  })
})
