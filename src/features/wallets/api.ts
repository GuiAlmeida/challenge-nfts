import { type Wallet, walletSchema } from '@/contracts/wallet'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'
import { z } from 'zod'

const walletListSchema = z.object({ items: z.array(walletSchema) })

export const fetchWallets = async (signal?: AbortSignal): Promise<Wallet[]> =>
  parseInDev(walletListSchema, await http.get<{ items: Wallet[] }>('/me/wallets', undefined, { signal })).items
