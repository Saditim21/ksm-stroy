import { Link } from 'react-router'

// The site's actions (plan Task 7). A router Link for `to`, a plain anchor for
// `href` (tel:, mailto:, a PDF), a <button> otherwise.
//
// Spec §3.4: the 2 px ui radius; a 44 px touch target. Primary is ink on paper
// and paper on dusk; secondary is a 1 px border in the text colour; quiet is
// text with the link underline (gold-ink on paper, paper on dusk: no gold on
// dusk, §3.1). Hover and press change colour only, within 200 ms (§5.2.6).
//
// `arrow` draws the → that only the two or three primary actions of a page
// carry (§3.3), nudged on hover. It is drawn, not typed, and hidden from
// assistive technology, so the action's name is its text alone.
const BASE = 'group inline-flex min-h-[44px] items-center justify-center gap-3 rounded-ui font-text text-small font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS = {
  primary: {
    paper: 'bg-ink px-6 py-2.5 text-paper hover:bg-ink/85',
    dusk: 'bg-paper px-6 py-2.5 text-ink hover:bg-paper/85',
  },
  secondary: {
    paper: 'border border-current px-6 py-2.5 text-ink hover:bg-ink/5',
    dusk: 'border border-current px-6 py-2.5 text-paper hover:bg-paper/10',
  },
  quiet: {
    paper: 'px-1 text-ink underline decoration-gold-ink decoration-1 underline-offset-[6px] hover:decoration-2',
    dusk: 'px-1 text-paper underline decoration-paper/60 decoration-1 underline-offset-[6px] hover:decoration-paper',
  },
}

// The focus ring src/index.css draws, in the colour of the ground `tone`
// names (decision of 2026-11-14): ink on paper, paper on dusk, never the
// label's colour, which a filled primary button sets to the ground's own.
// Set here too, so a button over a dark picture with no .on-dusk around it
// still shows its ring. Under forced colours, the system's Highlight.
const RING = {
  paper: 'focus-visible:outline-ink',
  dusk: 'focus-visible:outline-paper',
}
const FORCED_RING = 'forced-colors:focus-visible:outline-[color:Highlight]'

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 18 10"
      width="18"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200 ease-power3-out group-hover:translate-x-1 group-focus-visible:translate-x-1"
    >
      <path d="M1 5h15.5M12.5 1l4 4-4 4" />
    </svg>
  )
}

export default function Button({
  to,
  href,
  type = 'button',
  variant = 'primary',
  tone = 'paper',
  arrow = false,
  className = '',
  children,
  ...rest
}) {
  const look = VARIANTS[variant]?.[tone] ?? VARIANTS.primary.paper
  const ring = `${RING[tone] ?? RING.paper} ${FORCED_RING}`
  const classes = `${BASE} ${look} ${ring} ${className}`.trim()
  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  )
  if (to !== undefined) return <Link to={to} className={classes} {...rest}>{content}</Link>
  if (href !== undefined) return <a href={href} className={classes} {...rest}>{content}</a>
  return <button type={type} className={classes} {...rest}>{content}</button>
}
