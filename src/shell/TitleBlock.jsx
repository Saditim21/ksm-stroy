import { SITE } from '../config/site'

// The one title block (щампа, spec §3.3) at the bottom right of the footer:
// a ruled box, as on a drawing, with the company, the object on a project's
// pages, and the year. One honest detail, not a ruled footer.
//
// The rules are on umber, so ivory at 40% (§3.1 gives 16% for hairlines; the
// box's edge is the detail itself and must read). Each cell draws its right
// and bottom rule and the box its top and left, so the box stays closed when
// its cells stack on a phone.
export default function TitleBlock({ object }) {
  const cells = [SITE.legalName, object ? `Обект: ${object}` : null, '2026'].filter(Boolean)
  return (
    <div className="grid w-max max-w-full border-l border-t border-ivory/40 font-text text-label sm:grid-flow-col">
      {cells.map((cell) => (
        <p key={cell} className="nums border-b border-r border-ivory/40 px-3.5 py-2 font-medium">
          {cell}
        </p>
      ))}
    </div>
  )
}
