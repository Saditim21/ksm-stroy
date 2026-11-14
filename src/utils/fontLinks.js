// The display faces' preloads (spec §3.1). The root preloads only KSM Text,
// the shell's face. A page that sets KSM Display in its first viewport (Home,
// Golden Residence, the block pages) adds both display files from its own
// route `links`, so the browser fetches the title's face, and the italic of
// its one italic word, with the page:
//
//   export const links = () => [...DISPLAY_FONT_PRELOADS]
//
// A preload no page uses within a few seconds is a console warning (and a
// failed smoke run), so only such pages add them. crossOrigin 'anonymous'
// matches the font request, which is always CORS, so the preload is reused.
const fontPreload = (href) => Object.freeze({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

export const DISPLAY_FONT_PRELOADS = Object.freeze([
  fontPreload('/fonts/ksm-display.woff2'),
  fontPreload('/fonts/ksm-display-italic.woff2'),
])
