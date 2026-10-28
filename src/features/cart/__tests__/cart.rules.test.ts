import { describe, expect, it } from 'vitest'
import type { Cart, CartItem } from '@/contracts/cart'
import type { Quote } from '@/contracts/quote'
import { applyNftUpdateToCart, describeChange, isQuoteStale, maxQuantity, removeItem, setItemQuantity } from '../cart.rules'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'ci_1',
  nftId: 'emerald-ape-042',
  editionId: 'emerald-ape-042:1of10',
  name: 'Emerald Ape #042',
  tokenId: '#0042',
  editionLabel: '1/10',
  image: { slug: 'ape-emerald', alt: '' },
  network: 'ethereum',
  unitPrice: '1.19',
  quantity: 2,
  available: 7,
  maxPerOrder: 10,
  lineTotal: '2.38',
  nftVersion: 1,
  ...overrides,
})

const cart = (items: CartItem[]): Cart => ({
  id: 'cart_1',
  scope: 'guest',
  items,
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: '2.38',
  updatedAt: '2026-10-27T00:00:00.000Z',
  version: 1,
})

describe('quantidade', () => {
  it('limita pelo menor entre disponível e máximo por pedido', () => {
    expect(maxQuantity({ available: 3, maxPerOrder: 10 })).toBe(3)
    expect(maxQuantity({ available: 50, maxPerOrder: 10 })).toBe(10)
  })
  it('recalcula totais em BigInt ao mudar quantidade ou remover', () => {
    const next = setItemQuantity(cart([item()]), 'ci_1', 3)
    expect(next.items[0]?.lineTotal).toBe('3.57')
    expect(next.subtotal).toBe('3.57')
    expect(next.itemCount).toBe(3)
    expect(removeItem(next, 'ci_1').items).toHaveLength(0)
  })
})

describe('applyNftUpdateToCart', () => {
  it('aplica preço e disponibilidade só para versão maior e registra a mudança', () => {
    const payload = { price: '1.309', editions: [{ id: 'emerald-ape-042:1of10', price: '1.309', available: 5 }] }
    const result = applyNftUpdateToCart(cart([item()]), 'emerald-ape-042', 2, payload)
    expect(result.cart.items[0]?.unitPrice).toBe('1.309')
    expect(result.cart.items[0]?.lineTotal).toBe('2.618')
    expect(result.changes).toHaveLength(1)
    expect(describeChange(result.changes[0]!)).toBe('Preço de Emerald Ape #042 mudou de 1.19 para 1.309 ETH.')
    const stale = applyNftUpdateToCart(result.cart, 'emerald-ape-042', 1, { price: '9.00', editions: payload.editions })
    expect(stale.changes).toHaveLength(0)
    expect(stale.cart).toBe(result.cart)
  })
  it('descreve esgotamento', () => {
    const result = applyNftUpdateToCart(cart([item()]), 'emerald-ape-042', 3, {
      editions: [{ id: 'emerald-ape-042:1of10', price: '1.19', available: 0 }],
    })
    expect(describeChange(result.changes[0]!)).toBe('Emerald Ape #042 esgotou.')
  })
})

describe('isQuoteStale', () => {
  const quote = {
    lines: [{ itemId: 'ci_1', quantity: 2, unitPrice: '1.19', available: 7 }],
  } as unknown as Quote
  it('é falso quando linhas e carrinho batem', () => {
    expect(isQuoteStale(quote, cart([item()]))).toBe(false)
  })
  it('é verdadeiro quando preço, quantidade, disponibilidade ou itens divergem', () => {
    expect(isQuoteStale(quote, cart([item({ unitPrice: '1.309' })]))).toBe(true)
    expect(isQuoteStale(quote, cart([item({ quantity: 3 })]))).toBe(true)
    expect(isQuoteStale(quote, cart([item({ available: 0 })]))).toBe(true)
    expect(isQuoteStale(quote, cart([]))).toBe(true)
  })
})
