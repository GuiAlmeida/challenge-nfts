import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from './auth'
import { ensNameSchema } from './common'

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60, 'Máximo de 60 caracteres'),
  username: usernameSchema,
  email: emailSchema,
  walletAlias: z.string().trim().max(40, 'Máximo de 40 caracteres').optional().or(z.literal('')),
  ens: ensNameSchema.optional().or(z.literal('')),
})
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: passwordSchema,
})
export type PasswordChange = z.infer<typeof passwordChangeSchema>

export const avatarUploadSchema = z.object({
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, 'Envie PNG, JPEG ou WebP')
    .max(280_000, 'Imagem até 200 KB'),
})
export type AvatarUpload = z.infer<typeof avatarUploadSchema>
