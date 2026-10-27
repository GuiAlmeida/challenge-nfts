export interface CouponRecord {
  code: string
  label: string
  discountBps: number
  expiresAt: string | null
}

export const COUPONS: CouponRecord[] = [
  { code: 'KURIO10', label: 'Desconto do lançamento', discountBps: 1000, expiresAt: null },
  { code: 'LANCAMENTO5', label: 'Desconto do lançamento', discountBps: 500, expiresAt: null },
  { code: 'EXPIRADO', label: 'Cupom de inverno', discountBps: 1500, expiresAt: '2026-01-01T00:00:00.000Z' },
]
