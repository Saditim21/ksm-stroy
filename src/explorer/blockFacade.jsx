import FacadeLights from './FacadeLights'

// A block page's facade (spec M3 §6.3, §6.5; rulings PF8, PF9; the concept's
// js/mnogofamilna.js:269-282, :391-430, its 'block' mode): the facade of one
// block, beside the page's rows of that block's floors. The page renders the
// facade (Facade.jsx) in block mode, which has no edge panel and no sheet,
// the rows being its floors' panels, with the page's own hot floor
// (`hotState`), so a row and its floor on the facade light as one
// (MnBlockPage.jsx).
//
// What makes it one block's is the project this gives it, the building's
// with its facade narrowed to the block:
// - its building map with that block's floors alone, so the facade draws one
//   block's floors and one rail, and its lens, its keys and its intro know no
//   other;
// - its lights given the block, so only that block's lit floors are in the
//   page (ruling PF9);
// - its class, fx--block, which the block's crop on a desktop hangs on, the
//   phone's being the building's crop of the block (the page's stylesheet,
//   mn-block.css, and mn-facade.css);
// - its picture's `sizes`, the page's: its crop shows the picture at twice
//   the stage's width.
// The building's seam, its blocks' names and the phone's block switch, which
// the facade draws for a whole building, the page's stylesheet leaves out.
// Only a block page imports this, so none of it is in another route's
// first-load JS (ruling PF8).

/** `project` with its facade narrowed to `block` (above); `sizes`, the
 * block's picture's. A new object each call: its caller keeps it. */
export function blockFacade(project, block, sizes) {
  const { facade } = project
  const Lights = (props) => <FacadeLights {...props} block={block} />
  return {
    ...project,
    facade: {
      ...facade,
      map: { ...facade.map, shapes: facade.map.shapes.filter((shape) => shape.type !== 'floor' || shape.block === block) },
      className: `${facade.className} fx--block`,
      sizes,
      Lights,
    },
  }
}
