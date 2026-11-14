// Whether a build is the production site. Only production is indexed; every
// other build (preview deploys, local builds, any other Vercel project, such
// as the client review project) is noindex. vite.config.js injects the result
// as IS_PRODUCTION_BUILD; scripts/postbuild.mjs asks the same question of the
// same environment, process.env (README, "Indexing").
//
// Vercel sets VERCEL_ENV and VERCEL_PROJECT_PRODUCTION_URL on every build: the
// deployment's environment, and the project's production domain without
// https://, which its previews get too. A review project whose production
// branch is redesign-v2 builds as production on a *.vercel.app domain, so
// production is the production deployment of the project whose domain is
// ksmstroy.com. VITE_SITE_STAGE overrides that: 'review' is never production,
// 'production' always is (a local check of the production build).
const PRODUCTION_DOMAINS = ['ksmstroy.com', 'www.ksmstroy.com']

export function isProductionStage(env) {
  if (env.VITE_SITE_STAGE === 'review') return false
  if (env.VITE_SITE_STAGE === 'production') return true
  const domain = String(env.VERCEL_PROJECT_PRODUCTION_URL ?? '').trim().toLowerCase()
  return env.VERCEL_ENV === 'production' && PRODUCTION_DOMAINS.includes(domain)
}
