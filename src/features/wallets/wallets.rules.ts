import type { DefaultValues } from 'react-hook-form'
import type { PublicUser } from '@/contracts/auth'
import type { Wallet, WalletInput } from '@/contracts/wallet'
import type { WalletFormOutput, WalletFormValues } from './schemas'

export function walletFormFrom(wallet: Wallet): WalletFormValues {
  return {
    displayName: wallet.displayName,
    alias: wallet.alias,
    network: wallet.network,
    profileName: wallet.profileName,
    address: wallet.address,
    secondaryAddress: wallet.secondaryAddress ?? '',
    provider: wallet.provider,
    referralCode: wallet.referralCode ?? '',
    email: wallet.email,
    ens: wallet.ens ?? '',
  }
}

export function newWalletForm(user: PublicUser, copyFrom?: Wallet): DefaultValues<WalletFormValues> {
  if (copyFrom) return walletFormFrom(copyFrom)
  return {
    displayName: user.displayName,
    alias: '',
    profileName: user.displayName,
    address: '',
    secondaryAddress: '',
    referralCode: '',
    email: user.email,
    ens: '',
  }
}

export function walletPayload(values: WalletFormOutput): WalletInput {
  const { ens, ...rest } = values
  return values.network === 'ethereum' ? { ...rest, ens } : rest
}

export function upsertWallet(list: readonly Wallet[] | undefined, wallet: Wallet): Wallet[] {
  const current = list ?? []
  return current.some((w) => w.id === wallet.id) ? current.map((w) => (w.id === wallet.id ? wallet : w)) : [...current, wallet]
}
