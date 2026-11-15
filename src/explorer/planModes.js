// The plan renderer's modes (spec §7.4; extract §4.22), for PlanSvg.jsx: per
// mode, the viewBox's padding, the pattern's size, the label and the line on
// screen, and whether the drawing lies under the units.
export const PLAN_MODES = {
  mini: { pad: 4, pat: 16, labelPx: 10, lineW: 1, drawing: false },
  stage: { pad: 14, pat: 8, labelPx: 12.5, lineW: 1, drawing: true },
  crop: { pad: 14, pat: 5, labelPx: 13, lineW: 1.2, drawing: true },
}

/** Writes the sizes a plan keeps on screen (spec §7.4) for `scale`, its px
 * per unit of its viewBox: --fs, --hs, --lw and --dash, in the plan's own
 * units, for its mode's label and line, a halo of 3 px and a dash of 4/3 px.
 * PlanSvg's fit() writes them for the scale it measures; the morph's ghost
 * is written for the scale it lands at (PlanStage.jsx). */
export function sizePlan(svg, scale, mode = 'mini') {
  const { labelPx, lineW } = PLAN_MODES[mode] ?? PLAN_MODES.mini
  svg.style.setProperty('--fs', `${labelPx / scale}px`)
  svg.style.setProperty('--hs', `${3 / scale}px`)
  svg.style.setProperty('--lw', `${lineW / scale}px`)
  svg.style.setProperty('--dash', `${4 / scale} ${3 / scale}`)
}
