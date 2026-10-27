import { z } from 'zod'
import { ethStringSchema, idSchema, isoDateSchema, networkSchema } from './common'
import { nftImageSchema } from './nft'

export const quoteRequestSchema = z.object({
  couponCode: z.string().trim().max(32).nullable().optional(),
})
export type QuoteRequest = z.infer<typeof quoteRequestSchema>

export const quoteLineSchema = z.object({
  itemId: idSchema,
  nftId: idSchema,
  editionId: idSchema,
  name: z.string().min(1),
  tokenId: z.string().min(1),
  editionLabel: z.string().min(1),
  image: nftImageSchema,
  network: networkSchema,
  unitPrice: ethStringSchema,
  quantity: z.number().int().positive(),
  lineTotal: ethStringSchema,
  available: z.number().int().nonnegative(),
})
export type QuoteLine = z.infer<typeof quoteLineSchema>

export const couponStateSchema = z.object({
  code: z.string(),
  discountBps: z.number().int().nonnegative(),
  label: z.string(),
})

export const quoteSchema = z.object({
  quoteId: idSchema,
  version: z.number().int().nonnegative(),
  cartId: idSchema,
  cartVersion: z.number().int().nonnegative(),
  fingerprint: z.string().min(1),
  createdAt: isoDateSchema,
  expiresAt: isoDateSchema,
  lines: z.array(quoteLineSchema),
  subtotal: ethStringSchema,
  discount: ethStringSchema,
  networkFee: ethStringSchema,
  networkFees: z.array(z.object({ network: networkSchema, fee: ethStringSchema })),
  total: ethStringSchema,
  coupon: couponStateSchema.nullable(),
})
export type Quote = z.infer<typeof quoteSchema>
