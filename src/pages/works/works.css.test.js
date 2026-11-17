import { firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/works/works.css, Обекти's own, and book.css, its book's (spec
// M3/M4 §7.2, §4.3; Diptych §5.5, §11): the register's opening, its plates
// and their grade, the filter's short labels, the book's true colour and its
// place over the page. jsdom applies no CSS, so these read the rules
// (src/test/css.js).

const PAGE = 'src/pages/works/works.css'
const BOOK = 'src/pages/works/book.css'
const rules = rulesOf(PAGE)
const book = rulesOf(BOOK)
const PHONE = '@media (max-width: 900px)'
const FINE_POINTER = '@media (hover: hover) and (pointer: fine)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = [], from = rules) {
  const found = rulesFor(from, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const animationOf = (selector) => rulesFor(rules, selector).find((rule) => valueOf(rule, 'animation') || valueOf(rule, 'animation-name'))
const keyframes = (name) => rules.filter((rule) => rule.atRules.at(-1) === `@keyframes ${name}`)

describe('the opening’s motion (Diptych §5.5, M3/M4 §4.2, §7.2)', () => {
  // Every rule that declares an animation starts with :root.js and sits
  // inside @media (prefers-reduced-motion: no-preference); outside @keyframes
  // and that media query, nothing in the opening, its first row included,
  // declares opacity: 0, visibility: hidden, a translateY(…) or a scale…(…).
  it('plays the opening only under the gate, its starting states in the keyframes', () => {
    expect(firstViewportMotionProblems(PAGE, '.ob, .wk')).toEqual([])
  })

  // Spec §7.2: the title rises, the seam draws down, the lead and the filter
  // follow, the first row's cover photo settles and its two smaller plates
  // open from the seam. All from --arrive.
  it('raises the title, draws the seam and opens the first row’s smaller plates from the seam', () => {
    expect(valueOf(animationOf(':root.js .ob__h1 .split-line'), 'animation')).toBe('works-rise .95s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .ob__seam'), 'animation')).toBe('works-draw 1.6s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .ob__lead'), 'animation')).toBe('works-up 1s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .ob__filter'), 'animation')).toBe('works-up 1s var(--e-out) both')
    expect(valueOf(animationOf(':root.js .ob__list:not(.is-folded) > .wk:first-child .wk__ph--m1'), 'animation')).toBe('works-wipe 1s var(--e-io) both')
    expect(valueOf(animationOf(':root.js .ob__list:not(.is-folded) > .wk:first-child .wk__ph--m2'), 'animation')).toBe('works-wipe 1s var(--e-io) both')
    for (const selector of [
      ':root.js .ob__h1 .line-mask',
      ':root.js .ob__h1 .split-line',
      ':root.js .ob__seam',
      ':root.js .ob__lead',
      ':root.js .ob__filter',
      ':root.js .ob__list:not(.is-folded) > .wk:first-child .wk__ph--m1',
      ':root.js .ob__list:not(.is-folded) > .wk:first-child .wk__ph--m2',
      ':root.js .ob__list:not(.is-folded) > .wk:first-child .wk__ph--cover img',
    ]) {
      const rule = animationOf(selector)
      expect(rule, selector).toBeDefined()
      expect(rule.atRules, selector).toEqual([NO_PREFERENCE])
      expect(valueOf(rule, 'animation-delay'), selector).toMatch(/^(calc\()?var\(--arrive\)/)
    }
    expect(keyframes('works-wipe')[0].declarations).toEqual([{ prop: 'clip-path', value: 'inset(0% 0% 0% 100%)', important: false }])
    expect(keyframes('works-rise')[0].declarations).toEqual([{ prop: 'transform', value: 'translateY(112%)', important: false }])
  })

  // Diptych §5.5 (v2 rule 5.2.3, which §5.9 keeps): the first row's cover is
  // the page's LCP image (Register.jsx gives it fetchpriority=high). It is
  // whole from the first frame, never wiped, clipped or faded: its photo
  // only settles in scale, from --arrive, as Home's and Golden Residence's
  // do. Of the first row, only the two smaller plates open from the seam.
  it('keeps the first row’s cover, the LCP image, whole from the first frame: its photo only settles in scale', () => {
    const FIRST_ROW = ':root.js .ob__list:not(.is-folded) > .wk:first-child '
    const animated = rules
      .filter((rule) => rule.declarations.some(({ prop }) => prop === 'animation' || prop === 'animation-name'))
      .flatMap((rule) => rule.selectors
        .filter((selector) => selector.includes('.wk:first-child') || selector.includes('.wk__ph') || selector.includes('.wk__pic'))
        .map((selector) => [selector.replace(FIRST_ROW, ''), valueOf(rule, 'animation') ?? valueOf(rule, 'animation-name'), rule.atRules.join(' / ')]))
    expect(animated).toEqual([
      ['.wk__ph--cover img', 'works-settle 1.5s var(--e-out) both', NO_PREFERENCE],
      ['.wk__ph--m1', 'works-wipe 1s var(--e-io) both', NO_PREFERENCE],
      ['.wk__ph--m2', 'works-wipe 1s var(--e-io) both', NO_PREFERENCE],
      ['.wk__ph--m1', 'works-wipe-top', `${NO_PREFERENCE} / ${PHONE}`],
      ['.wk__ph--m2', 'works-wipe-top', `${NO_PREFERENCE} / ${PHONE}`],
    ])
    expect(valueOf(animationOf(`${FIRST_ROW}.wk__ph--cover img`), 'animation-delay')).toBe('var(--arrive)')
    expect(keyframes('works-settle').flatMap((rule) => rule.declarations)).toEqual([{ prop: 'transform', value: 'scale(1.12)', important: false }])
  })

  // On a phone the halves stack and the seam hides: the smaller plates open
  // from their top, as a picture does there (useWipes).
  it('opens the first row’s smaller plates from their top on a phone', () => {
    for (const plate of ['.wk__ph--m1', '.wk__ph--m2']) {
      const phone = rulesFor(rules, `:root.js .ob__list:not(.is-folded) > .wk:first-child ${plate}`)
        .find((rule) => rule.atRules.join(' / ') === `${NO_PREFERENCE} / ${PHONE}`)
      expect(valueOf(phone, 'animation-name'), plate).toBe('works-wipe-top')
    }
    expect(keyframes('works-wipe-top')[0].declarations).toEqual([{ prop: 'clip-path', value: 'inset(0% 0% 100% 0%)', important: false }])
  })

  // Keyframe names never clash with Tailwind's (ruling C4.2).
  it('names its keyframes for the page', () => {
    const names = rules.flatMap((rule) => rule.atRules.filter((at) => at.startsWith('@keyframes')).map((at) => at.slice(11)))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^works-/)
  })
})

// Spec §4.1: Обекти's H1 is a big single-word title, at the Golden
// Residence H1's size.
it('sets the title at --fs-title', () => {
  expect(declaredFor('.ob__h1')['font-size']).toBe('var(--fs-title)')
})

// Spec §7.2: the long labels where the half has the room; below 1240 px the
// eye gets the short ones, while the long ones keep naming the buttons.
it('gives the filter its short labels below 1240 px, the long ones still the buttons’ names', () => {
  expect(declaredFor('.ob__fs').display).toBe('none')
  const narrow = ['@media (max-width: 1240px)']
  expect(declaredFor('.ob__fs', narrow).display).toBe('inline')
  const long = declaredFor('.ob__fl', narrow)
  expect(long.position).toBe('absolute')
  expect(long.clip).toBe('rect(0 0 0 0)')
  expect(long.display).toBeUndefined()
})

describe('the plates (spec §7.2, §11)', () => {
  // Each plate's picture fills it, cropped, its grade the markup's (.grade).
  it('fill each plate with its picture, cropped', () => {
    expect(declaredFor('.wk__pic')).toMatchObject({ width: '100%', height: '100%' })
    expect(declaredFor('.wk__pic img')).toMatchObject({ width: '100%', height: '100%', 'object-fit': 'cover' })
    expect(declaredFor('.wk__ph--cover')['aspect-ratio']).toBe('4 / 3')
  })

  // Spec §11: a plate is a link over media: its ring is the system's, 4 px
  // inside its edges, over the picture, which lies under the plate's own
  // painting.
  it('ring a focused plate 4 px inside its edges, over its picture', () => {
    expect(declaredFor('.wk__ph:focus-visible')['outline-offset']).toBe('-4px')
    expect(declaredFor('.wk__ph').isolation).toBe('isolate')
    expect(declaredFor('.wk__pic')['z-index']).toBe('-1')
  })

  it('brighten a plate’s edge where a pointer hovers, only there', () => {
    const hover = rulesFor(rules, '.wk__ph:hover::after')
    expect(hover.length).toBeGreaterThan(0)
    for (const rule of hover) expect(rule.atRules).toEqual([FINE_POINTER])
  })
})

describe('the book (spec §7.2, §4.3)', () => {
  // The book shows its photos, and the strip its thumbnails, in true
  // colour: nothing in book.css filters them. Only the plate that flies in
  // carries the grade, which lifts as it lands (Book.jsx).
  it('shows its photos in true colour', () => {
    for (const rule of book) {
      if (rule.selectors.includes('.bk-fly')) continue
      expect(valueOf(rule, 'filter'), rule.selector).toBeUndefined()
    }
    expect(declaredFor('.bk-fly', [], book).filter).toBe('saturate(.5) sepia(.2) brightness(.74) contrast(1.08)')
  })

  // Each photo at its own size or below (--w and --h are the photo's).
  it('sets each photo at its own size or below', () => {
    expect(declaredFor('.bk__fig img', [], book)).toMatchObject({
      'max-width': 'min(100%, var(--w))',
      'max-height': 'min(100%, var(--h))',
    })
  })

  // Over the page and its header, as the plan stage is; the plate that
  // flies in over the book.
  it('lies over the page, the plate that flies in over it', () => {
    expect(declaredFor('.bk', [], book)).toMatchObject({ position: 'fixed', 'z-index': '50' })
    expect(declaredFor('.bk-fly', [], book)).toMatchObject({ position: 'fixed', 'z-index': '51', 'pointer-events': 'none' })
  })

  // A phone shows one page: the right one and the seam go.
  it('shows one page on a phone', () => {
    expect(declaredFor('.bk__stage', [PHONE], book)['grid-template-columns']).toBe('1fr')
    expect(declaredFor('.bk__page--r', [PHONE], book).display).toBe('none')
  })

  // A swipe turns the pages; the browser keeps the vertical scroll.
  it('lets a finger swipe the stage', () => {
    expect(declaredFor('.bk__stage', [], book)['touch-action']).toBe('pan-y')
  })

  // Spec §11, ruling C8.12: a thumbnail's ring keeps 5 px or more inside
  // the strip, which scrolls.
  it('keeps a thumbnail’s ring inside the strip', () => {
    const strip = declaredFor('.bk__strip', [], book)
    expect(strip['overflow-x']).toBe('auto')
    expect(strip.padding).toBe('6px')
    expect(declaredFor('.bk__strip button:focus-visible', [], book)['outline-offset']).toBe('1px')
  })

  it('changes on hover only where a pointer hovers', () => {
    for (const rule of book.filter((each) => each.selectors.some((selector) => selector.includes(':hover')))) {
      expect(rule.atRules, rule.selector).toEqual([FINE_POINTER])
    }
  })
})

// Plan, global rules: the system's ring, never `outline: none`, and the
// screen's height as --screen-h, never vh or svh.
it('keeps the system’s focus ring and the screen’s height token', () => {
  for (const rule of [...rules, ...book]) {
    for (const { prop, value } of rule.declarations) {
      if (prop === 'outline') expect(value, rule.selector).not.toMatch(/none|^0/)
      expect(value, `${rule.selector} ${prop}`).not.toMatch(/\d(s|d|l)?vh\b/)
    }
  }
})
