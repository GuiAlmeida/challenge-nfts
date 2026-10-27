import { z } from 'zod'
import { ethStringSchema, idSchema, isoDateSchema, networkSchema, quantitySchema } from './common'
import { nftImageSchema } from './nft'

export const cartScopeSchema = z.enum(['guest', 'user'])

export const cartItemSchema = z.object({
  id: idSchema,
  nftId: idSchema,
  editionId: idSchema,
  name: z.string().min(1),
  tokenId: z.string().min(1),
  editionLabel: z.string().min(1),
  image: nftImageSchema,
  network: networkSchema,
  unitPrice: ethStringSchema,
  quantity: quantitySchema,
  available: z.number().int().nonnegative(),
  maxPerOrder: z.number().int().positive(),
  lineTotal: ethStringSchema,
  nftVersion: z.number().int().nonnegative(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  id: idSchema,
  scope: cartScopeSchema,
  items: z.array(cartItemSchema),
  itemCount: z.number().int().nonnegative(),
  subtotal: ethStringSchema,
  updatedAt: isoDateSchema,
  version: z.number().int().nonnegative(),
  merged: z.boolean().optional(),
})
export type Cart = z.infer<typeof cartSchema>

export const addCartItemSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  quantity: quantitySchema,
})
export type AddCartItem = z.infer<typeof addCartItemSchema>

export const updateCartItemSchema = z.object({ quantity: quantitySchema })
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>
