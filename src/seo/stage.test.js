import { expect, it } from 'vitest'
import { isProductionStage } from './stage'

// Only the production site is indexed (spec §6.7). Vercel sets VERCEL_ENV and
// VERCEL_PROJECT_PRODUCTION_URL (the project's production domain, without
// https://, previews included) on every build. A build is production only on
// the production deployment of the project whose domain is ksmstroy.com;
// VITE_SITE_STAGE overrides that either way.

const ON_KSMSTROY = { VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'www.ksmstroy.com' }
// A second Vercel project for the client's review, whose production branch is
// redesign-v2 (spec §13): its builds are production deployments too.
const ON_REVIEW_PROJECT = { VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'ksmstroy-v2.vercel.app' }

it('is production on the production deployment of the project whose domain is ksmstroy.com, with or without www.', () => {
  expect(isProductionStage(ON_KSMSTROY)).toBe(true)
  expect(isProductionStage({ ...ON_KSMSTROY, VERCEL_PROJECT_PRODUCTION_URL: 'ksmstroy.com' })).toBe(true)
})

it('is not production on a second project whose production branch is redesign-v2, on a vercel.app domain', () => {
  expect(isProductionStage(ON_REVIEW_PROJECT)).toBe(false)
})

it('is not production on a domain that is not ksmstroy.com itself', () => {
  for (const domain of ['notksmstroy.com', 'review.ksmstroy.com', 'ksmstroy.com.vercel.app', '']) {
    expect(isProductionStage({ ...ON_KSMSTROY, VERCEL_PROJECT_PRODUCTION_URL: domain }), domain).toBe(false)
  }
  expect(isProductionStage({ VERCEL_ENV: 'production' })).toBe(false)
})

it('is not production on a preview, though a preview knows the production domain', () => {
  expect(isProductionStage({ ...ON_KSMSTROY, VERCEL_ENV: 'preview' })).toBe(false)
  expect(isProductionStage({ ...ON_KSMSTROY, VERCEL_ENV: 'development' })).toBe(false)
})

it('is not production in a local build', () => {
  expect(isProductionStage({})).toBe(false)
})

it('VITE_SITE_STAGE=review makes any build noindex, the production deployment included', () => {
  expect(isProductionStage({ ...ON_KSMSTROY, VITE_SITE_STAGE: 'review' })).toBe(false)
  expect(isProductionStage({ ...ON_REVIEW_PROJECT, VITE_SITE_STAGE: 'review' })).toBe(false)
})

it('VITE_SITE_STAGE=production makes any build indexable, for a local check of the production build', () => {
  expect(isProductionStage({ VITE_SITE_STAGE: 'production' })).toBe(true)
  expect(isProductionStage({ ...ON_REVIEW_PROJECT, VITE_SITE_STAGE: 'production' })).toBe(true)
  expect(isProductionStage({ ...ON_KSMSTROY, VERCEL_ENV: 'preview', VITE_SITE_STAGE: 'production' })).toBe(true)
})
