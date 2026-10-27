export interface AvailabilityInput {
  requested: number
  available: number
  maxPerOrder: number
}

export interface AvailabilityResult {
  ok: boolean
  allowed: number
  reason: 'ok' | 'sold_out' | 'exceeds_available' | 'exceeds_max_per_order'
}

export function checkAvailability({ requested, available, maxPerOrder }: AvailabilityInput): AvailabilityResult {
  const cap = Math.min(available, maxPerOrder)
  if (available <= 0) return { ok: false, allowed: 0, reason: 'sold_out' }
  if (requested > available) return { ok: false, allowed: cap, reason: 'exceeds_available' }
  if (requested > maxPerOrder) return { ok: false, allowed: cap, reason: 'exceeds_max_per_order' }
  return { ok: true, allowed: requested, reason: 'ok' }
}
