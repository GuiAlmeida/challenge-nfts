import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateOrder, Order } from '@/contracts/order'
import { useSessionStore } from '@/features/auth'
import { createOrder } from './api'
import { orderKeys } from './queries/keys'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const userId = useSessionStore((s) => s.user?.id ?? 'anonymous')
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CreateOrder; idempotencyKey: string }) => createOrder(body, idempotencyKey),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(orderKeys.detail(userId, order.id), order)
    },
  })
}
