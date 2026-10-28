import { useSessionStore } from '@/features/auth'
import { useWalletSim } from './wallet-sim'

export function installCheckoutSessionBridge(): () => void {
  return useSessionStore.subscribe((state, previous) => {
    if (state.token !== previous.token) useWalletSim.getState().disconnect()
  })
}
