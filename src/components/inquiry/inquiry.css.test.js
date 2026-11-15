import { rulesFor, rulesOf, valueOf } from '../../test/css'

// src/components/inquiry/inquiry.css: the closing inquiry, the contact half
// and the form (spec §6.12, §10; extract §4.14), ported from the concept's
// css/diptych.css:232-253 and :405-412. jsdom applies no CSS, so these read
// the rules (src/test/css.js).

const rules = rulesOf('src/components/inquiry/inquiry.css')
const PHONE = '@media (max-width: 900px)'
const FINE = '@media (hover: hover) and (pointer: fine)'

function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

// Spec §2.1: a control's border is hair-ctl, which reaches 3:1 on onyx.
it('underlines the fields in hair-ctl, 17 px ivory on the ground', () => {
  expect(declaredFor('.field input')).toMatchObject({
    background: 'transparent',
    'border-bottom': '1px solid var(--hair-ctl)',
    color: 'var(--ivory)',
    'font-size': '17px',
    'border-radius': '0',
  })
  expect(declaredFor('.chip').border).toBe('1px solid var(--hair-ctl)')
})

// Ruling F9, spec §11: the fields keep the site's focus ring; the concept's
// brass-l underline stays as a second cue. Nothing takes the ring away.
it('keeps the site’s focus ring on every field, the brass-l underline besides', () => {
  for (const rule of rules) {
    expect(valueOf(rule, 'outline'), rule.selector).not.toBe('none')
    expect(rule.declarations.filter(({ prop }) => prop.startsWith('outline')), rule.selector).toEqual([])
  }
  expect(declaredFor('.field input:focus')['border-color']).toBe('var(--brass-l)')
})

// The form is `hidden` once sent (InquiryForm.jsx), and its own display
// would outrank the attribute's.
it('hides a sent form, for the thank-you in its place', () => {
  expect(declaredFor('.form').display).toBe('grid')
  expect(declaredFor('.form[hidden]')).toEqual({ display: 'none' })
})

// Spec §2.1: status-sold marks an invalid field.
it('marks an invalid field and its message in status-sold', () => {
  expect(declaredFor(".field [aria-invalid='true']")['border-color']).toBe('var(--status-sold)')
  expect(declaredFor('.field__err').color).toBe('var(--status-sold)')
})

it('sets the select’s brass chevron, its options on umber', () => {
  const select = declaredFor('.field select')
  expect(select.appearance).toBe('none')
  expect(select.background).toContain('%23B8954A')
  expect(declaredFor('.field select option').background).toBe('var(--umber)')
})

// Spec §2.2: a hover effect needs a pointer that hovers.
it('keeps every :hover rule where a fine pointer hovers', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.length).toBeGreaterThan(0)
  for (const rule of hovers) expect(rule.atRules, rule.selector).toEqual([FINE])
})

it('stacks the halves and the form’s rows on a phone, the form under a brass rule', () => {
  expect(declaredFor('.form__row', [PHONE])['grid-template-columns']).toBe('1fr')
  expect(declaredFor('.contact__r', [PHONE])['border-top']).toBe('1px solid var(--brass)')
  expect(declaredFor('.contact__l', [PHONE])).toMatchObject({ 'justify-items': 'start', 'text-align': 'left' })
})

it('sizes nothing by vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})
