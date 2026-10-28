import type { QueryClient } from '@tanstack/react-query'
import type { EventEnvelope, OrderUpdatedPayload } from '@/contracts/events'
import { type Order, receiptSchema } from '@/contracts/order'
import { cartKeys } from '@/features/cart'
import { orderKeys } from '@/features/orders'

export function currentOrderVersion(queryClient: QueryClient, userId: string | null, orderId: string): number | undefined {
  if (!userId) return undefined
  return queryClient.getQueryData<Order>(orderKeys.detail(userId, orderId))?.version
}

export function applyOrderUpdated(queryClient: QueryClient, userId: string | null, envelope: EventEnvelope<OrderUpdatedPayload>): void {
  if (!userId) return
  const key = orderKeys.detail(userId, envelope.resource.id)
  const current = queryClient.getQueryData<Order>(key)
  if (!current || current.version >= envelope.version) return
  const { payload } = envelope
  const receipt = receiptSchema.safeParse(payload.receipt)
  const next: Order = {
    ...current,
    version: envelope.version,
    status: payload.status,
    updatedAt: envelope.occurredAt,
    txHash: payload.txHash ?? current.txHash,
    explorerUrl: payload.explorerUrl ?? current.explorerUrl,
    confirmedAt: payload.status === 'confirmed' ? (current.confirmedAt ?? envelope.occurredAt) : current.confirmedAt,
    receipt: receipt.success ? receipt.data : current.receipt,
  }
  queryClient.setQueryData(key, next)
  if (payload.status === 'confirmed') void queryClient.invalidateQueries({ queryKey: cartKeys.all })
}
