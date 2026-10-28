export const orderKeys = {
  all: ['orders'] as const,
  detail: (userId: string, orderId: string) => ['orders', userId, orderId] as const,
}
