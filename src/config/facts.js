// The projects' fixed facts (spec §9), one place for every page that states
// them. Only the free counts are live (useAvailability); these never change
// with the sheets. src/config/facts.test.js holds each to the data built into
// the site.

// Многофамилна сграда's counts, dated: its sheets are not published, so Home
// shows the built-in data's figures with their date until M3 switches the
// half to live counts with the project's page (spec §1.10, §9).
export const MNOGO_DATED = Object.freeze({ free: 16, total: 144, date: '01.12.2025' })

// Golden Residence: 192 apartments in 2 blocks of 8 floors, 12 a floor, from
// 43,98 to 114,58 m²; 113 garages and 68 parking places. `elevations` is the
// кота of a floor, keyed by its floor key, and only where the drawings give
// one: А1 at +3,06 (spec §9, §14.6). No floor's кота is extrapolated.
export const GR_FACTS = Object.freeze({
  apartments: 192,
  blocks: 2,
  floors: 8,
  perFloor: 12,
  minArea: 43.98,
  maxArea: 114.58,
  garages: 113,
  parking: 68,
  elevations: Object.freeze({ 'А-1': 3.06 }),
})
