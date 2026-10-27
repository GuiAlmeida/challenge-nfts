export const cartKeys = {
  all: ['cart'] as const,
  scope: (scope: string) => ['cart', scope] as const,
}
