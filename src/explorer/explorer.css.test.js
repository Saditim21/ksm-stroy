import { describe, expect, it } from 'vitest'
import { rulesFor, rulesOf, valueOf } from '../test/css'

// src/explorer/explorer.css: the explorer's section, the facade, its rails,
// the edge panel, the plans and the phone sheet (spec §7.2–7.5, §7.9; extract
// §4.19–4.22, §4.25). jsdom applies no CSS, so these read the rules
// (src/test/css.js).

const CSS = 'src/explorer/explorer.css'
const rules = rulesOf(CSS)
const PHONE = '@media (max-width: 900px)'
const WIDE = '@media (min-width: 901px)'
const FINE = '@media (hover: hover) and (pointer: fine)'

// What the rules for `selector` inside exactly these at-rules declare,
// together, later over earlier.
function declaredFor(selector, atRules = []) {
  const found = rulesFor(rules, selector).filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  expect(found.length, `${selector} in ${atRules.join(' / ') || 'no at-rule'}`).toBeGreaterThan(0)
  return Object.assign({}, ...found.map((rule) => Object.fromEntries(rule.declarations.map(({ prop, value }) => [prop, value]))))
}

const declaring = (prop) => rules.filter((rule) => rule.declarations.some((declaration) => declaration.prop === prop))

// Whether a rule for `selector` inside exactly these at-rules declares
// `prop: value !important`.
const important = (selector, atRules, prop, value) => rulesFor(rules, selector)
  .filter((rule) => rule.atRules.join(' / ') === atRules.join(' / '))
  .some((rule) => rule.declarations.some((declaration) => declaration.prop === prop && declaration.value === value && declaration.important))

describe('the facade’s layout (spec §7.2)', () => {
  // The 860 px floor: from 901 px the floors stay at least 24 px apart.
  it('never sets the stage narrower than 860 px, in full or compact mode', () => {
    const formulas = declaring('--sw').filter((rule) => rule.atRules.length === 0)
    expect(formulas.map((rule) => rule.selector).sort()).toEqual(['.fx', '.fx--compact'])
    for (const rule of formulas) expect(valueOf(rule, '--sw')).toMatch(/^max\(860px,/)
    expect(declaredFor('.fx')['--sw']).toBe('max(860px, min(calc((50cqw - var(--pw) - 18px) * 2.6087), calc((var(--screen-h) - 300px) * 2.6432), 1500px))')
    expect(declaredFor('.fx--compact')['--sw']).toBe('max(860px, min(calc(100cqw - 340px), calc((var(--screen-h) - 300px) * 2.6432), 1180px))')
    expect(declaredFor('.fx')).toMatchObject({
      '--pw': 'clamp(284px, 20cqw, 380px)',
      '--sh': 'calc(var(--sw) * 454 / 1200)',
      '--pitch': 'calc(var(--sw) * 33.5 / 1200)',
    })
  })

  // Container units never resolve against the element that declares the
  // container, so the root's sizes need a wrapper's.
  it('measures the root on a wrapper: the container is not the rule that sets the sizes', () => {
    const containers = declaring('container-type')
    expect(containers.map((rule) => [rule.selector, valueOf(rule, 'container-type')])).toEqual([['.fx-wrap', 'inline-size']])
    for (const rule of containers) expect(valueOf(rule, '--sw')).toBeUndefined()
  })

  it('places the stage so x 605 is the page’s centre, the root its height plus 100 px', () => {
    expect(declaredFor('.fx').height).toBe('calc(var(--sh) + 100px)')
    expect(declaredFor('.fx__stage')).toMatchObject({ width: 'var(--sw)', height: 'var(--sh)', left: 'calc(50% - var(--sw) * .504167)', top: '52px' })
  })

  // Phones crop one block with CSS (spec §7.2): the stage keeps the crop's
  // aspect, and the root's data-block moves the grid under it.
  it('crops one block on a phone, by the root’s data-block', () => {
    expect(declaredFor('.fx__stage', [PHONE])['aspect-ratio']).toBe('628 / 388')
    expect(declaredFor('.fx', [PHONE])).toMatchObject({ '--vby': '132', '--vbw': '628', '--vbh': '388' })
    expect(declaredFor('.fx[data-block="Б"]', [PHONE])['--vbx']).toBe('572')
    expect(declaredFor('.fx[data-block="А"] .fx__rail--b', [PHONE]).display).toBe('none')
    expect(declaredFor('.fx[data-block="Б"] .fx__rail--a', [PHONE]).display).toBe('none')
    expect(declaredFor('.fx')).toMatchObject({ '--vbx': '0', '--vby': '112', '--vbw': '1200', '--vbh': '454' })
    expect(declaredFor('.fx', [PHONE])['--pitch']).toBe('calc((100cqw - 2 * var(--gut)) * 33.5 / 628)')
  })
})

describe('the rails (spec §7.2)', () => {
  it('sets each row min(30px, var(--pitch)) tall, centred on its floor, so no two overlap', () => {
    expect(declaredFor('.fx__cnt')).toMatchObject({ height: 'min(30px, var(--pitch))', 'margin-top': 'calc(min(30px, var(--pitch)) / -2)' })
  })

  it('sets the count by the pitch on a desktop, 24 to 28 px, and 24 px on a phone', () => {
    expect(declaredFor('.fx__cnt .n')['font-size']).toBe('clamp(24px, calc(var(--pitch) * .93), 28px)')
    expect(declaredFor('.fx__cnt .n', [PHONE])['font-size']).toBe('24px')
  })

  // A zero count dims to 3.36:1 on onyx (src/styles/tokens.test.js), a hot
  // one turns brass-l and the others fade back.
  it('dims a zero, lights the hot count and fades the others', () => {
    expect(declaredFor('.fx__cnt.is-zero .n').color).toBe('rgba(155, 148, 136, .65)')
    expect(declaredFor('.fx__cnt.is-hot .n').color).toBe('var(--brass-l)')
    expect(declaredFor('.fx.is-hot .fx__cnt:not(.is-hot) > span').opacity).toBe('.32')
  })

  // Below 1000 px the floor numbers hide, so the counts stay on screen.
  it('hides the floor numbers below 1000 px', () => {
    expect(declaredFor('.fx__cnt .f', ['@media (max-width: 999px)']).display).toBe('none')
  })

  it('marks each floor with its colour’s 10 × 10 glyph', () => {
    expect(declaredFor('.fx__cnt .g')).toMatchObject({ width: '10px', height: '10px' })
  })
})

describe('the edge panel and the sheet (spec §7.3, §7.5)', () => {
  it('sets the panel var(--pw) wide, 470 px tall at least, over the block’s edge', () => {
    expect(declaredFor('.fxp')).toMatchObject({ width: 'var(--pw)', 'min-height': '470px', background: 'rgba(26, 23, 20, .97)', visibility: 'hidden' })
    expect(declaredFor('.fxp[data-open]').visibility).toBe('visible')
    expect(declaredFor('.fxp--a')['border-right']).toBe('1px solid var(--brass)')
    expect(declaredFor('.fxp--b')['border-left']).toBe('1px solid var(--brass)')
    expect(important('.fxp', [PHONE], 'display', 'none')).toBe(true)
  })

  it('sets the sheet at z 45, never from 901 px', () => {
    expect(declaredFor('.sheet', [PHONE])).toMatchObject({ position: 'fixed', 'z-index': '45', background: 'var(--umber)', 'border-top': '1px solid var(--brass)', 'box-shadow': '0 -24px 60px rgba(0, 0, 0, .55)' })
    expect(important('.sheet', [WIDE], 'display', 'none')).toBe(true)
    expect(declaredFor('.sheet__plan', [PHONE]).height).toBe('150px')
  })

  it('says „Разпродаден етаж“ in the sold colour, in the 28 px italic', () => {
    expect(declaredFor('.fxp__soldout')).toMatchObject({ 'font-style': 'italic', 'font-size': '28px', color: 'var(--status-sold)' })
  })
})

// Ruling C7.3, spec §3.3: figures are tabular in the rails and the stepper.
// The `font` shorthand on the stepper's floor resets them, so they come after.
it('sets the rails’ counts and the stepper’s floor in tabular figures', () => {
  expect(declaredFor('.fx__cnt .n')['font-variant-numeric']).toMatch(/tabular-nums/)
  const [floor] = rulesFor(rules, '.step output b')
  const props = floor.declarations.map(({ prop }) => prop)
  expect(props.lastIndexOf('font-variant-numeric')).toBeGreaterThan(props.lastIndexOf('font'))
  expect(valueOf(floor, 'font-variant-numeric')).toMatch(/tabular-nums/)
})

describe('the plan stage and the unit panel (spec §2.2, §7.4, §7.6, §7.7)', () => {
  // Spec §2.2's layers, over the header (40) and the sheet (45), under the
  // menu (60).
  it('stacks the stage at 50, the morph’s plan at 51 and the unit panel at 52, fixed over the screen', () => {
    expect(declaredFor('.ps')).toMatchObject({ position: 'fixed', inset: '0', 'z-index': '50', background: 'var(--umber)' })
    expect(declaredFor('.ps__ghost')).toMatchObject({ position: 'fixed', 'z-index': '51', 'pointer-events': 'none', 'transform-origin': '0 0' })
    expect(declaredFor('.up')).toMatchObject({ position: 'fixed', inset: '0', 'z-index': '52', background: 'rgba(8, 7, 6, .72)' })
  })

  // Spec §7.10 with §1.9, §14.1: on a deep link's landing the header keeps
  // its EU row in view (src/styles/shell.css), and the dialogs leave the row
  // its 36 px, for as long as ExplorerContext.jsx holds data-eu-hold.
  it('leaves the EU row its 36 px on a deep link’s landing', () => {
    expect(declaredFor(':root[data-eu-hold] .ps').top).toBe('var(--eu-h)')
    expect(declaredFor(':root[data-eu-hold] .up').top).toBe('var(--eu-h)')
  })

  it('splits the stage’s body into the plan and a side column of 320–400 px on umber-2', () => {
    expect(declaredFor('.ps__body')['grid-template-columns']).toBe('minmax(0, 1fr) minmax(320px, 400px)')
    expect(declaredFor('.ps__side').background).toBe('var(--umber-2)')
    expect(declaredFor('.ps__bar')).toMatchObject({ 'grid-template-columns': '1fr auto 1fr', background: 'var(--onyx)' })
  })

  // Extract §8.3.4: the concept's drawing spills over the bar. The plan's
  // area clips it.
  it('clips the plan’s drawing to its area', () => {
    expect(declaredFor('.ps__plan').overflow).toBe('clip')
  })

  // Ruling F9: a row takes the ground's ring, 2 px inside itself, so the
  // scrolling column never clips it.
  it('rings a focused row inside itself, in the ground’s colour', () => {
    expect(declaredFor('.utable tr.row:focus-visible')).toEqual({ 'outline-offset': '-2px' })
  })

  // Spec §7.4: the drawing at .6, .78 in the crop; a hot or focused unit in a
  // brass-l line, the others' fills dropping back.
  it('draws the plan’s drawing at .6, and at .78 in the crop', () => {
    expect(declaredFor('.plan .drawing[data-loaded]').opacity).toBe('.6')
    expect(declaredFor('.plan--crop .drawing[data-loaded]').opacity).toBe('.78')
  })

  it('outlines a hot unit in brass-l and dims the others; in the crop, the focus', () => {
    expect(declaredFor('.plan .u[data-hot] .u-shape')).toMatchObject({ stroke: 'var(--brass-l)', 'stroke-width': 'calc(var(--lw, 1px) * 2.6)' })
    expect(important('.plan[data-has-hot] .u:not([data-hot]) .u-fill', [], 'opacity', '.4')).toBe(true)
    expect(declaredFor('.plan .u[data-focus] .u-shape')).toMatchObject({ stroke: 'var(--brass-l)', 'stroke-width': 'calc(var(--lw, 1px) * 2.4)' })
    expect(important('.plan[data-has-focus] .u:not([data-focus]) .u-fill', [], 'opacity', '.22')).toBe(true)
  })

  it('sizes the unit panel’s box from its screen, never wider than 1120 or taller than 680 px', () => {
    expect(declaredFor('.up__box')).toMatchObject({ width: 'min(1120px, calc(100% - 32px))', height: 'min(680px, calc(100% - 48px))', 'grid-template-columns': '1fr 1fr' })
  })

  it('stacks both on a phone: the stage’s bar on two rows, its plan over the side column; the unit panel in one column', () => {
    expect(declaredFor('.ps__bar', [PHONE])['grid-template-columns']).toBe('1fr auto')
    expect(declaredFor('.ps__body', [PHONE])['grid-template-columns']).toBe('1fr')
    expect(declaredFor('.ps__inspect', [PHONE]).display).toBe('none')
    expect(declaredFor('.up__box', [PHONE])['grid-template-columns']).toBe('1fr')
  })
})

// Ruling C8.4: on a phone the counts, the key and the table scroll together,
// and the hint stays under them in view; the side column itself never
// scrolls. From 901 px the table scrolls alone, as before.
it('scrolls the stage’s counts, key and table together on a phone, the hint pinned under them', () => {
  expect(declaredFor('.ps__scroll')).toMatchObject({ display: 'flex', 'flex-direction': 'column', flex: '1', 'min-height': '0' })
  expect(declaredFor('.ps__list')).toMatchObject({ flex: '1', overflow: 'auto' })
  expect(declaredFor('.ps__scroll', [PHONE])).toMatchObject({ overflow: 'auto', 'overscroll-behavior': 'contain' })
  expect(declaredFor('.ps__list', [PHONE])).toMatchObject({ flex: 'none', overflow: 'visible' })
  expect(declaredFor('.ps__side', [PHONE]).overflow).toBeUndefined()
  expect(declaredFor('.ps__hint').flex).toBe('none')
})

describe('„Визуално“ and „По критерии“ (spec §7.8; extract §4.19)', () => {
  it('sets the tabs in the serif, stone, the selected one ivory, 34 px apart', () => {
    expect(declaredFor('.toggle')).toMatchObject({ display: 'inline-grid', 'grid-template-columns': 'auto auto', 'column-gap': '34px' })
    expect(declaredFor('.toggle button')).toMatchObject({ padding: '8px 0 12px', font: '500 clamp(28px, 2.2vw, 36px)/1 var(--serif)', color: 'var(--stone)' })
    expect(declaredFor('.toggle button[aria-selected="true"]').color).toBe('var(--ivory)')
    expect(declaredFor('.toggle button:hover', [FINE]).color).toBe('var(--ivory)')
  })

  // The underline lies in the selected tab's column by CSS alone, so the
  // prerendered HTML shows it in place; Flip moves it on a switch
  // (ExplorerSection.jsx).
  it('lays the 1 px brass-l underline under the selected tab, by the tablist’s data-view', () => {
    expect(declaredFor('.toggle__bar')).toMatchObject({ 'grid-row': '1', 'grid-column': '1', 'align-self': 'end', height: '1px', background: 'var(--brass-l)' })
    expect(declaredFor('.toggle[data-view="list"] .toggle__bar')['grid-column']).toBe('2')
    // Both tabs placed by hand: an auto-placed first tab would go past the
    // cells the underline and the second tab hold, into a third column.
    expect(declaredFor('.toggle [role="tab"]:nth-of-type(1)')['grid-column']).toBe('1')
    expect(declaredFor('.toggle [role="tab"]:nth-of-type(2)')['grid-column']).toBe('2')
  })

  it('stacks the tabs over the lead in the head’s second half, 18 px apart', () => {
    expect(declaredFor('.explorer__head > div:nth-of-type(2)')).toMatchObject({ display: 'grid', gap: '18px', 'justify-items': 'start' })
    expect(declaredFor('.views').position).toBe('relative')
  })
})

describe('the list (spec §7.8; extract §4.26)', () => {
  // The concept's diptych.css:723-725: up to 1100 px the meta starts its own
  // line, on the left.
  it('sets the filters in a ruled bar, the meta at its end, and at its line’s start up to 1100 px', () => {
    expect(declaredFor('.lv').padding).toBe('0 var(--gut)')
    expect(declaredFor('.lv__bar')).toMatchObject({ display: 'flex', 'flex-wrap': 'wrap', gap: '18px 30px', padding: '22px 0', 'border-top': '1px solid var(--hair-2)', 'border-bottom': '1px solid var(--hair-2)' })
    expect(declaredFor('.lv__meta')).toMatchObject({ 'margin-left': 'auto', 'align-self': 'flex-end', 'white-space': 'nowrap', 'text-align': 'right' })
    expect(declaredFor('.lv__meta', ['@media (max-width: 1100px)'])).toMatchObject({ 'margin-left': '0', 'text-align': 'left' })
    expect(declaredFor('.lv__meta b')).toMatchObject({ font: '600 30px/1 var(--serif)', color: 'var(--ivory)' })
  })

  // The concept's rows are 65 px, set there by its save button (not built).
  it('sets each row 65 px tall', () => {
    expect(declaredFor('.lv .utable td')).toMatchObject({ height: '65px', 'padding-top': '14px', 'padding-bottom': '14px' })
  })

  // Spec §2.1: a control's border is hair-ctl, where the concept's hair gave
  // 1.6:1. The hover leaves a pressed pill alone: it comes later in the file
  // than the pressed rule, with the same weight, and would set ivory words on
  // the ivory pill.
  it('sets the pills 36 px tall in hair-ctl, a pressed one ivory with onyx words', () => {
    expect(declaredFor('.pills button')).toMatchObject({ height: '36px', padding: '0 13px', border: '1px solid var(--hair-ctl)', 'font-size': '13px', 'white-space': 'nowrap' })
    expect(declaredFor('.pills button[aria-pressed="true"]')).toMatchObject({ 'border-color': 'var(--ivory)', background: 'var(--ivory)', color: 'var(--onyx)' })
    expect(declaredFor('.pills button:not([aria-pressed="true"]):hover', [FINE])).toMatchObject({ 'border-color': 'var(--brass)', color: 'var(--ivory)' })
    expect(rulesFor(rules, '.pills button:hover')).toEqual([])
    expect(declaredFor('.lv__bar .pills')['flex-wrap']).toBe('nowrap')
    expect(declaredFor('.lv__bar .pills', [PHONE])['flex-wrap']).toBe('wrap')
  })

  it('sets the selects 36 px tall, 132 px wide at least, in hair-ctl with a brass chevron', () => {
    const select = declaredFor('.lv__sel')
    expect(select).toMatchObject({ height: '36px', 'min-width': '132px', border: '1px solid var(--hair-ctl)', appearance: 'none' })
    expect(select.background).toMatch(/%23B8954A/)
  })

  // Spec §2.2: sizes from the screen use --screen-h: min(70vh, 720px), and
  // 64svh on a phone.
  it('scrolls the table in a box of the screen’s .7, at most 720 px, and .64 on a phone', () => {
    expect(declaredFor('.lv__table')).toMatchObject({ 'max-height': 'min(calc(var(--screen-h) * .7), 720px)', overflow: 'auto', 'overscroll-behavior': 'contain' })
    expect(declaredFor('.lv__table', [PHONE])['max-height']).toBe('calc(var(--screen-h) * .64)')
    expect(declaredFor('.lv .utable th').background).toBe('var(--onyx)')
  })

  it('hides Етаж and Изложение on a phone', () => {
    expect(declaredFor('.lv .utable .c-floor', [PHONE]).display).toBe('none')
    expect(declaredFor('.lv .utable .c-expo', [PHONE]).display).toBe('none')
  })

  // The sort's indicator: a brass triangle, turned up for ascending.
  it('marks the sorted column with a brass triangle', () => {
    expect(declaredFor('.lv .utable th button[data-dir]::after')).toMatchObject({ 'border-top': '5px solid var(--brass)' })
    expect(declaredFor('.lv .utable th button[data-dir="asc"]::after').transform).toBe('rotate(180deg)')
  })

  // Ruling C8.12, spec §11: on a small phone the cells sit closer, but the
  // first column keeps room for the „Имот“ sort button's ring, 2 px at a
  // 3 px offset (src/index.css, which no rule here changes), inside the
  // table's box, which clips what passes its edge.
  it('keeps the „Имот“ button’s ring inside the table’s box on a small phone', () => {
    const SMALL = ['@media (max-width: 560px)']
    expect(declaredFor('.lv .utable th', SMALL)).toMatchObject({ 'padding-left': '8px', 'padding-right': '8px' })
    const first = Number.parseFloat(declaredFor('.lv .utable th:first-child', SMALL)['padding-left'])
    expect(first).toBeGreaterThanOrEqual(2 + 3)
    // The rows' first cells stay in line with their head.
    expect(declaredFor('.lv .utable td:first-child', SMALL)['padding-left']).toBe(`${first}px`)
    expect(rules.filter((rule) => /th\b[^,]*button/.test(rule.selector) && rule.declarations.some(({ prop }) => prop.startsWith('outline')))).toEqual([])
  })
})

// Spec §2.1: a control's border is hair-ctl.
it('borders the segmented control and the stepper in hair-ctl', () => {
  expect(declaredFor('.seg').border).toBe('1px solid var(--hair-ctl)')
  expect(declaredFor('.step').border).toBe('1px solid var(--hair-ctl)')
})

// Ruling F9, spec §11: nothing takes the site's focus ring away.
it('keeps the site’s focus ring on every control', () => {
  for (const rule of rules) expect(valueOf(rule, 'outline'), rule.selector).not.toBe('none')
})

// Spec §2.2: sizes from the screen use --screen-h, never vh or svh.
it('sizes nothing by vh or svh', () => {
  for (const rule of rules) {
    for (const { prop, value } of rule.declarations) expect(value, `${rule.selector} { ${prop} }`).not.toMatch(/\d(s|d|l)?vh\b/)
  }
})

// Spec §2.2: a hover effect needs a pointer that hovers.
it('keeps every :hover rule where a fine pointer hovers', () => {
  const hovers = rules.filter((rule) => rule.selector.includes(':hover'))
  expect(hovers.length).toBeGreaterThan(0)
  for (const rule of hovers) expect(rule.atRules, rule.selector).toContain(FINE)
})
