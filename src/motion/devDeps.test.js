import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

// Infra minor 3: the dev server pre-bundles every library the motion modules
// load (vite.config.js, optimizeDeps.include), the lazy ones too: Flip, which
// the explorer's stage and Обекти's register import() on their first use. A
// library Vite only meets on a page's first visit makes it optimise again and
// reload, and a page hydrating during that reload mixes two copies of React
// („Invalid hook call“). Only `npm run dev` is concerned; the build bundles
// as it always has.

const MOTION = join(cwd(), 'src', 'motion')
const config = readFileSync(join(cwd(), 'vite.config.js'), 'utf8')

// The bare specifiers of gsap and Lenis a module imports, statically or with
// import().
const librariesOf = (source) => [...source.matchAll(/(?:\bfrom\s*|\bimport\(\s*)['"]((?:gsap|lenis)(?:\/[\w-]+)?)['"]/g)].map(([, name]) => name)

it('pre-bundles for the dev server every motion library src/motion loads', () => {
  const modules = readdirSync(MOTION).filter((name) => /\.jsx?$/.test(name) && !/\.test\.jsx?$/.test(name))
  const loaded = [...new Set(modules.flatMap((name) => librariesOf(readFileSync(join(MOTION, name), 'utf8'))))].sort()
  expect(loaded).toEqual(['gsap', 'gsap/Flip', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'])

  const include = /optimizeDeps:\s*\{\s*include:\s*\[([^\]]*)\]/.exec(config)?.[1]
  const listed = [...(include ?? '').matchAll(/'([^']+)'/g)].map(([, name]) => name)
  expect(loaded.filter((name) => !listed.includes(name))).toEqual([])
})
