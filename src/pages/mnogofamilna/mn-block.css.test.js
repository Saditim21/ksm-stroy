import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/mnogofamilna/mn-block.css, a Многофамилна block page's own (spec
// M3 §6.3, §6.5; the concept's css/mnogofamilna-block-a.css): the head, the
// floors beside the block's pinned facade, Б mirrored, the facade's block
// crop, and the head's entrance. jsdom applies no CSS, so these read the
// rules (src/test/css.js).

const PATH = 'src/pages/mnogofamilna/mn-block.css'
const rules = rulesOf(PATH)
const DESKTOP = '@media (min-width: 901px)'
const PHONE = '@media (max-width: 900px)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

// Spec M3 §6.5: the facade's half stays pinned while the floors scroll, on a
// desktop; on a phone the facade comes first and scrolls with the page.
// Without motion (reduced motion, data saver: the motion gate, `:root.js`)
// it is not pinned, as Diptych §5.8 drops the other sticky media and the
// concept unpins it (css/mnogofamilna-block-a.css:74-76): it stands at the
// top of its half, as tall as it is.
it('pins the facade’s half only from 901 px, and only with motion', () => {
  const sticky = rules.filter((rule) => valueOf(rule, 'position') === 'sticky')

  expect(sticky.map((rule) => [rule.selector, rule.atRules])).toEqual([[':root.js .mbl__pin', [NO_PREFERENCE, DESKTOP]]])
  const pin = declaredFor(':root.js .mbl__pin', [NO_PREFERENCE, DESKTOP])
  expect(pin.top).toBe('var(--bar-h)')
  expect(pin.height).toBe('calc(var(--screen-h) - var(--bar-h))')
  for (const rule of rulesFor(rules, '.mbl__pin')) expect(valueOf(rule, 'height'), rule.atRules.join(' / ')).toBeUndefined()
})

// Spec M3 §6.5: block Б is mirrored, its facade on the right as the block
// stands, by its root's class alone; the rows' brass rule on their seam
// side, and each half's gutter on its own outer edge.
it('mirrors block Б’s halves by its root’s class', () => {
  expect(declaredFor('.mbp--b .mbl__pin', [DESKTOP]).order).toBe('2')
  // Б's facade stands 18 px under the floors' top, as the concept has it
  // (css/mnogofamilna-block-a.css:24); А's sits lower, by its clamp.
  expect(declaredFor('.mbp--b .mbl__pin', [DESKTOP]).padding).toBe('18px var(--gut) 18px clamp(28px, 4vw, 72px)')
  expect(declaredFor('.mbp--b .mbl__rows', [DESKTOP]).order).toBe('1')
  const rule = declaredFor('.mbr::before')
  const mirrored = declaredFor('.mbp--b .mbr::before')
  expect(rule.left).toMatch(/^calc\(-1 \*/)
  expect([mirrored.left, mirrored.right]).toEqual(['auto', rule.left])
  // The stage stands against the seam: block А's on the right of its half,
  // Б's on the left, its rail on the outer side.
  expect(declaredFor('.fx--mn.fx--block .fx__stage', [DESKTOP])['margin-left']).toBe('auto')
  expect(declaredFor('.fx--mn.fx--block[data-block="Б"] .fx__stage', [DESKTOP])['margin-left']).toBe('0')
})

// Spec M3 §6.3: the block page's crops on the building map's grid, А
// 0 / 196 / 600 × 436 and Б 610 / 196 / 600 × 436, with the concept's fades
// (mnogofamilna.js:440); a phone keeps the main page's crop of the block
// (mn-facade.css).
it('crops the facade to its block on a desktop', () => {
  const crop = declaredFor('.fx.fx--mn.fx--block', [DESKTOP])
  expect([crop['--vbx'], crop['--vby'], crop['--vbw'], crop['--vbh']]).toEqual(['0', '196', '600', '436'])
  expect([crop['--fl'], crop['--fr']]).toEqual(['.127', '.117'])
  expect(crop['--sh']).toBe('calc(var(--sw) * 436 / 600)')
  const b = declaredFor('.fx.fx--mn.fx--block[data-block="Б"]', [DESKTOP])
  expect([b['--vbx'], b['--fl'], b['--fr']]).toEqual(['610', '.117', '.12'])
})

// What a block's facade leaves out (spec M3 §6.5): the courtyard's seam,
// the blocks' names, the phone's block switch and the caption, which the
// page sets under the facade itself.
it('shows no seam, names, block switch or caption of the facade’s own', () => {
  const hidden = rules.filter((rule) => valueOf(rule, 'display') === 'none' && rule.atRules.length === 0).flatMap((rule) => rule.selectors)

  expect(hidden).toEqual(expect.arrayContaining(['.fx.fx--block .fx__seam', '.fx.fx--block .fx__bname', '.fx.fx--block .fxm', '.fx.fx--block .fx__cap']))
})

// Spec M3 §4.1: on a phone the halves stack, the facade first; the rows'
// brass rule, which stands on the seam, goes with the seam.
it('stacks the halves on a phone, the facade first, the rows’ rule gone', () => {
  // The building's long name keeps whole at 320 px, in a reader's text
  // spacing too.
  expect(declaredFor('.mbp .bp__title', [PHONE])['font-size']).toBe('clamp(34px, 10.6vw, 52px)')
  expect(declaredFor('.mbl', [PHONE])['grid-template-columns']).toBe('minmax(0, 1fr)')
  expect(declaredFor('.mbr::before', [PHONE]).display).toBe('none')
  const pins = rulesFor(rules, '.mbp--b .mbl__pin')
  for (const rule of pins) expect(rule.atRules, 'only a desktop mirrors').toEqual([DESKTOP])
})

// A pointed floor's row (spec M3 §6.5): the brass rule draws down on its
// seam side, its number brass-l.
it('draws the hot row’s brass rule down its seam side', () => {
  expect(declaredFor('.mbr::before').transform).toBe('scaleY(0)')
  expect(declaredFor('.mbr.is-hot::before').transform).toBe('scaleY(1)')
  expect(declaredFor('.mbr.is-hot .mbr__no b').color).toBe('var(--brass-l)')
})

// The rule draws over the seam (spec M3 §6.5), for both blocks at every width.
// The seam is 1 px wide, centred on the halves' edge, above the split's other
// children (src/styles/diptych.css: `.split > .seam`). The rule lies on the
// same pixel, centred on that edge: the rows' padding on their seam side, and
// half a pixel, back from the row. And it paints above the seam: its z-index
// tops the seam's, in the stacking context they share, since neither the row,
// the rows' column nor the split makes one of its own. Flush against the edge
// and under the seam, one block's rule was covered whole once the pixels
// snapped (Б's at 1440 with Windows' scrollbar, А's at an even width).
it('draws the hot row’s rule on the seam’s own pixel, above it, for both blocks', () => {
  const seamDepths = rulesFor(rulesOf('src/styles/diptych.css'), '.split > .seam').map((each) => valueOf(each, 'z-index')).filter(Boolean)
  const seamDepth = Number(seamDepths.at(-1))
  const rule = declaredFor('.mbr::before')
  const mirrored = declaredFor('.mbp--b .mbr::before')

  expect(seamDepth).toBeGreaterThan(0)
  expect(Number(rule['z-index'])).toBeGreaterThan(seamDepth)
  expect(rule.left).toBe('calc(-1 * clamp(28px, 4vw, 72px) - .5px)')
  expect(mirrored.right).toBe(rule.left)
  expect(rule.width).toBe('1px')
  // The rows' padding on their seam side is the rule's way back to the edge.
  expect(declaredFor('.mbl__rows').padding).toBe('0 var(--gut) 0 clamp(28px, 4vw, 72px)')
  expect(declaredFor('.mbp--b .mbl__rows', [DESKTOP]).padding).toBe('0 clamp(28px, 4vw, 72px) 0 var(--gut)')
  for (const selector of ['.mbr', '.mbl__rows', '.mbl']) {
    for (const each of rulesFor(rules, selector)) {
      for (const prop of ['z-index', 'isolation', 'transform', 'opacity', 'filter', 'contain', 'will-change']) {
        expect(valueOf(each, prop), `${selector} ${prop}`).toBeUndefined()
      }
    }
  }
})

describe('the head’s entrance (Diptych §5.5, M3 §4.2)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the head declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…).
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PATH, '.mbp, .mbh, .bp')).toEqual([])
  })

  it('animates the head from --arrive', () => {
    const animated = rules.filter((rule) => valueOf(rule, 'animation'))
    expect(animated.length).toBeGreaterThan(0)
    for (const rule of animated) {
      expect(rule.atRules, rule.selector).toEqual([NO_PREFERENCE])
      expect(valueOf(rule, 'animation-delay'), rule.selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2), nor with the
  // main page's (mn.css), which can be in the page as the doors close.
  it('names its keyframes for the block page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^mnb-/)
  })
})

// Sizes that set the page's length come from --screen-h (Global
// Constraints): never vh or svh.
it('sizes nothing in vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})
