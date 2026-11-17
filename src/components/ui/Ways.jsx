import { Link } from 'react-router'
import Seam from './Seam'
import './ways.css'

// The closing pair of ways (M3/M4 spec §4.4; Diptych spec §6.11, extract
// §4.13), Home's teaser's, which Контакти, Обекти and Продажби close with
// too: a <nav> named `label`, a half each on the seam, the first against it.
// Each of `ways` is { title, sub, to?, href?, onClick? }: its title in the
// serif over its line, `sub`, and where it goes, a page of the site (`to`, a
// router Link that prefetches on intent), any other address (`href`), or,
// with neither, what its `onClick` does, as a button. A link runs its
// onClick too. The look is ways.css's, on the routes that show the ways.
export default function Ways({ label, ways }) {
  return (
    <nav className="ways" aria-label={label}>
      <Seam />
      {ways.map(({ title, sub, to, href, onClick }, index) => {
        const words = (
          <>
            <span className="serif">{title}</span> <span className="small">{sub}</span>
          </>
        )
        if (to !== undefined) {
          return (
            <Link key={index} to={to} prefetch="intent" onClick={onClick}>
              {words}
            </Link>
          )
        }
        if (href !== undefined) {
          return (
            <a key={index} href={href} onClick={onClick}>
              {words}
            </a>
          )
        }
        return (
          <button key={index} type="button" onClick={onClick}>
            {words}
          </button>
        )
      })}
    </nav>
  )
}
