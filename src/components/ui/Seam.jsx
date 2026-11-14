// The seam (spec §4, §6.6): 1 px of brass down the middle of the section it
// sits in, which positions it (src/styles/diptych.css: .seam, and .split and
// .hinge around it). Decoration, so hidden from assistive technology.
//
// `draw` marks it for useReveals (src/motion/useReveals.js), which draws it
// down from the top, once, when its section reaches 82 % of the viewport. The
// markup is the drawn seam: without motion it simply stands there.
export default function Seam({ draw = false, className }) {
  return (
    <span
      className={className ? `seam ${className}` : 'seam'}
      aria-hidden="true"
      data-draw={draw ? '' : undefined}
    />
  )
}
