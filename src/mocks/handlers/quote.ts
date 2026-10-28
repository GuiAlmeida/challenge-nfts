import { http } from 'msw'
import { quoteRequestSchema } from '@/contracts/quote'
import type { Quote, QuoteLine } from '@/contracts/quote'
import { formatEth, mulQty, parseEth } from '@/lib/eth'
import { getDb, mutate, nextId, nowIso } from '../db/store'
import type { MockDb } from '../db/schema'
import { touchNft } from '../events'
import { computeQuoteTotals, quoteFingerprint } from '../rules/quote.rules'
import { consumeAfterQuote, getScenario } from '../scenarios/runtime'
import { scheduleMock } from '../timers'
import { toCart } from '../serializers'
import { findOrCreateCart, resolveOwner, type CartOwner } from './cart'
import { API_PREFIX, applyScenario, fail, json, parseBody } from './shared'

const QUOTE_TTL_MS = 10 * 60_000

export type CouponLookup = { ok: true; coupon: { code: string; discountBps: number; label: string } | null } | { ok: false; response: Response }

export function lookupCoupon(db: MockDb, code: string | null | undefined): CouponLookup {
  const trimmed = code?.trim().toUpperCase()
  if (!trimmed) return { ok: true, coupon: null }
  const coupon = db.coupons.find((c) => c.code === trimmed)
  if (!coupon)
    return {
      ok: false,
      response: fail(422, 'COUPON_INVALID', 'Cupom inválido.', { fields: { couponCode: 'Cupom inválido.' } }),
    }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) {
    return {
      ok: false,
      response: fail(422, 'COUPON_EXPIRED', 'Este cupom expirou.', {
        fields: { couponCode: 'Este cupom expirou.' },
      }),
    }
  }
  return { ok: true, coupon: { code: coupon.code, discountBps: coupon.discountBps, label: coupon.label } }
}

export function buildQuote(
  db: MockDb,
  owner: NonNullable<CartOwner>,
  couponCode: string | null,
): { ok: true; quote: Quote } | { ok: false; response: Response } {
  const cart = findOrCreateCart(db, owner)
  const serialized = toCart(cart, db)
  if (serialized.items.length === 0) return { ok: false, response: fail(422, 'VALIDATION_ERROR', 'Seu carrinho está vazio.') }
  const unavailable = serialized.items.find((item) => item.quantity > item.available)
  if (unavailable) {
    return {
      ok: false,
      response: fail(409, 'AVAILABILITY_CONFLICT', `"${unavailable.name}" tem só ${unavailable.available} unidades disponíveis.`, {
        details: { itemId: unavailable.id, allowed: unavailable.available },
      }),
    }
  }
  const couponResult = lookupCoupon(db, couponCode)
  if (!couponResult.ok) return couponResult
  const lines: QuoteLine[] = serialized.items.map((item) => ({
    itemId: item.id,
    nftId: item.nftId,
    editionId: item.editionId,
    name: item.name,
    tokenId: item.tokenId,
    editionLabel: item.editionLabel,
    image: item.image,
    network: item.network,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: formatEth(mulQty(parseEth(item.unitPrice), item.quantity)),
    available: item.available,
  }))
  const totals = computeQuoteTotals(lines, couponResult.coupon?.discountBps ?? 0)
  const now = Date.now()
  const quote: Quote = {
    quoteId: nextId('q'),
    version: 1,
    cartId: cart.id,
    cartVersion: cart.version,
    fingerprint: quoteFingerprint(lines, couponResult.coupon?.code ?? null),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
    lines,
    ...totals,
    coupon: couponResult.coupon,
  }
  return { ok: true, quote }
}

function scheduleAfterQuote(quote: Quote): void {
  const first = quote.lines[0]
  if (!first) return
  for (const change of getScenario().afterQuote ?? []) {
    if (!consumeAfterQuote(change)) continue
    scheduleMock(() => {
      mutate((db) => {
        touchNft(db, first.nftId, (nft) => {
          const edition = nft.editions.find((e) => e.id === first.editionId)
          if (!edition) return
          if (change.change === 'price-up') {
            const bumped = formatEth((parseEth(edition.price) * 11n) / 10n)
            nft.previousPrice = edition.price
            for (const e of nft.editions) if (e.id === edition.id || e.kind !== 'unique') e.price = bumped
          } else {
            edition.available = 0
          }
        })
      })
    }, change.afterQuoteMs)
  }
}

export const quoteHandlers = [
  http.post(`${API_PREFIX}/cart/quote`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const owner = resolveOwner(request)
    if (owner instanceof Response) return owner
    if (!owner) return fail(400, 'VALIDATION_ERROR', 'Carrinho não identificado.')
    const parsed = await parseBody(request, quoteRequestSchema)
    if (!parsed.ok) return parsed.response
    const result = buildQuote(getDb(), owner, parsed.data.couponCode ?? null)
    if (!result.ok) return result.response
    mutate((db) => {
      db.quotes = db.quotes.filter((q) => new Date(q.quote.expiresAt).getTime() > Date.now()).slice(-50)
      db.quotes.push({
        quote: result.quote,
        userId: owner.scope === 'user' ? owner.key : null,
        couponCode: result.quote.coupon?.code ?? null,
      })
    })
    scheduleAfterQuote(result.quote)
    return json(result.quote)
  }),
]

void nowIso
