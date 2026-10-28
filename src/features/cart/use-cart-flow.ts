import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { CartItem } from '@/contracts/cart'
import type { Quote } from '@/contracts/quote'
import { isApiError } from '@/lib/api-error'
import { isQuoteStale } from './cart.rules'
import { useCartUiStore } from './cart-ui-store'
import { cartKeys, quoteKeys } from './queries/keys'
import { useCart } from './queries/use-cart'
import { useQuote } from './queries/use-quote'
import { useRemoveCartItem, useUpdateCartItem } from './use-cart-mutations'

interface AvailabilityIssue {
  message: string
  itemId: string | null
  allowed: number | null
}

const readAvailabilityIssue = (error: unknown): AvailabilityIssue | null => {
  if (!isApiError(error) || error.code !== 'AVAILABILITY_CONFLICT') return null
  const details = (error.details ?? {}) as { itemId?: string; allowed?: number }
  return { message: error.message, itemId: details.itemId ?? null, allowed: details.allowed ?? null }
}

export function useCartFlow() {
  const queryClient = useQueryClient()
  const cart = useCart()
  const [couponDraft, setCouponDraft] = useState('')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const items = cart.data?.items ?? []
  const quote = useQuote(couponCode, items.length > 0)
  const [lastQuote, setLastQuote] = useState<Quote | undefined>(undefined)
  if (quote.data && quote.data !== lastQuote) setLastQuote(quote.data)
  const displayQuote = quote.data ?? (items.length > 0 ? lastQuote : undefined)
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const priceChanges = useCartUiStore((s) => s.priceChanges)
  const acknowledge = useCartUiStore((s) => s.acknowledge)

  const couponError = isApiError(quote.error) && quote.error.fields?.couponCode ? quote.error.fields.couponCode : null
  const availabilityIssue = readAvailabilityIssue(quote.error)
  const quoteOutdated = Boolean(displayQuote && cart.data && isQuoteStale(displayQuote, cart.data))
  const quoteError = quote.isError && !couponError && !availabilityIssue ? quote.error : null

  const refreshSummary = () => {
    acknowledge()
    void queryClient.invalidateQueries({ queryKey: cartKeys.all })
    void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
  }

  return {
    cart,
    items,
    quote,
    displayQuote,
    couponDraft,
    setCouponDraft,
    appliedCoupon: displayQuote?.coupon?.code ?? null,
    couponError,
    applyCoupon: () => setCouponCode(couponDraft.trim().toUpperCase() || null),
    removeCoupon: () => {
      setCouponCode(null)
      setCouponDraft('')
    },
    setQuantity: (item: CartItem, quantity: number) => update.mutate({ itemId: item.id, quantity }),
    removeItem: (item: CartItem) => remove.mutate({ itemId: item.id, name: item.name }),
    availabilityIssue,
    quoteError,
    retryQuote: () => void quote.refetch(),
    fixAvailability: () => {
      if (!availabilityIssue?.itemId) return
      const item = items.find((i) => i.id === availabilityIssue.itemId)
      if (!item) return
      if (!availabilityIssue.allowed) remove.mutate({ itemId: item.id, name: item.name })
      else update.mutate({ itemId: item.id, quantity: availabilityIssue.allowed })
    },
    priceChanges,
    quoteOutdated,
    refreshSummary,
    mutating: update.isPending || remove.isPending,
  }
}
