import type { Socket } from 'socket.io-client'
import { networkReady } from '@/lib/ready'

let socket: Socket | null = null
let loading: Promise<Socket> | null = null

/**
 * `socket.io-client` é importado dinamicamente depois de `networkReady`: o engine.io captura
 * `globalThis.WebSocket` na avaliação do módulo, e o MSW só troca o construtor em `worker.start()`.
 * `transports: ['websocket']` é obrigatório: o MSW intercepta WebSocket, não o long-polling HTTP.
 */
export async function getSocket(): Promise<Socket> {
  if (socket) return socket
  if (!loading) {
    loading = networkReady.promise
      .then(() => import('socket.io-client'))
      .then(({ io }) => {
        socket = io('/', {
          path: '/socket.io/',
          transports: ['websocket'],
          autoConnect: false,
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5_000,
          timeout: 10_000,
        })
        return socket
      })
  }
  return loading
}

export async function connectSocket(token: string | null): Promise<Socket> {
  const current = await getSocket()
  current.auth = token ? { token } : {}
  if (current.connected) current.disconnect()
  current.connect()
  return current
}

export function disconnectSocket(): void {
  socket?.disconnect()
}
