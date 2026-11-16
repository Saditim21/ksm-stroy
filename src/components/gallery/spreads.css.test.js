import { rulesFor, rulesOf, valueOf } from '../../test/css'

// src/components/gallery/spreads.css, a gallery of spreads (Spreads.jsx;
// Diptych spec §6.17, M3 §4.4, §6.2 #5). Its stage, layers, caption and
// controls moved here from the Golden Residence page's stylesheet, their
// pins with them, unchanged (ruling PF7); the drawings' plates are new.
// jsdom applies no CSS, so these read the rules (src/test/css.js).

const SPREADS = 'src/components/gallery/spreads.css'
const rules = rulesOf(SPREADS)
const PHONE = '@media (max-width: 900px)'
const FINE = '@media (hover: hover) and (pointer: fine)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('the gallery (spec §6.17)', () => {
  it('sets two halves on the seam, .78 of the screen tall up to 780 px, stacked 4:3 on a phone', () => {
    expect(declaredFor('.gal__stage')).toMatchObject({ display: 'grid', 'grid-template-columns': '1fr 1fr', height: 'min(calc(var(--screen-h) * .78), 780px)' })
    expect(declaredFor('.gal__stage', [PHONE])).toMatchObject({ 'grid-template-columns': '1fr', height: 'auto' })
    expect(declaredFor('.gal__half', [PHONE])['aspect-ratio']).toBe('4 / 3')
  })

  // Spec §2.1: a control's border is hair-ctl.
  it('borders its buttons in hair-ctl, 52 px square', () => {
    expect(declaredFor('.gal__ctl button')).toMatchObject({ width: '52px', height: '52px', border: '1px solid var(--hair-ctl)' })
  })

  // Every layer but those on show is hidden; Spreads.jsx stacks them.
  it('shows only the pictures on show', () => {
    expect(declaredFor('.gal__img').visibility).toBe('hidden')
    expect(declaredFor('.gal__img[data-shown]').visibility).toBe('visible')
  })
})

// Spec §4: at 900 px and under every grid stacks and the seams hide.
it('hides the gallery’s seams on a phone', () => {
  for (const selector of ['.gal__stage > .seam', '.gal__bar > .seam']) {
    expect(declaredFor(selector, [PHONE]).display, selector).toBe('none')
  }
})

// Spec M3 §6.2 #5: a drawing lies whole on the umber, never cropped, under
// its title; and a picture that fades into its ground (Многофамилна's
// grade) shows umber through, never the layer under it.
describe('the drawings’ plates (spec M3 §6.2 #5)', () => {
  it('lays a drawing whole on the umber, inside a margin, under its title, the two in the middle', () => {
    expect(declaredFor('.gal__img--whole')).toMatchObject({ display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', padding: 'clamp(18px, 4vw, 64px)' })
    // As tall as it is at the plate's width, or shrunk to what the plate
    // leaves it, whole, its left edge under its title's.
    expect(declaredFor('.gal__img--whole picture')).toMatchObject({ flex: '0 1 auto', 'min-height': '0', height: 'auto' })
    expect(declaredFor('.gal__img--whole img')).toMatchObject({ 'object-fit': 'contain', 'object-position': '0 50%' })
    expect(declaredFor('.gal__title').flex).toBe('none')
  })

  it('puts umber under every layer’s picture', () => {
    expect(declaredFor('.gal__img').background).toBe('var(--umber)')
    expect(declaredFor('.gal__img img')['object-fit']).toBe('cover')
  })
})

// Ruling F9, spec §11: nothing takes the site's focus ring away.
it('keeps the site’s focus ring on every control', () => {
  for (const rule of rules) expect(valueOf(rule, 'outline'), rule.selector).not.toBe('none')
})

// Spec §2.2: anything sized by the screen uses --screen-h, never vh or svh.
it('sizes nothing by vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})

// Spec §2.2: a hover effect needs a pointer that hovers, so a tap never
// leaves one behind.
it('keeps every :hover rule where a fine pointer hovers', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.map((rule) => rule.selector)).toEqual(['.gal__ctl button:hover'])
  for (const rule of hovers) expect(rule.atRules, rule.selector).toContain(FINE)
})
