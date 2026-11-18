import { firstViewportMotionProblems, NO_PREFERENCE, outweighs, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/projects/projects.css, Продажби's own (spec M3/M4 §7.1; Diptych
// §5.5, §11): the sales board, its opening, its hot floor and square, the
// two buildings row by row, and the closing's solid way (ruling M4-PF14).
// jsdom applies no CSS, so these read the rules (src/test/css.js).

const PAGE = 'src/pages/projects/projects.css'
const rules = rulesOf(PAGE)
const PHONE = '@media (max-width: 900px)'
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

describe('the opening’s motion (Diptych §5.5, M3/M4 §4.2, §7.1)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening declares opacity: 0,
  // visibility: hidden, a translateY(…) or a scale…(…).
  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.pz-open, .pz-head, .pz-h1, .pz-lead, .pz-hint, .pz-board, .bd')).toEqual([])
  })

  // Spec §7.1: the H1 rises; the seam draws down and the ground line draws
  // across; the buildings rise floor by floor, the ground floor first, each
  // floor spreading out from the seam: a square waits 85 ms a floor above the
  // ground and 6 ms a square away from the seam. All from --arrive.
  it('raises the title, draws the seam and the ground, then raises the buildings floor by floor from the seam', () => {
    expect(valueOf(animationOf(':root.js .pz-h1 .split-line'), 'animation')).toBe('projects-rise .9s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .pz-board > .seam'), 'animation')).toBe('projects-draw 1.3s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .pz-board::after'), 'animation')).toBe('projects-ground 1.2s var(--e-out) both')
    const square = animationOf(':root.js .bd .blk__grid > button')
    expect(valueOf(square, 'animation')).toBe('projects-cell .6s var(--e-out) backwards')
    expect(valueOf(square, 'animation-delay')).toBe('calc(var(--arrive) + .55s + var(--rise) * 85ms + var(--x) * 6ms)')
    for (const selector of [':root.js .pz-h1 .split-line', ':root.js .pz-board > .seam', ':root.js .pz-board::after', ':root.js .bd .blk__grid > button']) {
      const rule = animationOf(selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(keyframes('projects-cell')[0].declarations.map(({ prop }) => prop)).toEqual(['opacity', 'transform'])
    expect(keyframes('projects-ground')[0].declarations).toEqual([{ prop: 'transform', value: 'scaleX(0)', important: false }])
  })

  // A square's floor and its place from the seam, by its place in its grid:
  // Golden Residence's twelve a floor, eight floors; Многофамилна's eight a
  // floor, nine floors. Its rise counts the floors above the ground.
  it('places every square by its floor and its distance from the seam', () => {
    expect(declaredFor('.bd--gr .blk__grid > :nth-child(n+85)')['--row']).toBe('7')
    expect(declaredFor('.bd--mn .blk__grid > :nth-child(n+65)')['--row']).toBe('8')
    expect(declaredFor('.bd--gr .blk__grid > :nth-child(12n)')['--col']).toBe('11')
    expect(declaredFor('.bd--mn .blk__grid > :nth-child(8n)')['--col']).toBe('7')
    expect(declaredFor('.bd--gr .blk__grid > button')['--rise']).toBe('calc(7 - var(--row, 0))')
    expect(declaredFor('.bd--mn .blk__grid > button')['--rise']).toBe('calc(8 - var(--row, 0))')
    // Golden Residence stands left of the seam: its block Б is nearer it.
    expect(declaredFor('.bd--gr .bd__blk:first-child .blk__grid > button')['--x']).toBe('calc(23 - var(--col, 0))')
    expect(declaredFor('.bd--gr .bd__blk:last-child .blk__grid > button')['--x']).toBe('calc(11 - var(--col, 0))')
    expect(declaredFor('.bd--mn .bd__blk:first-child .blk__grid > button')['--x']).toBe('var(--col, 0)')
    expect(declaredFor('.bd--mn .bd__blk:last-child .blk__grid > button')['--x']).toBe('calc(8 + var(--col, 0))')
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^projects-/)
  })
})

// Spec §4.1: Продажби's H1 is a big single-word title, at the Golden
// Residence H1's size.
it('sets the H1 at the system’s title size', () => {
  expect(declaredFor('.pz-h1')['font-size']).toBe('var(--fs-title)')
})

// Spec §7.1: hover or focus lights the square's floor and dims the rest; the
// square itself grows, ringed in brass, and the keyboard's ring stays the
// site's (spec §11, ruling F9).
describe('the hot floor and square', () => {
  const DIM = 'calc(.26 + .74 * clamp(0, 1 - (var(--row, 0) - var(--hot, -9)) * (var(--row, 0) - var(--hot, -9)), 1))'
  const opacityOf = (rule) => rule.declarations.find(({ prop }) => prop === 'opacity')

  // A pointer's hot floor is a plain declaration: a square still in its
  // entrance (an animation, which outranks it) keeps its entrance and lands
  // on its dimmed or lit look, never showing early, shrunk and low, as an
  // important one would have it (final review, W2). The entrance fills
  // backwards only, so once a square has landed nothing holds it, and the
  // dimming takes over (ruling FWc).
  it('dims every square but the hot floor’s, a square still rising left to its entrance', () => {
    const [dim, ...more] = rulesFor(rules, '.bd__plot[data-hot] .blk__grid > button')
    expect(more).toEqual([])
    expect(opacityOf(dim)).toEqual({ prop: 'opacity', value: DIM, important: false })
    expect(valueOf(animationOf(':root.js .bd .blk__grid > button'), 'animation')).toMatch(/ backwards$/)
  })

  // The keyboard's: the focus within a grid keeps every square at opacity 1,
  // important (blockGrid.css, over BlockGrid's own entrance), so the hot
  // floor's dimming is important there, and weightier, whichever stylesheet
  // comes last.
  it('dims them for the keyboard too, over the focus’s own opacity', () => {
    const [own] = rulesFor(rulesOf('src/explorer/blockGrid.css'), '.blk__grid:focus-within button')
    expect(opacityOf(own)).toEqual({ prop: 'opacity', value: '1', important: true })
    const [keyboard] = rulesFor(rules, '.bd__plot[data-hot] .blk__grid:focus-within > button')
    expect(opacityOf(keyboard)).toEqual({ prop: 'opacity', value: DIM, important: true })
    expect(outweighs('.bd__plot[data-hot] .blk__grid:focus-within > button', '.blk__grid:focus-within button')).toBe(true)
  })

  // The ring marks it everywhere; it grows only where motion is welcome
  // (Diptych §5.8), and hover only where a pointer hovers (spec §2.2).
  it('rings the hot square in brass, grows it where motion is welcome, and keeps the keyboard’s ring', () => {
    expect(declaredFor('.bd .blk__grid > button:focus')).toMatchObject({ outline: '1px solid var(--brass-l)' })
    expect(declaredFor('.bd .blk__grid > button:hover', [FINE_POINTER])).toMatchObject({ outline: '1px solid var(--brass-l)' })
    expect(declaredFor('.bd .blk__grid > button:focus', [NO_PREFERENCE])).toEqual({ transform: 'scale(1.3)' })
    expect(declaredFor('.bd .blk__grid > button:hover', [NO_PREFERENCE, FINE_POINTER])).toEqual({ transform: 'scale(1.3)' })
    expect(declaredFor('.bd .blk__grid > button:focus-visible')).toMatchObject({ outline: '2px solid var(--ivory)' })
    for (const rule of rules) {
      for (const { prop, value } of rule.declarations) {
        if (prop === 'outline' || prop === 'outline-style') expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/:\s*(none|0)\b/)
      }
    }
  })
})

// Spec §7.1 and the concept (css/prodazhbi.css:136-137, its captures
// prodazhbi-1440-first and -critic-1440-first): under each building, its
// count, then „Разгледайте апартаментите“, then the caption, last, two lines
// high whatever it says, so that its changes move nothing. The stale-data
// notice comes after the caption, so that it moves nothing either: on a
// 1440 × 900 screen the hot caption stays in view with the notice shown.
it('puts each building’s link under its count, the caption under the link and the stale-data notice last', () => {
  expect(declaredFor('.bd__plot')['grid-row']).toBe('3')
  expect(declaredFor('.bd__count')['grid-row']).toBe('4')
  expect(declaredFor('.bd__go')['grid-row']).toBe('5')
  expect(declaredFor('.bd__cap')).toMatchObject({ 'grid-row': '6', 'min-height': '58px' })
  expect(declaredFor('.bd .bd__notice')['grid-row']).toBe('7')
  // On a phone the caption keeps to the squares, where the finger is, and
  // the link follows it.
  expect(declaredFor('.bd__cap', [PHONE]).order).toBe('6')
  expect(declaredFor('.bd__go', [PHONE]).order).toBe('7')
})

// The stale-data notice keeps to its building's side over its own stylesheet's
// centring (src/explorer/staleNotice.css, which may load after this one), and
// to the gutter on a phone.
it('keeps the stale-data notice on its building’s side', () => {
  expect(declaredFor('.bd--gr .bd__notice')).toMatchObject({ 'margin-right': 'var(--pad)', 'margin-left': 'var(--gut)', 'text-align': 'right' })
  expect(declaredFor('.bd--mn .bd__notice')).toMatchObject({ 'margin-right': 'var(--gut)', 'margin-left': 'var(--pad)', 'text-align': 'left' })
  expect(declaredFor('.bd--gr .bd__notice', [PHONE])).toMatchObject({ margin: '14px 0 0', 'text-align': 'left' })
  // On a phone it follows the count, before the squares, in the building's
  // own order, not the board's row.
  expect(declaredFor('.bd .bd__notice', [PHONE])).toMatchObject({ 'grid-row': 'auto', order: '4' })
  expect(declaredFor('.bd__count', [PHONE]).order).toBe('3')
  expect(declaredFor('.bd__plot', [PHONE]).order).toBe('5')
})

// Ruling M4-PF14: the closing's first way, „Попитайте за цени“, in the solid
// look, ivory with an onyx label; white where a pointer hovers.
it('gives the closing’s first way the solid look', () => {
  expect(declaredFor('.pz-close .ways > .seam + *')).toMatchObject({ background: 'var(--ivory)', color: 'var(--onyx)' })
  expect(declaredFor('.pz-close .ways > .seam + *:hover', [FINE_POINTER])).toMatchObject({ background: '#fff' })
})

// Spec §7.1: phones get two stacked spec sheets, each answer labelled.
it('stacks the rows into two spec sheets on a phone, each answer labelled', () => {
  expect(declaredFor('.led__row', [PHONE]).display).toBe('contents')
  expect(declaredFor('.led__v::before', [PHONE]).content).toBe('attr(data-k)')
  expect(declaredFor('.led__k', [PHONE]).display).toBe('none')
})

// Global Constraints: sizes that set the page's length come from --screen-h.
it('sizes nothing in vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(`${rule.selector} { ${prop}: ${value} }`).not.toMatch(/\d(s|l|d)?vh\b/)
  }
})
