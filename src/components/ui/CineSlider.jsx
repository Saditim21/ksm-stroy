import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../utils/motion'

// Only the caption block moves with captionPosition — the bottom-right slide
// index + progress line stay put regardless (see task-2-brief.md).
const CAPTION_POSITION_CLASS = {
  'bottom-left': 'bottom-8 left-6 max-w-md sm:left-10',
  'top-right': 'top-8 right-6 max-w-md text-right sm:right-10',
}

// Cinematic crossfade slider shared by Home's hero (Task 3) and About (Task 5) —
// interface frozen per task-2-brief.md. Fills its parent; the consumer sets height.
//
// Autoplay advances on a fixed interval and skips ticks while the tab is
// hidden (checked inside the tick, not by tearing the interval down, so it
// resumes on the very next visible tick without drift). Reduced motion drops
// autoplay and Ken Burns entirely — a static first slide plus small prev/next
// buttons keep every slide reachable without relying on animation.
export default function CineSlider({
  slides,
  interval = 6500,
  className = '',
  overlayClassName = '',
  captionPosition = 'bottom-left',
  children,
}) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const n = slides.length

  useEffect(() => {
    if (reduce || n <= 1) return undefined
    const id = setInterval(() => {
      // Nothing to see on a backgrounded tab; the next visible tick catches up.
      if (typeof document !== 'undefined' && document.hidden) return
      setIndex((i) => (i + 1) % n)
    }, interval)
    return () => clearInterval(id)
  }, [reduce, interval, n])

  // Warm the browser's image cache for the slide that's coming up next — with
  // only the active slide mounted, waiting for it to become current before
  // the <img>/motion.img even exists means the 1.2s crossfade animates over
  // a still-downloading (blank) image on real networks. This runs regardless
  // of reduced motion: even without autoplay, the prev/next buttons can jump
  // straight to an unwarmed slide.
  useEffect(() => {
    if (slides.length <= 1) return undefined
    const next = slides[(index + 1) % slides.length]
    const img = new Image()
    if (next.srcSet) img.srcset = next.srcSet
    img.src = next.src
    return undefined
  }, [index, slides])

  const goPrev = () => setIndex((i) => (i - 1 + n) % n)
  const goNext = () => setIndex((i) => (i + 1) % n)

  const slide = slides[index]
  const isEven = index % 2 === 0
  const loading = index === 0 ? 'eager' : 'lazy'

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`.trim()}>
      {reduce ? (
        <img
          src={slide.src}
          srcSet={slide.srcSet}
          sizes={slide.sizes}
          alt={slide.alt}
          loading={loading}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <AnimatePresence>
          <motion.img
            key={index}
            src={slide.src}
            srcSet={slide.srcSet}
            sizes={slide.sizes}
            alt={slide.alt}
            loading={loading}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: isEven ? [1, 1.08] : [1.08, 1] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: EASE },
              scale: { duration: (interval + 1200) / 1000, ease: 'linear' },
            }}
          />
        </AnimatePresence>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute ${CAPTION_POSITION_CLASS[captionPosition]}`}>
          {reduce ? (
            slide.caption && (
              <div>
                <p className="text-plaster font-display text-lg">{slide.caption}</p>
                {slide.sub && <p className="text-plaster/60 text-sm">{slide.sub}</p>}
              </div>
            )
          ) : (
            <AnimatePresence>
              {slide.caption && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: EASE }}
                >
                  <p className="text-plaster font-display text-lg">{slide.caption}</p>
                  {slide.sub && <p className="text-plaster/60 text-sm">{slide.sub}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="absolute bottom-8 right-6 flex flex-col items-end gap-2 sm:right-10">
          {reduce ? (
            <div className="h-px w-24 origin-left bg-gold-accent" />
          ) : (
            <motion.div
              key={index}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: interval / 1000, ease: 'linear' }}
              className="h-px w-24 origin-left bg-gold-accent"
            />
          )}
          <p className="text-plaster/70 text-xs tracking-eyebrow">
            0{index + 1} — 0{n}
          </p>
        </div>
      </div>

      {children && (
        <div className={`absolute inset-0 ${overlayClassName}`.trim()}>{children}</div>
      )}

      {reduce && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
          <button
            type="button"
            aria-label="Предишен слайд"
            onClick={goPrev}
            className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center bg-ink/40 text-plaster transition-colors duration-300 ease-luxe hover:bg-ink/60"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Следващ слайд"
            onClick={goNext}
            className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center bg-ink/40 text-plaster transition-colors duration-300 ease-luxe hover:bg-ink/60"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
