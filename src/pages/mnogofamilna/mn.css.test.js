import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/mnogofamilna/mn.css, the Многофамилна page's own (its opening, the
// list's section), and src/explorer/mn-facade.css, Многофамилна's facade
// (spec M3 §6.2, §6.3; Diptych §5.5): its geometry on the building map's
// grid, its crops, its lights and their entrance, and its dialogs' drawing.
// jsdom applies no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/mnogofamilna/mn.css'
const FACADE = 'src/explorer/mn-facade.css'
const page = rulesOf(PAGE)
const facade = rulesOf(FACADE)
const PHONE = '@media (max-width: 900px)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(rules, selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (rules, selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation'))
const keyframes = (rules, name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)

describe('the first viewport’s motion (Diptych §5.5, M3 §4.2)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening, the facade or its lights
  // declares opacity: 0, visibility: hidden, a translateY(…) or a scale…(…).
  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.mnx')).toEqual([])
  })

  it('plays the facade and its lights only under the gate, their starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(FACADE, '.fx, .fx__lit, .fx__lights')).toEqual([])
  })

  // The opening: the title's two parts rise from their masks, across the
  // seam, then the address, the facts and the actions come up, each from
  // --arrive.
  it('animates the opening from --arrive', () => {
    for (const selector of [
      ':root.js .mnx__head > .seam',
      ':root.js .mnx__h1 .line-mask',
      ':root.js .mnx__h1 .split-line',
      ':root.js .mnx__addr',
      ':root.js .mnx__fact',
      ':root.js .mnx__actions > *',
    ]) {
      const rule = animationOf(page, selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules).toContain(NO_PREFERENCE)
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(valueOf(animationOf(page, ':root.js .mnx__h1 .split-line'), 'animation')).toMatch(/^mn-rise \.9s var\(--e-out\) both$/)
  })

  // Spec M3 §6.3: the lit floors switch on once, bottom to top, both blocks
  // of a floor together, 0.55 s each and 0.11 s apart, the page's one
  // signature moment. Dark only in the keyframes, under :root.js inside
  // no-preference, from --arrive; without motion they are simply lit.
  it('switches the lights on from dark only in their keyframes, 0.55 s each, 0.11 s apart, from --arrive', () => {
    const rule = animationOf(facade, ':root.js .fx__lit')
    expect(rule).toBeDefined()
    expect(rule.atRules).toEqual([NO_PREFERENCE])
    const [name, duration, , fill] = valueOf(rule, 'animation').split(' ')
    expect(duration).toBe('.55s')
    expect(fill).toBe('both')
    expect(valueOf(rule, 'animation-delay')).toMatch(/^calc\(var\(--arrive\) \+ .*var\(--i\) \* \.11s\)$/)
    const frames = keyframes(facade, name)
    expect(frames.map((frame) => frame.selector)).toEqual(['from'])
    expect(frames[0].declarations).toEqual([{ prop: 'opacity', value: '0', important: false }])
    // Nowhere else is a lit floor dark.
    const dark = facade.filter((each) => each.selectors.some((selector) => selector.includes('.fx__lit')) && valueOf(each, 'opacity') !== undefined)
    expect(dark).toEqual([])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = [...page, ...facade].flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^mn-/)
  })
})

// Sizes that set the page's length come from --screen-h (Global
// Constraints): never vh or svh.
it('sizes nothing in vh or svh', () => {
  for (const rule of [...page, ...facade]) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|l|d)?vh\b/)
  }
})

// Spec M3 §6.3 (the concept's mnogofamilna.js:257-266, :403-409), on the
// building map's grid of 1200 × 848.
describe('the facade’s geometry', () => {
  it('shows the desktop crop 0 / 150 / 1200 × 480, the courtyard at the page’s centre', () => {
    expect(declaredFor(facade, '.fx.fx--mn')).toMatchObject({ '--vbx': '0', '--vby': '150', '--vbw': '1200', '--vbh': '480' })
    expect(declaredFor(facade, '.fx--mn .fx__stage')).toMatchObject({ left: 'calc(50% - var(--sw) * .507917)' })
  })

  it('crops a phone to one block: А −36 / 208 / 652 × 412, Б from 600', () => {
    expect(declaredFor(facade, '.fx.fx--mn', [PHONE])).toMatchObject({ '--vbx': '-36', '--vby': '208', '--vbw': '652', '--vbh': '412' })
    expect(declaredFor(facade, '.fx.fx--mn[data-block="Б"]', [PHONE])).toMatchObject({ '--vbx': '600' })
    expect(declaredFor(facade, '.fx--mn .fx__stage', [PHONE])).toMatchObject({ 'aspect-ratio': '652 / 412' })
  })

  it('stands the rails at x 72 and 1142', () => {
    expect(declaredFor(facade, '.fx--mn .fx__rail--a').left).toBe('calc((72 - var(--vbx)) / var(--vbw) * 100%)')
    expect(declaredFor(facade, '.fx--mn .fx__rail--b').left).toBe('calc((1142 - var(--vbx)) / var(--vbw) * 100%)')
  })

  // The render without its margins lies at y 56.2, 1200 × 732.5, in the
  // grid's frame, 848 tall; the lights over it, the same box.
  it('places the render and its lights at y 56.2, 1200 × 732.5 on the grid', () => {
    expect(declaredFor(facade, '.fx--mn .fx__frame').height).toBe('calc(848 / var(--vbh) * 100%)')
    const box = declaredFor(facade, '.fx--mn .fx__pic')
    expect(box).toMatchObject({ top: 'calc(56.2 / 848 * 100%)', height: 'calc(732.5 / 848 * 100%)' })
    expect(declaredFor(facade, '.fx--mn .fx__lights')).toMatchObject({ top: 'calc(56.2 / 848 * 100%)', height: 'calc(732.5 / 848 * 100%)' })
  })

  // The edge fades (the concept's :438-452): the render fades into the onyx
  // at the crop's edges, the lights with it.
  it('fades the render and its lights at the crop’s edges', () => {
    for (const selector of ['.fx--mn .fx__pic', '.fx--mn .fx__lights']) {
      const declared = declaredFor(facade, selector)
      expect(declared['mask-image'], selector).toMatch(/linear-gradient\(to bottom[\s\S]*linear-gradient\(to right/)
      expect(declared['mask-composite'], selector).toBe('intersect')
    }
  })
})

// Ruling PF5: Многофамилна's drawing is quieter, .42 in the plan stage and
// .55 in the unit panel's crop, under its plans' class.
it('draws Многофамилна’s plan drawing at .42 in the stage and .55 in the crop', () => {
  expect(declaredFor(facade, '.plan.plan--mn')['--drawing']).toBe('.42')
  expect(declaredFor(facade, '.plan--mn.plan--crop')['--drawing']).toBe('.55')
  expect(declaredFor(facade, '.plan.plan--mn .drawing[data-loaded]').opacity).toBe('var(--drawing)')
})

// Spec M3 §6.2 #3: the list loads lazily, and the room it takes is kept
// before it comes, so nothing visible moves when it lands: its bar's height
// over its table's box, which then fills what the bar leaves.
it('keeps the list’s room before it loads', () => {
  expect(declaredFor(page, '.mnl')['--list-table']).toMatch(/var\(--screen-h\)/)
  expect(declaredFor(page, '.mnl__list')['min-height']).toMatch(/^calc\(var\(--list-table\) \+ \d+px\)$/)
  expect(declaredFor(page, '.mnl .lv__table')).toMatchObject({ height: 'var(--list-table)', flex: '1 0 auto' })
})
