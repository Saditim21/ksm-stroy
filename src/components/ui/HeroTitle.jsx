import { Fragment } from 'react'

// A hero heading authored as lines (plan Task 7, spec §5.2.2 and §5.4). The
// page's load moment is CSS only: each line rises once out of its mask, 60 ms
// after the one above it, from the first paint. tailwind.config.js holds the
// `hero-rise` keyframes; the `motion-safe:` variant runs them only under
// prefers-reduced-motion: no-preference. There is no JS, so nothing replays
// when hydration lands, and the markup is the final state.
//
// A space between the lines keeps them two words apart in the heading's text
// and accessible name; between two blocks it takes no room. Each mask reaches
// 0.05em below its line, and gives that back with a negative margin, so the
// lines keep their spacing and no descender (р, у, щ, the Bulgarian з) is
// clipped. No more than that: on the first frame the line sits 105% of its
// height lower, and a deeper mask would show the tops of its tallest letters.
export default function HeroTitle({ as = 'h1', lines, className = '' }) {
  const Tag = as === 'h2' ? 'h2' : 'h1'
  return (
    <Tag className={`font-display text-display font-[420] ${className}`}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className="-mb-[0.05em] block overflow-hidden pb-[0.05em]">
            <span className="block motion-safe:animate-hero-rise" style={{ '--i': i }}>
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
