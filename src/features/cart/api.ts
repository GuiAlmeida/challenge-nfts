import { type AddCartItem, type Cart, cartSchema } from '@/contracts/cart'
import { type Quote, quoteSchema } from '@/contracts/quote'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const fetchCart = async (signal?: AbortSignal): Promise<Cart> => parseInDev(cartSchema, await http.get<Cart>('/cart', undefined, { signal }))

export const addCartItem = async (body: AddCartItem): Promise<Cart> => parseInDev(cartSchema, await http.post<Cart>('/cart/items', body))

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> =>
  parseInDev(cartSchema, await http.patch<Cart>(`/cart/items/${encodeURIComponent(itemId)}`, { quantity }))

export const removeCartItem = async (itemId: string): Promise<Cart> =>
  parseInDev(cartSchema, await http.delete<Cart>(`/cart/items/${encodeURIComponent(itemId)}`))

export const requestQuote = async (couponCode: string | null, signal?: AbortSignal): Promise<Quote> =>
  parseInDev(quoteSchema, await http.post<Quote>('/cart/quote', { couponCode }, { signal }))
