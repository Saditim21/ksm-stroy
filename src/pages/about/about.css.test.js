import { describe, expect, it } from 'vitest'
import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf } from '../../test/css'

// src/pages/about/about.css, За нас's own (polish spec §4). jsdom applies no
// CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/about/about.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
const PHONE_ON_ITS_SIDE = '@media (max-width: 900px) and (orientation: landscape)'

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

  // A tile's box keeps its size from its first frame: the page's largest
  // paint is a tile's, and a box that grew as it came up would count again,
  // larger, at the end of its rise, 1.9 s in (Lighthouse on a phone, against
  // M4's 2.5 s). The tile fades in; its photograph settles inside it.
  it('fades the tiles in at their size, their photographs settling inside them', () => {
    const tile = rules.filter((rule) => rule.atRules.includes('@keyframes about-tile'))
    expect(tile.flatMap((rule) => rule.declarations.map(({ prop }) => prop))).toEqual(['opacity', 'opacity'])
    expect(declaredFor(':root.js .wl__t picture', [NO_PREFERENCE]).animation).toMatch(/^about-settle /)
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
  // The row the works slide along, and the one screen it is pinned in, are
  // the slide's own (WorksTrack.jsx sets data-slide while it runs: a desktop
  // tall enough, with motion). Without it, on any screen, the works stand in
  // a grid, every one of them on the page and none clipped (the final
  // review's first finding: a clipped row under reduced motion).
  it('lays the works in a row only while their track slides', () => {
    expect(declaredFor('.trk__track').display).toBe('grid')
    expect(declaredFor('.trk__pin').overflow).toBeUndefined()
    expect(declaredFor('.trk__pin').height).toBeUndefined()
    expect(declaredFor('.trk[data-slide] .trk__track')).toMatchObject({ display: 'flex', width: 'max-content' })
    expect(declaredFor('.trk[data-slide] .trk__pin')).toMatchObject({ height: 'var(--screen-h)', overflow: 'hidden' })
  })

  // A stack's back photograph, turned 7° and moved down 5 % (about.css),
  // hangs up to a tenth of the stack's width below it: the stack keeps that
  // much room under it, so the work's name is never under a photograph, in
  // the grid, in the row or on a phone.
  it('keeps a work’s name clear of its fanned photographs', () => {
    expect(declaredFor('.trk__stack')['margin-bottom']).toBe('10%')
    expect(declaredFor('.trk__stack', [PHONE]).margin).toBe('0 8% 10%')
  })

  // A short screen: what is pinned is one screen tall, never taller, so its
  // words stay on it (a phone on its side, 844 × 390 or 932 × 430; the
  // final review's third finding), and the works' photographs are sized by
  // the height too, so their names stay on a short desktop.
  it('keeps the pinned wall and track within a short screen', () => {
    expect(declaredFor('.wl__pin')['min-height']).toBeUndefined()
    expect(declaredFor('.trk[data-slide] .trk__pin')['min-height']).toBeUndefined()
    expect(declaredFor('.trk[data-slide] .trk__p').width).toContain('var(--screen-h)')
    expect(declaredFor('.wl__grid', [PHONE_ON_ITS_SIDE])).toMatchObject({ 'grid-template-columns': 'repeat(7, 1fr)', 'grid-template-rows': 'repeat(5, 1fr)' })
  })
})
