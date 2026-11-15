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

// Spec §2.2: the concept's order, scaled so the legacy modals (z-50) still
// sit above the header.
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

  // The row's text takes the room the logos and „За проекта“ leave, and that
  // box, not the viewport, decides which text shows.
  it('gives the row’s text the room that is left, as a container', () => {
    expect(declaredFor('.eu--row')['grid-template-columns']).toBe('auto minmax(0, 1fr) auto')
    // Taller than the row (WCAG 1.4.12 text spacing), the text keeps below
    // the screen's top edge.
    expect(declaredFor('.eu--row')['align-items']).toBe('safe center')
    expect(declaredFor('.eu__text')).toMatchObject({ 'container-type': 'inline-size', 'white-space': 'nowrap', 'text-overflow': 'ellipsis' })
    expect(declaredFor('.eu__text > span').display).toBe('none')
  })

  // The short text from the width that holds it through the number, the full
  // one from the width that holds it through „…C01, “ and the ellipsis, in
  // 13 px Manrope and its widest fallback face: never a cut number. Spec
  // §6.3 gives Manrope's widths (about 256 and 483 px); Chrome measures the
  // widest face, Arial, at 284 and 526 px.
  it('shows the short text, then the full one, only once the box holds each through the number', () => {
    const widthOf = (selector) => {
      const rule = rules.find((r) => r.selectors.includes(selector) && valueOf(r, 'display') === 'inline')
      expect(rule, selector).toBeDefined()
      const query = rule.atRules.find((at) => at.startsWith('@container'))
      return Number(/min-width:\s*(\d+)px/.exec(query)?.[1])
    }
    const short = widthOf('.eu__text > .eu__short')
    const full = widthOf('.eu__text > .eu__full')
    expect(short).toBeGreaterThanOrEqual(284)
    expect(full).toBeGreaterThanOrEqual(526)
    // And no wider than a few pixels past them, so a text shows once it fits.
    expect(short).toBeLessThan(300)
    expect(full).toBeLessThan(540)
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
})

describe('the footer (spec §6.5)', () => {
  it('is two halves, the right one umber, stacked on a phone', () => {
    expect(declaredFor('.ftr__grid')['grid-template-columns']).toBe('1fr 1fr')
    expect(declaredFor('.ftr__half--r').background).toBe('var(--umber)')
    expect(declaredFor('.ftr__logo').width).toBe('156px')
    expect(declaredFor('.ftr__grid', [LAYER, PHONE])['grid-template-columns']).toBe('1fr')
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
