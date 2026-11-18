import { useLayoutEffect, useRef } from 'react'

// The 404 page's drawing (spec M3/M4 §7.6; the concept's 404.html:86-107):
// Golden Residence's typical floor of блок А, as the explorer's plan stage
// shows it, with one apartment missing. The page is not in the drawing, and
// the drawing shows it.
//
// - The explorer's own dark drawing of блок А (plan-a, from the image
//   pipeline: src/data/images/golden-residence.json, its one 1200 px rung),
//   its AVIF, else its WebP, at .4 (notfound.css). It is the page's largest
//   picture, so it is fetched first and never faded (Diptych §5.5). Its
//   manifest stays with Golden Residence's chunks: this module names the two
//   files itself, and not-found.prerender.test.jsx holds them to the
//   manifest.
// - Over it, in the drawing's own grid (the viewBox crops it to the floor),
//   the explorer's brass outlines of the floor's apartments, from
//   src/data/maps/golden-residence.floors.json (block А's shapes, which the
//   prerender test compares), but for apartment 04: its walls are cut out
//   of the drawing (its outline filled with the stage's ground) and its
//   outline is left dashed. Nothing on the page says which apartment it is,
//   or whose floor: the figure is a picture only, hidden from assistive
//   technology, with no text in it (src/routes.test.jsx).
// - The outlines stay one screen pixel wide, as the explorer's do
//   (PlanSvg.jsx's fit()): the drawing's units per pixel, --u, its viewBox's
//   850 over its width, measured as it changes size, the only work done in
//   JS. Until then notfound.css gives the width at the drawing's common
//   sizes. The outlines draw themselves in turn on arrival (pathLength 1,
//   --i), the missing apartment last: notfound.css, all CSS.
//
// A static module, imported only by the 404 page (src/routes/not-found.jsx),
// so none of it reaches another route's first load: the block pages load the
// 404 page lazily (src/routes/BlockRoute.jsx).

const VIEW = { x: 150, y: 66, w: 850, h: 720 }
const PLAN = '/img/plan-a-1200'

// Block А's apartments 01–03 and 05–12, in the map's order: one outline each.
export const OUTLINES = [
  'M402 330L507 330L525 340L518 360L516 448L504 456L471 456L456 448L395 454L390 407L402 401Z',
  'M404 111L458 111L500 112L515 112L520 166L517 315L505 315L504 323L444 323L443 314L399 314L392 264L392 224Z',
  'M262 111L297 117L340 112L364 114L366 152L381 153L383 170L374 171L374 235L383 236L378 257L348 259L348 275L332 281L332 287L227 287L214 282L214 206L216 165L238 163L238 112Z',
  'M273 430L284 434L344 430L350 480L338 485L337 557L286 557L283 538L214 538L211 500L210 482L214 473L214 438L224 431L259 431Z',
  'M362 563L395 568L403 574L403 593L412 593L407 659L416 692L416 701L372 705L286 704L214 703L211 613L227 581L321 581L321 573L357 574Z',
  'M500 563L516 563L516 581L541 586L541 630L550 630L550 695L543 705L452 704L452 692L438 688L442 635L424 632L424 578L494 576Z',
  'M591 563L607 563L612 576L683 576L683 632L665 635L663 698L654 704L599 708L565 701L565 650L557 650L561 598L571 581L591 581Z',
  'M768 563L783 564L783 581L807 589L807 630L816 631L816 701L808 704L712 704L708 635L691 634L696 593L690 592L690 578L761 575Z',
  'M854 461L867 472L883 472L883 501L938 502L941 644L950 661L950 695L915 695L915 708L836 703L835 556L824 551L824 472L851 471Z',
  'M757 393L783 393L788 396L804 398L816 508L805 512L746 511L740 523L724 523L724 513L696 513L691 452L698 452L698 399Z',
  'M557 430L659 432L660 473L678 473L675 503L649 505L648 523L634 523L628 512L557 511Z',
]

// Apartment 04, the one that is not in the drawing.
export const GONE = 'M284 297L339 297L336 368L345 368L350 380L345 423L333 423L333 416L259 423L218 423L210 381L214 326L238 316L238 305L246 315L284 315Z'

export default function LostPlan() {
  const ref = useRef(null)

  // --u: the drawing's units per screen pixel, as it is drawn now.
  useLayoutEffect(() => {
    const svg = ref.current
    const fit = () => {
      const { width } = svg.getBoundingClientRect()
      if (width) svg.style.setProperty('--u', (VIEW.w / width).toFixed(3))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="lost__plan" aria-hidden="true">
      <div className="lost__draw">
        <picture>
          <source type="image/avif" srcSet={`${PLAN}.avif`} />
          <img className="lost__drawing" src={`${PLAN}.webp`} width="1200" height="845" alt="" fetchPriority="high" decoding="async" />
        </picture>
        <svg ref={ref} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} focusable="false">
          <path className="lost__cut" d={GONE} />
          <g className="lost__units">
            {OUTLINES.map((d, i) => (
              <path key={d} d={d} pathLength="1" style={{ '--i': i }} />
            ))}
          </g>
          <path className="lost__gone" d={GONE} />
        </svg>
      </div>
    </figure>
  )
}
