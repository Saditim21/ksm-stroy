import useMediaQuery from './useMediaQuery'

// True on touch screens, whose primary pointer is a finger. From
// golden-residence src/hooks/useCoarsePointer.js @944bb03.
export default function useCoarsePointer() {
  return useMediaQuery('(pointer: coarse)')
}
