import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import '@/styles/globals.css'
import { configureHttp } from '@/lib/http'
import { isPrivatePath, signOut, useSessionStore } from '@/features/auth'
import { ensureCartId, installCartSessionBridge } from '@/features/cart'
import { installCheckoutSessionBridge } from '@/features/checkout'
import { App } from './providers'
import { bootstrapMocks } from './bootstrap-mocks'
import { queryClient } from './query-client'
import { router } from './router'

configureHttp({
  getToken: () => useSessionStore.getState().token,
  getCartId: ensureCartId,
  onUnauthorized: () => {
    signOut(queryClient, 'expired')
    toast.warning('Sua sessão expirou. Entre novamente para continuar.', { id: 'session-expired' })
    const { pathname, href } = router.state.location
    if (isPrivatePath(pathname)) void router.navigate({ to: '/login', search: { redirect: href } })
  },
})

installCartSessionBridge()
installCheckoutSessionBridge()

const container = document.getElementById('root')
if (!container) throw new Error('#root não encontrado')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/** O backend simulado sobe depois da primeira pintura para o bundle dele não disputar a rede com a interface; as requisições já esperam `networkReady`. */
requestAnimationFrame(() => setTimeout(() => void bootstrapMocks(), 0))
