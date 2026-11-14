import { expect, it } from 'vitest'
import { pageMeta } from './meta'

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
