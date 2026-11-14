import useMediaQuery from './useMediaQuery'

// True on touch screens, whose primary pointer is a finger. From
// golden-residence src/hooks/useCoarsePointer.js @944bb03. False on the server
// and while hydrating, like every useMediaQuery answer, then the browser's.
export default function useCoarsePointer() {
  return useMediaQuery('(pointer: coarse)')
}
