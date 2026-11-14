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
