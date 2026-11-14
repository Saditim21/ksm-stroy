import useMediaQuery from './useMediaQuery'

// True for a mouse or trackpad: a pointer that hovers and is precise. It gates
// the effects that follow the pointer, such as useMagnetic. From
// golden-residence src/hooks/useFinePointer.js @944bb03. False on the server
// and while hydrating, like every useMediaQuery answer, then the browser's.
export default function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
