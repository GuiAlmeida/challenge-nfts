import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Session } from '@/contracts/auth'
import { isPrivateKey } from './private-keys'
import { authKeys } from './queries/keys'
import { useSessionStore } from './session-store'

const DRAFT_PREFIX = 'kurio.checkout.'

export function clearCheckoutDrafts(): void {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(DRAFT_PREFIX)) sessionStorage.removeItem(key)
    }
  } catch {
    return
  }
}

export function afterSignIn(session: Session, queryClient: QueryClient): void {
  queryClient.removeQueries({ predicate: (query) => isPrivateKey(query.queryKey) })
  useSessionStore.getState().setSession(session)
  queryClient.setQueryData(authKeys.me(session.user.id), session)
  void queryClient.invalidateQueries({ queryKey: ['cart'] })
  if (session.cartMerged) {
    toast.success('Os itens do seu carrinho foram mantidos.', { id: 'cart-merged' })
  }
}

export function signOut(queryClient: QueryClient, reason: 'logout' | 'expired'): void {
  useSessionStore.getState().clear()
  if (reason === 'logout') clearCheckoutDrafts()
  queryClient.removeQueries({ predicate: (query) => isPrivateKey(query.queryKey) })
  void queryClient.invalidateQueries({ queryKey: ['cart'] })
}
