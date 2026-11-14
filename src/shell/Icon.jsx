// The shell's line icons: a 22 px glyph drawn in the text colour, for a 44 px
// button. Decorative; the button or link carries the name.
export const PHONE = 'M7.1 3.6h2.4l1.5 4.1-1.9 1.4a11.6 11.6 0 0 0 5.8 5.8l1.4-1.9 4.1 1.5v2.4a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 5.1 5.8a2 2 0 0 1 2-2.2z'
export const MENU = 'M3.5 8.5h17M3.5 15.5h17'
export const CLOSE = 'M5.5 5.5l13 13M18.5 5.5l-13 13'

export default function Icon({ d }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}
