import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'
import { LIGHT_PALETTE } from '../../styles/palette.js'

// src/pages/contact/contact.css, Контакти's own (spec M3/M4 §7.3; Diptych
// §5.5, §11): its opening's entrance, the form's sticky picture, the
// subject's picture opening from the seam, the construction group's fold,
// the offices and the phones. jsdom applies no CSS, so these read the rules
// (src/test/css.js).

const PAGE = 'src/pages/contact/contact.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
const DESKTOP = '@media (min-width: 901px)'
const FINE_POINTER = '@media (hover: hover) and (pointer: fine)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation') || valueOf(rule, 'animation-name'))
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)

describe('the opening’s motion (Diptych §5.5, M3/M4 §4.2)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…).
  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.reach')).toEqual([])
  })

  // Spec §7.3: the seam draws down, the H1's lines rise from their masks,
  // 0.1 s apart, and the answer follows down the seam, each from --arrive.
  it('draws the seam, raises the lines and brings the answer down the seam, from --arrive', () => {
    const seam = animationOf(':root.js .reach > .seam')
    expect(valueOf(seam, 'animation')).toBe('contact-draw 1.3s var(--e-out) both')
    expect(valueOf(seam, 'animation-delay')).toBe('var(--arrive)')
    const lines = animationOf(':root.js .reach__h1 .split-line')
    expect(valueOf(lines, 'animation')).toBe('contact-rise .9s var(--e-out) both')
    expect(valueOf(lines, 'animation-delay')).toBe('calc(var(--arrive) + .12s + var(--n, 0) * .1s)')
    expect(valueOf(animationOf(':root.js .reach__a > *'), 'animation-delay')).toBe('calc(var(--arrive) + .42s + var(--i, 0) * .09s)')
    for (const selector of [':root.js .reach > .seam', ':root.js .reach__h1 .line-mask', ':root.js .reach__h1 .split-line', ':root.js .reach__lead', ':root.js .reach__a > *']) {
      const rule = animationOf(selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(keyframes('contact-rise')[0].declarations).toEqual([{ prop: 'transform', value: 'translateY(112%)', important: false }])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^contact-/)
  })
})

// Spec §4.1: the H1 reads across the seam at Home's slogan size; no heading
// outsizes its section's h2, so the cities stand at the h2's own size.
it('sets the H1 at the slogan’s size, and the cities at their section’s h2’s', () => {
  expect(declaredFor('.reach__h1')['font-size']).toBe('var(--fs-slogan)')
  expect(declaredFor('.office__city')['font-size']).toBe('var(--fs-h2)')
  expect(declaredFor('.office__city', [PHONE])['font-size']).toBeUndefined()
})

// Global Constraints: sizes that set the page's length come from --screen-h.
it('sizes nothing in vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|l|d)?vh\b/)
  }
})

// Spec §11, ruling F9: the radio is visually hidden, so its row carries the
// site's ring (2 px ivory, 3 px off), Highlight under forced colours; no rule
// takes a ring away.
it('rings the subject’s row as the keyboard reaches its radio, and takes no ring away', () => {
  expect(declaredFor('.subj__opt:has(:focus-visible)')).toMatchObject({ outline: '2px solid var(--ivory)', 'outline-offset': '3px' })
  expect(declaredFor('.subj__opt:has(:focus-visible)', ['@media (forced-colors: active)'])['outline-color']).toBe('Highlight')
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) {
      if (prop.startsWith('outline')) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/none|\b0(px)?\b/)
    }
  }
})

// Diptych §5.8: the subjects' picture is sticky only where motion is
// allowed, and side by side; held, the picture starts below the whole header.
it('pins the picture only with motion, on a desktop', () => {
  expect(declaredFor(':root.js .ask__media', [NO_PREFERENCE, DESKTOP])).toMatchObject({ position: 'sticky', top: '0' })
  expect(rulesFor(rules, '.ask__media').every((rule) => valueOf(rule, 'position') !== 'sticky')).toBe(true)
  expect(declaredFor(':root[data-eu-hold] .ask__frame', [DESKTOP]).top).toBe('var(--header-h)')
})

// Spec §5.2, §5.3, Diptych §9: the stale-data notice sits under the subjects
// as they are set, against the seam on a desktop and flush with the legend on
// a phone; its words and its phone are the component's own stylesheet's
// (src/explorer/staleNotice.css).
it('sets the stale-data notice under the subjects, as they are set', () => {
  expect(declaredFor('.subj .subj__notice')).toMatchObject({ margin: '14px 0 0', padding: '0', 'text-align': 'right' })
  expect(declaredFor('.subj .subj__notice', [PHONE])['text-align']).toBe('left')
})

// Spec §7.3: the visitor's subject opens its picture from the seam (the left
// half's right edge), 1 s; on a phone from the band's foot; at once without
// motion.
it('opens the chosen picture from the seam in 1 s, only with motion', () => {
  const opening = animationOf(':root.js .plate.is-opening')
  expect(opening.atRules).toEqual([NO_PREFERENCE])
  expect(valueOf(opening, 'animation')).toBe('contact-open 1s var(--e-io) both')
  // Both ends are shapes, so the clip moves (clip-path cannot interpolate to
  // none: it would flip half-way).
  expect(keyframes('contact-open').map((frame) => [frame.selector, valueOf(frame, 'clip-path')])).toEqual([['from', 'inset(0 0 0 100%)'], ['to', 'inset(0 0 0 0)']])
  expect(declaredFor(':root.js .plate.is-opening', [NO_PREFERENCE, PHONE])['animation-name']).toBe('contact-open-up')
  expect(keyframes('contact-open-up').map((frame) => [frame.selector, valueOf(frame, 'clip-path')])).toEqual([['from', 'inset(100% 0 0 0)'], ['to', 'inset(0 0 0 0)']])
})

// Spec §7.3: the construction group folds open and closed in 0.55 s, and
// clips only while it folds, so no ring is cut once it is open (ruling F9).
it('folds the construction group in 0.55 s, clipping only while it folds', () => {
  expect(valueOf(animationOf(':root.js .fold.is-opening'), 'animation')).toBe('contact-fold-open .55s var(--e-out) both')
  expect(valueOf(animationOf(':root.js .fold.is-closing'), 'animation')).toBe('contact-fold-close .55s var(--e-out) forwards')
  expect(keyframes('contact-fold-open')[0].declarations).toEqual(expect.arrayContaining([{ prop: 'grid-template-rows', value: '0fr', important: false }]))
  expect(declaredFor('.fold__in')).toEqual({ 'min-height': '0' })
  expect(declaredFor(':root.js .fold.is-opening > .fold__in', [NO_PREFERENCE]).overflow).toBe('hidden')
})

// Spec §2.2: hover belongs to pointers that hover.
it('hovers only where a pointer hovers', () => {
  for (const rule of rules.filter(({ selector }) => selector.includes(':hover'))) expect(rule.atRules, rule.selector).toContain(FINE_POINTER)
})

// M3/M4 §4.1: the halves stack on a phone, the seams hide and the second
// half takes the brass rule.
it('stacks the halves on a phone, each second half under a brass rule', () => {
  expect(declaredFor('.reach', [PHONE])['grid-template-columns']).toBe('1fr')
  expect(declaredFor('.reach > .seam', [PHONE]).display).toBe('none')
  expect(declaredFor('.reach__a', [PHONE])['border-top']).toBe('1px solid var(--brass)')
  expect(declaredFor('.ask__grid > .seam', [PHONE]).display).toBe('none')
  expect(declaredFor('.ask__fields', [PHONE])['border-top']).toBe('1px solid var(--brass)')
  expect(declaredFor('.doorway', [PHONE])['grid-template-columns']).toBe('1fr')
})

// On a phone the subjects leave the photograph for the page below it, yet sit
// in its dark island (.ask__media.dark): in the light theme they take the
// page's light values back, as the form's other fields have them, and their
// inherited colour with them. The light sweep found the chosen subject ivory
// on the light stone, all but invisible.
it('gives the subjects the light values on a phone in the light theme', () => {
  const values = declaredFor(':root[data-theme="light"] .ask__media .subj', [PHONE])
  for (const [key, value] of Object.entries(LIGHT_PALETTE)) expect(values[`--${key}`], key).toBe(value)
  expect(values['--hi']).toBe('#000000')
  expect(values['color-scheme']).toBe('light')
  expect(values.color).toBe('var(--ivory)')
})
