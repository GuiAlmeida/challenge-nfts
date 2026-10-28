import type { Cart, CartItem } from '@/contracts/cart'
import type { NftUpdatedPayload } from '@/contracts/events'
import type { Quote } from '@/contracts/quote'
import { compareEth, formatEth, mulQty, parseEth, sumWei } from '@/lib/eth'

export interface PriceChange {
  itemId: string
  nftId: string
  name: string
  previousPrice: string
  price: string
  available: number
}

export const maxQuantity = (item: Pick<CartItem, 'available' | 'maxPerOrder'>): number => Math.max(0, Math.min(item.available, item.maxPerOrder))

export const lineTotal = (unitPrice: string, quantity: number): string => formatEth(mulQty(parseEth(unitPrice), quantity))

export function withItems(cart: Cart, items: CartItem[]): Cart {
  return {
    ...cart,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: formatEth(sumWei(items.map((item) => parseEth(item.lineTotal)))),
  }
}

export function setItemQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  return withItems(
    cart,
    cart.items.map((item) => (item.id === itemId ? { ...item, quantity, lineTotal: lineTotal(item.unitPrice, quantity) } : item)),
  )
}

export function removeItem(cart: Cart, itemId: string): Cart {
  return withItems(
    cart,
    cart.items.filter((item) => item.id !== itemId),
  )
}

export function applyNftUpdateToCart(cart: Cart, nftId: string, version: number, payload: NftUpdatedPayload): { cart: Cart; changes: PriceChange[] } {
  const changes: PriceChange[] = []
  const items = cart.items.map((item) => {
    if (item.nftId !== nftId || item.nftVersion >= version) return item
    const edition = payload.editions?.find((e) => e.id === item.editionId)
    if (!edition) return { ...item, nftVersion: version }
    const next: CartItem = {
      ...item,
      unitPrice: edition.price,
      available: edition.available,
      nftVersion: version,
      lineTotal: lineTotal(edition.price, item.quantity),
    }
    if (compareEth(next.unitPrice, item.unitPrice) !== 0 || next.available !== item.available) {
      changes.push({
        itemId: item.id,
        nftId,
        name: item.name,
        previousPrice: item.unitPrice,
        price: next.unitPrice,
        available: next.available,
      })
    }
    return next
  })
  return { cart: changes.length ? withItems(cart, items) : cart, changes }
}

export function isQuoteStale(quote: Quote, cart: Cart): boolean {
  if (quote.lines.length !== cart.items.length) return true
  return cart.items.some((item) => {
    const line = quote.lines.find((l) => l.itemId === item.id)
    return !line || line.quantity !== item.quantity || compareEth(line.unitPrice, item.unitPrice) !== 0 || line.available !== item.available
  })
}

export function describeChange(change: PriceChange): string {
  if (change.available === 0) return `${change.name} esgotou.`
  if (compareEth(change.price, change.previousPrice) !== 0) {
    return `Preço de ${change.name} mudou de ${formatEth(parseEth(change.previousPrice))} para ${formatEth(parseEth(change.price))} ETH.`
  }
  return `${change.name} agora tem ${change.available} ${change.available === 1 ? 'unidade' : 'unidades'}.`
}
