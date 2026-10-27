import { COUPONS } from '../fixtures/coupons'
import { buildNftFixtures } from '../fixtures/nfts'
import { FAVORITES, USERS, WALLETS } from '../fixtures/users'
import type { MockDb } from './schema'

export const DB_VERSION = 1

export function buildSeed(meta: { seed: number; scenario: string }): MockDb {
  return {
    meta: {
      version: DB_VERSION,
      seed: meta.seed,
      scenario: meta.scenario,
      createdAt: new Date().toISOString(),
    },
    users: structuredClone(USERS),
    sessions: [],
    nfts: buildNftFixtures(),
    favorites: structuredClone(FAVORITES),
    carts: [],
    quotes: [],
    orders: [],
    coupons: structuredClone(COUPONS),
    wallets: structuredClone(WALLETS),
    idempotency: [],
  }
}
