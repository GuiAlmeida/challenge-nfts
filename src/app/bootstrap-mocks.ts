import { mocksEnabled } from '@/lib/env'
import { networkReady } from '@/lib/ready'

/** Se o worker falhar, a rede é liberada mesmo assim: o erro vira falha HTTP em vez de tela em branco. */
export async function bootstrapMocks(): Promise<void> {
  if (!mocksEnabled) {
    networkReady.resolve()
    return
  }
  try {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
    window.__kurioMocksReady = true
  } catch (error) {
    console.error('[mocks] falha ao iniciar o service worker', error)
  } finally {
    networkReady.resolve()
  }
}
