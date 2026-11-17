import { useLayoutEffect, useRef } from 'react'
import useMotionNow from '../../motion/useMotionNow'
import { scrollToId } from '../../utils/scroll'

// The thank-you a sent inquiry turns into (spec §5.7, §10; useInquiryForm.jsx):
// a status that takes the focus, once, as it arrives, and comes into view if
// the form's end was all that showed: the glide to the inquiry goes on as far
// as the thank-you, which on a short phone screen sits a whole contact half
// below the section's top (ruling C5.3). With motion its lines rise into
// place, 18 px over 0.8 s, 0.08 s apart, and the rise goes with it.
//
// Only a sent inquiry shows it, so it travels with the send path
// (sendPath.js), out of the first-load JS of every page with the form (spec
// §10, FR5). `phone` is the form's phone, kept on one line.

// Its id, which the glide to the inquiry brings into view.
const THANKS = 'f-thanks'

export default function InquiryThanks({ phone }) {
  const ref = useRef(null)
  const motionNow = useMotionNow()

  useLayoutEffect(() => {
    const box = ref.current
    box.focus({ preventScroll: true })
    const { top, bottom } = box.getBoundingClientRect()
    if (top < 0 || bottom > window.innerHeight) scrollToId('zapitvane', { reveal: THANKS })
    const motion = motionNow()
    if (!motion) return undefined
    const rise = motion.gsap.from(box.children, { opacity: 0, y: 18, duration: 0.8, ease: 'expo.out', stagger: 0.08, clearProps: 'opacity,transform' })
    return () => rise.revert()
    // Once, as the thank-you arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} id={THANKS} className="form__ok" role="status" tabIndex={-1}>
      <p>Благодарим ви.</p>
      <p className="lead">
        Ще се свържем с&nbsp;вас в&nbsp;работно време. За бърз отговор: {phone}.
      </p>
    </div>
  )
}
