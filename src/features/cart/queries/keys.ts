export const cartKeys = {
  all: ['cart'] as const,
  scope: (scope: string) => ['cart', scope] as const,
}

export const quoteKeys = {
  all: ['quote'] as const,
  for: (scope: string, couponCode: string | null) => ['quote', scope, couponCode] as const,
}
