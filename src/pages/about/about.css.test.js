import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/about/about.css, За нас's own (spec M3/M4 §7.4, §4.1, §4.3;
// Diptych §5.5, §11): the founding drawing itself once, in CSS, under the
// motion gate; the type held to the system's sizes, but for the H1's ruled
// exception (T5a); the photos left to the archive's one grade. jsdom applies
// no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/about/about.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
// The opening's blocks: the section, the seam's line, its two nodes, the lens
// and the figure.
const OPENING = '.origin, .stem, .node, .lens, .lineage'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation') || valueOf(rule, 'animation-name'))
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)
// An animation's start, in seconds after --arrive: „calc(var(--arrive) + 1.42s)“ → 1.42.
const startOf = (selector) => {
  const delay = valueOf(animationOf(selector), 'animation-delay')
  expect(delay, selector).toMatch(/^(calc\()?var\(--arrive\)/)
  return Number(/\+ ([\d.]+)s/.exec(delay)?.[1] ?? 0)
}

describe('the founding draws itself once, in CSS (Diptych §5.5, M3/M4 §4.2, §7.4)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…). Under reduced motion
  // it shows the final state.
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, OPENING)).toEqual([])
  })

  const STEPS = [
    ':root.js .origin__h1 .split-line',
    ':root.js .stem--top',
    ':root.js .node--top > span',
    ':root.js .lens__arcs svg',
    ':root.js .lens__name--l span',
    ':root.js .lens__name--r span',
    ':root.js .lens__and',
    ':root.js .stem--bot',
    ':root.js .node--bot .split-line',
    ':root.js .lineage__cap',
  ]

  it('animates each part of the drawing from --arrive, inside the reduced-motion query', () => {
    for (const selector of [...STEPS, ':root.js .origin__h1 .line-mask', ':root.js .node--bot .line-mask']) {
      const rule = animationOf(selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
      startOf(selector)
    }
  })

  // Spec §7.4, about 2.4 s in all: the H1 rises and the stem draws; the lens
  // opens from the top down; the names unveil outward from the seam; the
  // „и“ fades in and the date rises; then the caption, which says it all.
  it('draws in the spec’s order: the H1 and the stem, the lens, the names, the „и“ and the date', () => {
    const at = Object.fromEntries(STEPS.map((selector) => [selector, startOf(selector)]))
    const [h1, stem, , lens, left, right, and, stemBot, date, caption] = STEPS.map((selector) => at[selector])

    expect(h1).toBe(0)
    expect(stem).toBeLessThan(lens)
    expect(lens).toBeLessThan(left)
    expect(left).toBe(right)
    expect(left).toBeLessThan(and)
    expect(and).toBeLessThan(stemBot)
    expect(stemBot).toBeLessThan(date)
    expect(date).toBeLessThan(caption)
    expect(caption).toBeLessThanOrEqual(1.6)
  })

  // The lens opens from the top down; each name unveils from the seam
  // outward: „Кадри“ from its right edge, „Сухат“ from its left. Both ends of
  // each clip are shapes, so it moves (clip-path cannot interpolate to none).
  it('opens the lens from the top and unveils the names from the seam', () => {
    const frames = (name) => keyframes(name).map((frame) => [frame.selector, valueOf(frame, 'clip-path')])
    const lens = animationOf(':root.js .lens__arcs svg')
    expect(valueOf(lens, 'animation')).toMatch(/^about-lens [\d.]+s var\(--e-io\) backwards$/)
    expect(frames('about-lens')).toEqual([['from', 'inset(-2px -2px 100% -2px)'], ['to', 'inset(-2px)']])
    expect(valueOf(animationOf(':root.js .lens__name--l span'), 'animation')).toMatch(/^about-unveil-l /)
    expect(valueOf(animationOf(':root.js .lens__name--r span'), 'animation')).toMatch(/^about-unveil-r /)
    expect(frames('about-unveil-l')).toEqual([['from', 'inset(-.2em 0 -.3em 100%)'], ['to', 'inset(-.2em 0 -.3em 0)']])
    expect(frames('about-unveil-r')).toEqual([['from', 'inset(-.2em 100% -.3em 0)'], ['to', 'inset(-.2em 0 -.3em 0)']])
    expect(keyframes('about-rise')[0].declarations).toEqual([{ prop: 'transform', value: 'translateY(112%)', important: false }])
    expect(keyframes('about-draw')[0].declarations).toEqual([{ prop: 'transform', value: 'scaleY(0)', important: false }])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^about-/)
  })
})

// Ruling T5a, an exception to spec §4.1's two title sizes: above 900 px the
// H1 keeps the approved concept's size, at which „в КСМ Строй ООД“ holds one
// line in its half and the founding caption stays in the first screen (the
// slogan's size broke the name before „ООД“ up to about 1850 px). Phones keep
// the H1's own size, as Контакти's and Многофамилна's do. The motto closes
// its sentence at h3 size, not as a display quote (§7.4).
it('sets the H1 at the concept’s size above 900 px and its own below, the motto at h3 size', () => {
  expect(declaredFor('.origin__h1')['font-size']).toBe('clamp(40px, 4.3vw, 72px)')
  expect(declaredFor('.origin__h1', [PHONE])['font-size']).toBe('clamp(31px, 9.6vw, 52px)')
  expect(declaredFor('.motto')['font-size']).toBe('var(--fs-h3)')
})

// A clamp(min, vw, max) font size at a screen `width` px wide.
function sizeAt(clamp, width) {
  const [, min, vw, max] = /^clamp\(([\d.]+)px, ([\d.]+)vw, ([\d.]+)px\)$/.exec(clamp).map(Number)
  return Math.min(max, Math.max(min, (vw * width) / 100))
}
const H2 = 'clamp(40px, 4.6vw, 76px)'

// Spec §4.1: a heading never outsizes its section's h2, and За нас's value
// words are smaller than „Какво ни прави различни“ (QUESTIONS.md): at every
// width, side by side and stacked. The h2 is the system's (--fs-h2, src/index.css).
it('keeps the value words smaller than their h2 at every width', () => {
  const desktop = declaredFor('.ledger__k')['font-size']
  const phone = declaredFor('.ledger__k', [PHONE])['font-size']
  for (const width of [901, 1024, 1280, 1440, 1680, 1920, 2560]) {
    expect(sizeAt(desktop, width), `${width} px`).toBeLessThan(sizeAt(H2, width))
  }
  for (const width of [320, 360, 390, 430, 600, 900]) {
    expect(sizeAt(phone, width), `${width} px`).toBeLessThan(sizeAt(H2, width))
  }
})

// Spec §4.1: the promised activities' names stand no larger than their
// section's h2, side by side and stacked: at its size, or a clamp under it.
it('sets the activities’ names no larger than their section’s h2', () => {
  expect(declaredFor('.deed__t')['font-size']).toBe('var(--fs-h2)')
  const sizes = rules.filter((rule) => rule.selectors.some((selector) => selector.endsWith('.deed__t')))
    .flatMap((rule) => rule.declarations.filter(({ prop }) => prop === 'font-size').map(({ value }) => [rule.selector, value]))
  expect(sizes.length).toBeGreaterThan(1)
  for (const [selector, size] of sizes) {
    if (size === 'var(--fs-h2)') continue
    for (const width of [320, 390, 900, 901, 1024, 1440, 1920, 2560]) expect(sizeAt(size, width), `${selector} at ${width} px`).toBeLessThan(sizeAt(H2, width))
  }
})

// Spec §4.3: the archive's photos take the one grade, `.grade`
// (src/styles/diptych.css), on their pictures in the markup; the page sets no
// filter of its own.
it('leaves the photos’ grade to .grade, setting no filter of its own', () => {
  for (const rule of rules) {
    for (const { prop } of rule.declarations) expect(`${rule.selector} { ${prop} }`).not.toMatch(/\{ (-webkit-)?filter \}/)
  }
})

// Global Constraints: sizes that set the page's length come from --screen-h.
it('sizes nothing in vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|l|d)?vh\b/)
  }
})

// Spec §11, ruling F9: no rule takes a ring away.
it('takes no focus ring away', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) {
      if (prop.startsWith('outline')) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/none|\b0(px)?\b/)
    }
  }
})

// Spec §7.4: on phones the lineage stays a vertical figure (its lens and its
// stems stay), while every other pair stacks and its seam hides.
it('keeps the lineage a vertical figure on phones, and stacks the pairs', () => {
  const figure = rules.filter((rule) => rule.atRules.includes(PHONE) && rule.selectors.some((selector) => /\.(stem|lens|lineage)/.test(selector)))
  for (const rule of figure) {
    for (const { prop, value } of rule.declarations) {
      expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\{ (display: none|grid-template-columns: .*) \}$/)
    }
  }
  expect(declaredFor('.origin__h1', [PHONE])['grid-template-columns']).toBe('minmax(0, 1fr)')
  // One column, which a reader's wider text spacing may make narrower than
  // its longest word (WCAG 1.4.12): the word breaks, never runs off the screen.
  for (const pair of ['.deeds__pair', '.team__body', '.offer', '.cta']) {
    expect(declaredFor(pair, [PHONE])['grid-template-columns'], pair).toBe('minmax(0, 1fr)')
  }
  expect(declaredFor('.tradition')['overflow-wrap']).toBe('anywhere')
})
