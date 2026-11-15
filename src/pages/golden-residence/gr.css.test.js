import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/golden-residence/gr.css: the Golden Residence page's hero, story,
// blocks, gallery and parking (spec §5.5, §5.8, §6.14–6.18). jsdom applies no
// CSS, so these read the rules (src/test/css.js).

const GR = 'src/pages/golden-residence/gr.css'
const rules = rulesOf(GR)
const PHONE = '@media (max-width: 900px)'
const WIDE = '@media (min-width: 901px)'
const FINE = '@media (hover: hover) and (pointer: fine)'
// The first viewport's blocks: the hero and its facts.
const HERO = '.grhero, .fact'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('the hero’s entrance (spec §5.5)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, no rule for the hero declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…).
  it('plays only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(GR, HERO)).toEqual([])
  })

  // The table of spec §5.5: the image settles from 1.12, the two words of
  // the title rise, the address, the facts' seam, the facts and the actions
  // come in, each from --arrive.
  it('animates what spec §5.5 animates, each from --arrive', () => {
    const animated = [
      ':root.js .grhero__media img',
      ':root.js .grhero__title .split-line',
      ':root.js .grhero__addr',
      ':root.js .grhero__facts .seam',
      ':root.js .fact',
      ':root.js .grhero__actions > *',
    ]
    for (const selector of animated) {
      const [rule] = rulesFor(rules, selector).filter((r) => valueOf(r, 'animation'))
      expect(rule, selector).toBeDefined()
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(valueOf(rulesFor(rules, ':root.js .grhero__media img')[0], 'animation')).toMatch(/^gr-settle 1\.4s var\(--e-out\) both$/)
    expect(valueOf(rulesFor(rules, ':root.js .grhero__title .split-line')[0], 'animation')).toMatch(/^gr-rise \.9s var\(--e-out\) both$/)
  })

  // Spec §5.5: the starts of a normal entrance, and of the hero move's,
  // which lands on Home's own picture: that does not settle again.
  it('starts the entrance as spec §5.5 says, sooner after the hero move, whose picture does not settle again', () => {
    expect(declaredFor('.grhero')).toMatchObject({ '--gr-title': '.25s', '--gr-addr': '.45s', '--gr-seam': '.55s', '--gr-facts': '.6s', '--gr-actions': '.7s' })
    expect(declaredFor('[data-arrive="hero"] .grhero')).toEqual({
      '--gr-title': '.05s', '--gr-addr': '.2s', '--gr-seam': '.3s', '--gr-facts': '.32s', '--gr-actions': '.42s',
    })
    expect(declaredFor(':root.js [data-arrive="hero"] .grhero__media img', [NO_PREFERENCE])).toEqual({ animation: 'none' })
  })

  // Spec §5.5: the LCP image is never faded; it only settles in scale.
  it('never fades the picture', () => {
    const picture = rules.filter((rule) => rule.selectors.some((selector) => selector.includes('.grhero__media')))
    for (const rule of picture) expect(valueOf(rule, 'opacity'), rule.selector).toBeUndefined()
    const settle = rules.filter((rule) => rule.atRules.at(-1) === '@keyframes gr-settle')
    expect(settle.flatMap((frame) => frame.declarations.map(({ prop }) => prop))).toEqual(['transform'])
  })
})

// Ruling F8: the hero move lands through vt-cut and an identical frame, not a
// shared element, which would fade the LCP picture on its own.
it('names no view transition', () => {
  for (const rule of rules) expect(valueOf(rule, 'view-transition-name'), rule.selector).toBeUndefined()
})

describe('the hero (spec §6.14, §6.7)', () => {
  // 640 px at least, shared with Home's opening, so the hero move lands
  // exactly (spec §14.9); the render framed as Home's half frames it.
  it('is one screen tall, at least 640 px, the render framed as on Home', () => {
    expect(declaredFor('.grhero').height).toBe('max(640px, var(--screen-h))')
    expect(declaredFor('.grhero__media img')['object-position']).toBe('50% 62%')
    expect(declaredFor('.grhero__media img', [PHONE])['object-position']).toBe('68% 62%')
  })

  it('stacks the facts on a phone around a 56 px brass tick', () => {
    expect(declaredFor('.grhero__facts', [PHONE])['grid-template-columns']).toBe('1fr')
    expect(declaredFor('.grhero__facts .seam', [PHONE])).toMatchObject({ width: '56px', height: '1px' })
    expect(declaredFor('.grhero__title', [PHONE])['font-size']).toBe('clamp(48px, 13.5vw, 80px)')
  })
})

describe('the story (spec §6.15, §5.8)', () => {
  // Spec §5.8: no sticky story without motion, and inline figures instead.
  it('keeps its picture beside the text only with motion and the halves side by side', () => {
    const sticky = rules.filter((rule) => valueOf(rule, 'position') === 'sticky')
    expect(sticky.map((rule) => [rule.selector, rule.atRules])).toEqual([[':root.js .story__pin', [NO_PREFERENCE, WIDE]]])
    expect(declaredFor(':root.js .story__pin', [NO_PREFERENCE, WIDE])).toMatchObject({ display: 'block', top: '0', height: 'var(--screen-h)' })
    expect(declaredFor('.story__pin').display).toBe('none')
  })

  it('shows the inline figures except beside the picture: on a phone, and without motion', () => {
    expect(declaredFor('.story__inline').display).toBe('block')
    expect(declaredFor(':root.js .story__inline', [NO_PREFERENCE, WIDE]).display).toBe('none')
    expect(declaredFor('.story__inline', [PHONE])['aspect-ratio']).toBe('4 / 3')
  })

  it('sets the first block one screen tall and the others .84 of it, beside the picture', () => {
    expect(declaredFor(':root.js .story__block', [NO_PREFERENCE, WIDE])['min-height']).toBe('calc(var(--screen-h) * .84)')
    expect(declaredFor(':root.js .story__block:first-child', [NO_PREFERENCE, WIDE])['min-height']).toBe('var(--screen-h)')
  })
})

describe('the blocks (spec §6.16; extract §4.27)', () => {
  it('sets each block’s 12 × 8 squares 4 px apart, 500 px wide at most, the floors beside them', () => {
    expect(declaredFor('.blk__grid')).toMatchObject({ display: 'grid', 'grid-template-columns': 'repeat(12, 1fr)', gap: '4px', width: '100%' })
    expect(declaredFor('.blk__grid button')).toMatchObject({ 'aspect-ratio': '1', border: '1px solid var(--c)' })
    expect(declaredFor('.blk__floors')).toMatchObject({ display: 'grid', 'grid-template-columns': 'auto 1fr', gap: '8px', width: 'min(100%, 500px)' })
    expect(declaredFor('.blk--a .blk__floors')['grid-template-columns']).toBe('1fr auto')
    expect(declaredFor('.blk__fl')).toMatchObject({ 'grid-template-rows': 'repeat(8, 1fr)', 'font-size': '10px', color: 'var(--stone)' })
  })

  // Spec §7.9: never colour alone; a status's pattern on each square.
  it('marks each square by its status’s pattern, blocked by a dashed outline, and waits in a hair outline', () => {
    expect(declaredFor('.blk__grid .s-free')).toMatchObject({ '--c': 'var(--status-free)', background: 'rgba(79, 191, 133, .55)' })
    expect(declaredFor('.blk__grid .s-reserved').background).toBe('repeating-linear-gradient(-45deg, rgba(233, 149, 63, .9) 0 1.5px, transparent 1.5px 4px)')
    expect(declaredFor('.blk__grid .s-sold')).toMatchObject({ '--c': 'rgba(212, 87, 78, .7)', 'background-image': 'radial-gradient(rgba(212, 87, 78, .85) 1px, transparent 1.3px)', 'background-size': '4px 4px' })
    expect(declaredFor('.blk__grid .s-blocked')).toMatchObject({ '--c': 'var(--status-blocked)', 'border-style': 'dashed' })
    expect(declaredFor('.blk__grid .s-none')['--c']).toBe('var(--hair)')
  })

  it('grows a square pointed at by 1.18, where a fine pointer hovers', () => {
    expect(declaredFor('.blk__grid button:hover', [FINE])).toMatchObject({ transform: 'scale(1.18)', 'z-index': '1' })
  })

  it('sets the stats: the types in 14 px, the exposures four across in the serif, two on a small phone', () => {
    expect(declaredFor('.blk__types')).toMatchObject({ 'font-size': '14px', color: 'var(--ivory-2)' })
    expect(declaredFor('.blk__expo')).toMatchObject({ display: 'grid', 'grid-template-columns': 'repeat(4, auto)', gap: '10px 22px' })
    expect(declaredFor('.blk__expo b')).toMatchObject({ display: 'block', font: '600 26px/1 var(--serif)' })
    expect(declaredFor('.blk__expo', ['@media (max-width: 560px)'])['grid-template-columns']).toBe('repeat(2, auto)')
    expect(declaredFor('.blk__note')).toMatchObject({ 'font-size': '13px', color: 'var(--stone)', 'max-width': '30em' })
  })

  // Ruling C8.11: before the data, block Б's exposures (BlocksSection.jsx)
  // keep the room their rows take once the data fills them, so nothing
  // under the blocks moves: two rows of four, four of two on a small phone,
  // each the count's 26 px over a 13 px line at the page's 1.6 leading.
  it('keeps the room of block Б’s exposure rows while they wait for the data', () => {
    expect(declaredFor('.blk__expo:empty')['min-height']).toBe('calc(2 * (26px + 1.6em) + 10px)')
    expect(declaredFor('.blk__expo:empty', ['@media (max-width: 560px)'])['min-height']).toBe('calc(4 * (26px + 1.6em) + 3 * 10px)')
  })

  // Extract §4.27, phones: left-aligned, block А's floors moved to the left.
  it('turns block А’s floors to the left of its squares on a phone, and its counts left-aligned', () => {
    expect(declaredFor('.blk--a .blk__floors', [PHONE])['grid-template-columns']).toBe('auto 1fr')
    expect(declaredFor('.blk--a .blk__floors .blk__fl', [PHONE]).order).toBe('-1')
    expect(declaredFor('.blk--a .blk__stats .legend')['justify-content']).toBe('flex-end')
    expect(declaredFor('.blk--a .blk__stats .legend', [PHONE])['justify-content']).toBe('flex-start')
  })
})

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

  // Every layer but those on show is hidden; GallerySection.jsx stacks them.
  it('shows only the pictures on show', () => {
    expect(declaredFor('.gal__img').visibility).toBe('hidden')
    expect(declaredFor('.gal__img[data-shown]').visibility).toBe('visible')
  })
})

// Spec §4: at 900 px and under every grid stacks and the seams hide. The
// story's seam shows only beside its picture half, with motion.
it('hides the gallery’s seams on a phone, and the story’s wherever its halves are not side by side', () => {
  for (const selector of ['.gal__stage > .seam', '.gal__bar > .seam']) {
    expect(declaredFor(selector, [PHONE]).display, selector).toBe('none')
  }
  expect(declaredFor('.story > .seam').display).toBe('none')
  expect(rules.filter((rule) => rule.selectors.includes(':root.js .story > .seam')).map((rule) => [valueOf(rule, 'display'), rule.atRules]))
    .toEqual([['block', [NO_PREFERENCE, WIDE]]])
})

describe('the garages and parking places (spec §6.18)', () => {
  it('sets each half’s cells 11 px square, 3 px apart, at most 460 px wide', () => {
    expect(declaredFor('.park__cells')).toMatchObject({ gap: '3px', 'max-width': '460px' })
    expect(declaredFor('.park__cells i')).toMatchObject({ width: '11px', height: '11px' })
    expect(declaredFor('.park')).toMatchObject({ background: 'var(--umber)' })
  })

  // Spec §7.9: a status is never colour alone; blocked is a dashed outline.
  it('marks each status by its pattern, blocked by a dashed outline', () => {
    expect(declaredFor('.park__cells .s-reserved').background).toMatch(/^repeating-linear-gradient\(-45deg/)
    expect(declaredFor('.park__cells .s-sold')['background-image']).toMatch(/^radial-gradient\(/)
    expect(declaredFor('.park__cells .s-blocked')['border-style']).toBe('dashed')
  })
})

// Ruling F9, spec §11: nothing takes the site's focus ring away.
it('keeps the site’s focus ring on every control', () => {
  for (const rule of rules) {
    expect(valueOf(rule, 'outline'), rule.selector).not.toBe('none')
  }
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
  expect(hovers.length).toBeGreaterThan(0)
  for (const rule of hovers) expect(rule.atRules, rule.selector).toContain(FINE)
})
