import { z } from 'zod'

export const ethStringSchema = z.string().regex(/^\d+(\.\d{1,18})?$/, 'Valor em ETH inválido')
export type EthString = z.infer<typeof ethStringSchema>

export const idSchema = z.string().min(1)
export const isoDateSchema = z.string().min(1)
export const quantitySchema = z.number().int().min(1).max(99)

export const networkSchema = z.enum(['ethereum', 'polygon', 'solana'])
export type Network = z.infer<typeof networkSchema>

export const NETWORK_LABEL: Record<Network, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
}

export const walletProviderSchema = z.enum(['metamask', 'walletconnect', 'coinbase'])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const WALLET_PROVIDER_LABEL: Record<WalletProvider, string> = {
  metamask: 'MetaMask',
  walletconnect: 'WalletConnect',
  coinbase: 'Coinbase Wallet',
}

export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço 0x inválido')
export const ensNameSchema = z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i, 'Nome ENS inválido')
