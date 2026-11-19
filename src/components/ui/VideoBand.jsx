import { useEffect, useRef, useState } from 'react'
import useMotionAllowed from '../../hooks/useMotionAllowed'
import { MD_UP } from '../../utils/motion'
import ResponsivePicture from './ResponsivePicture'

// A looping film band over its poster (plan Task 7, spec §5.4), ported from
// golden-residence src/components/film/VideoBand.jsx @944bb03.
//
// `sources` is { desktop, mobile }, each { av1, h264 }; `poster` is
// { desktop, mobile }, each a manifest image. The browser picks each crop with
// <source media> (md and up is desktop), never JS. The poster is always
// rendered, sized by its crop, and is the LCP candidate; `priority` fetches it
// first. A caller that sizes the band (className) gets the poster covering it.
//
// The film is the poster's guest. It attaches only after the window's `load`,
// then the poster's decode(), then an idle period, and only within one
// viewport of the screen; it starts transparent and fades in on its first
// frame. It plays while on screen and pauses off it. Only after its first
// `playing` does the pause control appear („Пауза“, then „Пусни“; WCAG 2.2.2),
// and a visitor's pause holds until they press play. A refused play() (iOS Low
// Power Mode) or a file that cannot play removes the film: the poster stays and
// no control appears. Without motion (reduced motion, data saver, the
// prerender) the band is its poster alone.

// AV1 Main profile (0), level 4.0 (08), Main tier (M), 8-bit (08): enough for
// 1920×760 at 30 fps.
const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"'

// Resolves once the window has fired `load`, at once if it already has.
function windowLoaded() {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
}

// Safari has no requestIdleCallback: it gets the next macrotask instead.
function browserIdle() {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(() => resolve())
    else setTimeout(resolve, 1)
  })
}

function PauseIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" />
      <rect x="9.5" y="2.5" width="3" height="11" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M4.5 2.5v11l9-5.5z" />
    </svg>
  )
}

export default function VideoBand({ sources, poster, alt, priority = false, className = '' }) {
  const motionOk = useMotionAllowed()
  const bandRef = useRef(null)
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false) // load, then the poster decoded, then idle
  const [near, setNear] = useState(false) // has come within one viewport
  const [visible, setVisible] = useState(false)
  const [started, setStarted] = useState(false) // the first `playing`
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(false) // the visitor's pause

  useEffect(() => {
    if (!motionOk) return undefined
    let live = true
    const posterImg = bandRef.current.querySelector('img')
    windowLoaded()
      .then(() => {
        if (!live || !posterImg.decode) return undefined
        // A poster that fails to decode does not hold the film back.
        return posterImg.decode().catch(() => {})
      })
      .then(() => live && browserIdle())
      .then(() => {
        if (live) setReady(true)
      })
    return () => {
      live = false
    }
  }, [motionOk])

  useEffect(() => {
    if (!motionOk || typeof IntersectionObserver === 'undefined') return undefined
    const band = bandRef.current
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true)
    }, { rootMargin: '100% 0px' })
    const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    nearby.observe(band)
    onScreen.observe(band)
    return () => {
      nearby.disconnect()
      onScreen.disconnect()
    }
  }, [motionOk])

  const showFilm = motionOk && ready && near && !failed
  const wanted = visible && !paused

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (wanted) {
      const attempt = video.play()
      attempt?.catch?.((error) => {
        // An AbortError is play() cut short by pause(), not a refusal.
        if (error?.name !== 'AbortError') setFailed(true)
      })
    } else {
      video.pause()
    }
  }, [showFilm, wanted])

  return (
    <div ref={bandRef} className={`dark relative overflow-hidden ${className}`.trim()}>
      <ResponsivePicture
        image={poster.mobile}
        art={{ media: MD_UP, image: poster.desktop }}
        alt={alt}
        sizes="100vw"
        priority={priority}
        className="h-full w-full"
        imgClassName="h-full w-full object-cover"
      />
      {showFilm ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          playsInline
          loop
          preload="none"
          onPlaying={() => setStarted(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${started ? 'opacity-100' : 'opacity-0'}`}
        >
          <source media={MD_UP} src={sources.desktop.av1} type={AV1_TYPE} />
          <source media={MD_UP} src={sources.desktop.h264} type="video/mp4" />
          <source src={sources.mobile.av1} type={AV1_TYPE} />
          <source src={sources.mobile.h264} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      ) : null}
      {showFilm && started ? (
        <button
          type="button"
          aria-label={paused ? 'Пусни' : 'Пауза'}
          onClick={() => setPaused((was) => !was)}
          className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-ui bg-[color-mix(in_srgb,var(--onyx)_85%,transparent)] text-ivory transition-colors duration-200 hover:bg-onyx"
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      ) : null}
    </div>
  )
}
