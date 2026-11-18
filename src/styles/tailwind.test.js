import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { expect, it, vi } from 'vitest'
import config from '../../tailwind.config.js'

// Tailwind's defaults for its transform, filter, ring and touch utilities
// (M4 Task 8, spec M3/M4 §10): on the selectors of the utilities that read
// them, never on every element and both its pseudo-elements, where every
// style recalculation paid for them (tailwind.config.js, `experimental`).
// Built from the site's config over a page that names one such utility.
// Preflight's own `--tw-content`, for the content utility, stays on the
// pseudo-elements.
it('gives no element Tailwind’s --tw defaults but the utilities that read them', async () => {
  // Tailwind warns that the flag is experimental; the build shows it.
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { root } = await postcss([tailwindcss({ ...config, content: [{ raw: '<p class="transform">' }] })])
    .process('@tailwind base; @tailwind utilities;', { from: undefined })
  warn.mockRestore()

  const holders = []
  const universal = []
  root.walkRules((rule) => {
    const props = rule.nodes.filter((node) => node.type === 'decl' && node.prop.startsWith('--tw-')).map((node) => node.prop)
    if (props.includes('--tw-translate-x')) holders.push(rule.selector)
    if (rule.selectors.some((selector) => ['*', '::before', '::after', '::backdrop'].includes(selector.trim()))) {
      universal.push(...props.filter((prop) => prop !== '--tw-content'))
    }
  })
  expect(holders).toEqual(['.transform'])
  expect(universal).toEqual([])
})
