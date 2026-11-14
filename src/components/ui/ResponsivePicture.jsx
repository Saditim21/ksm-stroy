import { useEffect, useRef, useState } from 'react'

// One picture from the image manifests (plan Tasks 7 and 8): `image` is
// { path, w, h, widths, color }, and the files are `${path}-${width}.avif` and
// `.webp`, one per width. An AVIF <source>, then a WebP <source>, then the
// largest WebP as the <img>, with the image's real width and height so nothing
// shifts while it loads. `sizes` must describe the slot, so a phone fetches
// the small files. Every browser that runs this page knows <picture>, so the
// <img> needs no srcset of its own (golden-residence
// src/components/ui/ResponsivePicture.jsx @944bb03).
//
// `priority` is for a route's LCP image: fetched first and at once. Any other
// picture waits until it nears the viewport.
//
// Until the image has loaded, the picture shows the image's dominant colour.
// After that it shows none, so an image with transparent parts never sits on
// a coloured block. A picture is a block, so the colour fills the image's box.
//
// `art` is art direction: { media, image } adds that image's AVIF and WebP for
// the media query, ahead of the default ones, each <source> with its own size.
// The browser picks the crop; no JS takes part (VideoBand's poster).
const srcSet = (image, ext) => image.widths.map((w) => `${image.path}-${w}.${ext} ${w}w`).join(', ')

function ArtSources({ art, sizes }) {
  const { media, image } = art
  return ['avif', 'webp'].map((ext) => (
    <source key={ext} media={media} type={`image/${ext}`} srcSet={srcSet(image, ext)} sizes={sizes} width={image.w} height={image.h} />
  ))
}

export default function ResponsivePicture({ image, alt, sizes, priority = false, className = '', imgClassName = '', art }) {
  const imgRef = useRef(null)
  // The path of the image that has loaded: a new image shows its own colour.
  const [loadedPath, setLoadedPath] = useState(null)

  // An image already loaded when the page hydrated fired its `load` before
  // React was listening.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setLoadedPath(image.path)
  }, [image.path])

  const placeholder = loadedPath === image.path ? undefined : { backgroundColor: image.color }

  return (
    <picture className={`block ${className}`.trim()} style={placeholder}>
      {art ? <ArtSources art={art} sizes={sizes} /> : null}
      <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
      <img
        ref={imgRef}
        src={`${image.path}-${image.widths[image.widths.length - 1]}.webp`}
        width={image.w}
        height={image.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoadedPath(image.path)}
        className={imgClassName || undefined}
      />
    </picture>
  )
}
