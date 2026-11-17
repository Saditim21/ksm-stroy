import { rulesFor, rulesOf, valueOf } from '../../test/css'

// src/components/ui/ways.css, the closing pair of ways (Ways.jsx; M3/M4 spec
// §4.4; Diptych spec §6.11, extract §4.13), Home's teaser's: a half each on
// the seam between hair-2 rules, the first against the seam, stacked on a
// phone under a brass rule. A way is a link or a button, so the rules name
// the ways by their place in the <nav>, after its seam. jsdom applies no CSS,
// so these read the rules (src/test/css.js).

const rules = rulesOf('src/components/ui/ways.css')
const PHONE = '@media (max-width: 900px)'
const FINE = '@media (hover: hover) and (pointer: fine)'
// Every way, and the first, the one against the seam.
const WAY = '.ways > :not(.seam)'
const FIRST = '.ways > .seam + *'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

it('sets the ways a half each between rules, the first against the seam', () => {
  expect(declaredFor('.ways')).toMatchObject({ display: 'grid', 'grid-template-columns': '1fr 1fr', 'border-top': '1px solid var(--hair-2)', 'border-bottom': '1px solid var(--hair-2)' })
  // A button reads as a link does: from the start, its words over its line.
  expect(declaredFor(WAY)).toMatchObject({ display: 'grid', gap: '6px', padding: '36px clamp(28px, 4vw, 80px)', 'text-align': 'start' })
  expect(declaredFor(FIRST)).toMatchObject({ 'text-align': 'right', 'justify-items': 'end' })
  expect(declaredFor('.ways .serif')['font-size']).toBe('clamp(40px, 4vw, 64px)')
  expect(declaredFor('.ways .small')['font-size']).toBe('14px')
})

it('stacks them on a phone, left-aligned, a brass rule between, no seam', () => {
  // After the base rules, which would otherwise win at equal specificity.
  const at = (selector, atRules) => rules.findIndex((rule) => rule.selectors.includes(selector) && rule.atRules.join(' / ') === atRules.join(' / '))
  for (const selector of ['.ways', WAY, FIRST]) expect(at(selector, [PHONE]), selector).toBeGreaterThan(at(selector, []))
  expect(declaredFor('.ways', [PHONE])['grid-template-columns']).toBe('1fr')
  expect(declaredFor('.ways > .seam', [PHONE]).display).toBe('none')
  expect(declaredFor(FIRST, [PHONE])).toMatchObject({ 'justify-items': 'start', padding: '26px var(--gut)', 'text-align': 'left' })
  expect(declaredFor(`${WAY} + :not(.seam)`, [PHONE])['border-top']).toBe('1px solid var(--brass)')
})

// Spec §2.2: a hover needs a pointer that hovers, so a tap never leaves one
// behind.
it('warms a way under a fine pointer only', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.flatMap((rule) => rule.selectors)).toEqual([`${WAY}:hover`, `${WAY}:hover .serif`])
  for (const rule of hovers) expect(rule.atRules, rule.selector).toEqual([FINE])
})

// Ruling F9, spec §11: nothing takes the site's focus ring away.
it('keeps the site’s focus ring', () => {
  for (const rule of rules) expect(valueOf(rule, 'outline'), rule.selector).toBeUndefined()
})
