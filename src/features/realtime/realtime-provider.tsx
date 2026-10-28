import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  type EventEnvelope,
  type NftUpdatedPayload,
  nftUpdatedPayloadSchema,
  type OrderUpdatedPayload,
  orderUpdatedPayloadSchema,
} from '@/contracts/events'
import { useSessionStore } from '@/features/auth'
import { createEventGuard } from './event-guard'
import { applyNftUpdated, currentNftVersion } from './handlers/nft-updated'
import { applyOrderUpdated, currentOrderVersion } from './handlers/order-updated'
import { useRealtimeStore } from './realtime-store'
import { reconcile } from './reconcile'
import { connectSocket, disconnectSocket, getSocket } from './socket'

const resourceId = (raw: unknown): string | null => {
  if (!raw || typeof raw !== 'object') return null
  const resource = (raw as { resource?: { id?: unknown } }).resource
  return typeof resource?.id === 'string' ? resource.id : null
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const token = useSessionStore((s) => s.token)
  const userId = useSessionStore((s) => s.user?.id ?? null)

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    const guard = createEventGuard()
    const setStatus = useRealtimeStore.getState().setStatus
    setStatus('connecting')
    void getSocket().then((socket) => {
      if (disposed) return
      const onConnect = () => setStatus('connected')
      const onDisconnect = () => setStatus('disconnected')
      const onReconnectAttempt = () => setStatus('reconnecting')
      const onReconnect = () => {
        setStatus('connected')
        reconcile(queryClient)
      }
      const onNftUpdated = (raw: unknown) => {
        const id = resourceId(raw)
        const current = id ? currentNftVersion(queryClient, id) : undefined
        const { decision, envelope } = guard.accept(raw, current)
        if (decision !== 'apply' || !envelope) return
        const payload = nftUpdatedPayloadSchema.safeParse(envelope.payload)
        if (!payload.success) return
        applyNftUpdated(queryClient, { ...envelope, payload: payload.data } as EventEnvelope<NftUpdatedPayload>)
      }
      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.io.on('reconnect_attempt', onReconnectAttempt)
      socket.io.on('reconnect', onReconnect)
      const onOrderUpdated = (raw: unknown) => {
        const id = resourceId(raw)
        const current = id ? currentOrderVersion(queryClient, userId, id) : undefined
        const { decision, envelope } = guard.accept(raw, current)
        if (decision !== 'apply' || !envelope) return
        const payload = orderUpdatedPayloadSchema.safeParse(envelope.payload)
        if (!payload.success) return
        applyOrderUpdated(queryClient, userId, { ...envelope, payload: payload.data } as EventEnvelope<OrderUpdatedPayload>)
      }
      socket.on('nft.updated', onNftUpdated)
      socket.on('order.updated', onOrderUpdated)
      void connectSocket(token)
      cleanup = () => {
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.io.off('reconnect_attempt', onReconnectAttempt)
        socket.io.off('reconnect', onReconnect)
        socket.off('nft.updated', onNftUpdated)
        socket.off('order.updated', onOrderUpdated)
        disconnectSocket()
        setStatus('disconnected')
      }
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [queryClient, token, userId])

  return children
}
