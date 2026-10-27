export const favoriteKeys = {
  list: (userId: string) => ['favorites', userId] as const,
}
