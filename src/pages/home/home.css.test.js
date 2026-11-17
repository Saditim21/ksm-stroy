import defaultTheme from 'tailwindcss/defaultTheme'
import tailwindConfig from '../../../tailwind.config.js'
import { atRulesOf, firstViewportMotionProblems, NO_PREFERENCE, rulesFor, rulesOf, valueOf } from '../../test/css'

// src/pages/home/home.css: Home's opening, company section, services, works,
// the teaser's ways and the EU poster (spec §5.5, §5.8, §6.7–6.11, §6.13).
// jsdom applies no CSS, so these read the rules (src/test/css.js).

const HOME = 'src/pages/home/home.css'
const rules = rulesOf(HOME)
// Widening needs a pointer that hovers, and the halves side by side.
const FINE_WIDE = '@media (hover: hover) and (pointer: fine) and (min-width: 901px)'
const PHONE = '@media (max-width: 900px)'
const NARROW_PHONE = '@media (max-width: 359px)'
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

  // On a phone the seam drops for the EU row to --sy: half the opening (--hh)
  // on a screen 780 px tall or more, never above the header plus 290 px, nor
  // within 190 px of the foot.
  it('centres each building in its half with the spec’s translations, and drops to --sy on a phone', () => {
    const hero = declaredFor('.hero')
    expect(hero['--xg']).toBe('min(0px, max(calc((var(--s) - 1) * 100cqw), calc(var(--s) * 50cqw - 68cqw)))')
    expect(hero['--xm']).toBe('min(calc(var(--s) * 100cqw), max(0px, calc((1 + var(--s)) * 50cqw - 73cqw)))')
    expect(hero['container-type']).toBe('inline-size')
    expect(declaredFor('.hero', [PHONE])).toMatchObject({
      '--hh': 'max(560px, var(--screen-h))',
      '--sy': 'clamp(calc(var(--hh) / 2), calc(var(--header-h) + 290px), calc(var(--hh) - 190px))',
    })
  })

  // On a phone its rows hold their content: text a reader spaces wider
  // (WCAG 1.4.12) makes it taller, never cramped (below).
  it('is one screen tall, at least 640 px, or 560 px at least on a phone', () => {
    expect(declaredFor('.hero').height).toBe('max(640px, var(--screen-h))')
    expect(declaredFor('.hero', [PHONE])).toMatchObject({ height: 'auto', 'min-height': 'var(--hh)' })
  })

  it('clips the halves at the seam across on a desktop; on a phone each half is a row of its own', () => {
    expect(declaredFor('.half--gr')['clip-path']).toBe('inset(0 calc((1 - var(--s)) * 100%) 0 0)')
    expect(declaredFor('.half--mn')['clip-path']).toBe('inset(0 0 0 calc(var(--s) * 100%))')
    expect(declaredFor('.half', [PHONE])).toMatchObject({ position: 'relative', inset: 'auto', 'clip-path': 'none' })
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

// Spec §6.7, ruling F3: a click on the Golden Residence half (SplitHero.jsx)
// sets data-moving and --s: 1 on the hero, which grows the half over the
// whole hero before the page changes. That exists only with motion, and only
// where the halves widen: a fine pointer, side by side.
describe('the hero move (spec §6.7)', () => {
  const moving = rules.filter((rule) => rule.selectors.some((selector) => selector.includes('[data-moving]')))

  it('lives only with motion, where a fine pointer hovers and the halves sit side by side', () => {
    expect(moving.length).toBeGreaterThan(0)
    for (const rule of moving) {
      expect(rule.atRules, rule.selector).toEqual([NO_PREFERENCE, FINE_WIDE])
      for (const selector of rule.selectors) expect(selector).toMatch(/^:root\.js \.hero\[data-moving\]/)
    }
  })

  it('moves the seam to 1 over 0.8 s expo.inOut, fading the title and the infos over 0.3 s and the seam from 0.55 s', () => {
    expect(declaredFor(':root.js .hero[data-moving]', [NO_PREFERENCE, FINE_WIDE]).transition).toBe('--s .8s var(--e-io)')
    for (const part of ['.hero__title', '.half__info']) {
      expect(declaredFor(`:root.js .hero[data-moving] ${part}`, [NO_PREFERENCE, FINE_WIDE]), part)
        .toMatchObject({ opacity: '0', transition: 'opacity .3s var(--e-soft)' })
    }
    expect(declaredFor(':root.js .hero[data-moving] .hero__seam', [NO_PREFERENCE, FINE_WIDE]))
      .toMatchObject({ opacity: '0', transition: 'opacity .25s var(--e-soft) .55s' })
  })

  // The move lands on the Golden Residence hero (gr.css, .grhero::after): the
  // half's overlay gives way to the hero's as it grows, so the frame it lands
  // on is the one that page shows.
  it('turns the half’s overlay into the Golden Residence hero’s as it grows', () => {
    const heroOverlay = valueOf(rulesFor(rulesOf('src/pages/golden-residence/gr.css'), '.grhero::after')[0], 'background')
    expect(declaredFor(':root.js .hero[data-moving] .half--gr .half__shade', [NO_PREFERENCE, FINE_WIDE]))
      .toMatchObject({ background: heroOverlay, opacity: '1', transition: 'opacity .8s var(--e-io)' })
    expect(declaredFor(':root.js .hero[data-moving] .half--gr::before', [NO_PREFERENCE, FINE_WIDE]))
      .toMatchObject({ opacity: '0', transition: 'opacity .8s var(--e-io)' })
  })
})

// Spec §6.7 on a phone, and §11: text spacing (WCAG 1.4.12) holds at
// 320–360 px. The halves stack as the rows of a grid that hold their
// content, so a slogan or an info a reader spaces wider moves what follows
// it down instead of running over it. Placed from the opening's height, the
// slogan ran over the Golden Residence info, and the Многофамилна info rose
// above the seam, where its half's clip hid its name. The smoke run's phone
// opening measures both in Chrome, with the spacing and without.
describe('the phone opening’s rows (spec §6.7, §11)', () => {
  it('stacks the slogan under the header, at least 10 px of room, the Golden Residence info and the Многофамилна half', () => {
    expect(declaredFor('.hero', [PHONE])).toMatchObject({
      display: 'grid',
      'grid-template-columns': 'minmax(0, 1fr)',
      'grid-template-rows': 'calc(var(--header-h) + 14px) auto minmax(10px, 1fr) auto minmax(calc(var(--hh) - var(--sy)), auto)',
    })
    expect(declaredFor('.hero__title', [PHONE])).toMatchObject({ 'grid-area': '2 / 1', position: 'relative', inset: 'auto' })
  })

  // The half shares the opening's rows (subgrid), so its info takes the
  // fourth. A browser without subgrid lays the half out on its own, its info
  // at its foot, as the opening was before.
  it('gives the Golden Residence half the first four rows and its info the fourth, 18 px above the seam', () => {
    expect(declaredFor('.half--gr', [PHONE])).toMatchObject({
      'grid-area': '1 / 1 / 5',
      display: 'grid',
      'grid-template-rows': 'subgrid',
      'align-content': 'end',
      padding: '0 var(--gut) 18px',
    })
    expect(declaredFor('.half__info', [PHONE])).toMatchObject({ position: 'relative', bottom: 'auto' })
    expect(declaredFor('.half--gr .half__info', [PHONE])).toMatchObject({ 'grid-row': '4', left: 'auto' })
  })

  it('sets the Многофамилна info 22 px off the foot of the last row, the seam and the ring at its top', () => {
    expect(declaredFor('.half--mn', [PHONE])).toMatchObject({
      'grid-area': '5 / 1',
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'flex-end',
      padding: '0 var(--gut) 22px',
    })
    expect(declaredFor('.half--mn .half__info', [PHONE]).right).toBe('auto')
    expect(declaredFor('.hero__seam', [PHONE])).toMatchObject({ 'grid-area': '5 / 1', top: '0', height: '1px', margin: '-.5px 0 0' })
    expect(declaredFor('.half--mn::after', [PHONE])).toMatchObject({ top: '0', left: '0' })
  })

  // Each overlay looks as it did across the whole opening: its stops where
  // they were, measured from the opening's top, or from the seam, where the
  // Многофамилна half now starts.
  it('keeps each half’s overlay as it was, its stops measured from the opening’s top', () => {
    expect(declaredFor('.half--gr::before', [PHONE]).background).toBe(
      'linear-gradient(180deg, rgba(14, 13, 11, .78) 0px, rgba(14, 13, 11, .42) calc(var(--hh) * .16), rgba(14, 13, 11, .46) calc(var(--hh) * .24), rgba(14, 13, 11, .9) calc(var(--hh) * .49))',
    )
    expect(declaredFor('.half--mn::before', [PHONE]).background).toBe(
      'linear-gradient(180deg, rgba(14, 13, 11, .35) calc(var(--hh) * .5 - var(--sy)), rgba(14, 13, 11, 0) calc(var(--hh) * .64 - var(--sy)), rgba(14, 13, 11, 0) calc(var(--hh) * .7 - var(--sy)), rgba(14, 13, 11, .85) calc(var(--hh) - var(--sy)))',
    )
  })

  // A part still placed from the opening's percentages would ignore the
  // rows: the old clips, insets and offsets are gone.
  it('places nothing on a phone from a percentage of the opening', () => {
    for (const rule of rules.filter((r) => r.atRules.join(' / ') === PHONE)) {
      for (const { prop, value } of rule.declarations) {
        expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/100% - var\(--sy\)|^var\(--sy\)$|inset\(var\(--sy\)/)
      }
    }
  })
})

// Spec §3.2: the phone slogan takes two lines down to 320 px, and its floor
// is 28 px, the italic's (§3.3, §14.11). At the role's -.01em, „Създаваме
// пространства“ is 10.5 em: 294 px at 28 px, where a 320 px phone has 280 px
// between the gutters. So below 360 px the title tracks tighter and gives
// its ragged right 12 px, and it never gets smaller. The smoke run's phone
// opening measures the two lines in Chrome.
it('keeps the phone slogan on two lines down to 320 px: tighter below 360 px, never smaller', () => {
  expect(declaredFor('.hero__title', [PHONE])['font-size']).toBe('clamp(28px, 8.4vw, 46px)')
  expect(declaredFor('.hero__title', [NARROW_PHONE])).toEqual({ 'padding-right': '12px', 'letter-spacing': '-.03em' })
  expect(rules.filter((rule) => rule.atRules.includes(NARROW_PHONE)).flatMap((rule) => rule.selectors)).toEqual(['.hero__title'])
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

// A wrapped triad starts its second line with a dash („коректност — бързина“
// / „— точност“), so where its row does not fit, the words stack, a dash
// leading the second and the third. Its row needs about 435 px at its 28 px,
// so it stacks in a column under 460 px (25 px to spare for another face's
// widths): a phone's up to about 500 px, and the split's story column from
// 901 to about 1100 px. So the column's width decides, not the screen's.
it('stacks the triad wherever its column is too narrow for its row, a phone’s or the split’s', () => {
  const NARROW_COLUMN = '@container (max-width: 460px)'
  expect(declaredFor('.bros__story')['container-type']).toBe('inline-size')
  expect(declaredFor('.bros__story .triad', [NARROW_COLUMN])).toMatchObject({ 'flex-direction': 'column', 'align-items': 'flex-start', gap: '12px' })
  expect(declaredFor('.bros__story .triad span + span::before', [NARROW_COLUMN]).margin).toBe('0 16px 6px 0')
  expect(rulesFor(rules, '.bros__story .triad').map((rule) => rule.atRules)).toEqual([[], [NARROW_COLUMN]])
})

// Ruling C4.1: the phone name keeps its binding 32 px (extract §2.2) wherever
// „Многофамилна сграда“ fits on one line at that size, from about 328 px
// (287 px of text between two 20 px gutters), and only below that scales
// with the hero's width (its container, so a scrollbar never counts).
it('keeps the phone name at 32 px, smaller only where 32 px no longer fits on a line', () => {
  expect(declaredFor('.half__name', [PHONE])['font-size']).toBe('min(32px, calc((100cqw - 2 * var(--gut)) / 9))')
})

// Ruling C4.2: a @keyframes name is global, and the stylesheet loaded last
// wins for every rule that names it, so Home's own never share a name with
// Tailwind's (HeroTitle's `hero-rise`) or another stylesheet's.
it('names its keyframes apart from Tailwind’s and the site’s', () => {
  const keyframesOf = (path) => [...new Set(rulesOf(path).flatMap((rule) => rule.atRules)
    .filter((atRule) => atRule.startsWith('@keyframes ')).map((atRule) => atRule.slice('@keyframes '.length)))]
  const own = keyframesOf(HOME)
  expect(own).toEqual(expect.arrayContaining(['home-rise', 'home-settle', 'home-info', 'home-mask']))
  const elsewhere = [
    ...Object.keys(tailwindConfig.theme.extend.keyframes),
    ...Object.keys(defaultTheme.keyframes),
    ...['src/index.css', 'src/styles/motion.css', 'src/styles/shell.css', 'src/styles/diptych.css', 'src/components/inquiry/inquiry.css']
      .flatMap(keyframesOf),
  ]
  expect(own.filter((name) => elsewhere.includes(name))).toEqual([])
})

// Ruling C4.4: a section's padding (spec §2.2) is the site's
// (src/styles/diptych.css), so a page reached first by a link gets it too.
it('leaves the section padding to the site’s stylesheet', () => {
  expect(rulesFor(rules, '.sec')).toEqual([])
})

// Spec §2.2: anything sized by the screen uses --screen-h, never vh or svh.
it('sizes nothing by vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})

describe('the services (spec §6.9; extract §4.11)', () => {
  // The section's padding is the site's (.sec, src/styles/diptych.css, which
  // loads before this stylesheet). Side by side the row runs into the works
  // with none below it; a phone keeps the section's 88 px, as in the concept,
  // where the phone `.sec` comes after `.svc` (css/diptych.css:339, :736). An
  // unscoped `.svc` here would beat that phone rule.
  it('ends the row on the works side by side, and leaves a phone the section’s 88 px below it', () => {
    expect(declaredFor('.svc', ['@media (min-width: 901px)'])).toEqual({ 'padding-bottom': '0' })
    const padding = rulesFor(rules, '.svc').filter((rule) => rule.declarations.some(({ prop }) => prop.startsWith('padding')))
    expect(padding.map((rule) => rule.atRules)).toEqual([['@media (min-width: 901px)']])
  })

  it('sets the three columns in an umber row, the screen’s .6 tall within 470–600 px', () => {
    expect(declaredFor('.svc__cols')).toMatchObject({
      display: 'flex',
      height: 'clamp(470px, calc(var(--screen-h) * .6), 600px)',
      background: 'var(--umber)',
    })
    expect(declaredFor('.svc__col')).toMatchObject({ flex: '1 1 0', transition: 'flex-grow .8s var(--e-out)' })
    // A fixed measure, so a narrowed column never rewraps its hidden line.
    expect(declaredFor('.svc__d').width).toBe('23em')
  })

  // Review Focus 3, spec §2.2: the columns widen only for a pointer that
  // hovers, with the columns side by side, and only with motion; a tap, a
  // pen, a phone, reduced motion and Save-Data keep them equal.
  it('widens a column only on a fine pointer that hovers, side by side, with motion', () => {
    const widening = rules.filter((rule) => ['.78', '1.7'].includes(valueOf(rule, 'flex-grow')))
    expect(widening.map((rule) => valueOf(rule, 'flex-grow'))).toEqual(['.78', '1.7'])
    for (const rule of widening) {
      expect(rule.atRules, rule.selector).toContain(FINE_WIDE)
      expect(rule.atRules, rule.selector).toContain(NO_PREFERENCE)
      for (const selector of rule.selectors) expect(selector).toMatch(/^:root\.js /)
    }
    expect(widening[0].selectors).toEqual([':root.js .svc__cols:hover .svc__col', ':root.js .svc__cols:has(.svc__col:focus-visible) .svc__col'])
    expect(widening[1].selectors).toEqual([':root.js .svc__cols .svc__col:hover', ':root.js .svc__cols:has(.svc__col:focus-visible) .svc__col:focus-visible'])
  })

  // The reveal itself is feedback, and stays without motion: the photo opens,
  // the numeral brightens, the line shows, the underline draws, each only for
  // a pointer that hovers, or for the keyboard's focus.
  it('reveals the photo, the numeral, the line and the underline only where a fine pointer hovers', () => {
    const reveal = rules.filter((rule) => rule.selectors.some((selector) => /\.svc__col:(hover|focus-visible)/.test(selector))
      && rule.selector !== '.svc__col:focus-visible')
    expect(reveal.length).toBeGreaterThan(4)
    for (const rule of reveal) expect(rule.atRules, rule.selector).toContain(FINE_WIDE)
    expect(declaredFor('.svc__col:hover .svc__d', [FINE_WIDE])).toMatchObject({ opacity: '1', transform: 'none', 'transition-delay': '.12s' })
  })

  // Touch screens wider than a phone have nothing to point with, nor a pen:
  // every column shows its photo at half strength and its line.
  it('shows each column’s photo and line on a touch screen wider than a phone', () => {
    const TOUCH_WIDE = '@media (hover: none) and (min-width: 901px), (pointer: coarse) and (min-width: 901px)'
    expect(declaredFor('.svc__img', [TOUCH_WIDE])).toMatchObject({ opacity: '.5', 'clip-path': 'none' })
    expect(declaredFor('.svc__d', [TOUCH_WIDE])).toMatchObject({ opacity: '1', transform: 'none', width: 'auto', 'max-width': '24em' })
  })

  // Spec §5.8, ruling F13: without motion the columns stay equal and the
  // photo, the numeral, the line and the underline only fade, over 0.25 s.
  // Each fade's duration is its own and important, so the reduced-motion
  // clamp (src/index.css: 1 ms, important, on every element) never cuts it:
  // these rules are more specific, and Home's stylesheet loads after the
  // site's.
  it('only fades the reveal over 0.25 s without motion, past the reduced-motion clamp', () => {
    const fades = rules.filter((rule) => rule.selectors.every((selector) => selector.startsWith(':root:not(.js) .svc'))
      && rule.declarations.some(({ prop, value }) => prop === 'transition' && /\.25s/.test(value)))
    expect(fades.flatMap((rule) => rule.selectors).sort()).toEqual([
      ':root:not(.js) .svc__col::after',
      ':root:not(.js) .svc__d',
      ':root:not(.js) .svc__img',
      ':root:not(.js) .svc__n',
    ])
    for (const rule of fades) {
      const transition = rule.declarations.find(({ prop }) => prop === 'transition')
      expect(transition, rule.selector).toMatchObject({ value: 'opacity .25s var(--e-soft)', important: true })
      expect(rule.atRules, rule.selector).toEqual([])
    }
    expect(declaredFor(':root:not(.js) .svc__img')['clip-path']).toBe('none')
    expect(declaredFor(':root:not(.js) .svc__img img').transform).toBe('none')
    expect(declaredFor(':root:not(.js) .svc__d').transform).toBe('none')
  })

  // Spec §5.8: hover and focus feedback stay without motion, and the line is
  // that feedback. Without the widening the columns stay equal: with no `js`
  // (reduced motion, Save-Data), or with reduced motion switched on later,
  // where `js` stays but the widening's media query no longer holds. The
  // fixed measure then has nothing to keep still, and an equal column
  // narrower than 23em (from 901 to about 1100 px) would cut the line at its
  // overflow. So the line takes its column's width, at most 23em, where a
  // fine pointer hovers; touch screens and phones keep their own measure.
  it('without motion the line takes its column’s width', () => {
    const REDUCE = '@media (prefers-reduced-motion: reduce)'
    expect(declaredFor(':root:not(.js) .svc__d', [FINE_WIDE])).toEqual({ width: 'auto', 'max-width': '23em' })
    expect(declaredFor('.svc__d', [REDUCE, FINE_WIDE])).toEqual({ width: 'auto', 'max-width': '23em' })
  })

  it('stacks the columns on a phone, each with its photo and its line', () => {
    expect(declaredFor('.svc__cols', [PHONE])).toMatchObject({ 'flex-direction': 'column', height: 'auto' })
    expect(declaredFor('.svc__col + .svc__col', [PHONE])['border-top']).toBe('1px solid var(--brass)')
    expect(declaredFor('.svc__d', [PHONE])).toMatchObject({ opacity: '1', transform: 'none' })
    expect(declaredFor('.svc__img', [PHONE])).toMatchObject({ opacity: '.62', 'clip-path': 'none' })
  })

  // Spec §11: the column's own ring, drawn inside it: the row runs from edge
  // to edge of the screen, so a ring outside the first and the last column
  // would fall off it.
  it('rings a focused column 4 px inside, otherwise the ground’s ring', () => {
    expect(declaredFor('.svc__col:focus-visible')).toEqual({ 'outline-offset': '-4px' })
  })
})

describe('the works (spec §6.10; extract §4.12)', () => {
  // Spec §5.8: no sticky works media without motion.
  it('keeps the media beside the list one screen tall, sticky only with motion and the halves side by side', () => {
    expect(declaredFor('.works__media')).toMatchObject({ position: 'relative', height: 'var(--screen-h)', background: 'var(--umber)' })
    const sticky = rules.filter((rule) => valueOf(rule, 'position') === 'sticky')
    expect(sticky.map((rule) => [rule.selector, rule.atRules])).toEqual([[':root.js .works__media', [NO_PREFERENCE, '@media (min-width: 901px)']]])
    expect(valueOf(sticky[0], 'top')).toBe('0')
  })

  // The covers on show stack in the order they were chosen, which the
  // section sets on each (WorksSection.jsx); the rest are hidden.
  it('shows only the covers on show', () => {
    expect(declaredFor('.works__img').visibility).toBe('hidden')
    expect(declaredFor('.works__img[data-shown]').visibility).toBe('visible')
  })

  it('marks the chosen work, and a hovered one only for a pointer that hovers', () => {
    const hovers = rules.filter((rule) => rule.selector.includes('.works__items') && rule.selector.includes(':hover'))
    expect(hovers.length).toBeGreaterThan(0)
    for (const rule of hovers) expect(rule.atRules, rule.selector).toContain('@media (hover: hover) and (pointer: fine)')
    expect(declaredFor(".works__items button[aria-current='true'] .serif")).toMatchObject({ color: 'var(--brass-l)', transform: 'translateX(10px)' })
  })

  it('sets the media above the list on a phone, .62 of the screen tall', () => {
    expect(declaredFor('.works__media', [PHONE]).height).toBe('calc(var(--screen-h) * .62)')
  })
})

// The teaser's two ways into the explorer are the site's Ways, whose rules
// src/components/ui/ways.css.test.js reads (M3/M4 spec §4.4).

// Spec §2.2: every :hover rule of Home's needs a pointer that hovers, so a
// tap never leaves one behind.
it('keeps every :hover rule where a fine pointer hovers', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.length).toBeGreaterThan(0)
  for (const rule of hovers) expect(rule.atRules.join(' '), rule.selector).toMatch(/\(hover: hover\) and \(pointer: fine\)/)
})
