import type { QueryClient } from '@tanstack/react-query'
import { cartKeys, quoteKeys } from '@/features/cart'
import { nftKeys } from '@/features/catalog'
import { orderKeys } from '@/features/orders'

export function reconcile(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: nftKeys.all })
  void queryClient.invalidateQueries({ queryKey: cartKeys.all })
  void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
  void queryClient.invalidateQueries({ queryKey: orderKeys.all })
}
