import { createContext } from 'react'

// How the page on screen arrived, as its frame keeps it (src/root.jsx's
// PageFrame, which provides it around the page): undefined for the first
// page the app renders, the document the browser loaded; 'pop' for a page
// Back or Forward brought; 'hero' or 'doors' for a page a link brought. A
// page's landing reads it (src/shell/landingHold.js: useFreshArrival), so
// that only a page the visitor came to afresh lands. Outside the site's
// frame (a component's own test) it is undefined, as on the first page.
export const Arrival = createContext(undefined)
