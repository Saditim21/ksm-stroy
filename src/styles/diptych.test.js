import { NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../test/css'

// src/styles/diptych.css: Diptych's type roles, actions, grounds and the
// seam's layout primitives (spec §3, §4, §6.1, §11), in Tailwind's components
// layer. jsdom applies no CSS, so these read the rules (src/test/css.js).

const rules = rulesOf('src/styles/diptych.css')
const LAYER = '@layer components'
const FINE = '@media (hover: hover) and (pointer: fine)'
const PHONE = '@media (max-width: 900px)'

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

// The legacy pages keep the look they had: body's `font-synthesis: none`
// (src/index.css) would take the slant off an italic in a system face that
// has none (src/pages/About.jsx).
it('lets the legacy ground synthesise faces again', () => {
  expect(valueOf(only('.legacy-ground'), 'font-synthesis')).toBe('initial')
})

// The legacy ground's light (src/root.jsx: <main> is .legacy-ground, its one
// child the page's frame).
describe('the legacy ground', () => {
  // The page's frame paints it and fills <main> below the header, so the
  // doors (src/styles/motion.css) carry it with the page and open and close
  // it on the page's own centre, the seam's.
  it('is painted by the page’s frame', () => {
    expect(declared(only('.legacy-ground'))).toMatchObject({ display: 'flex', 'flex-direction': 'column' })
    expect(declared(only('.legacy-ground > .page-frame'))).toEqual({ 'flex-grow': '1', background: '#fafafa' })
  })

  // <main>, which the root snapshot holds, paints it too, below the header and
  // under the frame, except where the doors run. Their root snapshot spans the
  // scrollbar's gutter as well and opens half a gutter right of the page, so a
  // light ground there showed past the page's door as a band. Without the
  // doors the change is a crossfade: the root's two snapshots blend as one
  // pair, so a light ground in both stays light, while the leaving and the
  // arriving page fade apart, each over the root, and over onyx a quarter of
  // it showed through at the midpoint, a grey veil over the whole page.
  it('is painted by <main> as well, below the header, wherever the doors never run', () => {
    const ground = declared(only('.legacy-ground'))
    expect(ground['background-color']).toBe('#fafafa')
    expect(ground['background-clip']).toBe('content-box')
    expect(declared(only(':root.js .legacy-ground', [LAYER, NO_PREFERENCE]))).toEqual({ 'background-color': 'transparent' })
    const painting = rules.filter((rule) => rule.selectors.some((selector) => /\.legacy-ground$/.test(selector))
      && rule.declarations.some(({ prop }) => prop.startsWith('background')))
    expect(painting.map((rule) => rule.selector)).toEqual(['.legacy-ground', ':root.js .legacy-ground'])
  })

  // Where the doors run is motion.css's condition: the gate's :root.js, with
  // no reduced-motion preference. Reduced motion switched on after the page
  // loaded leaves `js` on <html> but stops the doors, so the gate's class
  // alone would not do.
  it('leaves <main> bare under the condition the doors run under', () => {
    const bare = only(':root.js .legacy-ground', [LAYER, NO_PREFERENCE])
    const motion = rulesOf('src/styles/motion.css')
    for (const selector of [':root.js:not(.vt-cut)::view-transition-old(root)', ':root.js:not(.vt-cut)::view-transition-new(root)']) {
      const found = rulesFor(motion, selector)
      expect(found, selector).toHaveLength(1)
      expect([LAYER, ...found[0].atRules], selector).toEqual(bare.atRules)
    }
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
