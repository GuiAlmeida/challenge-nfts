import { useSessionStore } from '@/features/auth'
import { clearCartId } from './cart-id'

export function installCartSessionBridge(): () => void {
  return useSessionStore.subscribe((state, previous) => {
    if (state.token !== previous.token) clearCartId()
  })
}
