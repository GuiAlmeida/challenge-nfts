const STORAGE_KEY = 'kurio.cartId'

export function ensureCartId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const created = `guest_${crypto.randomUUID()}`
    localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    return 'guest_memory'
  }
}

export function clearCartId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
