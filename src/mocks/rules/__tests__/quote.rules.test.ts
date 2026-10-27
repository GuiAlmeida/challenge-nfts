import { describe, expect, it } from 'vitest'
import { computeQuoteTotals, quoteFingerprint } from '../quote.rules'

describe('computeQuoteTotals', () => {
  it('reproduces the Figma cart: 26.83 + 0.016 = 26.846', () => {
    const totals = computeQuoteTotals(
      [
        { unitPrice: '1.19', quantity: 2, network: 'ethereum' },
        { unitPrice: '1.39', quantity: 6, network: 'ethereum' },
        { unitPrice: '1.79', quantity: 9, network: 'ethereum' },
      ],
      0,
    )
    expect(totals).toMatchObject({
      subtotal: '26.83',
      discount: '0.00',
      networkFee: '0.016',
      total: '26.846',
    })
  })

  it('charges one fee per distinct network and applies bps discount', () => {
    const totals = computeQuoteTotals(
      [
        { unitPrice: '1.00', quantity: 1, network: 'ethereum' },
        { unitPrice: '1.00', quantity: 1, network: 'polygon' },
        { unitPrice: '1.00', quantity: 1, network: 'polygon' },
      ],
      1000,
    )
    expect(totals.networkFees).toEqual([
      { network: 'ethereum', fee: '0.016' },
      { network: 'polygon', fee: '0.002' },
    ])
    expect(totals.discount).toBe('0.30')
    expect(totals.total).toBe('2.718')
  })

  it('fingerprint ignores line order but not quantity, price or coupon', () => {
    const a = [
      { itemId: 'a', editionId: 'e1', unitPrice: '1.19', quantity: 2 },
      { itemId: 'b', editionId: 'e2', unitPrice: '1.39', quantity: 1 },
    ]
    const b = [a[1]!, a[0]!]
    expect(quoteFingerprint(a, null)).toBe(quoteFingerprint(b, null))
    expect(quoteFingerprint(a, null)).not.toBe(quoteFingerprint(a, 'KURIO10'))
    expect(quoteFingerprint(a, null)).not.toBe(quoteFingerprint([{ ...a[0]!, unitPrice: '1.29' }, a[1]!], null))
  })
})
