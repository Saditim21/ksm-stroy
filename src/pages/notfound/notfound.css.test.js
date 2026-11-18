import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/notfound/notfound.css, the 404 page's own (spec M3/M4 §7.6, §4.1;
// Diptych §5.5, §11): the drawing on the plan stage's umber, the dark plan at
// .4 under the brass outlines, which draw in turn on arrival, the missing
// apartment last, all in CSS under the motion gate; the heading at the
// slogan's size; on phones the drawing first, under a brass rule. jsdom
// applies no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/notfound/notfound.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation') || valueOf(rule, 'animation-name'))
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)
// An animation's start, in seconds after --arrive: „calc(var(--arrive) + 1.55s)“ → 1.55.
const startOf = (selector) => {
  const delay = valueOf(rulesFor(rules, selector).filter((rule) => valueOf(rule, 'animation-delay')).at(-1), 'animation-delay')
  expect(delay, selector).toMatch(/^(calc\()?var\(--arrive\)/)
  return Number(/\+ ([\d.]+)s/.exec(delay)?.[1] ?? 0)
}

describe('the page arrives in CSS (Diptych §5.5, M3/M4 §4.2, §7.6)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing declares opacity: 0, visibility: hidden, a
  // stroke-dashoffset, a translateY(…) or a scale…(…). Under reduced motion
  // the page shows its final state, the drawing drawn.
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.lost')).toEqual([])
  })

  // Spec §7.6: on arrival the outlines draw in sequence, and the missing one
  // appears last. Each outline draws its own length once (pathLength 1,
  // LostPlan.jsx), 70 ms after the one before; the dashed one shows once the
  // last has started drawing. The dash is the drawing's only while it draws,
  // so at rest each outline is whole.
  it('draws the outlines in turn and shows the missing apartment last', () => {
    const draw = animationOf(':root.js .lost__units path')
    expect(draw.atRules).toEqual([NO_PREFERENCE])
    expect(valueOf(draw, 'animation')).toBe('notfound-draw 1.3s var(--e-out) backwards')
    expect(valueOf(draw, 'animation-delay')).toBe('calc(var(--arrive) + .25s + var(--i) * 70ms)')
    expect(keyframes('notfound-draw').map((frame) => [frame.selector, valueOf(frame, 'stroke-dasharray'), valueOf(frame, 'stroke-dashoffset')])).toEqual([
      ['from', '1 1', '1'],
      ['to', '1 1', '0'],
    ])
    const gone = animationOf(':root.js .lost__gone')
    expect(gone.atRules).toEqual([NO_PREFERENCE])
    expect(valueOf(gone, 'animation')).toBe('notfound-fade .8s var(--e-soft) backwards')
    const lastOutline = 0.25 + 10 * 0.07
    expect(startOf(':root.js .lost__gone')).toBeGreaterThan(lastOutline)
    expect(keyframes('notfound-fade')[0].declarations).toEqual([{ prop: 'opacity', value: '0', important: false }])
  })

  // The heading's lines rise from their masks 0.1 s apart, the seam draws
  // down, and the sentence and the ways fade up after them (Diptych §5.4).
  it('raises the heading’s lines, draws the seam and fades the words up, from --arrive', () => {
    for (const selector of [':root.js .lost > .seam', ':root.js .lost__h1 .line-mask', ':root.js .lost__h1 .split-line', ':root.js .lost__p, :root.js .lost__ways']) {
      const rule = rulesFor(rules, selector.split(', ')[0]).find((each) => valueOf(each, 'animation'))
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
    }
    expect(valueOf(animationOf(':root.js .lost > .seam'), 'animation')).toBe('notfound-seam 1.3s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .lost__h1 .split-line'), 'animation')).toBe('notfound-rise .9s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .lost__h1 .split-line'), 'animation-delay')).toBe('calc(var(--arrive) + var(--n, 0) * .1s)')
    expect(declaredFor('.lost__h1 .line-mask + .line-mask')['--n']).toBe('1')
    expect(startOf(':root.js .lost__p')).toBe(0.35)
    expect(startOf(':root.js .lost__ways')).toBe(0.45)
    expect(keyframes('notfound-seam')[0].declarations).toEqual([{ prop: 'transform', value: 'scaleY(0)', important: false }])
    expect(keyframes('notfound-rise')[0].declarations).toEqual([{ prop: 'transform', value: 'translateY(112%)', important: false }])
  })

  // Diptych §5.5: the LCP image is never faded. The drawing is the page's
  // largest picture, so it stands at its .4 from the first paint, under the
  // drawing outlines.
  it('never fades the drawing: the dark plan stands at .4 from the first paint', () => {
    expect(declaredFor('.lost__drawing').opacity).toBe('.4')
    const drawing = rules.filter((rule) => rule.selectors.some((selector) => selector.includes('lost__drawing')))
    for (const rule of drawing) {
      for (const { prop, value } of rule.declarations) {
        expect(prop, rule.selector).not.toMatch(/^(animation|transition)/)
        if (prop === 'opacity') expect(value, rule.selector).toBe('.4')
      }
    }
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^notfound-/)
  })
})

// Spec §7.6: left, on the plan stage's umber, the dark plan at .4 with the
// explorer's brass unit outlines one screen pixel wide (--u, the drawing's
// units per pixel, which LostPlan.jsx measures), and the cut-out apartment
// left as a dashed ivory outline. The drawing's picture is laid under the
// outlines' viewBox (150 66 850 720 of its 1200 × 845), so the two align.
describe('the drawing', () => {
  it('stands on the plan stage’s umber, left of the seam', () => {
    expect(declaredFor('.lost__plan')).toMatchObject({ order: '-1', background: 'var(--umber)' })
    expect(declaredFor('.lost__draw')['aspect-ratio']).toBe('850 / 720')
  })

  it('lays the plan under the outlines’ viewBox', () => {
    expect(declaredFor('.lost__drawing')).toMatchObject({
      position: 'absolute',
      left: 'calc(-150 / 850 * 100%)',
      top: 'calc(-66 / 720 * 100%)',
      width: 'calc(1200 / 850 * 100%)',
      'max-width': 'none',
    })
  })

  it('draws the outlines in brass, one screen pixel wide, the missing one dashed in ivory over its cut', () => {
    expect(declaredFor('.lost__units path')).toMatchObject({ fill: 'none', stroke: 'var(--brass)', 'stroke-width': 'calc(var(--u) * 1px)' })
    expect(declaredFor('.lost__gone')).toMatchObject({
      fill: 'none',
      stroke: 'var(--ivory-3)',
      'stroke-width': 'calc(var(--u) * 1px)',
      'stroke-dasharray': 'calc(var(--u) * 5px) calc(var(--u) * 4px)',
    })
    expect(declaredFor('.lost__cut').fill).toBe('var(--umber)')
    // Until it is measured, a pixel at the drawing's common size: 1440 px
    // wide (604 px of drawing), and 390 px on a phone (350 px).
    expect(declaredFor('.lost__draw svg')['--u']).toBe('1.4')
    expect(declaredFor('.lost__draw svg', [PHONE])['--u']).toBe('2.4')
  })
})

// Spec §4.1: the heading reads across the seam at the slogan's size, phones
// at their own (as Контакти's and Многофамилна's do).
it('sets the H1 at the slogan’s size, and its own on a phone', () => {
  expect(declaredFor('.lost__h1')['font-size']).toBe('var(--fs-slogan)')
  expect(declaredFor('.lost__h1', [PHONE])['font-size']).toBe('clamp(32px, 10.6vw, 60px)')
})

// Spec §7.6: on phones the drawing comes first, under a brass rule, and the
// seam hides.
it('puts the drawing first on a phone, under a brass rule', () => {
  expect(declaredFor('.lost', [PHONE])['grid-template-columns']).toBe('minmax(0, 1fr)')
  expect(declaredFor('.lost__plan', [PHONE])['border-bottom']).toBe('1px solid var(--brass)')
  expect(declaredFor('.lost > .seam', [PHONE]).display).toBe('none')
})

// The port's substitutions (spec M3/M4 front matter; Diptych rulings C4.2,
// F9): --screen-h for vh and svh, and the system's focus ring.
it('uses --screen-h, never vh or svh, and keeps the focus ring', () => {
  expect(declaredFor('.lost')['min-height']).toBe('calc(var(--screen-h) - var(--header-h))')
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) {
      expect(value, `${rule.selector} ${prop}`).not.toMatch(/\d(s|d|l)?vh\b/)
      expect(`${prop}: ${value}`, rule.selector).not.toMatch(/^outline(-style)?: none/)
    }
  }
})
