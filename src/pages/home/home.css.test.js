import { atRulesOf, firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/home/home.css: Home's opening, company section and EU poster
// (spec §5.5, §6.7, §6.8, §6.13). jsdom applies no CSS, so these read the
// rules (src/test/css.js).

const HOME = 'src/pages/home/home.css'
const rules = rulesOf(HOME)
// Widening needs a pointer that hovers, and the halves side by side.
const FINE_WIDE = '@media (hover: hover) and (pointer: fine) and (min-width: 901px)'
const PHONE = '@media (max-width: 900px)'
// The first viewport's blocks: the hero, its halves and slogan, the intro.
const FIRST_VIEWPORT = '.hero, .half, .sl, .intro-doors, .door, .doors'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('the first viewport’s motion (spec §5.5)', () => {
  // Every rule that declares an animation starts with :root.js and sits inside
  // @media (prefers-reduced-motion: no-preference); outside @keyframes and
  // that media query, no rule for the hero or the intro declares opacity: 0,
  // visibility: hidden, stroke-dashoffset, a translateY(…) or a scale…(…).
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(HOME, FIRST_VIEWPORT)).toEqual([])
  })

  // The checked rules exist: the slogan rises, the images settle, the infos
  // fade up, the doors part, the mark draws.
  it('animates what spec §5.5 animates, each from --arrive', () => {
    const animated = rules.filter((rule) => valueOf(rule, 'animation'))
    expect(animated.flatMap((rule) => rule.selectors)).toEqual(expect.arrayContaining([
      ':root.js .hero__title .split-line',
      ':root.js .half__media img',
      ':root.js .half__info',
      ':root.js.intro .intro-doors',
      ':root.js.intro .door--l',
      ':root.js.intro .door--r',
      ':root.js.intro .doors__seam',
      ':root.js.intro .door__mark path',
    ]))
    for (const selector of [':root.js .hero__title .split-line', ':root.js .half__media img', ':root.js .half__info']) {
      expect(valueOf(rulesFor(rules, selector)[0], 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
  })

  it('outside no-preference, nothing shows the intro doors', () => {
    const showing = rules.filter((rule) =>
      rule.selectors.some((selector) => /\.intro-doors$/.test(selector))
      && valueOf(rule, 'display') !== undefined
      && valueOf(rule, 'display') !== 'none'
      && !rule.atRules.includes(NO_PREFERENCE))
    expect(showing.map((rule) => rule.selector)).toEqual([])
    expect(valueOf(rulesFor(rules, '.intro-doors')[0], 'display')).toBe('none')
  })

  // The intro plays on the first page the app renders only: a page reached by
  // a link, or by Back, carries data-arrive (src/root.jsx), and the `intro`
  // class stays on <html> for the document's life (Review Focus 4).
  it('the intro doors never show under [data-arrive]', () => {
    const rule = rulesFor(rules, ':root.js.intro [data-arrive] .intro-doors')
    expect(rule).toHaveLength(1)
    expect(valueOf(rule[0], 'display')).toBe('none')
  })

  it('the intro ends hidden, its last keyframe visibility: hidden', () => {
    const name = valueOf(rulesFor(rules, ':root.js.intro .intro-doors')[0], 'animation').split(' ')[0]
    const frames = rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)
    expect(valueOf(frames.at(-1), 'visibility')).toBe('hidden')
    expect(frames.at(-1).selector).toMatch(/^(to|100%)$/)
  })
})

describe('the seam (spec §6.7)', () => {
  it('is a registered number, 0.5 to start', () => {
    const property = atRulesOf(HOME).find((atRule) => atRule.name === 'property' && atRule.params === '--s')
    expect(property.declarations.map(({ prop, value }) => [prop, value])).toEqual([
      ['syntax', "'<number>'"],
      ['inherits', 'true'],
      ['initial-value', '.5'],
    ])
  })

  it('centres each building in its half with the spec’s translations, and drops to --sy on a phone', () => {
    const hero = declaredFor('.hero')
    expect(hero['--xg']).toBe('min(0px, max(calc((var(--s) - 1) * 100cqw), calc(var(--s) * 50cqw - 68cqw)))')
    expect(hero['--xm']).toBe('min(calc(var(--s) * 100cqw), max(0px, calc((1 + var(--s)) * 50cqw - 73cqw)))')
    expect(hero['container-type']).toBe('inline-size')
    expect(declaredFor('.hero', [PHONE])['--sy']).toBe('clamp(50%, calc(var(--header-h) + 290px), calc(100% - 190px))')
  })

  it('is one screen tall, at least 640 px, or 560 px on a phone', () => {
    expect(declaredFor('.hero').height).toBe('max(640px, var(--screen-h))')
    expect(declaredFor('.hero', [PHONE]).height).toBe('max(560px, var(--screen-h))')
  })

  it('clips the halves at the seam: across on a desktop, down at --sy on a phone', () => {
    expect(declaredFor('.half--gr')['clip-path']).toBe('inset(0 calc((1 - var(--s)) * 100%) 0 0)')
    expect(declaredFor('.half--mn')['clip-path']).toBe('inset(0 0 0 calc(var(--s) * 100%))')
    expect(declaredFor('.half--gr', [PHONE])['clip-path']).toBe('inset(0 0 calc(100% - var(--sy)) 0)')
    expect(declaredFor('.half--mn', [PHONE])['clip-path']).toBe('inset(var(--sy) 0 0 0)')
    expect(declaredFor('.half--gr .half__info', [PHONE]).bottom).toBe('calc(100% - var(--sy) + 18px)')
  })

  // Spec §2.2, Review Focus 3: a tap never widens a half, nor does a phone,
  // and reduced motion keeps them at 50/50.
  it('widens only on a fine pointer that hovers, with the halves side by side', () => {
    const widening = rules.filter((rule) => ['.62', '.38'].includes(valueOf(rule, '--s')))
    expect(widening.map((rule) => valueOf(rule, '--s'))).toEqual(['.62', '.38'])
    for (const rule of widening) {
      expect(rule.atRules, rule.selector).toContain(FINE_WIDE)
      expect(rule.atRules, rule.selector).toContain(NO_PREFERENCE)
      expect(rule.selector).toMatch(/^:root\.js \.hero:has\(/)
    }
    expect(widening[0].selectors).toEqual([':root.js .hero:has(.half--gr:hover, .half--gr:focus-visible)'])
    expect(widening[1].selectors).toEqual([':root.js .hero:has(.half--mn:hover, .half--mn:focus-visible)'])
    const transition = rules.find((rule) => valueOf(rule, 'transition') === '--s .9s var(--e-out)')
    expect(transition.atRules).toEqual([NO_PREFERENCE, FINE_WIDE])
  })

  it('drops the other half’s shade to 0.4 as one widens', () => {
    const shades = rules.filter((rule) => valueOf(rule, 'opacity') === '.4')
    expect(shades.flatMap((rule) => rule.selectors).sort()).toEqual([
      ':root.js .hero:has(.half--gr:hover, .half--gr:focus-visible) .half--mn .half__shade',
      ':root.js .hero:has(.half--mn:hover, .half--mn:focus-visible) .half--gr .half__shade',
    ])
    for (const rule of shades) expect(rule.atRules).toEqual([NO_PREFERENCE, FINE_WIDE])
  })
})

// Spec §11: a link over positioned media carries its ring on an inset
// overlay: the half's own outline would fall outside its clip.
it('rings a focused half on an overlay of what shows of it, ivory, 4 px inside', () => {
  const ring = declaredFor('.half:focus-visible::after')
  expect(ring).toMatchObject({ outline: '2px solid var(--ivory)', 'outline-offset': '-4px' })
  expect(declaredFor('.half:focus-visible').outline).toBe('none')
  expect(declaredFor('.half:focus-visible::after', ['@media (forced-colors: active)'])['outline-color']).toBe('Highlight')
})

// Extract §8.3.2: `.bros__story p` beat the concept's `.triad`, which rendered
// at 17 px. Scoped, it renders at its role size (spec §3.3).
it('sets the triad at its role size, scoped so the story’s paragraphs never beat it', () => {
  const triad = declaredFor('.bros__story .triad')
  expect(triad).toMatchObject({ 'font-size': 'clamp(28px, 2.4vw, 38px)', 'line-height': '1', 'font-style': 'italic' })
  expect(rulesFor(rules, '.triad')).toEqual([])
})
