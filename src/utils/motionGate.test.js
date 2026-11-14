import { MOTION_GATE_SCRIPT } from './motionGate'
import { mockMatchMedia } from '../test/media'

// The motion gate (spec §5.2): an inline script in <head> marks <html> with
// `js` where motion may run, before first paint, and `intro` on the first
// Home load of the session. CSS motion keys off those classes.

const connection = Object.getOwnPropertyDescriptor(navigator, 'connection')
let restoreMedia

afterEach(() => {
  restoreMedia?.()
  restoreMedia = undefined
  if (connection) Object.defineProperty(navigator, 'connection', connection)
  else delete navigator.connection
  vi.restoreAllMocks()
  sessionStorage.clear()
  document.documentElement.removeAttribute('class')
  window.history.replaceState(null, '', '/')
})

// Sets up a browser as given, runs the script the way the parser does, and
// returns the classes it left on <html>.
function run({ path = '/about', reduce = false, saveData = false, matchMedia = true, storageThrows = false } = {}) {
  restoreMedia?.()
  restoreMedia = matchMedia ? mockMatchMedia({ reduce }) : undefined
  if (!matchMedia) delete window.matchMedia
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData } })
  window.history.replaceState(null, '', path)
  if (storageThrows) {
    const denied = () => { throw new DOMException('The operation is insecure.', 'SecurityError') }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied)
  }
  document.documentElement.removeAttribute('class')
  new Function(MOTION_GATE_SCRIPT)()
  return document.documentElement.className
}

it('marks motion as allowed', () => expect(run({ path: '/about' })).toBe('js'))

it('stays off under reduced motion, with Save-Data, or without matchMedia', () => {
  expect(run({ reduce: true })).toBe('')
  expect(run({ saveData: true })).toBe('')
  expect(run({ matchMedia: false })).toBe('')
})

it('plays the intro on the first Home load of the session only', () => {
  expect(run({ path: '/' })).toBe('js intro')
  expect(sessionStorage.getItem('ksm-intro')).toBe('1')
  expect(run({ path: '/' })).toBe('js')
  sessionStorage.clear()
  expect(run({ path: '/about' })).toBe('js')
  expect(sessionStorage.getItem('ksm-intro')).toBeNull()
})

// Safari with storage blocked: no flag could be kept, so the intro would
// play on every Home load. It never plays instead.
it('survives a sessionStorage that throws', () => expect(run({ path: '/', storageThrows: true })).toBe('js'))

// Without motion there is no intro, and the session keeps it for a load with
// motion.
it('keeps the intro for a load with motion', () => {
  expect(run({ path: '/', reduce: true })).toBe('')
  expect(sessionStorage.getItem('ksm-intro')).toBeNull()
})

// It runs before any module, in every browser that loads the page.
it('is plain ES5 text in one try block', () => {
  expect(MOTION_GATE_SCRIPT).not.toMatch(/=>|`|\blet\b|\bconst\b|\bimport\b|\?\.|\?\?/)
  expect(MOTION_GATE_SCRIPT).toMatch(/^\(function\(\)\{try\{.*\}catch\(e\)\{\}\}\)\(\)$/)
})
