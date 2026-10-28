import type { PublicUser } from '@/contracts/auth'
import type { Quote, QuoteLine } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'
import { compareEth } from '@/lib/eth'
import type { CheckoutForm } from './schemas'

export function prefillFrom(user: PublicUser, wallet: Wallet | undefined, draft: Partial<CheckoutForm> | null): CheckoutForm {
  const base: CheckoutForm = {
    displayName: user.displayName,
    username: user.username,
    profileName: wallet?.profileName ?? user.displayName,
    email: user.email,
    network: wallet?.network ?? 'ethereum',
    walletAddress: wallet?.address ?? '',
    walletProvider: wallet?.provider ?? 'metamask',
    secondaryAddress: wallet?.secondaryAddress ?? '',
    referralCode: wallet?.referralCode ?? '',
    ens: wallet?.ens || user.ens || '',
    note: '',
    walletId: wallet?.id ?? '',
  }
  return draft ? { ...base, ...draft } : base
}

export function walletFields(
  wallet: Wallet,
): Pick<CheckoutForm, 'walletId' | 'walletAddress' | 'network' | 'walletProvider' | 'ens' | 'secondaryAddress'> {
  return {
    walletId: wallet.id,
    walletAddress: wallet.address,
    network: wallet.network,
    walletProvider: wallet.provider,
    ens: wallet.ens,
    secondaryAddress: wallet.secondaryAddress,
  }
}

export interface QuoteDiff {
  kind: 'price' | 'quantity' | 'removed' | 'added'
  name: string
  before: string
  after: string
}

export function diffQuotes(previous: Quote, fresh: Quote): QuoteDiff[] {
  const diffs: QuoteDiff[] = []
  const byItem = new Map(fresh.lines.map((line) => [line.itemId, line]))
  for (const line of previous.lines) {
    const next = byItem.get(line.itemId)
    if (!next) {
      diffs.push({ kind: 'removed', name: line.name, before: `${line.quantity} × ${line.unitPrice} ETH`, after: 'removido' })
      continue
    }
    if (compareEth(next.unitPrice, line.unitPrice) !== 0) {
      diffs.push({ kind: 'price', name: line.name, before: `${line.unitPrice} ETH`, after: `${next.unitPrice} ETH` })
    }
    if (next.quantity !== line.quantity) {
      diffs.push({ kind: 'quantity', name: line.name, before: `${line.quantity}`, after: `${next.quantity}` })
    }
  }
  const known = new Set(previous.lines.map((line: QuoteLine) => line.itemId))
  for (const line of fresh.lines) {
    if (!known.has(line.itemId)) diffs.push({ kind: 'added', name: line.name, before: '—', after: `${line.quantity} × ${line.unitPrice} ETH` })
  }
  if (compareEth(previous.total, fresh.total) !== 0) {
    diffs.push({ kind: 'price', name: 'Total', before: `${previous.total} ETH`, after: `${fresh.total} ETH` })
  }
  return diffs
}
