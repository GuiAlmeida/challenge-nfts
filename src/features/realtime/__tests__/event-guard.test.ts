import { describe, expect, it } from 'vitest'
import { createEventGuard } from '../event-guard'

const envelope = (id: string, version: number) => ({
  id,
  type: 'nft.updated',
  resource: { type: 'nft', id: 'emerald-ape-042' },
  version,
  occurredAt: '2026-10-27T00:00:00.000Z',
  payload: { price: '1.29' },
})

describe('event guard', () => {
  it('applies a newer event once and rejects the duplicate delivery', () => {
    const guard = createEventGuard()
    expect(guard.accept(envelope('e1', 2), 1).decision).toBe('apply')
    expect(guard.accept(envelope('e1', 2), 2).decision).toBe('duplicate')
  })

  it('discards events older than or equal to the cached version', () => {
    const guard = createEventGuard()
    expect(guard.accept(envelope('e2', 3), 3).decision).toBe('stale')
    expect(guard.accept(envelope('e3', 1), 3).decision).toBe('stale')
    expect(guard.accept(envelope('e4', 4), 3).decision).toBe('apply')
  })

  it('applies when the cache has no version yet and rejects malformed envelopes', () => {
    const guard = createEventGuard()
    expect(guard.accept(envelope('e5', 1), undefined).decision).toBe('apply')
    expect(guard.accept({ id: 'x' }, undefined).decision).toBe('invalid')
  })

  it('forgets the oldest ids beyond capacity', () => {
    const guard = createEventGuard(2)
    guard.accept(envelope('a', 1), undefined)
    guard.accept(envelope('b', 2), undefined)
    guard.accept(envelope('c', 3), undefined)
    expect(guard.accept(envelope('a', 1), undefined).decision).toBe('apply')
    expect(guard.accept(envelope('c', 3), undefined).decision).toBe('duplicate')
    expect(guard.accept(envelope('b', 2), 2).decision).toBe('stale')
  })
})
