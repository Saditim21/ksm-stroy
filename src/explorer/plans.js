// A project's plans, by block letter (spec §7.4; M3 §6.4): what the edge
// panels, the sheet, the plan stage and the unit panel draw. Each block's is
// the entry of the project's floors map that applies to it (one typical floor
// serves all its floors, spec §9; Многофамилна's serves both blocks), with
// - `drawing`, the address of the dark drawing under it in the stage and the
//   unit panel (its widest WebP), or null where the project has none;
// - `unitNumber(unit)`, the number an apartment shows on it (Golden
//   Residence's „501“, Многофамилна's „101“, PlanSvg.jsx);
// - `floorMeta(floor)`, the project's word on a floor, or null (the кота its
//   drawings give, the attic; FloorMeta, FloorFacts.jsx);
// - `floorWord(floor)`, the word after the floor's number where one
//   apartment is named, or null, or undefined where the project has none
//   (Многофамилна's attic, „етаж 10, тавански“; UnitPanel.jsx);
// - `own`, the plans of the apartments production has a plan of their own
//   for, an image by the unit's label (Многофамилна's; the unit panel's
//   switch, UnitPanel.jsx), or undefined;
// - `className`, the class the plan's own look hangs on (Многофамилна's
//   quieter drawing, src/explorer/mn-facade.css), or undefined.
//
// The project hands them over as data (project.plans), there at once, as a
// chunk of its own (project.loadPlans()), or both: its data at once, whole
// once its chunk is in. So a project's plans load only on its pages, and
// Golden Residence's in none of its routes' first-load JS (ruling PF3, M3
// §10): Многофамилна's floors, numbers and attic are data (its block pages
// prerender mini plans, which draw no drawing), its drawing and its
// apartments' own plans a chunk of their own, as lazy as the dialogs that
// show them. Only modules of the surfaces' chunk import this one
// (surfaces.js), and loadSurfaces.js loads a project's plans before it hands
// the surfaces over (hasPlans), so plansOf() has them whole by the time a
// dialog draws.
import { planFor } from './planGeometry'

// Each project's plans, whole; and those of its data alone, while its chunk
// is still to load.
const whole = new WeakMap()
const early = new WeakMap()
const pending = new WeakMap()

const drawingOf = (image) => (image ? `${image.path}-${image.widths[image.widths.length - 1]}.webp` : null)

const plansFrom = ({ floors, drawings, unitNumber, floorMeta, floorWord, own, className }) => Object.freeze(Object.fromEntries(['А', 'Б'].map((block) => [
  block,
  Object.freeze({ ...planFor(floors, block), drawing: drawingOf(drawings?.[block]), unitNumber, floorMeta, floorWord, own, className }),
])))

/** `project`'s plans: { 'А': plan, 'Б': plan }, each a floors map's entry
 * with its `drawing`, `unitNumber`, `floorMeta`, `floorWord`, `own` and
 * `className`;
 * whole once loaded (loadPlans), those of its data alone before (no
 * drawing, no own plans), else undefined. */
export function plansOf(project) {
  if (whole.has(project) || !project?.plans) return whole.get(project)
  if (!project.loadPlans) {
    whole.set(project, plansFrom(project.plans))
    return whole.get(project)
  }
  if (!early.has(project)) early.set(project, plansFrom(project.plans))
  return early.get(project)
}

/** Whether `project`'s plans are whole: its data alone, or its chunk in. */
export function hasPlans(project) {
  plansOf(project)
  return whole.has(project)
}

/** Loads `project`'s plans, once, whole; a failed load may be tried again. */
export function loadPlans(project) {
  if (!project.loadPlans) return Promise.resolve(plansOf(project))
  if (!pending.has(project)) {
    pending.set(project, project.loadPlans().then(
      (data) => {
        const plans = plansFrom({ ...project.plans, ...data })
        whole.set(project, plans)
        return plans
      },
      (error) => {
        pending.delete(project)
        throw error
      },
    ))
  }
  return pending.get(project)
}
