import { create } from 'zustand'
import type { PriceChange } from './cart.rules'

interface CartUiState {
  priceChanges: PriceChange[]
  notePriceChanges: (changes: PriceChange[]) => void
  acknowledge: () => void
  miniCartOpen: boolean
  setMiniCartOpen: (open: boolean) => void
  announcement: string
  announce: (message: string) => void
}

export const useCartUiStore = create<CartUiState>()((set) => ({
  priceChanges: [],
  notePriceChanges: (changes) =>
    set((state) => {
      const byItem = new Map(state.priceChanges.map((c) => [c.itemId, c]))
      for (const change of changes) byItem.set(change.itemId, change)
      return { priceChanges: [...byItem.values()] }
    }),
  acknowledge: () => set({ priceChanges: [] }),
  miniCartOpen: false,
  setMiniCartOpen: (open) => set({ miniCartOpen: open }),
  announcement: '',
  announce: (message) => set({ announcement: message }),
}))
