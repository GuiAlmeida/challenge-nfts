import { z } from 'zod'
import { emailSchema, passwordSchema, usernameSchema } from '@/contracts/auth'

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe a senha'),
})
export type LoginForm = z.input<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })
export type RegisterForm = z.input<typeof registerFormSchema>
