// A project's plans, by block letter (spec §7.4; M3 §6.4): what the edge
// panels, the sheet, the plan stage and the unit panel draw. Each block's is
// the entry of the project's floors map that applies to it (one typical floor
// serves all its floors, spec §9; Многофамилна's serves both blocks), with
// - `drawing`, the address of the dark drawing under it in the stage and the
//   unit panel (its widest WebP), or null where the project has none;
// - `unitNumber(unit)`, the number an apartment shows on it (Golden
//   Residence's „501“, Многофамилна's „101“, PlanSvg.jsx);
// - `floorMeta(floor)`, the project's word on a floor, or null (the кота its
//   drawings give, the attic; FloorMeta, FloorPanel.jsx).
//
// The project hands them over as data (project.plans), there at once, or as
// a chunk of its own (project.loadPlans()), so a project's plans load only on
// its pages, and Golden Residence's in none of its routes' first-load JS
// (ruling PF3, M3 §10). Only modules of the surfaces' chunk import this one
// (surfaces.js), and loadSurfaces.js loads a project's plans before it hands
// the surfaces over, so plansOf() has them by the time a surface draws.
import { planFor } from './planGeometry'

const ready = new WeakMap()
const pending = new WeakMap()

const drawingOf = (image) => (image ? `${image.path}-${image.widths[image.widths.length - 1]}.webp` : null)

const plansFrom = ({ floors, drawings, unitNumber, floorMeta }) => Object.freeze(Object.fromEntries(['А', 'Б'].map((block) => [
  block,
  Object.freeze({ ...planFor(floors, block), drawing: drawingOf(drawings?.[block]), unitNumber, floorMeta }),
])))

/** `project`'s plans: { 'А': plan, 'Б': plan }, each a floors map's entry
 * with its `drawing`, `unitNumber` and `floorMeta`; at once where they are
 * data, else once loaded (loadPlans); else undefined. */
export function plansOf(project) {
  if (project?.plans && !ready.has(project)) ready.set(project, plansFrom(project.plans))
  return ready.get(project)
}

/** Loads `project`'s plans, once; a failed load may be tried again. */
export function loadPlans(project) {
  if (project.plans) return Promise.resolve(plansOf(project))
  if (!pending.has(project)) {
    pending.set(project, project.loadPlans().then(
      (data) => {
        const plans = plansFrom(data)
        ready.set(project, plans)
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
