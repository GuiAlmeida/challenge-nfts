import type { QueryClient } from '@tanstack/react-query'
import type { Cart } from '@/contracts/cart'
import type { EventEnvelope, NftUpdatedPayload } from '@/contracts/events'
import type { NftDetail, NftListResponse } from '@/contracts/nft'
import { applyNftUpdateToCart, cartKeys, type PriceChange, useCartUiStore } from '@/features/cart'
import { applyNftUpdateToDetail, applyNftUpdateToSummary, nftKeys } from '@/features/catalog'

export function currentNftVersion(queryClient: QueryClient, nftId: string): number | undefined {
  return queryClient.getQueryData<NftDetail>(nftKeys.detail(nftId))?.version
}

export function applyNftUpdated(queryClient: QueryClient, envelope: EventEnvelope<NftUpdatedPayload>): void {
  const nftId = envelope.resource.id
  const { version, payload } = envelope
  queryClient.setQueryData<NftDetail>(nftKeys.detail(nftId), (old) => (old ? applyNftUpdateToDetail(old, version, payload) : old))
  queryClient.setQueriesData<NftListResponse>({ queryKey: nftKeys.lists() }, (old) =>
    old ? { ...old, items: old.items.map((item) => (item.id === nftId ? applyNftUpdateToSummary(item, version, payload) : item)) } : old,
  )
  const changes: PriceChange[] = []
  queryClient.setQueriesData<Cart>({ queryKey: cartKeys.all, type: 'active' }, (old) => {
    if (!old) return old
    const result = applyNftUpdateToCart(old, nftId, version, payload)
    changes.push(...result.changes)
    return result.cart
  })
  if (changes.length > 0) useCartUiStore.getState().notePriceChanges(changes)
}
