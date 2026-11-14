// The emblem's stroke, shared by Emblem and Logo. It sits on the <svg> element
// as presentation attributes so a CSS rule on the className (the header sets
// stroke-width: 3.45) overrides it. In a module of its own: a component module
// that also exports an object breaks Fast Refresh
// (react-refresh/only-export-components).
export const STROKE_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}
