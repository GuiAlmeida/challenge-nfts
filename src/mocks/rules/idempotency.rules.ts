import { hashString } from './quote.rules'

export interface IdempotencyRecord {
  key: string
  userId: string
  bodyHash: string
  orderId: string
  createdAt: string
}

export type IdempotencyOutcome = { kind: 'new' } | { kind: 'replay'; orderId: string } | { kind: 'conflict' }

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export const hashBody = (body: unknown): string => hashString(canonical(body))

export function evaluateIdempotency(existing: IdempotencyRecord | undefined, userId: string, bodyHash: string): IdempotencyOutcome {
  if (!existing || existing.userId !== userId) return { kind: 'new' }
  if (existing.bodyHash === bodyHash) return { kind: 'replay', orderId: existing.orderId }
  return { kind: 'conflict' }
}
