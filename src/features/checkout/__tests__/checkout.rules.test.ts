import { describe, expect, it } from 'vitest'
import type { Quote, QuoteLine } from '@/contracts/quote'
import { diffQuotes } from '../checkout.rules'

const line = (overrides: Partial<QuoteLine>): QuoteLine => ({
  itemId: 'ci_1',
  nftId: 'emerald-ape-042',
  editionId: 'emerald-ape-042:1of10',
  name: 'Emerald Ape #042',
  tokenId: '#0042',
  editionLabel: '1/10',
  image: { slug: 'ape-emerald', alt: '' },
  network: 'ethereum',
  unitPrice: '1.19',
  quantity: 1,
  lineTotal: '1.19',
  available: 7,
  ...overrides,
})

const quote = (lines: QuoteLine[], total: string): Quote => ({ lines, total, fingerprint: total }) as unknown as Quote

describe('diffQuotes', () => {
  it('lista preço, quantidade, remoção e total', () => {
    const previous = quote([line({}), line({ itemId: 'ci_2', name: 'Sage Nomad #009' })], '2.40')
    const fresh = quote([line({ unitPrice: '1.309', quantity: 2, lineTotal: '2.618' })], '2.634')
    const diffs = diffQuotes(previous, fresh)
    expect(diffs.map((d) => `${d.kind}:${d.name}`)).toEqual([
      'price:Emerald Ape #042',
      'quantity:Emerald Ape #042',
      'removed:Sage Nomad #009',
      'price:Total',
    ])
  })
  it('não inventa diferença quando nada mudou', () => {
    const q = quote([line({})], '1.206')
    expect(diffQuotes(q, q)).toEqual([])
  })
})
