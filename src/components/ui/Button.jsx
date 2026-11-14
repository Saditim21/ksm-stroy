import { Link } from 'react-router'

// The site's actions (spec §6.1). A router Link for `to`, a plain anchor for
// `href` (tel:, mailto:, a PDF), a <button> otherwise. The look is
// src/styles/diptych.css's:
// - outline (the default): a 1 px brass border and an ivory label, 52 px tall;
//   on hover the border turns brass-l over a faint brass ground;
// - solid: an ivory fill with an onyx label, white on hover;
// - link: text over a 1 px brass underline, brass-l and white on hover.
// `size="sm"` is the 40 px action (the header's „Запитване“). An unknown
// variant or size is the outline action of the normal size.
//
// The colours and the focus ring come from the ground (src/index.css): there
// is no tone to pass. data-variant and data-size name what was drawn.
//
// `arrow` draws the arrow that moves 4 px on hover. It is drawn, not typed,
// and hidden from assistive technology, so the action's name is its text.
const VARIANTS = { outline: 'btn', solid: 'btn btn--solid', link: 'link' }
const SIZES = { md: '', sm: 'btn--sm' }

const known = (table, key, fallback) => (Object.prototype.hasOwnProperty.call(table, key) ? key : fallback)

function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 18 10" width="18" height="10" aria-hidden="true" focusable="false">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export default function Button({
  to,
  href,
  type = 'button',
  variant = 'outline',
  size = 'md',
  arrow = false,
  className,
  children,
  ...rest
}) {
  const look = known(VARIANTS, variant, 'outline')
  const scale = known(SIZES, size, 'md')
  // A link has no box, so no size of its own.
  const classes = [VARIANTS[look], look === 'link' ? '' : SIZES[scale], className].filter(Boolean).join(' ')
  const props = { className: classes, 'data-variant': look, 'data-size': scale, ...rest }
  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  )
  if (to !== undefined) return <Link to={to} {...props}>{content}</Link>
  if (href !== undefined) return <a href={href} {...props}>{content}</a>
  return <button type={type} {...props}>{content}</button>
}
