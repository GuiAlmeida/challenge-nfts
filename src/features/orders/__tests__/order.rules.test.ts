import { describe, expect, it } from 'vitest'
import type { Order } from '@/contracts/order'
import { formatOrderDate, newerOrder, shortHash } from '../order.rules'

const order = (version: number, status: Order['status']): Order => ({ version, status }) as unknown as Order

describe('order.rules', () => {
  it('mantém a versão maior entre cache e resposta', () => {
    expect(newerOrder(order(5, 'confirmed'), order(1, 'pending')).status).toBe('confirmed')
    expect(newerOrder(order(1, 'pending'), order(2, 'declined')).status).toBe('declined')
    expect(newerOrder(undefined, order(1, 'pending')).version).toBe(1)
  })
  it('encurta o hash e formata a data como no recibo', () => {
    expect(shortHash('0xa72e1234567890abcdef363b')).toBe('0xa72e…363B')
    expect(formatOrderDate('2026-07-29T15:00:00.000Z')).toMatch(/^29 jul, 2026$/)
  })
})
