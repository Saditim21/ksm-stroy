import { WORDMARK_D } from './wordmark-path.js'

export default function Wordmark({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 181.2 112.99"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" fillRule="evenodd" d={WORDMARK_D} />
    </svg>
  )
}
