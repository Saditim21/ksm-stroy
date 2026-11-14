import { pageMeta } from '../seo/meta'

// Any URL no other route matches. Prerendered as /404 for the host to serve.
export const meta = () => pageMeta({
  title: 'Страницата не е намерена - KSM Stroy',
  description: 'Тази страница я няма в чертежа.',
  path: '/404',
})

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 text-center">Тази страница я няма в чертежа.</h1>
    </section>
  )
}
