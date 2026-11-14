import { expect, it } from 'vitest'
import { normalizePathname } from './pathname'

it('strips one or more trailing slashes but keeps the root', () => {
  expect(normalizePathname('/about/')).toBe('/about')
  expect(normalizePathname('/projects/golden-residence//')).toBe('/projects/golden-residence')
  expect(normalizePathname('/')).toBe('/')
})
