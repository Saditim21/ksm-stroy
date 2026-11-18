import { useMatches } from 'react-router'

// The route `handle` contract. A route module may export
//
//   export const handle = {
//     header: 'overlay' | 'solid',
//     project?: 'golden-residence' | 'mnogofamilna-sgrada',
//     inquiry?: true,
//   }
//
// - header: 'overlay' for a page whose hero runs under the header, which stays
//   see-through over it until the page has scrolled 40 px; the page starts at
//   the top of the screen. 'solid' for any other page, which starts below the
//   header (spec §4, §6.2);
// - project: the project the page belongs to; „Запитване“ carries it to the
//   contact form as /contact?project=…#zapitvane;
// - inquiry: the page has an inquiry of its own, #zapitvane, where the
//   header's „Запитване“ goes instead (spec §6.2, §6.12); without one, it
//   goes to the contact page's form (M3/M4 spec §8).
//
// Every page is Diptych's, on the dark ground under the grain (src/root.jsx):
// the legacy pages' `legacy`, and their light ground with it, left with them
// (M3/M4 spec §9).
//
// The shell reads the deepest route's handle. A route without one is solid.
const DEFAULT_HANDLE = Object.freeze({ header: 'solid' })

export function useRouteHandle() {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const { handle } = matches[i]
    if (handle) return { ...DEFAULT_HANDLE, ...handle }
  }
  return DEFAULT_HANDLE
}

// The contact page's form, #zapitvane, with `project` chosen there, if any
// (M3/M4 spec §7.1–7.3, §8): the header's „Запитване“ on a page without an
// inquiry of its own, and the pages' links to the form.
export function inquiryHref(project) {
  return `/contact${project ? `?project=${encodeURIComponent(project)}` : ''}#zapitvane`
}

// Where the header's „Запитване“ goes: the page's own inquiry, or else the
// contact page's form with the page's project.
export function inquiryTarget(handle) {
  return handle.inquiry ? '#zapitvane' : inquiryHref(handle.project)
}
