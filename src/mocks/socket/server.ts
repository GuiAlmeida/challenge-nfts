import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { socketSessions } from './sessions'

/**
 * O binding 0.2.0 responde ao handshake (OPEN + CONNECT) mas não pulsa: sem ping o
 * `socket.io-client` derruba a conexão por "ping timeout" após pingInterval + pingTimeout (30 s).
 * Também não entrega o `auth` do handshake, que chega cru como pacote `40{...}`. Os dois são
 * tratados aqui. Limitações: só namespace `/`, eventos de texto, sem ack, transporte websocket.
 */
const PING_EVERY_MS = 20_000

type TokenResolver = (token: string | null) => string | null
let resolveUserId: TokenResolver = () => null

export function setSocketTokenResolver(resolver: TokenResolver): void {
  resolveUserId = resolver
}

const parseConnectAuth = (frame: string): string | null => {
  const raw = frame.slice(2).trim()
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'token' in parsed && typeof parsed.token === 'string') {
      return parsed.token
    }
  } catch {
    return null
  }
  return null
}

/**
 * O MSW 2.15 remove o prefixo `/socket.io/` do pathname do cliente antes de comparar com o link
 * (`WebSocketHandler.parse`), então o padrão descreve a origem com path `/`, não `/socket.io/`.
 * Em dev o HMR do Vite usa `/__vite_hmr` (vite.config.ts) para não cair aqui.
 */
export const socketLink = ws.link(/^wss?:\/\/[^/]+\/$/)

export const socketHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const { client } = connection
    const io = toSocketIo(connection)
    const id = crypto.randomUUID()
    const session = {
      id,
      token: null as string | null,
      userId: null as string | null,
      connectedAt: Date.now(),
      emit: (event: string, ...data: unknown[]) => io.client.emit(event, ...data),
      close: (code?: number, reason?: string) => client.close(code, reason),
    }
    socketSessions.register(session)

    client.addEventListener('message', (event) => {
      const frame = event.data
      if (typeof frame !== 'string') return
      if (frame.startsWith('40')) {
        session.token = parseConnectAuth(frame)
        session.userId = resolveUserId(session.token)
      }
    })

    const ping = setInterval(() => {
      try {
        client.send('2')
      } catch {
        clearInterval(ping)
      }
    }, PING_EVERY_MS)

    client.addEventListener('close', () => {
      clearInterval(ping)
      socketSessions.unregister(id)
    })
  }),
]
