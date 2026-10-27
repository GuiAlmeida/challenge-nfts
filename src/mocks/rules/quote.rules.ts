import type { Network } from '@/contracts/common'
import { applyBps, formatEth, mulQty, parseEth, sumWei } from '@/lib/eth'

export const NETWORK_FEE_ETH: Record<Network, string> = {
  ethereum: '0.016',
  polygon: '0.002',
  solana: '0.001',
}

export interface QuoteLineInput {
  unitPrice: string
  quantity: number
  network: Network
}

export interface QuoteTotals {
  subtotal: string
  discount: string
  networkFee: string
  networkFees: Array<{ network: Network; fee: string }>
  total: string
}

export function computeQuoteTotals(lines: readonly QuoteLineInput[], discountBps: number): QuoteTotals {
  const subtotalWei = sumWei(lines.map((line) => mulQty(parseEth(line.unitPrice), line.quantity)))
  const discountWei = applyBps(subtotalWei, discountBps)
  const networks = [...new Set(lines.map((line) => line.network))].sort()
  const networkFees = networks.map((network) => ({ network, fee: NETWORK_FEE_ETH[network] }))
  const feeWei = sumWei(networkFees.map((entry) => parseEth(entry.fee)))
  const totalWei = subtotalWei - discountWei + feeWei
  return {
    subtotal: formatEth(subtotalWei),
    discount: formatEth(discountWei),
    networkFee: formatEth(feeWei),
    networkFees,
    total: formatEth(totalWei),
  }
}

export function quoteFingerprint(
  lines: ReadonlyArray<{ itemId: string; editionId: string; unitPrice: string; quantity: number }>,
  couponCode: string | null,
): string {
  const parts = [...lines].map((line) => `${line.itemId}|${line.editionId}|${line.unitPrice}|${line.quantity}`).sort()
  parts.push(`coupon=${couponCode ?? ''}`)
  return hashString(parts.join(';'))
}

export function hashString(value: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
