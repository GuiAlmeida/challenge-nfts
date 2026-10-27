import { type AddCartItem, type Cart, cartSchema } from '@/contracts/cart'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const fetchCart = async (signal?: AbortSignal): Promise<Cart> => parseInDev(cartSchema, await http.get<Cart>('/cart', undefined, { signal }))

export const addCartItem = async (body: AddCartItem): Promise<Cart> => parseInDev(cartSchema, await http.post<Cart>('/cart/items', body))
