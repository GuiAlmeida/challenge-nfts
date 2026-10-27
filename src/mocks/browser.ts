import { setupWorker } from 'msw/browser'
import { initMocksFromLocation, installMockControl } from './control'
import { getDb } from './db/store'
import { authHandlers } from './handlers/auth'
import { cartHandlers } from './handlers/cart'
import { controlHandlers } from './handlers/control'
import { favoritesHandlers } from './handlers/favorites'
import { nftHandlers } from './handlers/nfts'
import { orderHandlers } from './handlers/orders'
import { profileHandlers } from './handlers/profile'
import { quoteHandlers } from './handlers/quote'
import { walletHandlers } from './handlers/wallets'
import { setSocketTokenResolver, socketHandlers } from './socket/server'

setSocketTokenResolver((token) => {
  if (!token) return null
  const session = getDb().sessions.find((s) => s.token === token)
  return session && new Date(session.expiresAt).getTime() > Date.now() ? session.userId : null
})

export const worker = setupWorker(
  ...controlHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
  ...socketHandlers,
)

initMocksFromLocation()
installMockControl()
