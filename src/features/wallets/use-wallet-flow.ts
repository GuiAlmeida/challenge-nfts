import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type DefaultValues, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { Wallet, WalletKind } from '@/contracts/wallet'
import { applyApiErrorToForm } from '@/features/auth'
import { createWallet, updateWallet } from './api'
import { walletKeys } from './queries/keys'
import { type WalletFormOutput, type WalletFormValues, walletFormSchema } from './schemas'
import { upsertWallet, walletFormFrom, walletPayload } from './wallets.rules'

const SAVED_MESSAGE: Record<WalletKind, string> = {
  primary: 'Carteira principal salva.',
  secondary: 'Carteira secundária salva.',
}

export function useWalletFlow({
  userId,
  kind,
  wallet,
  defaults,
}: {
  userId: string
  kind: WalletKind
  wallet: Wallet | undefined
  defaults: DefaultValues<WalletFormValues>
}) {
  const queryClient = useQueryClient()
  const form = useForm<WalletFormValues, unknown, WalletFormOutput>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: wallet ? walletFormFrom(wallet) : defaults,
  })
  const network = useWatch({ control: form.control, name: 'network' })
  const mutation = useMutation({
    mutationFn: (values: WalletFormOutput) =>
      wallet ? updateWallet(wallet.id, walletPayload(values)) : createWallet({ ...walletPayload(values), kind }),
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      const saved = await mutation.mutateAsync(values)
      queryClient.setQueryData<Wallet[]>(walletKeys.list(userId), (list) => upsertWallet(list, saved))
      form.reset(walletFormFrom(saved))
      toast.success(SAVED_MESSAGE[kind], { id: `wallet-saved:${kind}` })
    } catch (error) {
      applyApiErrorToForm(form, error)
    }
  })

  return { form, submit, network, pending: mutation.isPending }
}

export type WalletFlow = ReturnType<typeof useWalletFlow>
