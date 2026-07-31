import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import Reveal from '../components/ui/Reveal'
import { seoData } from '../utils/seo'
import { blogPosts } from '../data/blogData'
import { EASE } from '../utils/motion'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })

// Full-post detail overlay — the editorial-list equivalent of the old page's
// image-gallery modal: same read-more/keyboard-nav/backdrop-close behavior,
// restyled and rewired onto blogData.js posts instead of project photos.
function PostModal({ post, onClose, onPrev, onNext }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
        <motion.article
          className="relative bg-plaster rounded-2xl max-w-3xl w-full my-8 overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Затвори"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink/80 text-plaster hover:bg-ink transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img src={post.image} alt={post.title} className="w-full aspect-[16/9] object-cover" />

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-eyebrow text-graphite">
              <span>{formatDate(post.date)}</span>
              <span aria-hidden="true">·</span>
              <span>{post.author}</span>
              <span aria-hidden="true">·</span>
              <span>{post.readTime} четене</span>
            </div>

            <DisplayHeading as="h2" size="sub" className="mt-4">{post.title}</DisplayHeading>

            <p className="text-graphite leading-relaxed mt-6">{post.content}</p>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-concrete">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-graphite">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-concrete px-6 sm:px-10 py-4">
            <button
              onClick={onPrev}
              className="text-sm font-semibold text-ink hover:text-gold-deep transition-colors"
            >
              ← Предишна
            </button>
            <button
              onClick={onNext}
              className="text-sm font-semibold text-ink hover:text-gold-deep transition-colors"
            >
              Следваща →
            </button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  )
}

const Blog = () => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const openPost = (index) => setSelectedIndex(index)
  const closePost = () => setSelectedIndex(null)
  const prevPost = () =>
    setSelectedIndex((current) => (current === 0 ? blogPosts.length - 1 : current - 1))
  const nextPost = () =>
    setSelectedIndex((current) => (current === blogPosts.length - 1 ? 0 : current + 1))

  return (
    <>
      <SEO
        title={seoData.blog.title}
        description={seoData.blog.description}
        keywords={seoData.blog.keywords}
        ogTitle={seoData.blog.ogTitle}
        ogImage={seoData.blog.ogImage}
      />

      <main className="bg-plaster pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DimensionLine label="Блог" />
          <DisplayHeading as="h1">Новини от <em>обекта</em>.</DisplayHeading>

          <div className="mt-12 divide-y divide-concrete border-t border-concrete">
            {blogPosts.map((post, index) => (
              <Reveal key={post.id} delay={Math.min(index, 6) * 0.05}>
                <article
                  role="button"
                  tabIndex={0}
                  onClick={() => openPost(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openPost(index)
                    }
                  }}
                  className="py-8 grid md:grid-cols-4 gap-6 items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-accent"
                >
                  <div className="text-graphite text-sm">{formatDate(post.date)}</div>

                  <div className="md:col-span-2">
                    <h2 className="font-display text-2xl hover:text-gold-deep transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-graphite mt-2 leading-relaxed">{post.excerpt}</p>
                  </div>

                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="rounded-xl aspect-[4/3] object-cover w-full"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedIndex !== null && (
          <PostModal
            post={blogPosts[selectedIndex]}
            onClose={closePost}
            onPrev={prevPost}
            onNext={nextPost}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Blog
