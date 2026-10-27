import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSessionUser } from '@/features/auth'
import { fetchFavorites } from '../api'
import { favoriteKeys } from './keys'

export function useFavorites() {
  const user = useSessionUser()
  const query = useQuery({
    queryKey: favoriteKeys.list(user?.id ?? 'anonymous'),
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
  const ids = useMemo(() => new Set(query.data?.nftIds ?? []), [query.data])
  return { ids, isFavorite: (nftId: string) => ids.has(nftId), authenticated: Boolean(user) }
}
