import { http } from 'msw'
import { addCartItemSchema, updateCartItemSchema } from '@/contracts/cart'
import { getDb, mutate, nextId, nowIso } from '../db/store'
import type { CartRecord, MockDb } from '../db/schema'
import { checkAvailability } from '../rules/availability.rules'
import { toCart } from '../serializers'
import { API_PREFIX, applyScenario, fail, guestCartId, json, optionalUser, parseBody } from './shared'

export type CartOwner = { scope: 'user'; key: string } | { scope: 'guest'; key: string } | null

export function resolveOwner(request: Request): CartOwner | Response {
  const user = optionalUser(request)
  if (user instanceof Response) return user
  if (user) return { scope: 'user', key: user.id }
  const guest = guestCartId(request)
  return guest ? { scope: 'guest', key: guest } : null
}

export function findOrCreateCart(db: MockDb, owner: NonNullable<CartOwner>): CartRecord {
  let cart = db.carts.find((c) => c.scope === owner.scope && c.ownerKey === owner.key)
  if (!cart) {
    cart = {
      id: `cart_${owner.key}`,
      scope: owner.scope,
      ownerKey: owner.key,
      items: [],
      updatedAt: nowIso(),
      version: 0,
    }
    db.carts.push(cart)
  }
  return cart
}

const emptyCart = () =>
  json({
    id: 'cart_anonymous',
    scope: 'guest',
    items: [],
    itemCount: 0,
    subtotal: '0.00',
    updatedAt: nowIso(),
    version: 0,
  })

const availabilityError = (allowed: number, reason: string) =>
  fail(409, 'AVAILABILITY_CONFLICT', allowed === 0 ? 'Esta edição está esgotada.' : allowed === 1 ? 'Só resta 1 unidade desta edição.' : `Só restam ${allowed} unidades desta edição.`, {
    details: { allowed, reason },
  })

export const cartHandlers = [
  http.get(`${API_PREFIX}/cart`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const owner = resolveOwner(request)
    if (owner instanceof Response) return owner
    if (!owner) return emptyCart()
    const cart = mutate((db) => findOrCreateCart(db, owner))
    return json(toCart(cart, getDb()))
  }),

  http.post(`${API_PREFIX}/cart/items`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const owner = resolveOwner(request)
    if (owner instanceof Response) return owner
    if (!owner) return fail(400, 'VALIDATION_ERROR', 'Carrinho não identificado.')
    const parsed = await parseBody(request, addCartItemSchema)
    if (!parsed.ok) return parsed.response
    const { nftId, editionId, quantity } = parsed.data
    const db = getDb()
    const nft = db.nfts.find((n) => n.id === nftId)
    const edition = nft?.editions.find((e) => e.id === editionId)
    if (!nft || !edition) return fail(404, 'NOT_FOUND', 'Edição não encontrada.')
    const cart = findOrCreateCart(db, owner)
    const existing = cart.items.find((i) => i.editionId === editionId)
    const requested = (existing?.quantity ?? 0) + quantity
    const check = checkAvailability({
      requested,
      available: edition.available,
      maxPerOrder: edition.maxPerOrder,
    })
    if (!check.ok) return availabilityError(check.allowed, check.reason)
    const updated = mutate((current) => {
      const target = findOrCreateCart(current, owner)
      const item = target.items.find((i) => i.editionId === editionId)
      if (item) item.quantity = requested
      else target.items.push({ id: nextId('ci'), nftId, editionId, quantity, addedAt: nowIso() })
      target.version += 1
      target.updatedAt = nowIso()
      return target
    })
    return json(toCart(updated, getDb()), { status: 201 })
  }),

  http.patch(`${API_PREFIX}/cart/items/:itemId`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const owner = resolveOwner(request)
    if (owner instanceof Response) return owner
    if (!owner) return fail(400, 'VALIDATION_ERROR', 'Carrinho não identificado.')
    const parsed = await parseBody(request, updateCartItemSchema)
    if (!parsed.ok) return parsed.response
    const db = getDb()
    const cart = findOrCreateCart(db, owner)
    const item = cart.items.find((i) => i.id === params.itemId)
    if (!item) return fail(404, 'NOT_FOUND', 'Item não está no carrinho.')
    const edition = db.nfts.find((n) => n.id === item.nftId)?.editions.find((e) => e.id === item.editionId)
    if (!edition) return fail(404, 'NOT_FOUND', 'Edição não encontrada.')
    const check = checkAvailability({
      requested: parsed.data.quantity,
      available: edition.available,
      maxPerOrder: edition.maxPerOrder,
    })
    if (!check.ok) return availabilityError(check.allowed, check.reason)
    const updated = mutate((current) => {
      const target = findOrCreateCart(current, owner)
      const line = target.items.find((i) => i.id === params.itemId)
      if (line) line.quantity = parsed.data.quantity
      target.version += 1
      target.updatedAt = nowIso()
      return target
    })
    return json(toCart(updated, getDb()))
  }),

  http.delete(`${API_PREFIX}/cart/items/:itemId`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const owner = resolveOwner(request)
    if (owner instanceof Response) return owner
    if (!owner) return fail(400, 'VALIDATION_ERROR', 'Carrinho não identificado.')
    const updated = mutate((current) => {
      const target = findOrCreateCart(current, owner)
      target.items = target.items.filter((i) => i.id !== params.itemId)
      target.version += 1
      target.updatedAt = nowIso()
      return target
    })
    return json(toCart(updated, getDb()))
  }),
]
