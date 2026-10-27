import type { PublicUser } from '@/contracts/auth'
import type { Cart, CartItem } from '@/contracts/cart'
import type { NftDetail, NftSummary } from '@/contracts/nft'
import type { Order } from '@/contracts/order'
import type { Wallet } from '@/contracts/wallet'
import { compareEth, formatEth, mulQty, parseEth, sumWei } from '@/lib/eth'
import type { CartRecord, MockDb, OrderRecord } from './db/schema'
import { collectionBySlug } from './fixtures/collections'
import type { NftRecord } from './fixtures/nfts'
import type { UserRecord, WalletRecord } from './fixtures/users'

export const minPrice = (nft: NftRecord): string =>
  nft.editions.reduce((min, edition) => (compareEth(edition.price, min) < 0 ? edition.price : min), nft.editions[0]!.price)

export const isSoldOut = (nft: NftRecord): boolean => nft.editions.every((edition) => edition.available <= 0)

export function toNftSummary(nft: NftRecord): NftSummary {
  const collection = collectionBySlug(nft.collectionSlug) ?? {
    slug: nft.collectionSlug,
    name: nft.collectionSlug,
  }
  return {
    id: nft.id,
    name: nft.name,
    tokenId: nft.tokenId,
    collection,
    network: nft.network,
    price: minPrice(nft),
    previousPrice: nft.previousPrice,
    image: nft.image,
    rare: nft.rare,
    trending: nft.trending,
    listedAt: nft.listedAt,
    rating: nft.rating,
    reviewsCount: nft.reviewsCount,
    soldOut: isSoldOut(nft),
    version: nft.version,
  }
}

export function toNftDetail(nft: NftRecord): NftDetail {
  return {
    ...toNftSummary(nft),
    shortDescription: nft.shortDescription,
    description: nft.description,
    attributes: nft.attributes,
    creator: nft.creator,
    royaltyPct: nft.royaltyPct,
    contractAddress: nft.contractAddress,
    gallery: nft.gallery,
    editions: nft.editions,
  }
}

export function toCart(cart: CartRecord, db: MockDb, extra: { merged?: boolean } = {}): Cart {
  const items: CartItem[] = []
  for (const item of cart.items) {
    const nft = db.nfts.find((n) => n.id === item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    if (!nft || !edition) continue
    items.push({
      id: item.id,
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      tokenId: nft.tokenId,
      editionLabel: edition.label,
      image: nft.image,
      network: nft.network,
      unitPrice: edition.price,
      quantity: item.quantity,
      available: edition.available,
      maxPerOrder: edition.maxPerOrder,
      lineTotal: formatEth(mulQty(parseEth(edition.price), item.quantity)),
      nftVersion: nft.version,
    })
  }
  return {
    id: cart.id,
    scope: cart.scope,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: formatEth(sumWei(items.map((item) => parseEth(item.lineTotal)))),
    updatedAt: cart.updatedAt,
    version: cart.version,
    ...(extra.merged ? { merged: true } : {}),
  }
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    ens: user.ens,
    walletAlias: user.walletAlias,
    createdAt: user.createdAt,
    version: user.version,
  }
}

export function toWallet(wallet: WalletRecord): Wallet {
  return { ...wallet }
}

export function toOrder(order: OrderRecord): Order {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    confirmedAt: order.confirmedAt,
    txHash: order.txHash,
    explorerUrl: order.explorerUrl,
    declineReason: order.declineReason,
    receipt: order.receipt,
    version: order.version,
  }
}
