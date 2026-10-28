import type { EventEnvelope, NftUpdatedPayload, OrderUpdatedPayload } from '@/contracts/events'
import type { MockDb, OrderRecord } from './db/schema'
import type { NftRecord } from './fixtures/nfts'
import { minPrice } from './serializers'
import { socketBus } from './socket/bus'

export function nftUpdatedEnvelope(nft: NftRecord): EventEnvelope<NftUpdatedPayload> {
  return {
    id: crypto.randomUUID(),
    type: 'nft.updated',
    resource: { type: 'nft', id: nft.id },
    version: nft.version,
    occurredAt: new Date().toISOString(),
    payload: {
      price: minPrice(nft),
      editions: nft.editions.map((edition) => ({
        id: edition.id,
        price: edition.price,
        available: edition.available,
      })),
    },
  }
}

export function orderUpdatedEnvelope(order: OrderRecord): EventEnvelope<OrderUpdatedPayload> {
  return {
    id: crypto.randomUUID(),
    type: 'order.updated',
    resource: { type: 'order', id: order.id },
    version: order.version,
    occurredAt: new Date().toISOString(),
    payload: {
      status: order.status,
      txHash: order.txHash ?? undefined,
      explorerUrl: order.explorerUrl ?? undefined,
      receipt: order.status === 'confirmed' ? order.receipt : undefined,
    },
  }
}

export function touchNft(
  db: MockDb,
  nftId: string,
  change: (nft: NftRecord) => void,
): { nft: NftRecord; envelope: EventEnvelope<NftUpdatedPayload> } | null {
  const nft = db.nfts.find((n) => n.id === nftId)
  if (!nft) return null
  change(nft)
  nft.version += 1
  const envelope = nftUpdatedEnvelope(nft)
  socketBus.broadcast(envelope)
  return { nft, envelope }
}

export function touchOrder(order: OrderRecord, change: (order: OrderRecord) => void): void {
  change(order)
  order.version += 1
  order.updatedAt = new Date().toISOString()
  socketBus.toUser(order.userId, orderUpdatedEnvelope(order))
}
