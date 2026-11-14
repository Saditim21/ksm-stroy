import { expect, it } from 'vitest'
import { pageMeta, robotsMeta } from './meta'
import { meta as rootMeta } from '../root'

it('builds a canonical on the live domain', () => {
  const m = pageMeta({ title: 'За нас | КСМ Строй', description: 'd', path: '/about' })
  expect(m).toContainEqual({ title: 'За нас | КСМ Строй' })
  expect(m).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/about' })
  expect(m).toContainEqual({ property: 'og:url', content: 'https://www.ksmstroy.com/about' })
})

it('never appends the brand twice', () => {
  const m = pageMeta({ title: 'КСМ Строй', description: 'd', path: '/' })
  expect(m.find((x) => x.title).title).toBe('КСМ Строй')
})

it('marks every page noindex outside production, indexable in production', () => {
  expect(robotsMeta(false)).toEqual({ name: 'robots', content: 'noindex, nofollow' })
  expect(robotsMeta(true)).toEqual({ name: 'robots', content: 'index, follow' })
})

it('a build that is not production (the test build, a review build) is noindex on the root and on pages', () => {
  const noindex = { name: 'robots', content: 'noindex, nofollow' }
  expect(rootMeta()).toContainEqual(noindex)
  expect(pageMeta({ title: 't', description: 'd', path: '/' })).toContainEqual(noindex)
})
