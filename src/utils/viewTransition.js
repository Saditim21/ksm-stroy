// The doors' off switch (spec §5.6). The route change's doors are CSS
// (src/styles/motion.css) on React's view transition (root.jsx). `vt-cut` on
// <html> turns them off for the next change:
// - the hero move (Home → Golden Residence), which lands on an identical frame
//   and must not close doors over it;
// - Back and Forward, which are instant.
// The cut comes off once that change's view transition is over (liftCutWhenDone,
// below), or after TRANSITION_MAX_MS where no transition ends it
// (LenisScrollSync), so it never sticks. A cut left over from a change that
// never came (Back to a page still loading when a link was followed, a hero
// move given up) is lifted by the next page the doors bring, before its doors
// are set up (root.jsx).
export const VT_CUT = 'vt-cut'

// How many cuts have been made: the number of the latest. Each cut is one
// change's, and only that change's end lifts it.
let cuts = 0

export function cutNextTransition() {
  cuts += 1
  document.documentElement.classList.add(VT_CUT)
}

export function clearTransitionCut() {
  document.documentElement.classList.remove(VT_CUT)
}

// Returns the function that lifts the cut now on once its change is done. It
// lifts nothing if a later change has made a cut of its own by then: Back
// pressed during the doors cuts its own change, and the end of the doors it
// cut short must leave that cut on.
//
// RouteTransition (root.jsx) hands this to React as its <ViewTransition>'s
// onEnter and onExit: React calls it as the route change's view transition
// starts to animate, and calls what it returns once that transition has
// finished (ViewTransition.finished), its pseudo-elements gone. Not before:
// the browser keeps a transition up until the frame after its animations have
// all finished, and styles its pseudo-elements from the stylesheet until then.
// Lifted as the animations end (a cut change's are only the 250 ms the
// browser gives its groups), the cut would start the doors on them
// (src/styles/motion.css): the page left would show again and close, after
// Back had switched at once.
export function liftCutWhenDone() {
  const cut = cuts
  return () => {
    if (cut === cuts) clearTransitionCut()
  }
}

// The doors close the whole view (spec §5.6, decision 10): the root snapshot
// (the footer and the site's onyx) closes with the page, beneath the grain, a
// group of its own (src/styles/motion.css), and what they uncover is
// ::view-transition's onyx. But React leaves the root out of a view transition
// whose changes all sit inside the boundaries it animates, as a route change's
// do: it sets <html>'s inline view-transition-name to none, hides the root's
// group and shrinks ::view-transition to nothing. The doors would then uncover
// the live document, not onyx.
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
