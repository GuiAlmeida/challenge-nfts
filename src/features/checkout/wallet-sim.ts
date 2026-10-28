import { create } from 'zustand'
import type { WalletProvider } from '@/contracts/common'

export type WalletSimStatus = 'disconnected' | 'connecting' | 'connected' | 'rejected'

interface WalletSimState {
  status: WalletSimStatus
  provider: WalletProvider | null
  rejectNext: boolean
  connect: (provider: WalletProvider) => void
  disconnect: () => void
  setRejectNext: (value: boolean) => void
}

const CONNECT_DELAY_MS = 800

export const useWalletSim = create<WalletSimState>()((set, get) => ({
  status: 'disconnected',
  provider: null,
  rejectNext: false,
  connect: (provider) => {
    set({ status: 'connecting', provider })
    setTimeout(() => {
      const current = get()
      if (current.status !== 'connecting' || current.provider !== provider) return
      set({ status: current.rejectNext ? 'rejected' : 'connected', rejectNext: false })
    }, CONNECT_DELAY_MS)
  },
  disconnect: () => set({ status: 'disconnected', provider: null }),
  setRejectNext: (value) => set({ rejectNext: value }),
}))
