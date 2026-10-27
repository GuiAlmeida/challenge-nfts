import type { EventEnvelope } from '@/contracts/events'
import { socketSessions } from './sessions'

export const socketBus = {
  broadcast(envelope: EventEnvelope): number {
    const targets = socketSessions.all()
    for (const session of targets) session.emit(envelope.type, envelope)
    return targets.length
  },
  toUser(userId: string, envelope: EventEnvelope): number {
    const targets = socketSessions.forUser(userId)
    for (const session of targets) session.emit(envelope.type, envelope)
    return targets.length
  },
  dropAll(code = 4001, reason = 'simulated outage'): number {
    const targets = socketSessions.all()
    for (const session of targets) session.close(code, reason)
    return targets.length
  },
}
