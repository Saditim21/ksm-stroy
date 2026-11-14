import { replace } from 'react-router'

// /projects/:id for any id but the two real projects: /projects/1 to
// /projects/12 showed placeholder projects KSM Stroy never built, and their
// URLs land on /projects. These paths are not prerendered, and ssr:false
// allows no server `loader` on them, so the redirect runs in the browser.
//
// replace(), not redirect(): a redirect from the first page load pushes a new
// history entry, and Back would land on /projects/1 only to bounce straight
// back to /projects. replace() swaps the entry instead.
export function clientLoader() {
  return replace('/projects')
}

export function HydrateFallback() {
  return null
}

export default function ProjectsIdRedirect() {
  return null
}
