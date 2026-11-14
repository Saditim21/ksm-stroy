import { expect, it } from 'vitest'
import { isProductionStage } from './stage'

it('is production only on Vercel production or with VITE_SITE_STAGE=production', () => {
  expect(isProductionStage({})).toBe(false)
  expect(isProductionStage({ VERCEL_ENV: 'preview' })).toBe(false)
  expect(isProductionStage({ VERCEL_ENV: 'production' })).toBe(true)
  expect(isProductionStage({ VITE_SITE_STAGE: 'production' })).toBe(true)
})

it('a review build is never production, even on Vercel production', () => {
  expect(isProductionStage({ VERCEL_ENV: 'production', VITE_SITE_STAGE: 'review' })).toBe(false)
})
