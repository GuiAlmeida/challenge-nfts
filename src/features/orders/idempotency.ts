import type { CreateOrder } from '@/contracts/order'

export interface OrderAttempt {
  key: string
  body: CreateOrder
}

const storageKey = (userId: string, fingerprint: string) => `kurio.order-attempt.${userId}.${fingerprint}`

export function recallAttempt(userId: string, fingerprint: string): OrderAttempt | null {
  try {
    const raw = sessionStorage.getItem(storageKey(userId, fingerprint))
    return raw ? (JSON.parse(raw) as OrderAttempt) : null
  } catch {
    return null
  }
}

export function rememberAttempt(userId: string, fingerprint: string, attempt: OrderAttempt): void {
  try {
    sessionStorage.setItem(storageKey(userId, fingerprint), JSON.stringify(attempt))
  } catch {
    return
  }
}

export function forgetAttempt(userId: string, fingerprint: string): void {
  try {
    sessionStorage.removeItem(storageKey(userId, fingerprint))
  } catch {
    return
  }
}
