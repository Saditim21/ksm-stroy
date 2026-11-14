import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { atRulesOf, rulesFor, rulesOf, valueOf } from '../test/css'

// The route change's doors and the entrance delay (spec §5.5, §5.6), all CSS
// in src/styles/motion.css. React's <ViewTransition> in root.jsx gives the
// leaving page the class `page-out` and the arriving one `page-in`.
//
// With motion (`:root.js`, prefers-reduced-motion: no-preference) the old
// view closes onto the seam in 400 ms, the seam glints, and the new view opens
// from it, 600 ms from 520 ms. Otherwise, a 200 ms crossfade. `vt-cut` turns
// the doors off for one change.

const PATH = 'src/styles/motion.css'
const rules = rulesOf(PATH)
const NO_PREFERENCE = '@media (prefers-reduced-motion: no-preference)'

// The one rule that styles `selector`; the test fails on none or several.
function only(selector) {
  const found = rulesFor(rules, selector)
  expect(found, selector).toHaveLength(1)
  return found[0]
}
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)
const frame = (name, selector) => keyframes(name).find((rule) => rule.selector === selector)

describe('the doors', () => {
  it('close the old page in 400 ms on expo.inOut', () => {
    expect(valueOf(only(':root.js::view-transition-old(.page-out)'), 'animation')).toBe('door-close 400ms var(--e-io) both')
  })

  it('open the new page in 600 ms on expo.out, from 520 ms', () => {
    expect(valueOf(only(':root.js::view-transition-new(.page-in)'), 'animation')).toBe('door-open 600ms var(--e-out) 520ms both')
  })

  it('close the root snapshot and an open menu with the page, and open the root with it', () => {
    expect(valueOf(only(':root.js:not(.vt-cut)::view-transition-old(root)'), 'animation')).toMatch(/^door-close 400ms /)
    expect(valueOf(only(':root.js:not(.vt-cut)::view-transition-old(site-menu)'), 'animation')).toMatch(/^door-close 400ms /)
    expect(valueOf(only(':root.js:not(.vt-cut)::view-transition-new(root)'), 'animation')).toBe('door-open 600ms var(--e-out) 520ms both')
  })

  it('draw the seam on the new page’s image pair for the whole 1120 ms', () => {
    const pair = only(':root.js::view-transition-image-pair(.page-in)')
    expect(valueOf(pair, 'animation')).toBe('door-seam 1120ms linear both')
    expect(valueOf(pair, 'background')).toBe('linear-gradient(var(--door-seam), var(--door-seam)) 50% 0 / 1px 100% no-repeat')
  })

  it('uncover onyx', () => {
    expect(valueOf(only(':root.js::view-transition'), 'background')).toBe('var(--onyx)')
  })

  // The ground, the closing, the opening, the seam, and the cut's two.
  it('run only with motion allowed and no reduced-motion preference', () => {
    const doors = rules.filter((rule) => rule.selectors.some((selector) => selector.startsWith(':root.js') || selector.startsWith(':root.vt-cut')))
    expect(doors).toHaveLength(6)
    for (const rule of doors) expect(rule.atRules, rule.selector).toEqual([NO_PREFERENCE])
  })

  it('door-close shuts inset(0) onto the seam, and door-open undoes it', () => {
    expect(valueOf(frame('door-close', 'from'), 'clip-path')).toBe('inset(0 0 0 0)')
    expect(valueOf(frame('door-close', 'to'), 'clip-path')).toBe('inset(0 50% 0 50%)')
    expect(valueOf(frame('door-open', 'from'), 'clip-path')).toBe('inset(0 50% 0 50%)')
    expect(valueOf(frame('door-open', 'to'), 'clip-path')).toBe('inset(0 0 0 0)')
  })

  // 0–120 ms the seam appears; 400–460 ms brass-l with the glow, then brass;
  // from 670 ms it fades over 300 ms (spec §5.6).
  it('door-seam: brass, the glint at 400 ms, then the fade', () => {
    const at = (selector) => valueOf(frame('door-seam', selector), '--door-seam')
    expect(at('0%')).toBe('rgba(184, 149, 74, 0)')
    expect(at('10.7%, 35.7%')).toBe('#B8954A')
    expect(at('35.8%, 41%')).toBe('#D8BD7A')
    expect(valueOf(frame('door-seam', '35.8%, 41%'), 'filter')).toBe('drop-shadow(0 0 8px rgba(216,189,122,.7))')
    expect(at('41.1%, 59.8%')).toBe('#B8954A')
    expect(at('86.6%, 100%')).toBe('rgba(184, 149, 74, 0)')
  })

  // A registered colour, so the seam's colour animates between keyframes.
  it('registers the seam colour', () => {
    const property = atRulesOf(PATH).find((atRule) => atRule.name === 'property' && atRule.params === '--door-seam')
    expect(property.declarations.map(({ prop, value }) => [prop, value])).toEqual([
      ['syntax', "'<color>'"],
      ['inherits', 'false'],
      ['initial-value', 'rgba(184, 149, 74, 0)'],
    ])
  })
})

describe('vt-cut, the hero move and Back/Forward', () => {
  // What the rules for `selector` declare, together, later over earlier.
  const declared = (selector) => Object.fromEntries(rulesFor(rules, selector).flatMap((rule) => rule.declarations.map(({ prop, value }) => [prop, value])))

  it('stops the page’s doors and seam', () => {
    for (const selector of [
      ':root.vt-cut::view-transition-old(.page-out)',
      ':root.vt-cut::view-transition-new(.page-in)',
      ':root.vt-cut::view-transition-image-pair(.page-in)',
    ]) {
      expect(declared(selector).animation, selector).toBe('none')
    }
  })

  // The new page at once: a page has no ground of its own, so an old page's
  // snapshot left in place would show through it for the whole transition
  // (React runs one on Back and Forward too). It goes at once.
  it('takes the old page’s snapshot away at once', () => {
    const rule = rulesFor(rules, ':root.vt-cut::view-transition-old(.page-out)').find((found) => valueOf(found, 'display'))
    expect(valueOf(rule, 'display')).toBe('none')
    expect(rule.atRules).toEqual([NO_PREFERENCE])
    expect(declared(':root.vt-cut::view-transition-new(.page-in)').display).toBeUndefined()
  })

  // Back and Forward are instant (spec §5.6), as a browser's own Back from its
  // page cache is: the root (the ground, the footer) switches with the page. A
  // root that faded would hold the old ground under the new page's text for a
  // moment: ivory on a legacy page's light ground, or a legacy page's dark text
  // on onyx. The hero move's two roots are both onyx.
  it('switches the root at once', () => {
    expect(declared(':root.vt-cut::view-transition-old(root)').display).toBe('none')
    expect(declared(':root.vt-cut::view-transition-new(root)').animation).toBe('none')
    const root = [...rulesFor(rules, ':root.vt-cut::view-transition-old(root)'), ...rulesFor(rules, ':root.vt-cut::view-transition-new(root)')]
    for (const rule of root) expect(rule.atRules, rule.selector).toEqual([NO_PREFERENCE])
  })

  // The root and a menu stay out of the doors. An open menu fades out as the
  // browser does, at 200 ms, over the new page.
  it('leaves the root and a menu out of the doors, and lets a menu fade', () => {
    expect(rules.some((rule) => rule.selectors.some((selector) => /:root\.js::view-transition-(old|new)\((root|site-menu)\)/.test(selector)))).toBe(false)
    expect(rules.some((rule) => rule.selectors.some((selector) => selector.startsWith(':root.vt-cut') && selector.includes('(site-menu)')))).toBe(false)
  })
})

describe('without the doors', () => {
  // Reduced motion, Save-Data, no matchMedia: the browser's own crossfade, at
  // 200 ms. Under the cut, an open menu still fades at that speed, while the
  // page and the root switch at once.
  it('is a 200 ms crossfade of the page, the root and a menu', () => {
    const plain = rules.find((rule) => valueOf(rule, 'animation-duration') === '200ms')
    expect(plain.atRules).toEqual([])
    expect(plain.selectors).toEqual([
      '::view-transition-old(.page-out)',
      '::view-transition-new(.page-in)',
      '::view-transition-old(site-menu)',
      '::view-transition-old(root)',
      '::view-transition-new(root)',
    ])
  })

  // The header (src/shell/SiteHeader.jsx) is a group of its own: it takes the
  // new page's look at once, and stays on top (spec §5.6). The browser stacks
  // a name only the new view has, such as the arriving page's, above the
  // others, so an arriving page that runs under the header (Home's hero, under
  // the see-through bar) would cover it for the whole transition.
  it('switches the header at once, on top', () => {
    expect(valueOf(only('::view-transition-old(site-header)'), 'display')).toBe('none')
    expect(valueOf(only('::view-transition-new(site-header)'), 'animation')).toBe('none')
    const group = only('::view-transition-group(site-header)')
    expect(valueOf(group, 'z-index')).toBe('1')
    expect(group.atRules).toEqual([])
  })
})

// The entrance delay (spec §5.5): the first page waits for the intro, a page
// the doors bring waits for them to open, the hero move's target and a page
// Back or Forward brings start at once.
it('sets --arrive for each way a page arrives', () => {
  const arrive = (selector) => valueOf(only(selector), '--arrive')
  expect(arrive(':root')).toBe('0s')
  expect(arrive(':root.intro')).toBe('.95s')
  expect(arrive('[data-arrive="doors"]')).toBe('.52s')
  expect(arrive('[data-arrive="hero"]')).toBe('0s')
  expect(arrive('[data-arrive="pop"]')).toBe('0s')
})

// Hidden starting states exist only under :root.js (spec §5.5).
it('hides nothing outside :root.js or a @keyframes block', () => {
  const hiding = rules.filter((rule) => /^0(\.0*)?$/.test(valueOf(rule, 'opacity') ?? ''))
  for (const rule of hiding) {
    const underGate = rule.selectors.every((selector) => selector.startsWith(':root.js'))
    const keyframe = rule.atRules.some((atRule) => atRule.startsWith('@keyframes'))
    expect(underGate || keyframe, rule.selector).toBe(true)
  }
})

// index.css hands the route change to motion.css: no crossfade of its own,
// and no rule that cuts the view transition under reduced motion.
it('is the only place that styles the route change', () => {
  const index = readFileSync(join(cwd(), 'src/index.css'), 'utf8').replace(/\r\n/g, '\n')
  expect(index).toMatch(/^@import '\.\/styles\/fonts\.css';\n@import '\.\/styles\/diptych\.css';\n@import '\.\/styles\/motion\.css';\n/)
  expect(rulesOf('src/index.css').filter((rule) => rule.selector.includes('::view-transition'))).toEqual([])
})
