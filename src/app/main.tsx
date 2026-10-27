import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { configureHttp } from '@/lib/http'
import { useSessionStore } from '@/features/auth'
import { ensureCartId } from '@/features/cart'
import { App } from './providers'
import { bootstrapMocks } from './bootstrap-mocks'

configureHttp({
  getToken: () => useSessionStore.getState().token,
  getCartId: ensureCartId,
  onUnauthorized: () => useSessionStore.getState().expire(),
})

void bootstrapMocks()

const container = document.getElementById('root')
if (!container) throw new Error('#root não encontrado')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
