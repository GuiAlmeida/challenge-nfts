import { type CreateOrder, type Order, orderSchema } from '@/contracts/order'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const createOrder = async (body: CreateOrder, idempotencyKey: string): Promise<Order> =>
  parseInDev(orderSchema, await http.post<Order>('/orders', body, { idempotencyKey }))

export const fetchOrder = async (orderId: string, signal?: AbortSignal): Promise<Order> =>
  parseInDev(orderSchema, await http.get<Order>(`/orders/${encodeURIComponent(orderId)}`, undefined, { signal }))
