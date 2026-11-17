import mnImages from '../../data/images/mnogofamilna.json'
import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/mnogofamilna/mn.css, the Многофамилна page's own (its opening, the
// list's section), and src/explorer/mn-facade.css, Многофамилна's facade
// (spec M3 §6.2, §6.3; Diptych §5.5): its geometry on the building map's
// grid, its crops, its lights and their entrance, and its dialogs' drawing.
// jsdom applies no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/mnogofamilna/mn.css'
const FACADE = 'src/explorer/mn-facade.css'
const page = rulesOf(PAGE)
const facade = rulesOf(FACADE)
const PHONE = '@media (max-width: 900px)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(rules, selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (rules, selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation'))
const keyframes = (rules, name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)

describe('the first viewport’s motion (Diptych §5.5, M3 §4.2)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening, the facade or its lights
  // declares opacity: 0, visibility: hidden, a translateY(…) or a scale…(…).
  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.mnx')).toEqual([])
  })

  it('plays the facade and its lights only under the gate, their starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(FACADE, '.fx, .fx__lit, .fx__lights')).toEqual([])
  })

  // The opening: the title's two parts rise from their masks, across the
  // seam, then the address, the facts and the actions come up, each from
  // --arrive.
  it('animates the opening from --arrive', () => {
    for (const selector of [
      ':root.js .mnx__head > .seam',
      ':root.js .mnx__h1 .line-mask',
      ':root.js .mnx__h1 .split-line',
      ':root.js .mnx__addr',
      ':root.js .mnx__fact',
      ':root.js .mnx__actions > *',
    ]) {
      const rule = animationOf(page, selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules).toContain(NO_PREFERENCE)
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(valueOf(animationOf(page, ':root.js .mnx__h1 .split-line'), 'animation')).toMatch(/^mn-rise \.9s var\(--e-out\) both$/)
  })

  // Spec M3 §6.3: the lit floors switch on once, bottom to top, both blocks
  // of a floor together, 0.55 s each and 0.11 s apart, the page's one
  // signature moment. Dark only in the keyframes, under :root.js inside
  // no-preference, from --arrive; without motion they are simply lit.
  it('switches the lights on from dark only in their keyframes, 0.55 s each, 0.11 s apart, from --arrive', () => {
    const rule = animationOf(facade, ':root.js .fx__lit')
    expect(rule).toBeDefined()
    expect(rule.atRules).toEqual([NO_PREFERENCE])
    const [name, duration, , fill] = valueOf(rule, 'animation').split(' ')
    expect(duration).toBe('.55s')
    expect(fill).toBe('both')
    expect(valueOf(rule, 'animation-delay')).toMatch(/^calc\(var\(--arrive\) \+ .*var\(--i\) \* \.11s\)$/)
    const frames = keyframes(facade, name)
    expect(frames.map((frame) => frame.selector)).toEqual(['from'])
    expect(frames[0].declarations).toEqual([{ prop: 'opacity', value: '0', important: false }])
    // Nowhere else is a lit floor dark.
    const dark = facade.filter((each) => each.selectors.some((selector) => selector.includes('.fx__lit')) && valueOf(each, 'opacity') !== undefined)
    expect(dark).toEqual([])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = [...page, ...facade].flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^mn-/)
  })
})

// Sizes that set the page's length come from --screen-h (Global
// Constraints): never vh or svh.
it('sizes nothing in vh or svh', () => {
  for (const rule of [...page, ...facade]) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|l|d)?vh\b/)
  }
})

// Spec M3 §6.3 (the concept's mnogofamilna.js:257-266, :403-409), on the
// building map's grid of 1200 × 848.
describe('the facade’s geometry', () => {
  it('shows the desktop crop 0 / 150 / 1200 × 480, the courtyard at the page’s centre', () => {
    expect(declaredFor(facade, '.fx.fx--mn')).toMatchObject({ '--vbx': '0', '--vby': '150', '--vbw': '1200', '--vbh': '480' })
    expect(declaredFor(facade, '.fx--mn .fx__stage')).toMatchObject({ left: 'calc(50% - var(--sw) * .507917)' })
  })

  it('crops a phone to one block: А −36 / 208 / 652 × 412, Б from 600', () => {
    expect(declaredFor(facade, '.fx.fx--mn', [PHONE])).toMatchObject({ '--vbx': '-36', '--vby': '208', '--vbw': '652', '--vbh': '412' })
    expect(declaredFor(facade, '.fx.fx--mn[data-block="Б"]', [PHONE])).toMatchObject({ '--vbx': '600' })
    expect(declaredFor(facade, '.fx--mn .fx__stage', [PHONE])).toMatchObject({ 'aspect-ratio': '652 / 412' })
  })

  it('stands the rails at x 72 and 1142', () => {
    expect(declaredFor(facade, '.fx--mn .fx__rail--a').left).toBe('calc((72 - var(--vbx)) / var(--vbw) * 100%)')
    expect(declaredFor(facade, '.fx--mn .fx__rail--b').left).toBe('calc((1142 - var(--vbx)) / var(--vbw) * 100%)')
  })

  // The render without its margins lies at y 56.2, 1200 × 732.5, in the
  // grid's frame, 848 tall; the lights over it, the same box.
  it('places the render and its lights at y 56.2, 1200 × 732.5 on the grid', () => {
    expect(declaredFor(facade, '.fx--mn .fx__frame').height).toBe('calc(848 / var(--vbh) * 100%)')
    const box = declaredFor(facade, '.fx--mn .fx__pic')
    expect(box).toMatchObject({ top: 'calc(56.2 / 848 * 100%)', height: 'calc(732.5 / 848 * 100%)' })
    expect(declaredFor(facade, '.fx--mn .fx__lights')).toMatchObject({ top: 'calc(56.2 / 848 * 100%)', height: 'calc(732.5 / 848 * 100%)' })
  })

  // The edge fades (the concept's :438-452): the render fades into the onyx
  // at the crop's edges, the lights with it.
  it('fades the render and its lights at the crop’s edges', () => {
    for (const selector of ['.fx--mn .fx__pic', '.fx--mn .fx__lights']) {
      const declared = declaredFor(facade, selector)
      expect(declared['mask-image'], selector).toMatch(/linear-gradient\(to bottom[\s\S]*linear-gradient\(to right/)
      expect(declared['mask-composite'], selector).toBe('intersect')
    }
  })
})

// Ruling PF5: Многофамилна's drawing is quieter, .42 in the plan stage and
// .55 in the unit panel's crop, under its plans' class.
it('draws Многофамилна’s plan drawing at .42 in the stage and .55 in the crop', () => {
  expect(declaredFor(facade, '.plan.plan--mn')['--drawing']).toBe('.42')
  expect(declaredFor(facade, '.plan--mn.plan--crop')['--drawing']).toBe('.55')
  expect(declaredFor(facade, '.plan.plan--mn .drawing[data-loaded]').opacity).toBe('var(--drawing)')
})

// Spec M3 §6.2 #3: the list loads lazily, and the room it takes is kept
// before it comes, so nothing visible moves when it lands: its bar's height
// over its table's box, which then fills what the bar leaves.
it('keeps the list’s room before it loads', () => {
  expect(declaredFor(page, '.mnl')['--list-table']).toMatch(/var\(--screen-h\)/)
  expect(declaredFor(page, '.mnl__list')['min-height']).toMatch(/^calc\(var\(--list-table\) \+ \d+px\)$/)
  expect(declaredFor(page, '.mnl .lv__table')).toMatchObject({ height: 'var(--list-table)', flex: '1 0 auto' })
})

// Spec M3 §6.2 #2 (the concept's mnogofamilna.css:147-149): a block in
// numbers (src/explorer/blockGrid.css, its pins in
// src/explorer/blockGrid.css.test.js) sized for this building, 8 squares a
// floor and 9 floors, 352 px wide at most, the whole width on a small phone;
// under the section's own class, as Golden Residence's page sizes the same
// squares 12 × 8 (gr.css).
describe('the blocks (spec M3 §6.2 #2)', () => {
  it('sets each block’s squares 8 across and 9 floors down, 352 px wide at most', () => {
    expect(declaredFor(page, '.mnb .blk__grid')).toEqual({ 'grid-template-columns': 'repeat(8, 1fr)' })
    expect(declaredFor(page, '.mnb .blk__fl')).toEqual({ 'grid-template-rows': 'repeat(9, 1fr)' })
    expect(declaredFor(page, '.mnb .blk__floors')).toEqual({ width: 'min(100%, 352px)' })
    expect(declaredFor(page, '.mnb .blk__floors', ['@media (max-width: 560px)']).width).toBe('100%')
    // Every rule of the page's for the squares and the halves is the
    // section's own.
    const blocks = page.filter((rule) => rule.selectors.some((selector) => /.blk/.test(selector)))
    expect(blocks.length).toBeGreaterThan(0)
    for (const rule of blocks) for (const selector of rule.selectors) expect(selector, rule.selector).toMatch(/^.mnb /)
  })

  // The way to each block's page is as wide as its words, on the block's
  // side; on a phone, where the halves stack left-aligned, on the left.
  it('sets „Преглед на блока“ on its block’s side', () => {
    expect(declaredFor(page, '.mnb .blk__go')['justify-self']).toBe('start')
    expect(declaredFor(page, '.mnb .blk--a .blk__go')['justify-self']).toBe('end')
    expect(declaredFor(page, '.mnb .blk--a .blk__go', [PHONE])['justify-self']).toBe('start')
  })
})

// Spec M3 §6.2 #4: the building's picture and words side by side, the
// picture .72 of the screen tall; on a phone the picture first, at 4:3, the
// words under a brass rule.
it('sets the building’s picture beside its words, stacked on a phone', () => {
  expect(declaredFor(page, '.mns__media')['min-height']).toBe('clamp(460px, calc(var(--screen-h) * .72), 780px)')
  expect(declaredFor(page, '.mns__media img')['object-fit']).toBe('cover')
  expect(declaredFor(page, '.mns .kv')['grid-template-columns']).toBe('repeat(2, minmax(0, 1fr))')
  expect(declaredFor(page, '.mns__media', [PHONE])).toMatchObject({ 'min-height': '0', 'aspect-ratio': '4 / 3' })
  expect(declaredFor(page, '.mns__text', [PHONE])['border-top']).toBe('1px solid var(--brass)')
})

// Spec M3 §6.2 #4, #5: the daylight renders are taken to the night palette
// by CSS, as the concept's derivatives have them: each photo's sky cut away
// along its skyline, so the umber behind it is the night sky, the rest a
// little warmer and darker. The cut is a mask in the photo's own pixels,
// sized and placed as the photo is (cover, at --at, its object-position too),
// so the two meet at any crop; the drawings keep their colours
// (mn.prerender.test.jsx).
describe('the night grade (spec M3 §6.2 #4, #5)', () => {
  it('cuts each photo’s sky with a mask sized and placed as the photo is', () => {
    expect(declaredFor(page, '.mn-night')).toMatchObject({
      '--at': '50% 50%',
      filter: 'sepia(.12) brightness(.94)',
      'object-position': 'var(--at)',
      'mask-position': 'var(--at)',
      'mask-size': 'cover',
      'mask-repeat': 'no-repeat',
    })
  })

  // The concept's framing (its mnogofamilna.js:1101-1102): the blocks on
  // their towers, the gallery's perspective on its nearer pair.
  it('frames the blocks at 50% 46% and the gallery’s perspective at 58% 50%', () => {
    expect(declaredFor(page, '.mn-night--block-a')['--at']).toBe('50% 46%')
    expect(declaredFor(page, '.mn-night--block-b')['--at']).toBe('50% 46%')
    expect(declaredFor(page, '.mn-gal--persp')['--at']).toBe('58% 50%')
  })

  // Each mask is the photo's skyline in the photo's own pixels: an SVG as
  // wide and tall as the image (its manifest's w and h), one path that keeps
  // everything under the skyline, down to the photo's bottom edge.
  it('draws each photo’s skyline in its own pixels, keeping the street', () => {
    for (const [id, image] of [['block-a', 'mn-block-a'], ['block-b', 'mn-block-b'], ['front', 'mn-front'], ['persp', 'mn-persp']]) {
      const { w, h } = mnImages[image]
      const mask = declaredFor(page, `.mn-night--${id}`)['mask-image']
      const svg = decodeURIComponent(/^url\("data:image\/svg\+xml,(.*)"\)$/.exec(mask)?.[1] ?? '')
      expect(svg, id).toContain(`width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'`)
      const paths = [...svg.matchAll(/<path d='([^']+)'\/>/g)].map(([, d]) => d)
      expect(paths, id).toHaveLength(1)
      expect(paths[0], id).toMatch(new RegExp(`^M0 ${h}L.*L${w} ${h}Z$`))
    }
  })
})

// Spec M3 §4.1 (the critic's hinge fix): from 901 px no hinge's title or lead
// runs into the page's gutter. That is now the site's rule, for every hinge
// (src/styles/diptych.css; M3 ruling T5d), so the page sets no margin or
// padding of its own on a hinge or its halves, which would undo it.
it('leaves its hinges’ gutter to the site’s rule', () => {
  const own = page.filter((rule) => rule.selectors.some((selector) => /\.hinge\b/.test(selector)))
  expect(own.map((rule) => rule.selector)).toEqual([])
})

// Ruling F9, spec §11: nothing on the page takes the site's focus ring away.
it('keeps the site’s focus ring on every control', () => {
  for (const rule of page) expect(valueOf(rule, 'outline'), rule.selector).not.toBe('none')
})
