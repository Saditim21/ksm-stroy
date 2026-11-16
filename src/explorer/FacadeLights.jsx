import ResponsivePicture from '../components/ui/ResponsivePicture'
import { facadeOf } from './geometry'
import './mn-facade.css'

// Многофамилна's lights (spec M3 §6.3; the concept's mnogofamilna.js:283-303,
// :636-665): over the night render with every window dark (the facade's
// picture), the lit render shows through the band of every floor with at
// least one free apartment, in both blocks, as the model has it: a stack of
// per-floor strips, each holding the lit render where the whole one lies
// (mn-facade.css), so the building itself says what is left. The browser
// picks the render from its srcset and sizes, the facade's, with the page;
// nothing here reads the screen. Before the data, nothing is lit.
//
// `project` is Многофамилна's (projects/mn.js): its facade's floors (the
// bands, on its building map), its lit render and its bands. `block`, on a
// block page, lights that block's floors alone (ruling PF9).
//
// The floors switch on once, bottom to top, both blocks of a floor together:
// each strip carries its step, --i, the index of its floor among the floors
// lit, which the entrance staggers (mn-facade.css, under the motion gate).
// Without motion they are simply lit. Decoration only, hidden from
// assistive technology: the rails and the panels say the same.
//
// Each strip is data-lit by its floor's key („Б-9“).
export default function FacadeLights({ model, project, block = null }) {
  const { map, lit, sizes, bands } = project.facade
  const floors = facadeOf(map).shapes.filter((shape) => (!block || shape.block === block) && model?.floors.get(shape.key)?.counts.available > 0)
  const steps = [...new Set(floors.map((shape) => shape.floor))].sort((a, b) => a - b)
  return (
    <div className="fx__lights" aria-hidden="true">
      {floors.map(({ key, block: letter, floor, bbox }) => {
        const [left, right] = bands[letter]
        return (
          <div
            key={key}
            className="fx__lit"
            data-lit={key}
            style={{ '--x': left, '--y': bbox.y, '--w': right - left, '--h': bbox.h, '--i': steps.indexOf(floor) }}
          >
            <ResponsivePicture image={lit} alt="" sizes={sizes} eager />
          </div>
        )
      })}
    </div>
  )
}
