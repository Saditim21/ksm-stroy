import { rulesFor, rulesOf } from '../test/css'

// src/explorer/blockGrid.css, a block in numbers (BlockGrid.jsx; Diptych spec
// §6.16, §7.9; M3 §4.4): the halves, the squares, their statuses' patterns,
// the counts and the types, in one stylesheet that only the pages with a
// block in numbers load. Their pins moved here from the Golden Residence
// page's stylesheet's, unchanged; each page keeps its own size (gr.css 12 ×
// 8, 500 px; mn.css 8 × 9, 352 px), pinned in its own test. jsdom applies no
// CSS, so these read the rules (src/test/css.js).

const GRID = 'src/explorer/blockGrid.css'
const rules = rulesOf(GRID)
const PAGES = ['src/pages/golden-residence/gr.css', 'src/pages/mnogofamilna/mn.css']
const PHONE = '@media (max-width: 900px)'
const FINE = '@media (hover: hover) and (pointer: fine)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

describe('a block in numbers (spec §6.16; extract §4.27)', () => {
  it('sets the squares 4 px apart, the floors beside them on the seam’s side', () => {
    expect(declaredFor('.blk__grid')).toMatchObject({ display: 'grid', gap: '4px', width: '100%' })
    expect(declaredFor('.blk__grid button')).toMatchObject({ 'aspect-ratio': '1', border: '1px solid var(--c)' })
    expect(declaredFor('.blk__floors')).toMatchObject({ display: 'grid', 'grid-template-columns': 'auto 1fr', gap: '8px' })
    expect(declaredFor('.blk--a .blk__floors')['grid-template-columns']).toBe('1fr auto')
    expect(declaredFor('.blk__fl')).toMatchObject({ 'font-size': '10px', color: 'var(--stone)' })
  })

  // The page sizes its own grid: the shared rules set no columns, no floors'
  // rows and no width, so a page's size holds whatever order the two
  // stylesheets load in (the component's comes after the page's).
  it('leaves the columns, the floors and the width to the page', () => {
    expect(declaredFor('.blk__grid')['grid-template-columns']).toBeUndefined()
    expect(declaredFor('.blk__fl')['grid-template-rows']).toBeUndefined()
    expect(declaredFor('.blk__floors').width).toBeUndefined()
  })

  // Spec §7.9: never colour alone; a status's pattern on each square.
  it('marks each square by its status’s pattern, blocked by a dashed outline, and waits in a hair outline', () => {
    expect(declaredFor('.blk__grid .s-free')).toMatchObject({ '--c': 'var(--status-free)', background: 'color-mix(in srgb, var(--status-free) 55%, transparent)' })
    expect(declaredFor('.blk__grid .s-reserved').background).toBe('repeating-linear-gradient(-45deg, color-mix(in srgb, var(--status-reserved) 90%, transparent) 0 1.5px, transparent 1.5px 4px)')
    expect(declaredFor('.blk__grid .s-sold')).toMatchObject({ '--c': 'color-mix(in srgb, var(--status-sold) 70%, transparent)', 'background-image': 'radial-gradient(color-mix(in srgb, var(--status-sold) 85%, transparent) 1px, transparent 1.3px)', 'background-size': '4px 4px' })
    expect(declaredFor('.blk__grid .s-blocked')).toMatchObject({ '--c': 'var(--status-blocked)', 'border-style': 'dashed' })
    expect(declaredFor('.blk__grid .s-none')['--c']).toBe('var(--hair)')
  })

  it('grows a square pointed at by 1.18, where a fine pointer hovers', () => {
    expect(declaredFor('.blk__grid button:hover', [FINE])).toMatchObject({ transform: 'scale(1.18)', 'z-index': '1' })
  })

  // Spec §2.2: a hover effect needs a pointer that hovers, so a tap never
  // leaves one behind.
  it('keeps every :hover rule where a fine pointer hovers', () => {
    const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
    expect(hovers.length).toBeGreaterThan(0)
    for (const rule of hovers) expect(rule.atRules, rule.selector).toContain(FINE)
  })

  // WCAG 2.4.7: the squares' entrance holds them at opacity 0 until the
  // block reaches 75 % of the screen, and the focus can arrive before that
  // with no scroll. While it is inside the grid every square shows, its ring
  // with it: important, over the entrance's inline opacity.
  it('shows every square while the focus is in its grid, over the entrance', () => {
    const [rule] = rulesFor(rules, '.blk__grid:focus-within button')
    expect(rule.atRules).toEqual([])
    expect(rule.declarations).toEqual([{ prop: 'opacity', value: '1', important: true }])
  })

  it('sets the halves, the name in the serif, the counts and the types in 14 px', () => {
    expect(declaredFor('.blk')).toMatchObject({ display: 'grid', gap: '26px', padding: '0 clamp(28px, 5vw, 96px)' })
    expect(declaredFor('.blk--a')).toMatchObject({ 'justify-items': 'end', 'text-align': 'right' })
    expect(declaredFor('.blk__name')).toMatchObject({ 'font-family': 'var(--serif)', 'font-size': 'clamp(52px, 5.2vw, 88px)' })
    expect(declaredFor('.blk__types')).toMatchObject({ 'font-size': '14px', color: 'var(--ivory-2)' })
  })

  // Extract §4.27, phones: left-aligned, block А's floors moved to the left,
  // block Б under a brass rule.
  it('turns block А’s floors to the left of its squares on a phone, its counts left-aligned, block Б under a brass rule', () => {
    expect(declaredFor('.blk--a .blk__floors', [PHONE])['grid-template-columns']).toBe('auto 1fr')
    expect(declaredFor('.blk--a .blk__floors .blk__fl', [PHONE]).order).toBe('-1')
    expect(declaredFor('.blk--a .blk__stats .legend')['justify-content']).toBe('flex-end')
    expect(declaredFor('.blk--a .blk__stats .legend', [PHONE])['justify-content']).toBe('flex-start')
    expect(declaredFor('.blk--b', [PHONE])['border-top']).toBe('1px solid var(--brass)')
  })

  // Ruling F9, spec §11: nothing takes the site's focus ring away.
  it('keeps the site’s focus ring on every square', () => {
    for (const rule of rules) expect(rule.declarations.find(({ prop }) => prop === 'outline')?.value, rule.selector).not.toBe('none')
  })
})

// Spec M3 §4.4: one copy. A page's stylesheet sizes its grid and adds what
// is its own (Golden Residence's exposures, Многофамилна's way to each
// block's page), and copies none of the component's rules: no status
// pattern, no focus fix, no hover, and nothing but the size on the grid,
// its floors and their box.
describe('the pages’ own block rules', () => {
  const SIZE = { '.blk__grid': ['grid-template-columns'], '.blk__fl': ['grid-template-rows'], '.blk__floors': ['width'] }
  for (const page of PAGES) {
    it(`${page} only sizes the grid`, () => {
      const own = rulesOf(page).filter((rule) => rule.selectors.some((selector) => /\.blk/.test(selector)))
      expect(own.length).toBeGreaterThan(0)
      for (const rule of own) {
        for (const selector of rule.selectors) {
          expect(selector, rule.selector).not.toMatch(/\.s-(none|free|reserved|sold|blocked)|:focus-within|:hover|\.blk__(name|sub|stats|types)\b/)
          const [, target] = /(\.blk__(?:grid|fl|floors))$/.exec(selector) ?? []
          if (target) for (const { prop } of rule.declarations) expect(SIZE[target], `${selector} { ${prop} }`).toContain(prop)
        }
      }
    })
  }
})
