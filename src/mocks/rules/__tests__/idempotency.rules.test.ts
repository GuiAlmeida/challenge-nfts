import { describe, expect, it } from 'vitest'
import { evaluateIdempotency, hashBody } from '../idempotency.rules'

describe('idempotency', () => {
  const record = {
    key: 'k1',
    userId: 'u1',
    bodyHash: hashBody({ a: 1, b: [1, 2] }),
    orderId: 'o1',
    createdAt: 'x',
  }

  it('hashes bodies regardless of key order and undefined fields', () => {
    expect(hashBody({ b: [1, 2], a: 1, c: undefined })).toBe(record.bodyHash)
    expect(hashBody({ a: 2, b: [1, 2] })).not.toBe(record.bodyHash)
  })

  it('replays the same order for the same key and body', () => {
    expect(evaluateIdempotency(record, 'u1', record.bodyHash)).toEqual({ kind: 'replay', orderId: 'o1' })
  })

  it('conflicts when the same key carries a different body', () => {
    expect(evaluateIdempotency(record, 'u1', 'other')).toEqual({ kind: 'conflict' })
  })

  it('treats unknown keys and other users as new', () => {
    expect(evaluateIdempotency(undefined, 'u1', record.bodyHash)).toEqual({ kind: 'new' })
    expect(evaluateIdempotency(record, 'u2', record.bodyHash)).toEqual({ kind: 'new' })
  })
})
