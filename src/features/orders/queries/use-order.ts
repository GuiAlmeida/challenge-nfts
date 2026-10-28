import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/contracts/order'
import { useSessionStore } from '@/features/auth'
import { fetchOrder } from '../api'
import { newerOrder } from '../order.rules'
import { orderKeys } from './keys'

export function useOrder(orderId: string) {
  const userId = useSessionStore((s) => s.user?.id ?? 'anonymous')
  const queryClient = useQueryClient()
  const key = orderKeys.detail(userId, orderId)
  return useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => {
      const fetched = await fetchOrder(orderId, signal)
      return newerOrder(queryClient.getQueryData<Order>(key), fetched)
    },
    staleTime: 0,
    gcTime: 30 * 60_000,
    retry: 2,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 2_000 : false),
  })
}
