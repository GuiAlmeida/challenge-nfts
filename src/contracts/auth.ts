import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'

export const emailSchema = z.string().trim().toLowerCase().email('Informe um e-mail válido')
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Mínimo de 3 caracteres')
  .max(20, 'Máximo de 20 caracteres')
  .regex(/^[a-z0-9_]+$/i, 'Use letras, números e _')
export const passwordSchema = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[a-zA-Z]/, 'Inclua ao menos uma letra')
  .regex(/\d/, 'Inclua ao menos um número')

export const registerBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})
export type RegisterBody = z.infer<typeof registerBodySchema>

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe a senha'),
})
export type LoginBody = z.infer<typeof loginBodySchema>

export const publicUserSchema = z.object({
  id: idSchema,
  email: emailSchema,
  username: usernameSchema,
  displayName: z.string().min(1),
  avatarUrl: z.string().nullable(),
  ens: z.string().nullable(),
  walletAlias: z.string().nullable(),
  createdAt: isoDateSchema,
  version: z.number().int().nonnegative(),
})
export type PublicUser = z.infer<typeof publicUserSchema>

export const sessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: isoDateSchema,
  user: publicUserSchema,
  cartMerged: z.boolean().optional(),
})
export type Session = z.infer<typeof sessionSchema>
