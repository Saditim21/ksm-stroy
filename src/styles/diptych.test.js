import { rulesFor, rulesOf, valueOf } from '../test/css'

// src/styles/diptych.css: Diptych's type roles, actions, grounds and the
// seam's layout primitives (spec §3, §4, §6.1, §11), in Tailwind's components
// layer. jsdom applies no CSS, so these read the rules (src/test/css.js).

const rules = rulesOf('src/styles/diptych.css')
const LAYER = '@layer components'
const FINE = '@media (hover: hover) and (pointer: fine)'
const PHONE = '@media (max-width: 900px)'
const WIDE = '@media (min-width: 901px)'

// The rules for `selector` inside exactly these at-rules.
const rulesIn = (selector, atRules) => rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
// The one rule for `selector` inside exactly these at-rules.
function only(selector, atRules = [LAYER]) {
  const found = rulesIn(selector, atRules)
  expect(found, `${selector} in ${atRules.join(' / ')}`).toHaveLength(1)
  return found[0]
}
const declared = (rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))
// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules) {
  const found = rulesIn(selector, atRules)
  expect(found.length, `${selector} in ${atRules.join(' / ')}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map(declared))
}

// Spec §2.2: hover effects need a pointer that hovers, so a tap never leaves
// one behind. Tailwind's hoverOnlyWhenSupported gates its hover: utilities
// only; hand-written CSS gates its own.
it('keeps every :hover rule inside (hover: hover) and (pointer: fine)', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.flatMap((rule) => rule.selectors)).toEqual(expect.arrayContaining([
    '.btn:hover', '.btn--solid:hover', '.link:hover', '.btn:hover .arr', '.link:hover .arr',
  ]))
  for (const rule of hovers) expect(rule.atRules, rule.selector).toEqual([LAYER, FINE])
})

// Spec §11: 44 × 44 px wherever the layout allows. A link's box is its text
// and 6 px above and below (about 38 px, /404's ways back); a transparent box
// over it reaches 44 px each way, and the link looks as it did.
it('gives a link a 44 px hit box that draws nothing', () => {
  expect(valueOf(only('.link'), 'position')).toBe('relative')
  expect(declared(only('.link::before'))).toEqual({
    content: "''",
    position: 'absolute',
    inset: 'min(0px, (100% - 44px) / 2)',
  })
})

// The grounds (spec §11): the site's dark one, and a light plate inside it,
// whose text is onyx and whose native controls are light. The legacy pages'
// light ground left with them (spec M3/M4 §9): no rule paints a page light,
// and the page's frame paints nothing of its own.
describe('the grounds', () => {
  it('gives a light plate onyx text and light native controls', () => {
    expect(declared(only('.on-light'))).toEqual({ color: 'var(--onyx)', 'color-scheme': 'light' })
  })

  it('keeps no legacy ground', () => {
    expect(rules.filter((rule) => rule.selectors.some((selector) => /legacy-ground|page-frame/.test(selector)))).toEqual([])
  })
})

describe('the seam and the halves (spec §4)', () => {
  it('.seam is 1 px of brass down the middle, drawn from the top, never in the way', () => {
    expect(declared(only('.seam'))).toEqual({
      position: 'absolute',
      left: '50%',
      top: '0',
      bottom: '0',
      width: '1px',
      'margin-left': '-.5px',
      background: 'var(--brass)',
      'transform-origin': '50% 0',
      'pointer-events': 'none',
      'z-index': '3',
    })
  })

  it('.split is two equal halves, its seam over them', () => {
    expect(declared(only('.split'))).toEqual({ position: 'relative', display: 'grid', 'grid-template-columns': '1fr 1fr' })
    expect(valueOf(only('.split > .seam'), 'z-index')).toBe('4')
  })

  // Spec §2.2: a section's padding, the screen's .16 within 96–180 px, and
  // 88 px on a phone. The site's, not one page's (ruling C4.4): a page
  // reached first by a link, such as Golden Residence from the menu, has it
  // before any visit to Home.
  it('.sec pads every Diptych section, by the screen’s height', () => {
    expect(declared(only('.sec'))).toEqual({ position: 'relative', padding: 'clamp(96px, calc(var(--screen-h) * .16), 180px) 0' })
    expect(declaredFor('.sec', [LAYER, PHONE])).toEqual({ padding: '88px 0' })
  })

  // The heading ends at the seam, the lead starts after it, the seam
  // overshoots both by 18 px.
  it('.hinge sets the heading against the seam and the lead after it', () => {
    expect(declared(only('.hinge'))).toEqual({
      position: 'relative',
      display: 'grid',
      'grid-template-columns': '1fr 1fr',
      'align-items': 'end',
      'margin-bottom': 'clamp(56px, calc(var(--screen-h) * .09), 104px)',
    })
    expect(declared(only('.hinge > :first-child'))).toEqual({ 'text-align': 'right', 'padding-right': 'clamp(24px, 3vw, 52px)' })
    expect(declared(only('.hinge > :nth-child(2)'))).toEqual({ 'padding-left': 'clamp(24px, 3vw, 52px)' })
    expect(declared(only('.hinge .seam'))).toEqual({ top: '-18px', bottom: '-18px' })
  })

  // A hinge's lead keeps a lone word off its last line (Chrome, Safari;
  // Firefox ignores it), so a lead never ends on „Строй.“ alone, the
  // client's name broken in two, or „апартамента.“ alone.
  it('.hinge .lead keeps a lone word off its last line', () => {
    expect(declared(only('.hinge .lead'))).toEqual({ 'text-wrap': 'pretty' })
  })

  // M3/M4 spec §4.1 (the critic's hinge fix; M3 ruling T5d): from 901 px,
  // where the halves stand side by side, no hinge's title or lead runs into
  // the page's gutter, on any page. A margin, not the concepts' padding: a
  // lead's max-width holds its padding, so it keeps its measure wherever its
  // half has the room, and only a narrower half gives the gutter up.
  it('a hinge keeps the gutter from 901 px', () => {
    expect(declaredFor('.hinge > :first-child', [LAYER, WIDE])).toEqual({ 'margin-left': 'var(--gut)' })
    expect(declaredFor('.hinge > :nth-child(2)', [LAYER, WIDE])).toEqual({ 'margin-right': 'var(--gut)' })
    // On a phone the hinge's own padding is the gutter (below).
    for (const selector of ['.hinge > :first-child', '.hinge > :nth-child(2)']) {
      expect(Object.keys(declaredFor(selector, [LAYER, PHONE])).filter((prop) => prop.startsWith('margin')), selector).toEqual([])
    }
  })

  // At 900 px and under the halves stack and the seams hide; the hinge's lead
  // goes under a brass rule, 22 px from each side of it.
  it('stacks on a phone', () => {
    const phone = [LAYER, PHONE]
    expect(declaredFor('.split', phone)).toEqual({ 'grid-template-columns': '1fr' })
    expect(declaredFor('.hinge', phone)).toEqual({ 'grid-template-columns': '1fr', padding: '0 var(--gut)' })
    for (const selector of ['.split > .seam', '.hinge > .seam']) {
      expect(declaredFor(selector, phone), selector).toEqual({ display: 'none' })
    }
    expect(declaredFor('.hinge > :first-child', phone)).toEqual({ 'text-align': 'left', padding: '0 0 22px' })
    expect(declaredFor('.hinge > :nth-child(2)', phone)).toEqual({ padding: '22px 0 0', 'border-top': '1px solid var(--brass)' })
  })

  // Spec §3.3: a mask reaches past the descenders and an italic's overhang,
  // and gives the room back, so the line keeps its place and no glyph is cut.
  // SplitText names its masks split-line-mask (useReveals).
  it('line masks never clip a glyph', () => {
    const mask = only('.line-mask')
    expect(mask.selectors).toEqual(['.line-mask', '.split-line-mask'])
    expect(declared(mask)).toEqual({ display: 'block', padding: '.12em .14em .26em', margin: '-.12em -.14em -.26em' })
  })

  // A split heading's masks stack, and two margins in a row collapse to the
  // larger rather than add up: between two masks the room they took comes
  // back in one margin, .12em + .26em, so a heading of several lines is as
  // tall split as whole, and nothing under it moves when the split goes.
  // Only SplitText's stacked masks: the opening's parts are positioned.
  it('gives the room back between two stacked masks in one margin', () => {
    expect(declared(only('.split-line-mask + .split-line-mask'))).toEqual({ 'margin-top': '-.38em' })
    expect(declared(only('.split-line-mask:not(:last-child)'))).toEqual({ 'margin-bottom': '0' })
    expect(rules.filter((rule) => rule.selectors.some((selector) => /\.line-mask\s*\+/.test(selector)))).toEqual([])
  })
})

// M3/M4 spec §4.3: the archive photos on Обекти and За нас take one grade, in
// CSS; the Обекти book shows its photos in true colour.
it('.grade has the spec’s filter', () => {
  expect(declared(only('.grade'))).toEqual({ filter: 'saturate(.5) sepia(.2) brightness(.74) contrast(1.08)' })
})
