import { readScenarioName, writeScenarioName } from '../db/store'
import { createRng, pickLatency } from '../rules/latency.rules'
import { DEFAULT_SCENARIO_NAME, findScenario } from './index'
import type { FailureRule, Scenario, ScheduledChange } from './types'

interface RuntimeState {
  scenario: Scenario
  rng: () => number
  failureHits: Map<FailureRule, number>
  overrideHits: Map<RegExp, number>
  afterQuoteFired: Set<ScheduledChange>
}

let state: RuntimeState | null = null

const build = (scenario: Scenario): RuntimeState => ({
  scenario,
  rng: createRng(scenario.seed),
  failureHits: new Map(),
  overrideHits: new Map(),
  afterQuoteFired: new Set(),
})

export function consumeAfterQuote(change: ScheduledChange): boolean {
  if (!state || state.afterQuoteFired.has(change)) return false
  state.afterQuoteFired.add(change)
  return true
}

export function getScenario(): Scenario {
  if (!state) {
    const scenario = findScenario(readScenarioName()) ?? findScenario(DEFAULT_SCENARIO_NAME)!
    state = build(scenario)
  }
  return state.scenario
}

export function activateScenario(name: string): Scenario {
  const scenario = findScenario(name)
  if (!scenario) throw new Error(`Cenário desconhecido: ${name}`)
  state = build(scenario)
  writeScenarioName(scenario.name)
  return scenario
}

export function resetScenarioCounters(): void {
  if (state) state = build(state.scenario)
}

export function latencyFor(method: string, path: string): number {
  const current = getScenario()
  if (!state) return 0
  for (const override of current.latencyOverrides ?? []) {
    if (!override.path.test(path)) continue
    const hits = state.overrideHits.get(override.path) ?? 0
    state.overrideHits.set(override.path, hits + 1)
    const value = override.sequence[hits] ?? override.sequence.at(-1) ?? 0
    return value
  }
  void method
  return pickLatency(state.rng, current.latency)
}

export function matchFailure(method: string, path: string): FailureRule | null {
  const current = getScenario()
  if (!state) return null
  for (const rule of current.failures) {
    if (rule.method && rule.method !== method) continue
    if (!rule.path.test(path)) continue
    const hits = state.failureHits.get(rule) ?? 0
    if (rule.times !== undefined && hits >= rule.times) continue
    state.failureHits.set(rule, hits + 1)
    return rule
  }
  return null
}
