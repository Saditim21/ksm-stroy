# KSM Stroy — Visual Redesign & Interactive Apartment Explorer

**Date:** 2026-07-30
**Status:** Approved by owner (section-by-section review)
**Branch:** `redesign` (production `main` untouched until final approval)

## 1. Background & Problem

ksmstroy.bg presents two active residential projects — **Golden Residence** and
**Многофамилна сграда** — and lets buyers browse availability per floor and
apartment. Availability data lives in Google Sheets (published CSV, 30s cache)
for Golden Residence only; Многофамилна data is hardcoded in the source.

Current floor interaction swaps the entire building image to one of ~40
pre-baked Figma exports with a green/red band painted on. Problems:

1. **Hover colors are disconnected from live data** — bands are baked into
   images, so sold-out floors keep showing green until someone re-exports
   from Figma.
2. Hover zones are hand-tuned percentage rectangles that drift out of
   alignment with the real floors at different viewport sizes.
3. ~40 full-size hover images cost bandwidth and cause a flash on first hover.
4. Hover-only interaction has no touch/mobile story.
5. Only binary green/red — no reserved state, no counts.
6. Heavy code duplication: five overlapping floor-map components
   (~5,000 lines), 20 separate `isHoveringXFloorY` booleans, legacy data
   pasted into components, and an abandoned polygon experiment
   (`FloorHighlighter.tsx`, `src/components/geo/`).
7. Misleading naming: `FourTowersFloorMap` actually renders Многофамилна
   сграда. Placeholder portfolio content (12 fake projects) and a generic
   procedural 3D viewer undermine trust.

## 2. Decisions (from owner Q&A)

| Question | Decision |
|---|---|
| Scope | Full site redesign, flagship = apartment explorer |
| Visual direction | **Refined luxury** — keep gold + charcoal brand, executed with restraint |
| Explorer depth | **Apartment-level** interactivity (traced apartments on floor plans) |
| Projects covered | Both: Golden Residence and Многофамилна сграда (only 2 projects exist; "Four Towers" is a legacy internal name) |
| 3D | No real models exist → remove generic 3D viewer, design around renders |
| Data source | **All** apartment data moves to Google Sheets; hardcoded data kept as fallback only |
| Core technique | **Option A: dynamic SVG polygon overlays** over single base renders |
| Rollout | Everything on `redesign` branch + Vercel preview URL; merge only after owner approval |

## 3. Interactive Apartment Explorer

### 3.1 Customer journey (identical both projects; desktop + mobile)

1. Project page opens with a full-width building render. A one-time shimmer
   sweep + hint label ("Изберете етаж") signals interactivity.
2. Hovering (desktop) or tapping (mobile) a floor fills its traced outline
   with its live availability color and shows a tooltip:
   *"Етаж 4 — 5 свободни · 2 резервирани · 5 продадени"*. The floor list
   beside the building stays synced in both directions (kept from today).
3. Clicking a floor transitions to the floor-plan view: the architecture plan
   with each apartment outlined and colored by status at low opacity
   (plan stays readable), apartment number as label, legend + live counters
   above.
4. Clicking an apartment opens a details panel (slide-over desktop, bottom
   sheet mobile): number, type, areas, exposure, status badge, gold
   **"Изпратете запитване"** CTA → contact form pre-filled with apartment ID.
5. Filters above the plan: "Само свободни", type, area range. Non-matching
   apartments dim to gray.
6. Garages/parking keep their grid UI, restyled, still fed by their sheets.

### 3.2 Status semantics (single source of truth)

- **Floor color:** green if ≥1 Свободен; amber if 0 free and ≥1 Резервиран;
  red if all Продаден; neutral gray if no data.
- **Apartment color:** its own normalized status (Свободен/Резервиран/
  Продаден); neutral gray if the traced shape has no matching sheet row
  (tooltip "няма данни" — harmless, signals a data gap to us).
- Green/amber/red are reserved exclusively for availability across the whole
  site.

### 3.3 Components

- `InteractiveBuilding` — renders base image + SVG overlay of floor shapes;
  props: map JSON, per-floor status summaries, hover/select callbacks.
- `FloorPlanViewer` — plan image + SVG apartment shapes; zoom/pan (kept from
  today), filter dimming.
- `ApartmentPanel` — details slide-over/bottom-sheet.
- `AvailabilityBadge`, `AvailabilityLegend`, `LiveStatsBar` — shared UI.
- One config module per project (images, map JSON refs, sheet keys, blocks,
  floor ranges) — components contain zero project-specific data.

### 3.4 Shape map JSON

Traced shapes are stored in versioned JSON files under `src/data/maps/`.
Coordinates are **natural-image pixels** (SVG `viewBox="0 0 w h"` scales with
the rendered image, guaranteeing alignment at every viewport).

```jsonc
// buildingMap: one per facade view
{
  "image": "golden-residence/building-2.webp",
  "imageWidth": 2484, "imageHeight": 1240,
  "shapes": [
    {
      "type": "floor", "block": "A", "floor": 3,
      "polygons": [ [[x,y],[x,y],...], ... ]   // multi-polygon: facades with
    }                                           // gaps (tower sections) supported
  ]
}
```

```jsonc
// floorMap: one per UNIQUE plan image, reused across identical floors
{
  "image": "golden-residence/architecture-a-floor-2.webp",
  "imageWidth": 3000, "imageHeight": 2000,
  "appliesTo": { "project": "golden-residence", "block": "A", "floors": [2,3,4,5,6,7,8] },
  "shapes": [
    { "type": "apartment", "unitSuffix": "01", "polygons": [...] }
    // runtime resolves unit id = block letter + floor + suffix → "А 301";
    // floors with unique layouts may use explicit "unit" instead
  ]
}
```

Unit matching against sheet rows is exact-match after normalization: trim,
collapse spaces, tolerate Cyrillic/Latin А↔A.

## 4. Data Layer — everything live from Google Sheets

- Golden Residence: unchanged (Block A, Block B, garages, parking sheets).
- Многофамилна сграда: two new published-CSV tabs (Вход А, Вход Б), same
  column format: `Етаж, Апартамент, Вид, Застроена, Идеални, Обща,
  Изложение, Статус`. Initial content generated from the currently hardcoded
  data (~144 apartments) for the owner to paste in. New env vars
  `VITE_GOOGLE_SHEET_MNOGO_A` / `VITE_GOOGLE_SHEET_MNOGO_B` (Vercel + local),
  documented in a short setup guide mirroring the Golden Residence one.
- Hardcoded data remains **as fallback only** (both projects): sheet
  unreachable/misconfigured → silent fallback, site never breaks.
- Optional `Цена` column: if present in a sheet, price appears in the
  apartment panel; absent → nothing shows.
- Existing `googleSheets.js` service + `ApartmentContext` are extended, not
  replaced; 30s cache and cache-busting kept.

## 5. Tracing Editor (dev-only internal tool)

- Route `/dev/tracer`, **excluded from production builds** (dev-mode only).
- Load any render/plan → click corner-by-corner to draw outlines; drag
  points to fine-tune; zoom/pan for precision.
- Facade shortcut: mark 4 facade corners + floor count → auto-slice into
  bands (reusing the homography math from the abandoned experiment), then
  nudge individual lines.
- Shapes tagged with floor number or unit suffix/ID.
- Export writes the JSON map files consumed by the site; committed to git.
- Initial tracing of both projects (2 facades + all unique plans, ~20–30
  images) is done as part of this work; the editor remains for future
  buildings.

## 6. Site-wide Redesign — "refined luxury"

**Design language:**
- Ivory/warm-white foundations, deep charcoal text. Gold demoted to precision
  accent (hairlines, numbers, active states, inquiry CTA) — no gold-gradient
  washes.
- Editorial headlines in Playfair Display, Inter for UI/body, strict type
  scale, generous spacing.
- Renders go full-bleed with consistent edge-gradient treatment for text
  legibility.
- Motion: slow Ken Burns on heroes, soft scroll reveals, animated counters,
  consistent easing, `prefers-reduced-motion` respected.

**Pages:**
- **Начало:** full-screen hero + live trust bar ("X свободни апартамента в 2
  активни проекта" — real sheet numbers), two large project cards with
  availability summaries, services with real photos, stats, closing CTA.
- **Продажби (/projects):** clean landing with the two projects as immersive
  cards → dedicated project pages (the explorer). The modal-in-modal flow is
  replaced by proper pages with URLs. Existing URLs
  (`/projects/golden-residence/:block`, `/projects/mnogofamilna-sgrada/:block`)
  are preserved; selected floor becomes a shareable query param (`?floor=3`).
- **За нас / Контакти / Blog:** restyled to the design system; contact form
  receives pre-filled apartment inquiries; content unchanged.
- **Navbar/Footer:** thinner transparent navbar turning solid on scroll;
  footer reorganized.
- Removed: generic 3D viewer, 12 placeholder portfolio projects and their
  detail route. Any old `/projects/:id` placeholder URL redirects to
  `/projects` so previously indexed links never 404.

## 7. Architecture Cleanup

Deleted: `BuildingFloorMap.jsx`, `BuildingFloorMapExact.jsx`,
`BuildingFloorMapPrecise.jsx`, `FloorHighlighter.tsx`, `demo.tsx`,
`src/components/geo/` (after harvesting the band-slicing math),
`ThreeDModelViewer.jsx`, `projectsData.js`, `useFacadeBands.ts`,
`polygonUtils.ts`, root-level experiment JSONs, and all (~40) pre-baked hover
images. `FourTowersFloorMap`/"FourTowers" naming replaced by `mnogofamilna`.
The five floor-map components collapse into the Section 3.3 component set.

## 8. Performance & Resilience

- One render per explorer page (was: dozens preloaded); `srcset` responsive
  sizes; floor plans lazy-loaded on click; skeleton loading states.
- Lighthouse (mobile) measured before/after on the preview; numbers reported.
- Failure modes: sheets down → fallback data; missing shape/unmatched unit →
  neutral gray; images slow → skeletons. No customer-facing crash paths.

## 9. Testing

- Add Vitest + React Testing Library (project currently has zero tests).
- Unit tests: status normalization, floor/apartment color derivation, CSV
  parsing, unit-ID normalization/matching, map-JSON resolution
  (suffix → unit id), fallback behavior.
- Component tests: InteractiveBuilding hover/select, FloorPlanViewer
  filtering, ApartmentPanel content, prefilled inquiry flow.
- Manual checklist on Vercel preview: both projects × desktop/mobile ×
  hover/tap × all floors; sheet edit propagates ≤60s; all legacy URLs load.

## 10. Rollout

1. All work on `redesign` branch; `main` (production) untouched.
2. Vercel preview URL from the branch for owner review on any device, with
   real sheet data.
3. Merge to `main` only after owner click-through approval. Single-command
   revert if anything surfaces post-merge.

## 11. Out of Scope (explicitly)

- 3D building models (no source models exist).
- Multi-language versions (site stays Bulgarian).
- CMS/admin beyond Google Sheets.
- Blog content rewriting (restyle only).
- Price data entry (supported automatically only if owner adds the column).

## 12. Success Criteria

- Facade, floor-plan, list and counter colors always reflect the sheets
  within 60 seconds — zero image re-exports ever again.
- Apartment-level browsing works by touch and mouse, aligned at every
  viewport.
- Both projects fully sheet-driven with working fallback.
- Inquiry CTA arrives pre-filled with the correct apartment ID.
- Measurably improved mobile Lighthouse performance score.
- All existing indexed URLs keep working.
- Owner approves the preview before merge.
