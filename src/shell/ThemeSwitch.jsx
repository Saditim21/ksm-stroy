import { useEffect, useRef, useSyncExternalStore } from 'react'
import { applyTheme, onTheme, readTheme, syncBar } from '../utils/theme'

// The theme switch (polish spec §5): in the header before „Меню“ (variant
// 'bar') and in the menu ('menu'). It names the theme it switches to,
// „Светла тема“ on the dark site and „Тъмна тема“ on the light one; the bar
// shows only its disc below 1280 px (src/styles/shell.css), the name staying
// its accessible name.
//
// The prerender knows no visitor, so it renders the dark site's switch, and
// so does the first client render, which hydrates that HTML
// (useSyncExternalStore's server snapshot); then it follows the page, which
// the head script may already have made light (src/utils/theme.js). Every
// switch on the page follows every other through the `ksm-theme` event.
//
// The change: inside a circle that grows from the switch, where the browser
// has the View Transitions API and the visitor allows motion; at once
// otherwise. The page's own view-transition names and the doors' rules stand
// aside for it (:root.theme-vt, src/styles/motion.css).

const LABEL = { dark: 'Светла тема', light: 'Тъмна тема' }
const serverTheme = () => 'dark'

function switchTheme(next, button) {
  const root = document.documentElement
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
  if (typeof document.startViewTransition !== 'function' || reduce || !button) {
    applyTheme(next)
    return
  }
  const r = button.getBoundingClientRect()
  const x = r.left + r.width / 2
  const y = r.top + r.height / 2
  const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.classList.add('theme-vt')
  const transition = document.startViewTransition(() => applyTheme(next))
  transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  }).catch(() => {})
  transition.finished.finally(() => root.classList.remove('theme-vt')).catch(() => {})
}

export default function ThemeSwitch({ variant = 'bar' }) {
  const theme = useSyncExternalStore(onTheme, readTheme, serverTheme)
  const button = useRef(null)

  // Once hydrated, the browser bar takes the page's theme.
  useEffect(() => {
    syncBar()
  }, [])

  const label = LABEL[theme]
  return (
    <button
      ref={button}
      type="button"
      className={variant === 'menu' ? 'theme theme--menu' : 'theme'}
      aria-label={label}
      onClick={() => switchTheme(theme === 'light' ? 'dark' : 'light', button.current)}
    >
      <i className="theme__disc" aria-hidden="true" />
      <span className="theme__label" aria-hidden="true">{label}</span>
    </button>
  )
}
