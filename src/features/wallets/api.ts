import { z } from 'zod'
import { type Wallet, type WalletCreate, type WalletUpdate, walletSchema } from '@/contracts/wallet'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

const walletListSchema = z.object({ items: z.array(walletSchema) })

export const fetchWallets = async (signal?: AbortSignal): Promise<Wallet[]> =>
  parseInDev(walletListSchema, await http.get<{ items: Wallet[] }>('/me/wallets', undefined, { signal })).items

export const createWallet = async (body: WalletCreate): Promise<Wallet> => parseInDev(walletSchema, await http.post<Wallet>('/me/wallets', body))

export const updateWallet = async (id: string, body: WalletUpdate): Promise<Wallet> =>
  parseInDev(walletSchema, await http.patch<Wallet>(`/me/wallets/${encodeURIComponent(id)}`, body))
