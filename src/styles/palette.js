// The Diptych palette (spec §2.1): the single source of the site's colours.
// tailwind.config.js makes each key a Tailwind colour (bg-onyx, text-ivory,
// border-hair-ctl), and src/index.css writes each as a :root variable
// (--onyx, --ivory, …) for hand-written CSS; src/styles/tokens.test.js holds
// the two to these values and to the contrast floors.
//
// Warm near-black grounds, ivory text, brass only as a line, the one italic
// word or an active state, never a fill. hair-ctl outlines a control and
// reaches 3:1 on both grounds (WCAG 1.4.11). The four statuses always come
// with a pattern, a glyph and a word (spec §7.9).
export const PALETTE = Object.freeze({
  onyx: '#0E0D0B',
  umber: '#1A1714',
  'umber-2': '#211D19',
  ivory: '#EFE9DD',
  'ivory-2': 'rgba(239, 233, 221, 0.82)',
  'ivory-3': 'rgba(239, 233, 221, 0.62)',
  stone: '#9B9488',
  hair: 'rgba(155, 148, 136, 0.3)',
  'hair-2': 'rgba(155, 148, 136, 0.16)',
  'hair-ctl': 'rgba(155, 148, 136, 0.62)',
  brass: '#B8954A',
  'brass-l': '#D8BD7A',
  'status-free': '#4FBF85',
  'status-reserved': '#E9953F',
  'status-sold': '#D4574E',
  'status-blocked': '#8A867D',
})

// The light theme („травертин“, polish spec §5): the same keys, for
// :root[data-theme="light"] in src/index.css. Warm stone grounds, ink text, a
// deeper brass; the statuses darkened to keep 3:1 on both light grounds
// (src/styles/tokens.test.js). What sits on photographs keeps the dark values
// (.dark, src/index.css).
export const LIGHT_PALETTE = Object.freeze({
  onyx: '#ECE6DA',
  umber: '#E2DACC',
  'umber-2': '#D8CEBE',
  ivory: '#17140F',
  'ivory-2': 'rgba(23, 20, 15, 0.8)',
  'ivory-3': 'rgba(23, 20, 15, 0.66)',
  stone: '#5E574B',
  hair: 'rgba(23, 20, 15, 0.2)',
  'hair-2': 'rgba(23, 20, 15, 0.1)',
  'hair-ctl': 'rgba(23, 20, 15, 0.5)',
  brass: '#8E6D2C',
  'brass-l': '#735619',
  'status-free': '#237F4E',
  'status-reserved': '#B0621A',
  'status-sold': '#BA4136',
  'status-blocked': '#7A756B',
})
