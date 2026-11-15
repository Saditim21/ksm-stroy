// The status vocabulary's words and looks (spec §7.9), shared by the status
// components (StatusSwatch, StatusChip, StatusCount, StatusLegend) and by
// what draws a status in shapes of its own (the parking cells, the facade's
// rails). The labels and the keys are src/utils/propertyStatus.js's.
import { plural } from '../../utils/format'

// The order of every legend and count list.
export const STATUS_ORDER = Object.freeze(['available', 'reserved', 'sold', 'blocked'])

// Each key's look, by the concept's names (diptych.css:255-270). A status
// the rules do not know looks blocked.
const LOOK = Object.freeze({ available: 'free', reserved: 'reserved', sold: 'sold', blocked: 'blocked' })

const WORDS = Object.freeze({
  available: ['свободен', 'свободни'],
  reserved: ['резервиран', 'резервирани'],
  sold: ['продаден', 'продадени'],
  blocked: ['блокиран', 'блокирани'],
})

const known = (status) => Object.prototype.hasOwnProperty.call(LOOK, status)

/** The key itself for the four statuses the sheets use, else 'unknown'. */
export const statusKeyOf = (status) => (known(status) ? status : 'unknown')

/** The look's name: 'free' | 'reserved' | 'sold' | 'blocked'. */
export const statusLook = (status) => (known(status) ? LOOK[status] : 'blocked')

/** The word a count of `status` takes: the singular for exactly 1 („1
 * свободен“), the plural for any other count, `—` included. */
export const statusWord = (status, count) => plural(count, ...WORDS[known(status) ? status : 'blocked'])
