import type { Order } from '@/contracts/order'
import type { Quote } from '@/contracts/quote'
import type { CouponRecord } from '../fixtures/coupons'
import type { NftRecord } from '../fixtures/nfts'
import type { UserRecord, WalletRecord } from '../fixtures/users'
import type { IdempotencyRecord } from '../rules/idempotency.rules'

export interface SessionRecord {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

export interface CartItemRecord {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedAt: string
}

export interface CartRecord {
  id: string
  scope: 'guest' | 'user'
  ownerKey: string
  items: CartItemRecord[]
  updatedAt: string
  version: number
}

export interface QuoteRecord {
  quote: Quote
  userId: string | null
  couponCode: string | null
}

export interface OrderRecord extends Order {
  outcome: 'confirmed' | 'declined'
  resolveAt: string
  quoteId: string
  idempotencyKey: string
  cartId: string
  consumed: Array<{ itemId: string; nftId: string; editionId: string; quantity: number }>
}

export interface MockDb {
  meta: { version: number; seed: number; scenario: string; createdAt: string }
  users: UserRecord[]
  sessions: SessionRecord[]
  nfts: NftRecord[]
  favorites: Record<string, string[]>
  carts: CartRecord[]
  quotes: QuoteRecord[]
  orders: OrderRecord[]
  coupons: CouponRecord[]
  wallets: WalletRecord[]
  idempotency: IdempotencyRecord[]
}
