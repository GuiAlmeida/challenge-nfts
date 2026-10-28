import { z } from 'zod'
import { checkoutCustomerSchema } from '@/contracts/order'

export const checkoutFormSchema = checkoutCustomerSchema.extend({
  walletId: z.string().min(1, 'Selecione uma carteira'),
})
export type CheckoutForm = z.input<typeof checkoutFormSchema>
export type CheckoutFormOutput = z.output<typeof checkoutFormSchema>
