import { useMatches } from 'react-router'

// The route `handle` contract (plan Task 9). A route module may export
//
//   export const handle = {
//     header: 'overlay' | 'solid',
//     project?: 'golden-residence' | 'mnogofamilna-sgrada',
//     object?: string,
//     legacy?: true,
//   }
//
// - header: 'overlay' for a page whose hero runs under the header, which stays
//   see-through over it until the page has scrolled 80 px (spec §8.1);
//   'solid' for any other page;
// - project: the project the page belongs to; „Запитване“ carries it to the
//   form as /contact?project=…;
// - object: the project's name, for the footer's title block;
// - legacy: a page M2 has not rebuilt yet. It keeps production's light look
//   inside the dark shell (src/root.jsx).
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

