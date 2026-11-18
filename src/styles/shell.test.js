import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { rulesFor, rulesOf, valueOf } from '../test/css'

// src/styles/shell.css: the header with its EU row, the menu, the footer and
// the grain (spec §2.2, §6.2–6.5, §11), in Tailwind's components layer; and
// the header's heights in src/index.css (spec §4). jsdom applies no CSS, so
// these read the rules (src/test/css.js).

const SHELL = 'src/styles/shell.css'
const rules = rulesOf(SHELL)
const indexRules = rulesOf('src/index.css')
const LAYER = '@layer components'
const FINE = '@media (hover: hover) and (pointer: fine)'
const PHONE = '@media (max-width: 900px)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = [LAYER], from = rules) {
  const found = rulesFor(from, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ')}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

// Spec §2.2: the concept's order, scaled so a z-50 layer (the legacy pages'
// modals, once) sits above the header.
it('stacks the header, the menu, the grain and the skip link as spec §2.2 orders them', () => {
  expect(declaredFor('.hdr')['z-index']).toBe('40')
  expect(declaredFor('.menu')['z-index']).toBe('60')
  expect(declaredFor('.grain')['z-index']).toBe('70')
  expect(declaredFor('.skip')['z-index']).toBe('90')
})

// Extract §1.2: a breath of fractal noise over the black, never in the way.
it('lays the grain over the whole screen at 4.5 %, out of the pointer’s way', () => {
  const grain = declaredFor('.grain')
  expect(grain).toMatchObject({ position: 'fixed', inset: '0', 'pointer-events': 'none', opacity: '.045' })
  expect(grain['background-image']).toMatch(/feTurbulence/)
})

// A view transition group of its own, over all the others
// (src/styles/motion.css), as it lies live over the page, the header and the
// menu. In the root snapshot, which the browser paints beneath the page's
// group, it went missing wherever the arriving page is opaque until the change
// was over. No view-transition-class, so no class rule of the page's doors or
// crossfade reaches it.
it('is a view-transition group of its own, grain, with no class', () => {
  const grain = rulesFor(rules, '.grain')
  expect(grain.map((rule) => valueOf(rule, 'view-transition-name')).filter(Boolean)).toEqual(['grain'])
  expect(grain.filter((rule) => valueOf(rule, 'view-transition-class'))).toEqual([])
})

describe('the header (spec §6.2)', () => {
  it('turns solid in 0.45 s and moves in 0.5 s', () => {
    expect(declaredFor('.hdr').transition).toBe('background-color .45s var(--e-soft), transform .5s var(--e-out)')
    expect(declaredFor('.hdr__bar').transition).toBe('border-color .45s var(--e-soft)')
  })

  it('is see-through over its scrim, then onyx at 86 % with the blur and a hair-2 rule', () => {
    expect(declaredFor('.hdr::before').background).toBe('linear-gradient(rgba(14, 13, 11, .55), rgba(14, 13, 11, 0))')
    expect(declaredFor('.hdr[data-look="solid"]')).toMatchObject({
      'background-color': 'rgba(14, 13, 11, .86)',
      'backdrop-filter': 'blur(14px) saturate(1.1)',
    })
    expect(declaredFor('.hdr[data-look="solid"]::before').opacity).toBe('0')
    expect(declaredFor('.hdr[data-look="solid"] .hdr__bar')['border-color']).toBe('var(--hair-2)')
  })

  // Scrolled, the EU row slides away and the bar stays; the keyboard on the
  // EU row brings it back.
  it('moves up by the EU row once the page has scrolled', () => {
    expect(declaredFor('.hdr[data-scrolled]').transform).toBe('translateY(calc(-1 * var(--eu-h)))')
    expect(declaredFor('.hdr[data-scrolled]:has(.hdr__eu :focus-visible)').transform).toBe('none')
  })

  // Spec §1.9, §14.1: the EU line is in view on landing. A deep link lands
  // scrolled to the explorer with a dialog over the page (spec §7.10), and
  // the EU row stays while the landing holds (data-eu-hold,
  // src/explorer/ExplorerContext.jsx; the dialogs leave it room).
  it('keeps the EU row in view on a deep link’s landing', () => {
    expect(declaredFor(':root[data-eu-hold] .hdr[data-scrolled]').transform).toBe('none')
  })

  it('carries the EU row and the bar at their heights', () => {
    expect(declaredFor('.hdr__eu').height).toBe('var(--eu-h)')
    expect(declaredFor('.hdr__bar').height).toBe('var(--bar-h)')
  })

  // The logo 142 px wide (120 px on phones); the phone and „Запитване“ only
  // from 901 px.
  it('sets the logo at 142 px, 120 px on a phone, where the phone and „Запитване“ give way', () => {
    expect(declaredFor('.hdr__logo').width).toBe('142px')
    expect(declaredFor('.hdr__logo', [LAYER, PHONE]).width).toBe('120px')
    expect(declaredFor('.hdr__tel', [LAYER, PHONE]).display).toBe('none')
    expect(declaredFor('.hdr__cta', [LAYER, PHONE]).display).toBe('none')
  })
})

describe('the EU line (spec §6.3)', () => {
  it('sets the logos on the light plate: 20 px tall in the row, 28 px in the footer and the menu', () => {
    expect(declaredFor('.eu__plate').background).toBe('#F7F4EE')
    expect(declaredFor('.eu__plate img').height).toBe('28px')
    expect(declaredFor('.eu--row .eu__plate img').height).toBe('20px')
  })

  // The row holds the plate at its start and „За проекта“ at its end, with
  // no sentence between them (src/shell/EuLine.jsx).
  it('sets the row’s plate at its start and „За проекта“ at its end', () => {
    expect(declaredFor('.eu--row')).toMatchObject({ display: 'flex', 'justify-content': 'space-between' })
    // Taller than the row (WCAG 1.4.12 text spacing), the link keeps below
    // the screen's top edge.
    expect(declaredFor('.eu--row')['align-items']).toBe('safe center')
    expect(rules.some((r) => r.selectors.some((s) => s.includes('.eu__text')))).toBe(false)
  })
})

// Spec §11: text spacing (WCAG 1.4.12) holds at 320–360 px. With a reader's
// spacing, a heading's word wider than a phone's line (the EU poster's
// „предприятията“ at 40 px) ran past the screen and widened the page, and
// the fixed header widened with it: „За проекта“ and „Меню“ ended past the
// screen's edge. And where the page kept its width, the header's row
// narrowed the logos out of their proportions to keep „За проекта“ on one
// line. The smoke run's phone opening measures both in Chrome.
describe('text spacing (spec §11, WCAG 1.4.12)', () => {
  // `anywhere`, not `break-word`, so the word's grid or flex track stays as
  // wide as the screen too. Phones only: a wider screen's narrowing column
  // (the services' widening) keeps its words whole. Every page's headings,
  // as no legacy page is left to keep its own layout (spec M3/M4 §9).
  it('breaks a heading’s word too wide for a phone’s line, on every page', () => {
    expect(declaredFor(':where(h1, h2, h3)', ['@layer base', PHONE], indexRules)).toEqual({ 'overflow-wrap': 'anywhere' })
    const wrapping = [...indexRules, ...rules].filter((rule) => valueOf(rule, 'overflow-wrap') || valueOf(rule, 'word-break'))
    expect(wrapping.map((rule) => [rule.selector, rule.atRules])).toEqual([[':where(h1, h2, h3)', ['@layer base', PHONE]]])
  })

  // The logos keep their proportions (the base layer's img max-width: 100%
  // let the row's grid squeeze them), and „За проекта“, which may wrap,
  // takes two lines instead.
  it('never narrows the EU logos: „За проекта“ wraps instead', () => {
    expect(declaredFor('.eu__plate img')['max-width']).toBe('none')
    expect(declaredFor('.eu--row .eu__plate img')['max-width']).toBeUndefined()
    expect(declaredFor('.eu a')['white-space']).toBeUndefined()
    expect(rulesFor(rules, '.eu--row a')).toEqual([])
  })

  // A live count (RollingNumber) shows its digits through a window one em
  // tall. Their strip took the reader's line height (1.5), its lines grew
  // half an em taller than the window, and the window cut each digit's foot
  // off. The strip is a block of its own with its own line height: a
  // reader's `*` rule reaches no pseudo-element, and the strip's lines keep
  // to the window.
  it('keeps a live count’s digits whole in their one-em window', () => {
    expect(declaredFor('.roll-strip::before', [LAYER], indexRules)).toMatchObject({ display: 'block', 'line-height': '1' })
  })

  // Its second line reaches 3 px below the 36 px row, so once the header has
  // moved up, the row is clipped to its box, or the line's underline would
  // show along the top of the screen. Never while the row is back in view:
  // for the keyboard (its focus ring) or a deep link's landing.
  it('clips the EU row to its box only while it is out of view', () => {
    const selector = ':root:not([data-eu-hold]) .hdr[data-scrolled]:not(:has(.hdr__eu :focus-visible)) .hdr__eu'
    expect(declaredFor(selector)).toEqual({ 'clip-path': 'inset(0)' })
    expect(rules.filter((rule) => valueOf(rule, 'clip-path') === 'inset(0)').map((rule) => rule.selector)).toEqual([selector])
  })
})

describe('the menu (spec §6.4)', () => {
  // The doors close over an open menu (src/styles/motion.css).
  it('is its own view-transition group, site-menu', () => {
    expect(declaredFor('.menu')['view-transition-name']).toBe('site-menu')
  })

  it('is two halves, onyx and umber, a column on a phone', () => {
    expect(declaredFor('.menu')).toMatchObject({ position: 'fixed', inset: '0', display: 'grid', 'grid-template-columns': '1fr 1fr' })
    expect(declaredFor('.menu__half--l').background).toBe('var(--onyx)')
    expect(declaredFor('.menu__half--r').background).toBe('var(--umber)')
    expect(declaredFor('.menu', [LAYER, PHONE])['grid-template-columns']).toBe('1fr')
    expect(declaredFor('.menu > .menu__seam', [LAYER, PHONE]).display).toBe('none')
  })

  // Spec §6.4: „Затвори“ in the bar. On a phone the whole menu scrolls, and
  // the close stays in the bar's band, over an onyx strip from the screen's
  // top (the EU row's place too, until the page has scrolled) that the menu
  // scrolls under. The strip is the button's own: it fades with it, and a
  // tap on it is a tap on „Затвори“, never on a link scrolled under it.
  it('keeps „Затвори“ in the bar on a phone while the menu scrolls under it', () => {
    expect(declaredFor('.menu', [LAYER, PHONE]).overflow).toBe('auto')
    expect(declaredFor('.menu__close', [LAYER, PHONE]).position).toBe('fixed')
    expect(declaredFor('.menu__close::before', [LAYER, PHONE])).toMatchObject({
      content: "''",
      position: 'absolute',
      'z-index': '-1',
      top: '0',
      right: 'calc(-1 * var(--gut))',
      bottom: '0',
      width: '100vw',
      background: 'var(--onyx)',
    })
    expect(declaredFor(':root:has(.hdr:not([data-scrolled])) .menu__close::before', [LAYER, PHONE]).top).toBe('calc(-1 * var(--eu-h))')
  })

  // FR10: on a phone on its side the strip, which reaches the EU row's foot
  // until the page has scrolled (36 + 64 = 100 px), lay over „Начало“'s top
  // 12–14 px, where the pages' room for the bar ended (64 px and 6 % of the
  // screen, 87 px on a 390 px tall one): a tap there closed the menu. The
  // pages start below the strip at every height from 320 px, and from 600 px
  // tall, where the room was already enough, nothing moves.
  it('starts the pages below „Затвори“’s strip on a short phone screen', () => {
    const unscrolled = declaredFor(':root:has(.hdr:not([data-scrolled])) .menu__half--l', [LAYER, PHONE])['padding-top']
    const room = /^calc\((?:[^()]|\([^()]*\))*\)/.exec(declaredFor('.menu__half').padding)[0]
    // A length the rule declares, in px, on a phone `screen` px tall.
    const at = (expression, screen) => Function(`return ${expression
      .replaceAll('var(--header-h)', 'var(--eu-h) + var(--bar-h)')
      .replaceAll('var(--eu-h)', '36').replaceAll('var(--bar-h)', '64').replaceAll('var(--screen-h)', String(screen))
      .replaceAll('calc(', '(').replaceAll('max(', 'Math.max(')}`)()
    for (let screen = 320; screen <= 1200; screen += 10) {
      expect(at(unscrolled, screen), `${screen} px tall`).toBeGreaterThanOrEqual(100)
      if (screen >= 600) expect(at(unscrolled, screen), `${screen} px tall`).toBe(at(room, screen))
    }
  })
})

describe('the footer (spec §6.5)', () => {
  it('is two halves, the right one umber, stacked on a phone', () => {
    expect(declaredFor('.ftr__grid')['grid-template-columns']).toBe('1fr 1fr')
    expect(declaredFor('.ftr__half--r').background).toBe('var(--umber)')
    expect(declaredFor('.ftr__logo').width).toBe('156px')
    expect(declaredFor('.ftr__grid', [LAYER, PHONE])['grid-template-columns']).toBe('1fr')
  })

  // „Отвори в Google Maps“ is 13 px text, so its 44 px hit box reaches up
  // over the lower half of the address's last line. The address lies over
  // the box, as the link's own words do: a press there selects the address
  // and opens no map.
  it('lays each office’s address over its Maps link’s hit box', () => {
    expect(declaredFor('.ftr__office > p')).toEqual({ position: 'relative', 'z-index': '1' })
  })
})

// Spec §11: 44 × 44 px through a box that draws nothing. The link's words, in
// their span, lie over every box, so where the boxes of two stacked links
// meet, a click on a link's words is that link's.
it('gives the shell’s small links a 44 px hit box, under their words', () => {
  expect(declaredFor('.hit').position).toBe('relative')
  expect(declaredFor('.hit::before')).toEqual({
    content: "''",
    position: 'absolute',
    inset: 'min(0px, (100% - 44px) / 2)',
  })
  expect(declaredFor('.hit > span')).toEqual({ position: 'relative', 'z-index': '1' })
})

// Spec §2.2: hover effects need a pointer that hovers, so a tap never leaves
// one behind.
it('keeps every :hover rule inside (hover: hover) and (pointer: fine)', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.length).toBeGreaterThan(0)
  for (const rule of hovers) expect(rule.atRules, rule.selector).toEqual([LAYER, FINE])
})

// Tailwind keeps a rule of its components layer only when the content it
// scans (tailwind.config.js) holds the rule's class whole: a class built from
// parts, such as `eu--${variant}`, would lose its rules in the build. So each
// class this stylesheet styles is written whole in a component.
it('styles only classes the components write whole', () => {
  const sources = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.jsx?$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name)) sources.push(readFileSync(path, 'utf8'))
    }
  }
  walk(join(cwd(), 'src'))
  const text = sources.join('\n')
  const classes = new Set(rules.flatMap((rule) => rule.selectors).flatMap((selector) => [...selector.matchAll(/\.([\w-]+)/g)].map(([, name]) => name)))
  expect(classes.size).toBeGreaterThan(20)
  for (const name of classes) expect(text, `.${name}`).toMatch(new RegExp(`(?<![\\w-])${name}(?![\\w-])`))
})

// Spec §2.2: anything sized by the screen uses --screen-h, never vh or svh.
it('sizes nothing by vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})

describe('src/index.css', () => {
  const css = readFileSync(join(cwd(), 'src/index.css'), 'utf8')

  it('imports the shell’s stylesheet', () => {
    expect(css).toMatch(/@import '\.\/styles\/shell\.css';/)
  })

  // Spec §2.2, §4: one 36 px EU row everywhere; a 76 px bar, 64 px on a
  // phone; an in-page jump leaves room for the bar.
  it('sets the header’s heights and leaves room for the bar on a jump', () => {
    expect(declaredFor(':root', [], indexRules)).toMatchObject({
      '--eu-h': '36px',
      '--bar-h': '76px',
      '--header-h': 'calc(var(--eu-h) + var(--bar-h))',
    })
    expect(declaredFor(':root', [PHONE], indexRules)['--bar-h']).toBe('64px')
    expect(declaredFor('html', [], indexRules)['scroll-padding-top']).toBe('var(--bar-h)')
    expect(indexRules.filter((rule) => rule.selector.includes('eu-line'))).toEqual([])
  })

  // Ruling T4b: while a landing holds the EU row (src/shell/landingHold.js),
  // the whole header stays, so the landing's jump leaves room for all of it:
  // the list's section (?view=list on Многофамилна) lands with its heading
  // below the row, not under it. src/utils/scroll.js reads this padding.
  it('leaves room for the whole header while a landing holds the EU row', () => {
    expect(declaredFor('html[data-eu-hold]', [], indexRules)).toEqual({ 'scroll-padding-top': 'var(--header-h)' })
  })

  // A scroll lock hides <html>'s overflow (src/hooks/useScrollLock.js), and
  // with it a classic scrollbar (Windows). The gutter stays, so the menu or
  // a dialog never moves the page and the fixed header sideways as it opens
  // or closes; the lock paints the strip in its overlay's colour.
  it('keeps the scrollbar’s gutter while a lock hides the scrollbar', () => {
    expect(declaredFor('html', [], indexRules)['scrollbar-gutter']).toBe('stable')
  })

  // Spec §5.8, ruling F13: without motion the menu fades in over 0.2 s. The
  // rule comes after the reduced-motion clamp and carries its own important
  // duration, so the clamp's 1 ms never cuts it.
  it('fades the menu in over 0.2 s without motion, after the reduced-motion clamp', () => {
    const clamp = indexRules.findIndex((rule) => rule.atRules.includes('@media (prefers-reduced-motion: reduce)') && rule.selectors.includes('*'))
    const fade = indexRules.findIndex((rule) => rule.selectors.includes(':root:not(.js) .menu'))
    expect(clamp).toBeGreaterThan(-1)
    expect(fade).toBeGreaterThan(clamp)
    const [animation] = indexRules[fade].declarations.filter(({ prop }) => prop === 'animation')
    expect(animation).toMatchObject({ value: 'menu-fade .2s var(--e-soft)', important: true })
    const from = indexRules.find((rule) => rule.atRules.at(-1) === '@keyframes menu-fade' && rule.selector === 'from')
    expect(valueOf(from, 'opacity')).toBe('0')
  })
})
