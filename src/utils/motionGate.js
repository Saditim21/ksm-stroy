// The motion gate (spec §5.2): an inline script in <head>, right after
// SCREEN_HEIGHT_SCRIPT (src/root.jsx), that marks <html> before first paint.
//
// - `js`: motion may run. The browser can be asked about motion preferences
//   (matchMedia exists), the visitor has not asked for reduced motion, and
//   the connection is not in data-saver mode (navigator.connection.saveData,
//   Chromium). The same three things useMotionAllowed() asks, so CSS motion
//   (`:root.js`, Tailwind's `js:` variant) and JS motion agree from the
//   first frame.
// - `intro`: with `js`, on the first load of Home (`/`) in this session.
//   The session flag `ksm-intro` is set at once, so no later load in the
//   session plays the intro; where sessionStorage cannot keep it (blocked
//   storage throws), the intro never plays rather than on every load. The
//   class stays for the document's life; src/styles/motion.css keeps the
//   intro to the first page the app renders.
//
// This class is the one attribute a script writes on <html>. root.jsx renders
// <html> with no className and with suppressHydrationWarning, so hydration
// neither complains about it nor removes it.
//
// Plain ES5 in one try block: it runs while the HTML is parsed, before any
// module, in every browser that loads the page, and an error in it must never
// stop the page.
const INTRO_FLAG = 'ksm-intro'

export const MOTION_GATE_SCRIPT = `(function(){try{var w=window,d=document.documentElement,c=navigator.connection;if(typeof w.matchMedia!=='function'||w.matchMedia('(prefers-reduced-motion: reduce)').matches||(c&&c.saveData===true))return;d.classList.add('js');if(location.pathname!=='/')return;var s=w.sessionStorage;if(s.getItem('${INTRO_FLAG}'))return;s.setItem('${INTRO_FLAG}','1');d.classList.add('intro')}catch(e){}})()`
