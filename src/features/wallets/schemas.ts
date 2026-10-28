import { z } from 'zod'
import { emailSchema } from '@/contracts/auth'
import { ensNameSchema, networkSchema, walletAddressSchema, walletProviderSchema } from '@/contracts/common'

const name = (max: number) => z.string().trim().min(2, 'Mínimo de 2 caracteres').max(max, `Máximo de ${max} caracteres`)

export const walletFormSchema = z
  .object({
    displayName: name(60),
    alias: name(40),
    network: z.enum(networkSchema.options, { error: 'Informe a rede' }),
    profileName: name(60),
    address: z.string().trim().min(1, 'Informe o endereço da carteira').pipe(walletAddressSchema),
    secondaryAddress: z.union([walletAddressSchema, ensNameSchema, z.literal('')], { error: 'Use um endereço 0x ou um nome .eth' }),
    provider: z.enum(walletProviderSchema.options, { error: 'Informe o tipo de carteira' }),
    referralCode: z.string().trim().max(32, 'Máximo de 32 caracteres'),
    email: emailSchema,
    ens: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.network === 'ethereum' && values.ens !== '' && !ensNameSchema.safeParse(values.ens).success) {
      ctx.addIssue({ code: 'custom', path: ['ens'], message: 'Use um nome terminado em .eth' })
    }
  })

export type WalletFormValues = z.input<typeof walletFormSchema>
export type WalletFormOutput = z.output<typeof walletFormSchema>
