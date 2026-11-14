// The doors' off switch (spec §5.6). The route change's doors are CSS
// (src/styles/motion.css) on React's view transition (root.jsx). `vt-cut` on
// <html> turns them off for the next change:
// - the hero move (Home → Golden Residence), which lands on an identical frame
//   and must not close doors over it;
// - Back and Forward, which are instant.
// LenisScrollSync clears the cut once that change's transition is over, or
// after TRANSITION_MAX_MS where none settles, so it never sticks.
export const VT_CUT = 'vt-cut'

export function cutNextTransition() {
  document.documentElement.classList.add(VT_CUT)
}

export function clearTransitionCut() {
  document.documentElement.classList.remove(VT_CUT)
}

// The doors close the whole view (spec §5.6, decision 10): the root snapshot
// (the footer, the grain, the ground) closes with the page, and what they
// uncover is ::view-transition's onyx. But React leaves the root out of a view
// transition whose changes all sit inside the boundaries it animates, as a
// route change's do: it sets <html>'s inline view-transition-name to none,
// hides the root's group and shrinks ::view-transition to nothing. The doors
// would then uncover the live page, a legacy page's light ground among it.
// React leaves alone a name it finds set inline, so this sets the root's own
// name, `root`, there while the app is up. After hydration, so the server's
// <html> stays as React rendered it. Every view transition then closes the
// root with the doors: RouteTransition's is the site's only one, and an
// in-page <ViewTransition> added later must allow for that. Returns the
// remover.
export function keepRootSnapshot() {
  const { style } = document.documentElement
  style.setProperty('view-transition-name', 'root')
  return () => style.removeProperty('view-transition-name')
}

// Every popstate (Back, Forward, a fragment the browser followed) cuts the
// doors of the change it brings. A popstate fires before the router commits
// that change; React Router listens on window too, and its listener may lead
// to a commit before a later listener runs (React renders a transition started
// during popstate at once). A capturing listener on window runs before every
// bubbling one there, whenever each was added, so the cut is always in place
// first. Returns the remover.
export function cutOnPop() {
  const cut = () => cutNextTransition()
  window.addEventListener('popstate', cut, true)
  return () => window.removeEventListener('popstate', cut, true)
}
