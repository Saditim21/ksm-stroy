import { atRulesOf, firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/eu/eu.css, the EU page's own (spec M3/M4 §7.5, §4.1; Diptych
// §5.5, §11): the opening's entrance in CSS under the motion gate, the plate
// never hidden, the budget's seam a registered percentage at rest at the
// grant's 70 %, the title at the slogan's size. jsdom applies no CSS, so these
// read the rules (src/test/css.js).

const PAGE = 'src/pages/eu/eu.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
const DESKTOP = '@media (min-width: 901px)'
// The opening's blocks: the document's first part and the seal on it.
const OPENING = '.doc, .seal'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation') || valueOf(rule, 'animation-name'))
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)
// An animation's start, in seconds after --arrive: „calc(var(--arrive) + .35s)“ → 0.35.
const startOf = (selector) => {
  const delay = valueOf(rulesFor(rules, selector).filter((rule) => valueOf(rule, 'animation-delay')).at(-1), 'animation-delay')
  expect(delay, selector).toMatch(/^(calc\()?var\(--arrive\)/)
  return Number(/\+ ([\d.]+)s/.exec(delay)?.[1] ?? 0)
}

describe('the opening arrives in CSS, the plate never hidden (Diptych §5.5, M3/M4 §4.2, §7.5)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…). Under reduced motion
  // it shows the final state.
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, OPENING)).toEqual([])
  })

  // Spec §7.5: the plate never hides, even during the entrance, so the emblem
  // shows on landing. No rule animates it or hides it, under the gate or not.
  it('never animates, fades or moves the plate', () => {
    const touchesPlate = (rule) => rule.selectors.some((selector) => /\.seal|\.eu__plate/.test(selector))
    for (const rule of rules.filter(touchesPlate)) {
      for (const { prop, value } of rule.declarations) {
        expect(prop, rule.selector).not.toMatch(/^(animation|transition|opacity|visibility|clip-path|transform|translate|scale)/)
        expect(value, rule.selector).not.toMatch(/hidden/)
      }
    }
  })

  // The seam draws down, the title's lines rise from their masks 0.1 s apart,
  // and the statement fades up after them (Diptych §5.4: 1.3 s, 0.9 s, 1 s).
  it('draws the seam, raises the title’s lines and fades the statement up, from --arrive', () => {
    for (const selector of [':root.js .doc > .seam', ':root.js .doc__h1 .line-mask', ':root.js .doc__h1 .split-line', ':root.js .doc__text > p']) {
      const rule = animationOf(selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
    }
    expect(valueOf(animationOf(':root.js .doc > .seam'), 'animation')).toBe('eu-draw 1.3s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .doc__h1 .split-line'), 'animation')).toBe('eu-rise .9s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .doc__text > p'), 'animation')).toBe('eu-up 1s var(--e-out) both')
    expect(startOf(':root.js .doc > .seam')).toBe(0)
    expect(valueOf(animationOf(':root.js .doc__h1 .split-line'), 'animation-delay')).toBe('calc(var(--arrive) + var(--n, 0) * .1s)')
    expect(declaredFor('.doc__h1 .line-mask + .line-mask')['--n']).toBe('1')
    expect(startOf(':root.js .doc__text > p')).toBe(0.35)
    expect(startOf(':root.js .doc__text > p + p')).toBe(0.45)
    expect(keyframes('eu-draw')[0].declarations).toEqual([{ prop: 'transform', value: 'scaleY(0)', important: false }])
    expect(keyframes('eu-rise')[0].declarations).toEqual([{ prop: 'transform', value: 'translateY(112%)', important: false }])
    expect(keyframes('eu-up')[0].declarations).toEqual([
      { prop: 'opacity', value: '0', important: false },
      { prop: 'transform', value: 'translateY(16px)', important: false },
    ])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^eu-/)
  })
})

// Spec §7.5: the band's grant half and KSM's own meet at a brass seam at
// 70 % (24 724,03 of 35 320,04): a registered percentage, so the seam's move
// from 50 % (eu-proekt.motion.test.jsx) interpolates, at rest at 70 %, which
// is where it stays under reduced motion and without JS.
describe('#byudzhet, the seam at the grant’s share', () => {
  it('registers --split as a percentage, 70 % to start', () => {
    const property = atRulesOf(PAGE).find((atRule) => atRule.name === 'property' && atRule.params === '--split')
    expect(property.declarations.map(({ prop, value }) => [prop, value])).toEqual([
      ['syntax', "'<percentage>'"],
      ['inherits', 'true'],
      ['initial-value', '70%'],
    ])
  })

  it('rests the band’s seam at 70 %: the grant’s column is --split wide, its edge brass', () => {
    const band = declaredFor('.fund__list')
    expect(band['--split']).toBe('70%')
    expect(band['grid-template-columns']).toBe('var(--split) minmax(0, 1fr)')
    expect(band['grid-template-areas']).toBe("'total total' 'grant own' 'time time'")
    const seam = declaredFor('.fund__grant::after')
    expect(seam).toMatchObject({ position: 'absolute', right: '-.5px', width: '1px', background: 'var(--brass)' })
    expect(declaredFor('.fund__grant').background).toBe('var(--umber)')
    // The centre is the motion's alone: its keyframe's start, and the wait
    // the page marks, both under the motion gate. No other rule moves it.
    const centre = rules.filter((rule) => rule.declarations.some(({ prop, value }) => prop === '--split' && value !== '70%'))
    expect(centre.map((rule) => [rule.selector, rule.atRules])).toEqual([
      [":root.js .fund__list[data-band='wait']", [NO_PREFERENCE]],
      ['from', ['@keyframes eu-split']],
    ])
  })

  // Spec §7.5: when the band is first seen, the seam travels from 50 % to
  // 70 % in 1.5 s, expo.inOut. It waits at the centre from the first paint,
  // a keyframe's starting state, so a band whose edge already shows in the
  // first viewport (1440 × 900) never jumps; the page marks it waiting, then
  // landed or seen (eu-proekt.jsx), on its own data-band. A band that has
  // landed in view travels as the arrival's last beat, 0.75 s after the
  // opening's wait (the concept's js/eu-proekt.js:17); one scrolled into
  // view, at once. Without the page's script the keyframe brings it to 70 %
  // after 4 s; under reduced motion none of this applies, and it rests at
  // 70 %.
  it('waits at the centre from the first paint and travels to 70 % in 1.5 s when the band is seen', () => {
    const arrival = animationOf(':root.js .fund__list')
    expect(arrival.atRules).toEqual([NO_PREFERENCE])
    expect(valueOf(arrival, 'animation')).toBe('eu-split 1.5s var(--e-io) both')
    expect(valueOf(arrival, 'animation-delay')).toBe('calc(var(--arrive) + 4s)')
    expect(keyframes('eu-split').map((frame) => [frame.selector, valueOf(frame, '--split')])).toEqual([['from', '50%']])
    const wait = declaredFor(":root.js .fund__list[data-band='wait']", [NO_PREFERENCE])
    expect(wait).toEqual({ '--split': '50%', animation: 'none' })
    const seen = declaredFor(":root.js .fund__list[data-band='seen']", [NO_PREFERENCE])
    expect(seen).toEqual({ animation: 'none', transition: '--split 1.5s var(--e-io)' })
    const landed = declaredFor(":root.js .fund__list[data-band='landed']", [NO_PREFERENCE])
    expect(landed).toEqual({ animation: 'none', transition: '--split 1.5s var(--e-io)', 'transition-delay': 'calc(var(--arrive) + .75s)' })
  })

  // data-split is the system's SplitText marker (Diptych §5.7,
  // src/motion/useReveals.js), never used above the fold, and the band's
  // total is in the first viewport at 1440 × 900: the band's state has a name
  // of its own, and no rule here selects data-split.
  it('never selects data-split, the system’s SplitText marker', () => {
    expect(rules.filter((rule) => rule.selectors.some((selector) => selector.includes('data-split')))).toEqual([])
  })

  // Each amount holds its line (an amount never breaks), but for the dates,
  // which may part on a phone.
  it('keeps each amount on one line, the dates free to part on a phone', () => {
    expect(declaredFor('.fund__v')['white-space']).toBe('nowrap')
    expect(declaredFor('.fund__time .fund__v', [PHONE])['white-space']).toBe('normal')
  })

  // Spec §7.5: on phones, a 14 px bar with the seam at 70 %, over a list with
  // swatches.
  it('turns into a 14 px bar on a phone, its seam at --split, over the list with swatches', () => {
    expect(declaredFor('.fund__list', [PHONE])['grid-template-areas']).toBe("'total' 'bar' 'grant' 'own' 'time'")
    const bar = declaredFor('.fund__list::before', [PHONE])
    expect(bar).toMatchObject({ 'grid-area': 'bar', height: '14px' })
    expect(bar.background).toBe('linear-gradient(90deg, var(--ivory-3) 0 var(--split), transparent var(--split))')
    const seam = declaredFor('.fund__list::after', [PHONE])
    expect(seam).toMatchObject({ 'grid-area': 'bar', width: '1px', background: 'var(--brass)' })
    expect(seam.margin).toContain('calc(var(--split) - .5px)')
    expect(declaredFor('.fund__own::before', [PHONE])).toMatchObject({ width: '14px', height: '14px' })
    expect(declaredFor('.fund__grant::before', [PHONE]).background).toBe('var(--ivory-3)')
    expect(declaredFor('.fund__grant::after', [PHONE]).display).toBe('none')
  })
})

// Spec §4.1: the title reads across the seam at the slogan's size, phones at
// their own (as Контакти's and Многофамилна's do).
it('sets the H1 at the slogan’s size, and its own on a phone', () => {
  expect(declaredFor('.doc__h1')['font-size']).toBe('var(--fs-slogan)')
  expect(declaredFor('.doc__h1', [PHONE])['font-size']).toBe('clamp(33px, 11.2vw, 60px)')
})

// Spec §7.5: the EU lockup first and larger, then ПКИП; on phones the logos
// stack. Their heights outweigh the shell's 28 px (.eu__plate img, one class
// and an element, in src/styles/shell.css): two classes, since Tailwind's
// components layer is no cascade layer in the built CSS, and order alone
// would lose to it.
it('sets the logos large on the plate, the EU lockup first, stacked on a phone', () => {
  const shell = rulesFor(rulesOf('src/styles/shell.css'), '.eu__plate img')
  expect(valueOf(shell.at(-1), 'height')).toBe('28px')
  expect(declaredFor('.seal__plate .seal__emblem').height).toBe('clamp(52px, 4.6vw, 66px)')
  expect(declaredFor('.seal__plate .seal__programme').height).toBe('clamp(44px, 3.9vw, 56px)')
  expect(declaredFor('.seal__plate', [PHONE])['flex-direction']).toBe('column')
  expect(declaredFor('.seal__plate .seal__emblem', [PHONE]).height).toBe('clamp(40px, 12vw, 50px)')
  expect(declaredFor('.seal__plate .seal__programme', [PHONE]).height).toBe('clamp(34px, 10vw, 42px)')
  // Nothing sets a logo's height through one class alone.
  expect(rules.filter((rule) => rule.selectors.some((selector) => /^\.seal__(emblem|programme)$/.test(selector)))).toEqual([])
})

// #plakat: the poster's link and the disclaimer across the seam, which hides
// on a phone, where the disclaimer takes the brass rule. The ↓ moves down on
// a pointer's hover only.
it('reads #plakat across the seam, stacked on a phone, the ↓ moving on hover', () => {
  expect(declaredFor('.fin')['grid-template-columns']).toBe('1fr 1fr')
  expect(declaredFor('.fin > .seam', [PHONE]).display).toBe('none')
  expect(declaredFor('.fin__note', [PHONE])['border-top']).toBe('1px solid var(--brass)')
  expect(declaredFor('.btn:hover .arr--down', ['@media (hover: hover) and (pointer: fine)']).transform).toBe('translateY(3px)')
  expect(declaredFor('.doc__text', [DESKTOP])['padding-top']).toBe('.5em')
})

// The port's substitutions (spec M3/M4 front matter; Diptych rulings C4.2,
// F9): --screen-h for vh and svh, and the system's focus ring.
it('uses --screen-h, never vh or svh, and keeps the focus ring', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) {
      expect(value, `${rule.selector} ${prop}`).not.toMatch(/\d(s|d|l)?vh\b/)
      expect(`${prop}: ${value}`, rule.selector).not.toMatch(/^outline(-style)?: none/)
    }
  }
})
