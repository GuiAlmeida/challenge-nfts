import { buildSeed, DB_VERSION } from './seed'
import type { MockDb } from './schema'

const STORAGE_KEY = 'kurio.mock.db'
const SCENARIO_KEY = 'kurio.mock.scenario'
const DEFAULT_SCENARIO = 'default'
const DEFAULT_SEED = 1

let db: MockDb | null = null
let sequence = 0

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

const load = (): MockDb | null => {
  const raw = storage()?.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as MockDb
    return parsed?.meta?.version === DB_VERSION ? parsed : null
  } catch {
    return null
  }
}

export function persistDb(): void {
  if (!db) return
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('[mocks] falha ao persistir o db', error)
  }
}

export function readScenarioName(): string {
  return storage()?.getItem(SCENARIO_KEY) ?? DEFAULT_SCENARIO
}

export function writeScenarioName(name: string): void {
  storage()?.setItem(SCENARIO_KEY, name)
  if (db) {
    db.meta.scenario = name
    persistDb()
  }
}

export function getDb(): MockDb {
  if (!db) db = load() ?? buildSeed({ seed: DEFAULT_SEED, scenario: readScenarioName() })
  return db
}

export function mutate<T>(fn: (current: MockDb) => T): T {
  const result = fn(getDb())
  persistDb()
  return result
}

export function resetDb(options: { scenario?: string; seed?: number } = {}): MockDb {
  const scenario = options.scenario ?? readScenarioName()
  db = buildSeed({ seed: options.seed ?? DEFAULT_SEED, scenario })
  sequence = 0
  storage()?.setItem(SCENARIO_KEY, scenario)
  persistDb()
  return db
}

export function nextId(prefix: string): string {
  sequence += 1
  const random = crypto.randomUUID().slice(0, 8)
  return `${prefix}_${random}${sequence.toString(36)}`
}

export const nowIso = (): string => new Date().toISOString()
