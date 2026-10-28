import { useRef } from 'react'

type AutoFocusHandler = ((event: Event) => void) | undefined

export function useReturnFocus(onOpenAutoFocus: AutoFocusHandler, onCloseAutoFocus: AutoFocusHandler) {
  const opener = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus: (event: Event) => {
      opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null
      onOpenAutoFocus?.(event)
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event)
      const target = opener.current
      if (event.defaultPrevented || !target?.isConnected) return
      event.preventDefault()
      target.focus()
    },
  }
}
