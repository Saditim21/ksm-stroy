import { Fragment } from 'react'

// A hero heading authored as lines (plan Task 7, spec §5.2.2 and §5.4). The
// page's load moment is CSS only: each line rises once out of its mask, 60 ms
// after the one above it, from the first paint. tailwind.config.js holds the
// `hero-rise` keyframes; the `js:` variant runs them only once the motion gate
// has marked <html> (src/utils/motionGate.js: motion allowed, no Save-Data;
// Diptych spec §5.2). There is no JS of its own, so nothing replays when
// hydration lands, and the markup is the final state.
//
// A space between the lines keeps them two words apart in the heading's text
// and accessible name; between two blocks it takes no room. Each mask reaches
// 0.05em below its line, and gives that back with a negative margin, so the
// lines keep their spacing and no descender (р, у, щ, the Bulgarian з) is
// clipped. No more than that: on the first frame the line sits 105% of its
// height lower, and a deeper mask would show the tops of its tallest letters.
//
// `hero-title` (index.css) gives it the display role, KSM Display at the display
// size; a size class in `className` overrides it.
export default function HeroTitle({ as = 'h1', lines, className = '' }) {
  const Tag = as === 'h2' ? 'h2' : 'h1'
  return (
    <Tag className={`hero-title ${className}`.trim()}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className="-mb-[0.05em] block overflow-hidden pb-[0.05em]">
            <span className="block js:animate-hero-rise" style={{ '--i': i }}>
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
