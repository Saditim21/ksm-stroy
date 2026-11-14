import Button from '../components/ui/Button'
import { robotsMeta } from '../seo/meta'

// Any URL no other route matches (spec §8.1). Prerendered as /404;
// scripts/postbuild.mjs copies it to build/client/404.html, which the host
// serves, with a 404 status, for any URL that has no page of its own.
//
// Its head is noindex in every build, production included, with no canonical
// link and no og:url: /404 itself answers 200, and the same HTML answers every
// unknown URL, so there is no page here to index or to point at.
export const meta = () => [
  { title: 'Страницата не е намерена - KSM Stroy' },
  robotsMeta(false),
  { name: 'description', content: 'Тази страница я няма в чертежа.' },
]

export const handle = { header: 'solid' }

const WAYS_BACK = [
  { label: 'Начало', to: '/' },
  { label: 'Продажби', to: '/projects' },
  { label: 'Контакти', to: '/contact' },
]

export default function NotFound() {
  return (
    <section className="site-wrap font-text py-[clamp(72px,10vw,160px)]">
      {/* Two lines, so no line ends on „в“; the heading's name stays one
          sentence, which the tests look it up by. */}
      <h1 className="font-display text-h2 font-medium text-ivory">
        <span className="block">Тази страница</span> <span className="block">я няма в чертежа.</span>
      </h1>
      <p className="mt-6 max-w-[60ch] text-body text-stone">
        Проверете адреса или започнете от някоя от страниците по-долу.
      </p>
      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2">
        {WAYS_BACK.map(({ label, to }) => (
          <li key={to}>
            <Button to={to} variant="link">
              {label}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
