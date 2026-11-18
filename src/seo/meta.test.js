import { expect, it } from 'vitest'
import { pageMeta, robotsMeta } from './meta'
import { meta as rootMeta } from '../root'

it('builds a canonical on the live domain', () => {
  const m = pageMeta({ title: 'За нас | КСМ Строй', description: 'd', path: '/about' })
  expect(m).toContainEqual({ title: 'За нас | КСМ Строй' })
  expect(m).toContainEqual({ tagName: 'link', rel: 'canonical', href: 'https://www.ksmstroy.com/about' })
  expect(m).toContainEqual({ property: 'og:url', content: 'https://www.ksmstroy.com/about' })
})

// A real 1200 × 630 share image (v2 spec §6.7), cut from the Golden Residence
// dusk render: public/og/ksm-stroy-1200x630.jpg.
it('shares the 1200 × 630 dusk image by default', () => {
  const m = pageMeta({ title: 'КСМ Строй', description: 'd', path: '/' })
  expect(m).toContainEqual({ property: 'og:image', content: 'https://www.ksmstroy.com/og/ksm-stroy-1200x630.jpg' })
})

// Spec M3/M4 §11: a page that names its own picture, a 1200 × 630 file of the
// image pipeline, shares it instead, root-relative on the live domain.
it('shares the page’s own picture when it names one', () => {
  const m = pageMeta({ title: 'Обекти', description: 'd', path: '/blog', image: '/img/work-chitalishte-3-og.jpg' })
  expect(m.filter((tag) => tag.property === 'og:image')).toEqual([{ property: 'og:image', content: 'https://www.ksmstroy.com/img/work-chitalishte-3-og.jpg' }])
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
