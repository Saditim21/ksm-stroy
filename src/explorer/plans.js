// A project's plans, by block letter (spec §7.4; M3 §6.4): what the edge
// panels, the sheet, the plan stage and the unit panel draw. Each block's is
// the entry of the project's floors map that applies to it (one typical floor
// serves all its floors, spec §9; Многофамилна's serves both blocks), with
// `drawing`, the address of the dark drawing under it in the stage and the
// unit panel (its widest WebP), or null where the project has none.
//
// The project hands them over as data (project.plans) or as a chunk of its
// own (project.loadPlans()), so a project's plans load only on its pages
// (ruling PF3). Only the surfaces' chunk imports this module (surfaces.js),
// and loadSurfaces.js loads a project's plans before it hands the surfaces
// over, so plansOf() has them by the time a surface draws.
import { planFor } from './planGeometry'

const ready = new WeakMap()
const pending = new WeakMap()

const drawingOf = (image) => (image ? `${image.path}-${image.widths[image.widths.length - 1]}.webp` : null)

/** `project`'s plans once they have loaded (loadPlans), else undefined:
 * { 'А': plan, 'Б': plan }, each plan a floors map's entry with its
 * `drawing`. */
export const plansOf = (project) => ready.get(project)

/** Loads `project`'s plans, once; a failed load may be tried again. */
export function loadPlans(project) {
  if (!pending.has(project)) {
    pending.set(project, Promise.resolve(project.plans ?? project.loadPlans()).then(
      ({ floors, drawings }) => {
        const plans = Object.freeze(Object.fromEntries(['А', 'Б'].map((block) => [
          block,
          Object.freeze({ ...planFor(floors, block), drawing: drawingOf(drawings?.[block]) }),
        ])))
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
