import { useMatches } from 'react-router'

// The route `handle` contract. A route module may export
//
//   export const handle = {
//     header: 'overlay' | 'solid',
//     project?: 'golden-residence' | 'mnogofamilna-sgrada',
//     inquiry?: true,
//     legacy?: true,
//   }
//
// - header: 'overlay' for a page whose hero runs under the header, which stays
//   see-through over it until the page has scrolled 40 px; the page starts at
//   the top of the screen. 'solid' for any other page, which starts below the
//   header (spec §4, §6.2);
// - project: the project the page belongs to; „Запитване“ carries it to the
//   contact form as /contact?project=…;
// - inquiry: the page has an inquiry of its own, #zapitvane, where the
//   header's „Запитване“ goes instead (spec §6.2, §6.12);
// - legacy: a page M2 has not rebuilt yet. It keeps production's light look
//   inside the dark shell, with no grain over it (src/root.jsx).
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

export function inquiryHref(project) {
  return project ? `/contact?project=${encodeURIComponent(project)}` : '/contact'
}

// Where the header's „Запитване“ goes: the page's own inquiry, or else the
// contact page with the page's project.
export function inquiryTarget(handle) {
  return handle.inquiry ? '#zapitvane' : inquiryHref(handle.project)
}
