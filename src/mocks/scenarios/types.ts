import type { ApiErrorCode } from '@/contracts/errors'
import type { MockDb } from '../db/schema'

export type FailureKind = 'http' | 'network' | 'timeout'

export interface FailureRule {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: RegExp
  kind?: FailureKind
  status?: number
  code?: ApiErrorCode
  message?: string
  times?: number
}

export interface ScheduledChange {
  afterQuoteMs: number
  change: 'price-up' | 'sold-out'
}

export interface Scenario {
  name: string
  description: string
  seed: number
  latency: number | { min: number; max: number }
  latencyOverrides?: Array<{ path: RegExp; sequence: number[] }>
  failures: FailureRule[]
  sessionTtlMs: number
  order: { outcome: 'confirmed' | 'declined'; delayMs: number; responseDelayMs: number }
  afterQuote?: ScheduledChange[]
  seedPatch?: (db: MockDb) => void
}
