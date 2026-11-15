import { statusWord } from './status'
import StatusSwatch from './StatusSwatch'

// A count of one status (spec §7.9): the swatch, then „**n** word“, singular
// only for 1: „1 свободен“, „4 свободни“, „0 блокирани“. Until the count is
// known it reads `—`, never a zero it has not read (spec §9). The number
// stays still when it changes: these counts follow the floor a pointer is
// on, and spec §5.7 never rolls a count on hover.
//
// The number and the word sit in the chip's flex row as the concept's do
// (core.js:48-49), the chip's 8 px gap between them.
export default function StatusCount({ status, count }) {
  const known = typeof count === 'number'
  return (
    <span className="st">
      <StatusSwatch status={status} />
      <b>{known ? count : '—'}</b> {statusWord(status, known ? count : null)}
    </span>
  )
}
