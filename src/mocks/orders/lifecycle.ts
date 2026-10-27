import { getDb, mutate } from '../db/store'
import type { OrderRecord } from '../db/schema'
import { touchNft, touchOrder } from '../events'

const timers = new Map<string, ReturnType<typeof setTimeout>>()

const fakeTxHash = (): string => `0x${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`.slice(0, 66)

export function resolveOrder(orderId: string): void {
  timers.delete(orderId)
  mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId)
    if (!order || order.status !== 'pending') return
    if (order.outcome === 'declined') {
      touchOrder(order, (o) => {
        o.status = 'declined'
        o.declineReason = 'Pagamento recusado pela carteira simulada.'
      })
      return
    }
    for (const consumed of order.consumed) {
      touchNft(db, consumed.nftId, (nft) => {
        const edition = nft.editions.find((e) => e.id === consumed.editionId)
        if (edition && edition.total !== null) edition.available = Math.max(0, edition.available - consumed.quantity)
      })
    }
    const cart = db.carts.find((c) => c.id === order.cartId)
    if (cart) {
      for (const consumed of order.consumed) {
        const item = cart.items.find((i) => i.id === consumed.itemId)
        if (!item) continue
        item.quantity -= consumed.quantity
        if (item.quantity <= 0) cart.items = cart.items.filter((i) => i.id !== item.id)
      }
      cart.version += 1
      cart.updatedAt = new Date().toISOString()
    }
    touchOrder(order, (o) => {
      o.status = 'confirmed'
      o.confirmedAt = new Date().toISOString()
      o.txHash = fakeTxHash()
      o.explorerUrl = `https://etherscan.io/tx/${o.txHash}`
    })
  })
}

export function scheduleOrderResolution(order: OrderRecord): void {
  const existing = timers.get(order.id)
  if (existing) clearTimeout(existing)
  const wait = Math.max(0, new Date(order.resolveAt).getTime() - Date.now())
  timers.set(
    order.id,
    setTimeout(() => resolveOrder(order.id), wait),
  )
}

export function rescheduleOrders(): void {
  for (const order of getDb().orders) {
    if (order.status === 'pending') scheduleOrderResolution(order)
  }
}

export function clearOrderTimers(): void {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}
