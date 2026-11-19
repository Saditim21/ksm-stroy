import { describe, expect, it } from 'vitest'
import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf } from '../../test/css'

// src/pages/about/about.css, За нас's own (polish spec §4). jsdom applies no
// CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/about/about.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'

function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('#top, the wall', () => {
  it('lays the wall 7 × 5, and 5 × 7 on a phone, larger than the screen', () => {
    expect(declaredFor('.wl__grid')).toMatchObject({ 'grid-template-columns': 'repeat(7, 1fr)', 'grid-template-rows': 'repeat(5, 1fr)' })
    expect(declaredFor('.wl__grid', [PHONE])).toMatchObject({ 'grid-template-columns': 'repeat(5, 1fr)', 'grid-template-rows': 'repeat(7, 1fr)' })
  })

  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.wl, .wl__t, .wl__h1, .wl__l, .wl__r, .wl__sub, .wl__after, .wl__full, .wl__hint')).toEqual([])
  })

  // What only the zoom shows waits for it where the motion runs, and is not
  // there at all where it cannot.
  it('keeps the full photograph and the line after the zoom for the zoom', () => {
    expect(declaredFor(':root.js .wl__full', [NO_PREFERENCE]).opacity).toBe('0')
    expect(declaredFor(':root.js .wl__after', [NO_PREFERENCE]).opacity).toBe('0')
    expect(declaredFor(':root:not(.js) .wl__after').display).toBe('none')
    expect(declaredFor(':root:not(.js) .wl__hint').display).toBe('none')
  })
})

describe('#obekti, the works', () => {
  it('stands the works in a column on a phone', () => {
    expect(declaredFor('.trk__track', [PHONE])['flex-direction']).toBe('column')
  })
})
