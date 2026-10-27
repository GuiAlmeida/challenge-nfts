export const authKeys = {
  me: (userId: string | null) => ['me', userId] as const,
}
