import { describe, expect, it } from 'vitest'
import { checkAvailability } from '../availability.rules'
import { createRng, pickLatency } from '../latency.rules'

describe('checkAvailability', () => {
  it('accepts within limits', () => {
    expect(checkAvailability({ requested: 3, available: 10, maxPerOrder: 10 })).toEqual({
      ok: true,
      allowed: 3,
      reason: 'ok',
    })
  })
  it('flags sold out, over availability and over max per order', () => {
    expect(checkAvailability({ requested: 1, available: 0, maxPerOrder: 10 }).reason).toBe('sold_out')
    expect(checkAvailability({ requested: 5, available: 2, maxPerOrder: 10 })).toMatchObject({
      ok: false,
      allowed: 2,
      reason: 'exceeds_available',
    })
    expect(checkAvailability({ requested: 12, available: 50, maxPerOrder: 10 })).toMatchObject({
      ok: false,
      allowed: 10,
      reason: 'exceeds_max_per_order',
    })
  })
})

describe('latency', () => {
  it('is deterministic for a seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const profile = { min: 100, max: 900 }
    expect([pickLatency(a, profile), pickLatency(a, profile)]).toEqual([pickLatency(b, profile), pickLatency(b, profile)])
    expect(pickLatency(createRng(1), 250)).toBe(250)
  })
})
