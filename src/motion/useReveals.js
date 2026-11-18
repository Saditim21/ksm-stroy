import useMotion from './useMotion'

// The scroll reveals of a section (spec §5.7; the concept's KSM.reveal,
// js/core.js:192-218). Once the page has loaded, and where motion is allowed,
// one setup for the section (useMotion) finds the markers inside it, and each
// marked element is revealed once, when it scrolls into view:
// - data-split: SplitText splits it into lines, each in a mask
//   (`split-line-mask`, src/styles/diptych.css), that rise 112 % → 0 over
//   0.9 s, 0.1 s apart, at `top 88%`. Once they land the split is reverted, so
//   no mask is left to clip a glyph (spec §3.3). autoSplit splits again if a
//   font arrives or the width changes before then; the tween goes back to
//   SplitText, which carries it over. A no-break space stays one (no
//   reduceWhiteSpace, which reads it as a space), so the split lines break
//   where the landed heading does, never after a one-letter word (M3 ruling
//   T5d). A split into words and lines leaves the text readable where it is,
//   so it names nothing (`aria: 'none'`): SplitText's own label would be
//   prohibited on a span with no role, as За нас's heading halves are
//   (spec M3/M4 §4.5: Lighthouse a11y ≥ 98; M4 Task 8).
// - data-fade: body copy fades in from 16 px below, over 1 s, at `top 92%`.
// - data-draw: a seam (<Seam draw>) draws down over 1.3 s when its section
//   (the seam's parent) reaches `top 82%`.
//
// What is already on screen when the setup runs stays as it is: a reveal
// never replays what the visitor has seen, and the first viewport never
// moves for JS (its motion is CSS, spec §5.5). The markup is the final state;
// GSAP animates only from it, and reverting the section's context (on
// unmount, or when the visitor switches reduced motion on) puts it back.
export default function useReveals(scopeRef) {
  useMotion(scopeRef, ({ gsap, SplitText }) => {
    const scope = scopeRef.current
    if (!scope) return
    const below = (el) => el.getBoundingClientRect().top >= window.innerHeight
    const marked = (marker) => [...scope.querySelectorAll(`[${marker}]`)].filter(below)

    for (const el of marked('data-split')) {
      SplitText.create(el, {
        type: 'words,lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        reduceWhiteSpace: false,
        aria: 'none',
        onSplit: (split) => gsap.from(split.lines, {
          yPercent: 112,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => split.revert(),
        }),
      })
    }
    for (const el of marked('data-fade')) {
      gsap.from(el, {
        opacity: 0,
        y: 16,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    }
    for (const el of marked('data-draw')) {
      gsap.from(el, {
        scaleY: 0,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: el.parentElement, start: 'top 82%', once: true },
      })
    }
  })
}
