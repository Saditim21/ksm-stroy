import { describe, expect, it } from 'vitest'
import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/projects/projects.css, Продажби's own (polish spec §3). jsdom
// applies no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/projects/projects.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
const WIDE_FINE = '@media (hover: hover) and (pointer: fine) and (min-width: 901px)'

function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('#top, the two buildings', () => {
  it('sets the halves side by side, one screen tall, and one under the other on a phone', () => {
    expect(declaredFor('.gw')).toMatchObject({ display: 'flex', height: 'var(--screen-h)' })
    expect(declaredFor('.gw__half')).toMatchObject({ flex: '1 1 0' })
    expect(declaredFor('.gw', [PHONE])).toMatchObject({ 'flex-direction': 'column', height: 'auto' })
  })

  // A mouse on a half widens it and dims the other, only side by side and
  // only where a pointer hovers.
  it('widens the half a mouse is on, and dims the other', () => {
    expect(declaredFor('.gw:has(.gw__half:hover) .gw__half:hover', [WIDE_FINE])['flex-grow']).toBe('1.42')
    expect(declaredFor('.gw:has(.gw__half:hover) .gw__half:not(:hover) .gw__ph img', [WIDE_FINE]).filter).toBe('brightness(.42) saturate(.7)')
  })

  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.gw, .gw__title, .gw__half, .gw__ph, .gw__body, .gw__seam, .sbar')).toEqual([])
    const opening = rules.filter((rule) => rule.selectors.some((s) => s.startsWith(':root.js .gw')))
    expect(opening.length).toBeGreaterThan(0)
    for (const rule of opening) expect(rule.atRules[0], rule.selector).toBe(NO_PREFERENCE)
  })
})

describe('#etazhi and #svobodni', () => {
  it('draws each square in its status’s pattern, and the free in its colour', () => {
    expect(valueOf(rulesFor(rules, '.fr__c > .s-free')[0], 'background')).toBe('var(--status-free)')
  })

  it('stacks the two blocks on a phone', () => {
    expect(declaredFor('.ff__stage', [PHONE])['grid-template-columns']).toBe('1fr')
  })

  it('lays a row of the list as a table from 901 px, and as two lines on a phone', () => {
    expect(declaredFor('.fl__row').display).toBe('grid')
    expect(declaredFor('.fl__row', [PHONE])['grid-template-areas']).toBe("'id b go' 'id meta go'")
  })
})

// Polish spec §6 (the sweep): a floor's squares shrink to the room the row
// has, never wider than 22 px, so two blocks side by side fit a 1024 px
// screen; on a phone the count goes under the squares, which take the width.
describe('a floor’s row in any width', () => {
  it('lets its squares shrink to fit', () => {
    expect(declaredFor('.fr__c')['grid-template-columns']).toBe('repeat(var(--n), minmax(0, 22px))')
    expect(declaredFor('.fr')['grid-template-columns']).toBe('3.4em minmax(0, 1fr) auto')
  })

  it('puts the count under the squares on a phone', () => {
    expect(declaredFor('.fr', [PHONE])['grid-template-areas']).toBe("'n c' 'n w'")
  })
})

// Polish spec §6 (the sweep): one under the other, a half clears the header
// and the title above its words, so on a short screen (a phone on its side)
// its name never slides under them.
it('keeps a stacked half’s words clear of the header and the title', () => {
  expect(declaredFor('.gw__half', [PHONE])).toMatchObject({ flex: 'none', 'padding-top': 'calc(var(--eu-h) + var(--bar-h) + 96px)' })
})
