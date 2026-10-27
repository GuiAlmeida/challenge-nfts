import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { eventTypeSchema } from '@/contracts/events'
import { SCENARIOS } from '../scenarios/index'
import { activateScenario, getScenario } from '../scenarios/runtime'
import { getMockControl } from '../control'
import { fail, json } from './shared'

const scenarioBody = z.object({ name: z.string().min(1), reset: z.boolean().optional() })
const emitBody = z.object({
  type: eventTypeSchema,
  resourceId: z.string().min(1),
  payload: z.unknown(),
  version: z.number().int().optional(),
  id: z.string().optional(),
  userId: z.string().optional(),
})

export const controlHandlers = [
  http.get('/__mock/scenario', () =>
    json({
      active: getScenario().name,
      available: SCENARIOS.map((s) => ({ name: s.name, description: s.description })),
    }),
  ),
  http.post('/__mock/scenario', async ({ request }) => {
    const parsed = scenarioBody.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(422, 'VALIDATION_ERROR', 'Informe o nome do cenário.')
    try {
      const scenario = activateScenario(parsed.data.name)
      if (parsed.data.reset) getMockControl().reset({ scenario: scenario.name })
      return json({ active: scenario.name })
    } catch (error) {
      return fail(404, 'NOT_FOUND', error instanceof Error ? error.message : 'Cenário desconhecido.')
    }
  }),
  http.post('/__mock/reset', () => {
    getMockControl().reset()
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('/__mock/emit', async ({ request }) => {
    const parsed = emitBody.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return fail(422, 'VALIDATION_ERROR', 'Evento inválido.')
    const { type, resourceId, payload, ...options } = parsed.data
    return json(getMockControl().emit(type, resourceId, payload, options))
  }),
]
