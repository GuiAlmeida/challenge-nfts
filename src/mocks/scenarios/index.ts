import { parseEth } from '@/lib/eth'
import { nextId, nowIso } from '../db/store'
import type { Scenario } from './types'

const THIRTY_MIN = 30 * 60_000

const base: Omit<Scenario, 'name' | 'description'> = {
  seed: 1,
  latency: { min: 120, max: 420 },
  failures: [],
  sessionTtlMs: THIRTY_MIN,
  order: { outcome: 'confirmed', delayMs: 3_000, responseDelayMs: 0 },
}

const scenario = (name: string, description: string, patch: Partial<Scenario> = {}): Scenario => ({
  ...base,
  ...patch,
  name,
  description,
})

const seedAnaCart: Scenario['seedPatch'] = (db) => {
  const items = [
    ['emerald-ape-042', 2],
    ['violet-nomad-314', 6],
    ['ivory-baron-088', 9],
  ] as const
  db.carts.push({
    id: 'cart_u_ana',
    scope: 'user',
    ownerKey: 'u_ana',
    items: items.map(([nftId, quantity]) => ({
      id: nextId('ci'),
      nftId,
      editionId: `${nftId}:1of50`,
      quantity,
      addedAt: nowIso(),
    })),
    updatedAt: nowIso(),
    version: 1,
  })
  for (const [nftId] of items) {
    const nft = db.nfts.find((n) => n.id === nftId)
    const edition = nft?.editions.find((e) => e.id === `${nftId}:1of50`)
    if (edition && edition.available < 10) edition.available = 10
  }
  void parseEth
}

export const SCENARIOS: Scenario[] = [
  scenario('default', 'Sucesso com latência leve; pagamento confirmado em 3 s.'),
  scenario('slow', 'Latência alta (1,5–3 s) para ver skeletons.', { latency: { min: 1_500, max: 3_000 } }),
  scenario('out-of-order', 'Primeira listagem demora 1,5 s, a segunda 200 ms: respostas fora de ordem.', {
    latency: 150,
    latencyOverrides: [{ path: /^\/nfts$/, sequence: [1_500, 200, 1_200, 150] }],
  }),
  scenario('offline', 'Toda chamada REST falha como erro de rede.', {
    failures: [{ path: /.*/, kind: 'network' }],
  }),
  scenario('http-errors', 'Catálogo responde 500 duas vezes e depois recupera; favoritos sempre 500; adicionar ao carrinho 503 uma vez.', {
    failures: [
      {
        method: 'GET',
        path: /^\/nfts$/,
        status: 500,
        code: 'UNAVAILABLE',
        message: 'Falha transitória no catálogo.',
        times: 2,
      },
      {
        method: 'PUT',
        path: /^\/me\/favorites\//,
        status: 500,
        code: 'UNAVAILABLE',
        message: 'Não foi possível salvar o favorito.',
      },
      {
        method: 'DELETE',
        path: /^\/me\/favorites\//,
        status: 500,
        code: 'UNAVAILABLE',
        message: 'Não foi possível remover o favorito.',
      },
      {
        method: 'POST',
        path: /^\/cart\/items$/,
        status: 503,
        code: 'UNAVAILABLE',
        message: 'Serviço indisponível.',
        times: 1,
      },
    ],
  }),
  scenario('session-expired', 'Sessão expira em 15 s após o login.', { sessionTtlMs: 15_000 }),
  scenario('register-conflict', 'Cadastro sempre conflita (e-mail já usado).', {
    failures: [
      {
        method: 'POST',
        path: /^\/auth\/register$/,
        status: 409,
        code: 'EMAIL_TAKEN',
        message: 'Este e-mail já está cadastrado.',
      },
    ],
  }),
  scenario('coupon', 'Cupons: KURIO10 válido, LANCAMENTO5 válido, EXPIRADO vencido, demais inválidos.'),
  scenario('price-change', 'Cinco segundos após cotar, o preço do primeiro item do carrinho sobe 10% via nft.updated.', {
    afterQuote: [{ afterQuoteMs: 5_000, change: 'price-up' }],
  }),
  scenario('sold-out', 'Cinco segundos após cotar, a edição do primeiro item esgota via nft.updated.', {
    afterQuote: [{ afterQuoteMs: 5_000, change: 'sold-out' }],
  }),
  scenario('order-timeout', 'POST /orders demora 15 s (acima do timeout do cliente); o pedido existe e o retry com a mesma chave o recupera.', {
    order: { outcome: 'confirmed', delayMs: 3_000, responseDelayMs: 15_000 },
  }),
  scenario('payment-declined', 'Pagamento recusado 3 s após o envio.', {
    order: { outcome: 'declined', delayMs: 3_000, responseDelayMs: 0 },
  }),
  scenario('payment-confirmed', 'Pagamento confirmado 3 s após o envio.'),
  scenario('cart-seeded', 'Carrinho da Ana pré-carregado com os 3 itens do Figma.', {
    seedPatch: seedAnaCart,
  }),
]

export const DEFAULT_SCENARIO_NAME = 'default'

export const findScenario = (name: string): Scenario | undefined => SCENARIOS.find((s) => s.name === name)
