import { fireEvent, render } from '@testing-library/react'
import { expect, it } from 'vitest'
import SeamIntro from './SeamIntro'

// The seam intro (spec §5.5) plays once, from first paint, under the gate's
// `intro` class (home.css). The class stays on <html> for the document's
// life, so reduced motion switched on and off again would bring the intro's
// animation back and play it a second time. Once it has played, the intro
// leaves the page (ruling C4.5).

const doors = (container) => container.querySelector('.intro-doors')

it('is in the page until the intro has played', () => {
  const { container } = render(<SeamIntro />)
  expect(doors(container)).toHaveAttribute('aria-hidden', 'true')
  expect(doors(container).querySelectorAll('.door')).toHaveLength(2)
})

it('leaves the page when its own animation ends', () => {
  const { container } = render(<SeamIntro />)
  fireEvent.animationEnd(doors(container))
  expect(doors(container)).toBeNull()
})

// The doors, the seam and the mark animate inside it and end on their own
// (the seam fades out at the same moment the intro does): their ends bubble
// up, and none of them is the intro's.
it('stays for the animations inside it', () => {
  const { container } = render(<SeamIntro />)
  fireEvent.animationEnd(container.querySelector('.door--l'))
  fireEvent.animationEnd(container.querySelector('.doors__seam'))
  expect(doors(container)).not.toBeNull()
})

// The intro may end before the page hydrates (a slow phone): its finished
// animation, held by its fill, still tells.
it('leaves at once when the intro had already played before it hydrated', () => {
  const original = Element.prototype.getAnimations
  Element.prototype.getAnimations = function getAnimations() {
    return this.classList.contains('intro-doors') ? [{ animationName: 'intro-doors', playState: 'finished' }] : []
  }
  try {
    const { container } = render(<SeamIntro />)
    expect(doors(container)).toBeNull()
  } finally {
    if (original) Element.prototype.getAnimations = original
    else delete Element.prototype.getAnimations
  }
})
