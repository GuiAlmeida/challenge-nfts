import type { Page } from '@playwright/test'
import type { EventType } from '@/contracts/events'
import type { EmitOptions } from '@/mocks/control'

export const mock = {
  setScenario: (page: Page, name: string, { reset }: { reset: boolean }) =>
    page.evaluate(({ name, reset }) => window.__kurioMock?.setScenario(name, { reset }), { name, reset }),

  emit: (page: Page, type: EventType, resourceId: string, payload: unknown, meta?: EmitOptions) =>
    page.evaluate(({ type, resourceId, payload, meta }) => window.__kurioMock?.emit(type, resourceId, payload, meta), {
      type,
      resourceId,
      payload,
      meta,
    }),

  dropSocket: (page: Page) => page.evaluate(() => window.__kurioMock?.socket.dropAll() ?? 0),

  socketSessions: (page: Page) => page.evaluate(() => window.__kurioMock?.socket.sessions().length ?? 0),

  orderCount: (page: Page) => page.evaluate(() => window.__kurioMock?.state().orders ?? 0),
}
