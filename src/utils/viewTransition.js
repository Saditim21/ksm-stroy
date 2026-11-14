// The doors' off switch (spec §5.6). The route change's doors are CSS
// (src/styles/motion.css) on React's view transition (root.jsx). `vt-cut` on
// <html> turns them off for the next change:
// - the hero move (Home → Golden Residence), which lands on an identical frame
//   and must not close doors over it;
// - Back and Forward, which are instant.
// LenisScrollSync clears the cut once that change's transition is over, or
// after TRANSITION_MAX_MS where none settles, so it never sticks. A cut left
// over from a change that never came (Back to a page still loading when a link
// was followed, a hero move given up) is lifted by the next page the doors
// bring, before its doors are set up (root.jsx).
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

// Every popstate that brings another page (Back, Forward) cuts that change's
// doors. `bringsAnotherPage`, asked as each popstate arrives, says whether it
// does; without it, every popstate cuts. A fragment the browser follows (a
// plain #… link, the skip link among them) fires a popstate too, and keeps the
// page: it has no doors to cut, and a cut it set would wait for the next route
// change to clear it, and that change would run without its doors.
//
// React Router listens for popstate on window as well, from the moment the
// router is made, so before this. Which listener runs first is the browser's
// affair: the DOM standard (and jsdom) runs a capturing listener on window
// before the bubbling ones; Chrome runs window's listeners in the order they
// were added, whatever their phase, so there the router has handled the
// popstate when this runs, and React has often committed the change already
// (it renders a transition started during a popstate at once). Either way the
// cut is in time: React applies a route change to the page, and the browser
// sets up its doors, in the view transition a frame later. A change that runs
// no view transition has no doors to cut. Returns the remover.
export function cutOnPop(bringsAnotherPage = () => true) {
  const cut = () => {
    if (bringsAnotherPage()) cutNextTransition()
  }
  window.addEventListener('popstate', cut, true)
  return () => window.removeEventListener('popstate', cut, true)
}
