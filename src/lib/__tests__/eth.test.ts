import { describe, expect, it } from 'vitest'
import { applyBps, compareEth, formatEth, isEthString, mulQty, parseEth, sumEth } from '../eth'

describe('eth', () => {
  it('parses and formats without losing precision', () => {
    expect(formatEth(parseEth('1.19'))).toBe('1.19')
    expect(formatEth(parseEth('0.016'))).toBe('0.016')
    expect(formatEth(parseEth('26.846'))).toBe('26.846')
    expect(formatEth(parseEth('0'))).toBe('0.00')
    expect(formatEth(parseEth('0.000000000000000001'))).toBe('0.000000000000000001')
  })

  it('sums the cart from the Figma exactly', () => {
    const lines = [mulQty(parseEth('1.19'), 2), mulQty(parseEth('1.39'), 6), mulQty(parseEth('1.79'), 9)]
    const subtotal = lines.reduce((a, b) => a + b, 0n)
    expect(formatEth(subtotal)).toBe('26.83')
    expect(formatEth(subtotal + parseEth('0.016'))).toBe('26.846')
  })

  it('applies basis points by flooring', () => {
    expect(formatEth(applyBps(parseEth('26.83'), 1000))).toBe('2.683')
    expect(formatEth(applyBps(parseEth('1'), 3333), { maxDecimals: 4 })).toBe('0.3333')
  })

  it('rejects invalid input', () => {
    expect(isEthString('1.19')).toBe(true)
    expect(isEthString('1,19')).toBe(false)
    expect(isEthString('-1')).toBe(false)
    expect(() => parseEth('abc')).toThrow(RangeError)
    expect(() => mulQty(1n, 1.5)).toThrow(RangeError)
  })

  it('compares and sums strings', () => {
    expect(compareEth('1.19', '1.190')).toBe(0)
    expect(compareEth('0.39', '1.99')).toBe(-1)
    expect(sumEth(['1.19', '1.69', '1.99'])).toBe('4.87')
  })
})
