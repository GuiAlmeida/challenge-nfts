import { useQuery } from '@tanstack/react-query'
import { useSessionUser } from '@/features/auth'
import { fetchCart } from '../api'
import { ensureCartId } from '../cart-id'
import { cartKeys } from './keys'

export function useCartScope(): string {
  const user = useSessionUser()
  return user ? `user:${user.id}` : `guest:${ensureCartId()}`
}

export function useCart() {
  const scope = useCartScope()
  return useQuery({
    queryKey: cartKeys.scope(scope),
    queryFn: ({ signal }) => fetchCart(signal),
    staleTime: 0,
    gcTime: 10 * 60_000,
  })
}
