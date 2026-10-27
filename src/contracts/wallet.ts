import { z } from 'zod'
import { emailSchema } from './auth'
import { ensNameSchema, idSchema, isoDateSchema, networkSchema, walletAddressSchema, walletProviderSchema } from './common'

export const walletKindSchema = z.enum(['primary', 'secondary'])
export type WalletKind = z.infer<typeof walletKindSchema>

export const walletInputSchema = z.object({
  displayName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60),
  alias: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(40),
  network: networkSchema,
  profileName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60),
  address: walletAddressSchema,
  secondaryAddress: z.union([walletAddressSchema, ensNameSchema, z.literal('')]).optional(),
  provider: walletProviderSchema,
  referralCode: z.string().trim().max(32).optional().or(z.literal('')),
  email: emailSchema,
  ens: ensNameSchema.optional().or(z.literal('')),
})
export type WalletInput = z.infer<typeof walletInputSchema>

export const walletCreateSchema = walletInputSchema.extend({ kind: walletKindSchema })
export type WalletCreate = z.infer<typeof walletCreateSchema>

export const walletUpdateSchema = walletInputSchema.partial()
export type WalletUpdate = z.infer<typeof walletUpdateSchema>

export const walletSchema = walletInputSchema.extend({
  id: idSchema,
  userId: idSchema,
  kind: walletKindSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  version: z.number().int().nonnegative(),
})
export type Wallet = z.infer<typeof walletSchema>
