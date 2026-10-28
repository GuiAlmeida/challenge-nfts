import type { CheckoutForm } from './schemas'

const key = (userId: string) => `kurio.checkout.${userId}`

export function loadDraft(userId: string): Partial<CheckoutForm> | null {
  try {
    const raw = sessionStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as Partial<CheckoutForm>) : null
  } catch {
    return null
  }
}

export function saveDraft(userId: string, values: Partial<CheckoutForm>): void {
  try {
    sessionStorage.setItem(key(userId), JSON.stringify(values))
  } catch {
    return
  }
}

export function clearDraft(userId: string): void {
  try {
    sessionStorage.removeItem(key(userId))
  } catch {
    return
  }
}
