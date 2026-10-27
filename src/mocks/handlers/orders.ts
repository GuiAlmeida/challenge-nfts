import { delay, http } from 'msw'
import { createOrderSchema } from '@/contracts/order'
import type { Receipt } from '@/contracts/order'
import { getDb, mutate, nextId, nowIso } from '../db/store'
import type { OrderRecord } from '../db/schema'
import { scheduleOrderResolution } from '../orders/lifecycle'
import { evaluateIdempotency, hashBody } from '../rules/idempotency.rules'
import { getScenario } from '../scenarios/runtime'
import { toOrder } from '../serializers'
import { buildQuote } from './quote'
import { API_PREFIX, applyScenario, authenticate, fail, json, parseBody } from './shared'

export const orderHandlers = [
  http.post(`${API_PREFIX}/orders`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const idempotencyKey = request.headers.get('idempotency-key')?.trim()
    if (!idempotencyKey) return fail(400, 'VALIDATION_ERROR', 'Cabeçalho Idempotency-Key obrigatório.')
    const rawBody: unknown = await request
      .clone()
      .json()
      .catch(() => null)
    const bodyHash = hashBody(rawBody)
    const db = getDb()
    const existing = db.idempotency.find((r) => r.key === idempotencyKey && r.userId === auth.user.id)
    const outcome = evaluateIdempotency(existing, auth.user.id, bodyHash)
    if (outcome.kind === 'conflict') return fail(409, 'IDEMPOTENCY_CONFLICT', 'Esta chave já foi usada com outro conteúdo.')
    if (outcome.kind === 'replay') {
      const order = db.orders.find((o) => o.id === outcome.orderId)
      if (order) return json(toOrder(order), { status: 200 })
    }
    const parsed = await parseBody(request, createOrderSchema)
    if (!parsed.ok) return parsed.response
    const body = parsed.data
    const stored = db.quotes.find((q) => q.quote.quoteId === body.quoteId)
    if (!stored || stored.userId !== auth.user.id) return fail(409, 'QUOTE_OUTDATED', 'Cotação não encontrada. Atualize o resumo.')
    const fresh = buildQuote(db, { scope: 'user', key: auth.user.id }, stored.couponCode)
    if (!fresh.ok) return fresh.response
    if (fresh.quote.fingerprint !== stored.quote.fingerprint || stored.quote.version !== body.quoteVersion) {
      mutate((current) => {
        current.quotes.push({ quote: fresh.quote, userId: auth.user.id, couponCode: stored.couponCode })
      })
      return fail(409, 'QUOTE_OUTDATED', 'Preços ou disponibilidade mudaram. Revise e confirme novamente.', {
        details: { quote: fresh.quote },
      })
    }
    const wallet = db.wallets.find((w) => w.id === body.walletId && w.userId === auth.user.id)
    if (!wallet)
      return fail(422, 'VALIDATION_ERROR', 'Carteira não encontrada.', {
        fields: { walletId: 'Selecione uma carteira cadastrada.' },
      })
    const scenario = getScenario()
    const receipt: Receipt = {
      items: fresh.quote.lines.map((line) => ({
        nftId: line.nftId,
        name: line.name,
        tokenId: line.tokenId,
        editionLabel: line.editionLabel,
        image: line.image,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
      subtotal: fresh.quote.subtotal,
      discount: fresh.quote.discount,
      networkFee: fresh.quote.networkFee,
      total: fresh.quote.total,
      coupon: fresh.quote.coupon,
      wallet: {
        label: wallet.alias,
        provider: body.customer.walletProvider,
        address: body.customer.walletAddress,
      },
      network: body.network,
    }
    const createdAt = nowIso()
    const order: OrderRecord = {
      id: nextId('ord'),
      userId: auth.user.id,
      status: 'pending',
      createdAt,
      updatedAt: createdAt,
      confirmedAt: null,
      txHash: null,
      explorerUrl: null,
      declineReason: null,
      receipt,
      version: 1,
      outcome: scenario.order.outcome,
      resolveAt: new Date(Date.now() + scenario.order.delayMs).toISOString(),
      quoteId: fresh.quote.quoteId,
      idempotencyKey,
      cartId: fresh.quote.cartId,
      consumed: fresh.quote.lines.map((line) => ({
        itemId: line.itemId,
        nftId: line.nftId,
        editionId: line.editionId,
        quantity: line.quantity,
      })),
    }
    mutate((current) => {
      current.orders.push(order)
      current.idempotency.push({
        key: idempotencyKey,
        userId: auth.user.id,
        bodyHash,
        orderId: order.id,
        createdAt,
      })
    })
    scheduleOrderResolution(order)
    if (scenario.order.responseDelayMs > 0) await delay(scenario.order.responseDelayMs)
    return json(toOrder(order), { status: 202 })
  }),

  http.get(`${API_PREFIX}/orders`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const items = getDb()
      .orders.filter((o) => o.userId === auth.user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toOrder)
    return json({ items })
  }),

  http.get(`${API_PREFIX}/orders/:id`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const order = getDb().orders.find((o) => o.id === params.id)
    if (!order) return fail(404, 'NOT_FOUND', 'Pedido não encontrado.')
    if (order.userId !== auth.user.id) return fail(403, 'FORBIDDEN', 'Este pedido pertence a outro colecionador.')
    return json(toOrder(order))
  }),
]
