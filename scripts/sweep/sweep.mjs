// The responsiveness sweep (polish spec §6): every page the site prerenders,
// at the widths people use, in both themes, looking for what breaks a layout.
//
//   node scripts/sweep/sweep.mjs [--base http://127.0.0.1:5199] [--out <dir>] [--shots] [--theme dark|light|both]
//
// For each page and size it reports:
// - sideways scroll: the document wider than the screen;
// - what sticks out past the right edge, with no ancestor clipping it;
// - clipped text: an element that holds text and hides its overflow, with more
//   text than room (a mask that only clips a line's height is left out);
// - the header's controls overlapping its logo, or running off the bar.
// With --shots it also keeps each first screen, and one further down, as PNGs
// in --out, for a person to look at. Chrome is $CHROME_PATH, else its usual
// place, as the smoke run finds it. Nothing leaves 127.0.0.1.
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`)
  return at > -1 ? process.argv[at + 1] : fallback
}
const BASE = arg('base', 'http://127.0.0.1:5199')
const OUT = arg('out', path.join(process.env.TEMP ?? '/tmp', 'ksmstroy-sweep'))
const SHOTS = process.argv.includes('--shots')
const THEMES = (arg('theme', 'both') === 'both' ? ['dark', 'light'] : [arg('theme')])

const only = (() => { const at = process.argv.indexOf('--route'); return at > -1 ? process.argv[at + 1] : null })()
export const ROUTES = (only ? [only] : null) ?? ['/', '/projects', '/about', '/projects/golden-residence', '/projects/golden-residence/block-a', '/projects/mnogofamilna-sgrada', '/projects/mnogofamilna-sgrada/block-b', '/contact', '/blog', '/eu-proekt', '/missing-page']
// Phones (small to large), phones on their side (the larger past 900 px, so
// in the desktop layout), tablets upright and on their
// side, laptops, desktops, a wide screen.
export const SIZES = [[320, 640], [360, 760], [375, 667], [390, 844], [414, 896], [430, 932], [844, 390], [932, 430], [768, 1024], [820, 1180], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]]

const chrome = () => process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome')

// Runs in the page, where the browser's globals are (as smoke.mjs's
// inspectors): what is wrong with its layout now.
/* global document, getComputedStyle, window */
function inspect() {
  const vw = document.documentElement.clientWidth
  const problems = []
  if (document.documentElement.scrollWidth > vw + 1) problems.push(`sideways scroll: ${document.documentElement.scrollWidth} > ${vw}`)
  const clipped = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a)
      if (s.overflowX !== 'visible' || s.position === 'fixed') return true
    }
    return false
  }
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${String(el.className?.baseVal ?? el.className).trim().split(/\s+/).slice(0, 2).join('.')}`
  const out = new Set()
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.width && r.right > vw + 1 && !clipped(el)) out.add(`past the edge: ${name(el)} (${Math.round(r.right)} > ${vw})`)
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    const hides = s.overflowX === 'hidden' || s.overflowX === 'clip' || s.textOverflow === 'ellipsis'
    // A visually hidden label (1 px wide, for screen readers) is clipped on purpose.
    if (ownText && hides && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 2) out.add(`clipped text: ${name(el)} „${el.textContent.trim().slice(0, 40)}“ (${el.scrollWidth} > ${el.clientWidth})`)
  }
  problems.push(...[...out].slice(0, 12))
  const bar = document.querySelector('.hdr__bar')
  const logo = document.querySelector('.hdr__logo')?.getBoundingClientRect()
  const right = document.querySelector('.hdr__right')?.getBoundingClientRect()
  if (bar && logo && right) {
    if (right.left < logo.right + 8) problems.push(`header: its controls (${Math.round(right.left)}) crowd the logo (${Math.round(logo.right)})`)
    if (right.right > vw + 1) problems.push(`header: its controls run off the bar (${Math.round(right.right)} > ${vw})`)
  }
  return problems
}

async function sweep() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({ executablePath: chrome(), headless: true, args: ['--hide-scrollbars'] })
  const report = []
  try {
    for (const theme of THEMES) {
      for (const [w, h] of SIZES) {
        for (const route of ROUTES) {
          const page = await browser.newPage()
          await page.setRequestInterception(true)
          page.on('request', (request) => (new URL(request.url()).hostname === '127.0.0.1' ? request.continue() : request.abort()))
          await page.setViewport({ width: w, height: h, isMobile: w < 600 || h < 500, hasTouch: w < 900 })
          await page.evaluateOnNewDocument((t) => {
            try {
              localStorage.setItem('ksm-theme', t)
              sessionStorage.setItem('ksm-intro', '1')
            } catch { /* storage blocked */ }
          }, theme)
          try {
            await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 })
            await new Promise((resolve) => setTimeout(resolve, 2200))
            // Walk the page so what lays out on the way does.
            const height = await page.evaluate(() => document.documentElement.scrollHeight)
            const shots = []
            if (SHOTS) shots.push(0)
            for (let y = 0; y < height; y += Math.round(h * 0.9)) {
              await page.evaluate((top) => window.scrollTo(0, top), y)
              await new Promise((resolve) => setTimeout(resolve, 60))
            }
            await page.evaluate(() => window.scrollTo(0, 0))
            await new Promise((resolve) => setTimeout(resolve, 700))
            const problems = await page.evaluate(inspect)
            if (SHOTS) {
              const file = (n) => path.join(OUT, `${theme}-${w}x${h}${route.replace(/\//g, '_') || '_home'}-${n}.png`)
              await page.screenshot({ path: file(0) })
              await page.evaluate((top) => window.scrollTo(0, top), Math.round(h * 1.4))
              await new Promise((resolve) => setTimeout(resolve, 900))
              await page.screenshot({ path: file(1) })
            }
            report.push({ theme, size: `${w}x${h}`, route, problems })
            if (problems.length) console.log(`${theme} ${w}x${h} ${route}\n  ${problems.join('\n  ')}`)
          } catch (error) {
            report.push({ theme, size: `${w}x${h}`, route, problems: [`could not open: ${error.message}`] })
            console.log(`${theme} ${w}x${h} ${route}: could not open: ${error.message}`)
          } finally {
            await page.close()
          }
        }
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1))
  const bad = report.filter((row) => row.problems.length)
  console.log(`sweep: ${report.length} pages × sizes, ${bad.length} with problems; report in ${path.join(OUT, 'report.json')}`)
  return bad.length
}

const bad = await sweep()
process.exitCode = bad ? 1 : 0
