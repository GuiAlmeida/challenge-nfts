import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from '@/contracts/auth'
import { ensNameSchema } from '@/contracts/common'

/** Zod 4 skips object refinements once any field fails; `when` keeps the password checks running alongside field errors. */
export const profileFormSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(60, 'Máximo de 60 caracteres'),
    username: usernameSchema,
    email: emailSchema,
    ens: z
      .string()
      .trim()
      .refine((value) => value === '' || ensNameSchema.safeParse(value).success, 'Use um nome terminado em .eth'),
    walletAlias: z.string().trim().max(40, 'Máximo de 40 caracteres'),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine(
    (values, ctx) => {
      if (!values.currentPassword && !values.newPassword && !values.confirmPassword) return
      if (!values.currentPassword) ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Informe a senha atual' })
      const strength = passwordSchema.safeParse(values.newPassword)
      if (!strength.success) {
        ctx.addIssue({ code: 'custom', path: ['newPassword'], message: strength.error.issues[0]?.message ?? 'Senha inválida' })
      }
      if (values.confirmPassword !== values.newPassword) {
        ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'As senhas não conferem' })
      }
    },
    { when: () => true },
  )

export type ProfileFormValues = z.input<typeof profileFormSchema>
export type ProfileFormOutput = z.output<typeof profileFormSchema>
