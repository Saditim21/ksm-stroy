// The inline scripts root.jsx puts in <head>. The browser runs each one while
// it parses the HTML, before first paint and before any module has loaded, so
// they are plain ES5 text with no imports. They come after the meta tags (the
// server render puts every meta and title of the head ahead of them anyway),
// SCREEN_HEIGHT_SCRIPT first, then MOTION_GATE_SCRIPT.
//
// They write into <head>, never onto <body>, which React hydrates (spec §6.3).
// The motion gate's class (`js`, and `intro`) is the one attribute a script
// writes on <html> (Diptych spec §5.2, amending §6.3): root.jsx renders <html>
// with no className and with suppressHydrationWarning, so hydration leaves the
// class alone. React 19 skips extra nodes in <head>, except one that looks
// like the next element it expects, so an element a script adds goes in
// before the script itself (see SCREEN_HEIGHT_SCRIPT).
export { SCREEN_HEIGHT_SCRIPT } from './screenHeight'
export { MOTION_GATE_SCRIPT } from './motionGate'
