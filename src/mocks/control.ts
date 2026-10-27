import { eventEnvelopeSchema, type EventEnvelope, type EventType } from '@/contracts/events'
import { getDb, mutate, resetDb } from './db/store'
import { touchNft } from './events'
import { clearOrderTimers, rescheduleOrders, resolveOrder } from './orders/lifecycle'
import { SCENARIOS } from './scenarios/index'
import { activateScenario, getScenario, resetScenarioCounters } from './scenarios/runtime'
import { socketBus } from './socket/bus'
import { socketSessions } from './socket/sessions'
import { clearMockTimers } from './timers'

export interface EmitOptions {
  version?: number
  id?: string
  userId?: string
}

export interface KurioMockControl {
  emit: (type: EventType, resourceId: string, payload: unknown, options?: EmitOptions) => EventEnvelope
  updateNft: (nftId: string, patch: { price?: string; editionAvailable?: Record<string, number> }) => EventEnvelope | null
  resolveOrder: (orderId: string) => void
  scenario: () => string
  scenarios: () => Array<{ name: string; description: string }>
  setScenario: (name: string, options?: { reset?: boolean }) => string
  reset: (options?: { scenario?: string }) => void
  socket: {
    dropAll: () => number
    sessions: () => ReturnType<typeof socketSessions.snapshot>
  }
  state: () => { users: number; orders: number; carts: number; sessions: number; scenario: string }
}

declare global {
  interface Window {
    __kurioMock?: KurioMockControl
  }
}

const versions = new Map<string, number>()

const nextVersion = (key: string): number => {
  const next = (versions.get(key) ?? 0) + 1
  versions.set(key, next)
  return next
}

let control: KurioMockControl | null = null

export function getMockControl(): KurioMockControl {
  if (control) return control
  control = {
    emit(type, resourceId, payload, options = {}) {
      const resourceType = type === 'nft.updated' ? 'nft' : 'order'
      const key = `${resourceType}:${resourceId}`
      const envelope = eventEnvelopeSchema.parse({
        id: options.id ?? crypto.randomUUID(),
        type,
        resource: { type: resourceType, id: resourceId },
        version: options.version ?? nextVersion(key),
        occurredAt: new Date().toISOString(),
        payload,
      }) as EventEnvelope
      if (options.userId) socketBus.toUser(options.userId, envelope)
      else socketBus.broadcast(envelope)
      return envelope
    },
    updateNft(nftId, patch) {
      let envelope: EventEnvelope | null = null
      mutate((db) => {
        const result = touchNft(db, nftId, (record) => {
          if (patch.price) {
            record.previousPrice = record.editions.find((e) => e.kind !== 'unique')?.price ?? record.previousPrice
            for (const edition of record.editions) if (edition.kind !== 'unique') edition.price = patch.price
          }
          for (const [editionId, available] of Object.entries(patch.editionAvailable ?? {})) {
            const edition = record.editions.find((e) => e.id === editionId)
            if (edition) edition.available = available
          }
        })
        if (result) envelope = result.envelope
      })
      return envelope
    },
    resolveOrder(orderId) {
      resolveOrder(orderId)
    },
    scenario: () => getScenario().name,
    scenarios: () => SCENARIOS.map((s) => ({ name: s.name, description: s.description })),
    setScenario(name, options = {}) {
      const scenario = activateScenario(name)
      if (options.reset) control!.reset({ scenario: scenario.name })
      return scenario.name
    },
    reset(options = {}) {
      clearOrderTimers()
      clearMockTimers()
      versions.clear()
      const scenario = options.scenario ? activateScenario(options.scenario) : getScenario()
      resetScenarioCounters()
      const db = resetDb({ scenario: scenario.name, seed: scenario.seed })
      scenario.seedPatch?.(db)
      mutate(() => undefined)
    },
    socket: {
      dropAll: () => socketBus.dropAll(),
      sessions: () => socketSessions.snapshot(),
    },
    state: () => {
      const db = getDb()
      return {
        users: db.users.length,
        orders: db.orders.length,
        carts: db.carts.length,
        sessions: db.sessions.length,
        scenario: getScenario().name,
      }
    },
  }
  return control
}

export function initMocksFromLocation(): void {
  const url = new URL(window.location.href)
  const scenarioName = url.searchParams.get('mock-scenario')
  const wantsReset = url.searchParams.get('mock-reset') === '1'
  const ctl = getMockControl()
  if (scenarioName) {
    try {
      ctl.setScenario(scenarioName, { reset: true })
    } catch (error) {
      console.warn('[mocks]', error)
    }
  } else if (wantsReset) {
    ctl.reset()
  } else {
    getDb()
  }
  if (scenarioName || wantsReset) {
    url.searchParams.delete('mock-scenario')
    url.searchParams.delete('mock-reset')
    window.history.replaceState(window.history.state, '', url.toString())
  }
  rescheduleOrders()
}

export function installMockControl(): void {
  window.__kurioMock = getMockControl()
}
