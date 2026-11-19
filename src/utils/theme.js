// The site's two themes (polish spec §5): dark, the default, and light, the
// visitor's choice, kept in localStorage under `ksm-theme` and written on
// <html> as data-theme="light". src/index.css holds the light values.
//
// - THEME_SCRIPT runs in <head> while the HTML is parsed (src/root.jsx, after
//   the motion gate), so a visitor who chose light never sees the dark page
//   first. Plain ES5 in one try block, as the other head scripts are: it
//   writes the attribute only, never the theme-color meta, which React owns
//   until it has hydrated; ThemeSwitch puts that right once it mounts.
// - applyTheme() is the switch's: the attribute, the stored choice, the
//   browser bar's colour, and a `ksm-theme` event for every switch on the
//   page (the header's and the menu's).

export const THEME_KEY = 'ksm-theme'

// The browser bar's colour for each theme: onyx, as public/site.webmanifest
// has it, and the light onyx.
export const BAR_COLOUR = { dark: '#0E0D0B', light: '#ECE6DA' }

export const THEME_SCRIPT = `(function(){try{if(window.localStorage.getItem('${THEME_KEY}')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}})()`

/** The theme on the page now: 'light' or 'dark'. */
export function readTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

/** Sets the browser bar to `theme`'s colour. */
export function syncBar(theme = readTheme()) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOUR[theme])
}

/** Puts `theme` ('light' or 'dark') on the page, remembers it, and tells the switches. */
export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
  try {
    window.localStorage.setItem(THEME_KEY, theme === 'light' ? 'light' : 'dark')
  } catch {
    // Storage blocked: the theme holds for this page only.
  }
  syncBar(theme)
  window.dispatchEvent(new Event('ksm-theme'))
}

/** Calls `listener` on every theme change; returns the unsubscribe. */
export function onTheme(listener) {
  window.addEventListener('ksm-theme', listener)
  return () => window.removeEventListener('ksm-theme', listener)
}
