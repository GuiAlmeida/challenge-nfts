import { useSessionStore } from '@/features/auth'
import { clearCartId } from './cart-id'
import { useCartUiStore } from './cart-ui-store'

export function installCartSessionBridge(): () => void {
  return useSessionStore.subscribe((state, previous) => {
    if (state.token === previous.token) return
    clearCartId()
    useCartUiStore.getState().acknowledge()
  })
}
