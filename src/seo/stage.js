// Whether a build is the production site. Only production is indexed; every
// other build (preview deploys, review builds, local builds) is noindex.
// A local build counts as non-production unless VITE_SITE_STAGE=production.
// vite.config.js injects the result as IS_PRODUCTION_BUILD; scripts/postbuild.mjs
// asks the same question of the same environment.
export function isProductionStage(env) {
  if (env.VITE_SITE_STAGE === 'review') return false
  return env.VERCEL_ENV === 'production' || env.VITE_SITE_STAGE === 'production'
}
