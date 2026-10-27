import { eventEnvelopeSchema, type EventEnvelope } from '@/contracts/events'

export type GuardDecision = 'apply' | 'duplicate' | 'stale' | 'invalid'

export interface EventGuard {
  accept: (raw: unknown, currentVersion: number | undefined) => { decision: GuardDecision; envelope: EventEnvelope | null }
  reset: () => void
}

export function createEventGuard(capacity = 500): EventGuard {
  const seen = new Set<string>()
  const remember = (id: string) => {
    seen.add(id)
    if (seen.size > capacity) {
      const oldest = seen.values().next().value
      if (oldest !== undefined) seen.delete(oldest)
    }
  }
  return {
    accept(raw, currentVersion) {
      const parsed = eventEnvelopeSchema.safeParse(raw)
      if (!parsed.success) return { decision: 'invalid', envelope: null }
      const envelope = parsed.data as EventEnvelope
      if (seen.has(envelope.id)) return { decision: 'duplicate', envelope }
      remember(envelope.id)
      if (currentVersion !== undefined && envelope.version <= currentVersion) return { decision: 'stale', envelope }
      return { decision: 'apply', envelope }
    },
    reset() {
      seen.clear()
    },
  }
}
