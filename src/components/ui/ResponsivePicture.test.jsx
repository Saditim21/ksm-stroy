import { fireEvent, render } from '@testing-library/react'
import ResponsivePicture from './ResponsivePicture'

// ResponsivePicture (plan Task 7): an AVIF and a WebP srcset from the image's
// widths, the largest WebP as a sized <img>, and the image's dominant colour
// behind it until it loads. The image shape is the manifests' (plan Task 8).

const IMAGE = { path: '/img/x', w: 2000, h: 1250, widths: [640, 1024, 1600], color: '#8A8F86' }
const SIZES = '(min-width: 1024px) 50vw, 100vw'

const parts = (container) => {
  const picture = container.querySelector('picture')
  return { picture, sources: [...picture.querySelectorAll('source')], img: picture.querySelector('img') }
}

test('AVIF, then WebP, then the largest WebP as an img with its real size', () => {
  const { container } = render(<ResponsivePicture image={IMAGE} alt="Фасадата" sizes={SIZES} />)
  const { sources: [avif, webp], img } = parts(container)
  expect(avif).toHaveAttribute('type', 'image/avif')
  expect(avif.getAttribute('srcset')).toContain('/img/x-1024.avif 1024w')
  expect(avif).toHaveAttribute('srcset', '/img/x-640.avif 640w, /img/x-1024.avif 1024w, /img/x-1600.avif 1600w')
  expect(avif).toHaveAttribute('sizes', SIZES)
  expect(webp).toHaveAttribute('type', 'image/webp')
  expect(webp).toHaveAttribute('srcset', '/img/x-640.webp 640w, /img/x-1024.webp 1024w, /img/x-1600.webp 1600w')
  expect(webp).toHaveAttribute('sizes', SIZES)
  expect(img).toHaveAttribute('src', '/img/x-1600.webp')
  expect(img).toHaveAttribute('width', '2000')
  expect(img).toHaveAttribute('height', '1250')
  expect(img).toHaveAttribute('alt', 'Фасадата')
})

test('priority: fetched first, eagerly, decoded off the main thread', () => {
  const { container } = render(<ResponsivePicture image={IMAGE} alt="" sizes="100vw" priority />)
  const { img } = parts(container)
  expect(img).toHaveAttribute('fetchpriority', 'high')
  expect(img).toHaveAttribute('loading', 'eager')
  expect(img).toHaveAttribute('decoding', 'async')
})

test('otherwise lazy, with no fetch priority', () => {
  const { container } = render(<ResponsivePicture image={IMAGE} alt="" sizes="100vw" />)
  const { img } = parts(container)
  expect(img).toHaveAttribute('loading', 'lazy')
  expect(img).not.toHaveAttribute('fetchpriority')
})

test('the wrapper shows the dominant colour until the image loads', () => {
  const { container } = render(<ResponsivePicture image={IMAGE} alt="" sizes="100vw" />)
  const { picture, img } = parts(container)
  expect(picture.style.backgroundColor).toBe('rgb(138, 143, 134)')
  fireEvent.load(img)
  expect(picture.style.backgroundColor).toBe('')
})

test('a new image shows its own colour until it loads', () => {
  const { container, rerender } = render(<ResponsivePicture image={IMAGE} alt="" sizes="100vw" />)
  fireEvent.load(parts(container).img)
  rerender(<ResponsivePicture image={{ ...IMAGE, path: '/img/y', color: '#1F3A63' }} alt="" sizes="100vw" />)
  expect(parts(container).picture.style.backgroundColor).toBe('rgb(31, 58, 99)')
})

test('className reaches the picture and imgClassName the img', () => {
  const { container } = render(
    <ResponsivePicture image={IMAGE} alt="" sizes="100vw" className="absolute inset-0" imgClassName="h-full w-full object-cover" />,
  )
  const { picture, img } = parts(container)
  expect(picture).toHaveClass('absolute', 'inset-0')
  expect(img).toHaveClass('h-full', 'w-full', 'object-cover')
})

// Art direction (a poster with a desktop and a phone crop, as in VideoBand):
// the browser picks the crop by <source media>, with no JS.
test('art adds the other crop’s sources for its media query, ahead of the default ones', () => {
  const wide = { path: '/img/wide', w: 1920, h: 760, widths: [1024, 1920], color: '#9AA39B' }
  const { container } = render(
    <ResponsivePicture image={IMAGE} art={{ media: '(min-width: 768px)', image: wide }} alt="" sizes="100vw" />,
  )
  const { sources } = parts(container)
  expect(sources.map((s) => [s.getAttribute('media'), s.getAttribute('type'), s.getAttribute('srcset')])).toEqual([
    ['(min-width: 768px)', 'image/avif', '/img/wide-1024.avif 1024w, /img/wide-1920.avif 1920w'],
    ['(min-width: 768px)', 'image/webp', '/img/wide-1024.webp 1024w, /img/wide-1920.webp 1920w'],
    [null, 'image/avif', '/img/x-640.avif 640w, /img/x-1024.avif 1024w, /img/x-1600.avif 1600w'],
    [null, 'image/webp', '/img/x-640.webp 640w, /img/x-1024.webp 1024w, /img/x-1600.webp 1600w'],
  ])
  expect(sources[0]).toHaveAttribute('width', '1920')
  expect(sources[0]).toHaveAttribute('height', '760')
})
