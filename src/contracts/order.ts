import { z } from 'zod'
import { emailSchema } from './auth'
import { ensNameSchema, ethStringSchema, idSchema, isoDateSchema, networkSchema, walletAddressSchema, walletProviderSchema } from './common'
import { nftImageSchema } from './nft'
import { couponStateSchema } from './quote'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const checkoutCustomerSchema = z.object({
  displayName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60),
  username: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(20),
  profileName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60),
  email: emailSchema,
  network: networkSchema,
  walletAddress: walletAddressSchema,
  walletProvider: walletProviderSchema,
  secondaryAddress: z.union([walletAddressSchema, ensNameSchema, z.literal('')]).optional(),
  referralCode: z.string().trim().max(32).optional().or(z.literal('')),
  ens: ensNameSchema.optional().or(z.literal('')),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})
export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>

export const createOrderSchema = z.object({
  quoteId: idSchema,
  quoteVersion: z.number().int().nonnegative(),
  walletId: idSchema,
  network: networkSchema,
  customer: checkoutCustomerSchema,
})
export type CreateOrder = z.infer<typeof createOrderSchema>

export const receiptItemSchema = z.object({
  nftId: idSchema,
  name: z.string(),
  tokenId: z.string(),
  editionLabel: z.string(),
  image: nftImageSchema,
  quantity: z.number().int().positive(),
  unitPrice: ethStringSchema,
  lineTotal: ethStringSchema,
})

export const receiptSchema = z.object({
  items: z.array(receiptItemSchema),
  subtotal: ethStringSchema,
  discount: ethStringSchema,
  networkFee: ethStringSchema,
  total: ethStringSchema,
  coupon: couponStateSchema.nullable(),
  wallet: z.object({ label: z.string(), provider: walletProviderSchema, address: walletAddressSchema }),
  network: networkSchema,
})
export type Receipt = z.infer<typeof receiptSchema>

export const orderSchema = z.object({
  id: idSchema,
  userId: idSchema,
  status: orderStatusSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  confirmedAt: isoDateSchema.nullable(),
  txHash: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  declineReason: z.string().nullable(),
  receipt: receiptSchema,
  version: z.number().int().nonnegative(),
})
export type Order = z.infer<typeof orderSchema>

export const orderListSchema = z.object({ items: z.array(orderSchema) })
