// Pure helpers for a full-screen picture viewer, from the Golden Residence
// landing (golden-residence src/utils/viewer.js @944bb03, behind its
// GalleryViewer).

export const wrapIndex = (i, n) => ((i % n) + n) % n

// The whole picture (contain) inside the viewport less the gutters, centred.
// It may enlarge a small picture; it never returns a negative size.
export function fitRect(natural, viewport, gutters) {
  const room = {
    width: Math.max(0, viewport.width - 2 * gutters.x),
    height: Math.max(0, viewport.height - 2 * gutters.y),
  }
  const scale = Math.min(room.width / natural.width, room.height / natural.height)
  const width = natural.width * scale
  const height = natural.height * scale
  return { left: (viewport.width - width) / 2, top: (viewport.height - height) / 2, width, height }
}

// The viewer grows from, and shrinks back into, a grid rectangle only when at
// least half of it is on screen; otherwise it fades.
export function halfInView(rect, viewportHeight) {
  if (!rect || rect.height <= 0) return false
  const visible = Math.min(rect.top + rect.height, viewportHeight) - Math.max(rect.top, 0)
  return visible >= rect.height / 2
}
