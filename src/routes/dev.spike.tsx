import { createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { type EventEnvelope } from '@/contracts/events'
import { connectSocket, disconnectSocket, getSocket } from '@/features/realtime'
import { mocksEnabled } from '@/lib/env'

export const Route = createFileRoute('/dev/spike')({
  beforeLoad: () => {
    if (!mocksEnabled) throw notFound()
  },
  component: SpikePage,
})

const SPIKE_TOKEN = 'spike-token'

function SpikePage() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [reconnects, setReconnects] = useState(0)
  const [events, setEvents] = useState<EventEnvelope[]>([])
  const [mockToken, setMockToken] = useState<string>('-')

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    void getSocket().then((socket) => {
      if (disposed) return
      const onConnect = () => {
        setStatus('connected')
        setMockToken(window.__kurioMock?.socket.sessions().at(-1)?.token ?? 'null')
      }
      const onDisconnect = () => setStatus('disconnected')
      const onReconnect = () => setReconnects((n) => n + 1)
      const onNftUpdated = (envelope: EventEnvelope) => setEvents((list) => [...list, envelope])
      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.io.on('reconnect', onReconnect)
      socket.on('nft.updated', onNftUpdated)
      void connectSocket(SPIKE_TOKEN)
      cleanup = () => {
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.io.off('reconnect', onReconnect)
        socket.off('nft.updated', onNftUpdated)
        disconnectSocket()
      }
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <section className="mx-auto flex max-w-300 flex-col gap-4 px-6 py-10">
      <h1 className="text-[28px] font-bold">Spike Socket.IO</h1>
      <dl className="grid grid-cols-[160px_1fr] gap-2 text-[15px]">
        <dt className="text-sand">status</dt>
        <dd data-testid="socket-status">{status}</dd>
        <dt className="text-sand">reconexões</dt>
        <dd data-testid="reconnects">{reconnects}</dd>
        <dt className="text-sand">token visto pelo mock</dt>
        <dd data-testid="mock-token">{mockToken}</dd>
      </dl>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground"
          onClick={() => window.__kurioMock?.emit('nft.updated', 'spike-nft', { price: '1.29' })}
        >
          Emitir evento
        </button>
        <button
          type="button"
          className="rounded-md border border-primary px-4 py-2 font-medium text-brand"
          onClick={() => window.__kurioMock?.socket.dropAll()}
        >
          Derrubar conexão
        </button>
      </div>
      <ul data-testid="events" className="flex flex-col gap-1 text-sm text-sand">
        {events.map((event) => (
          <li key={event.id}>
            {event.type} · {event.resource.id} · v{event.version} · {JSON.stringify(event.payload)}
          </li>
        ))}
      </ul>
    </section>
  )
}
