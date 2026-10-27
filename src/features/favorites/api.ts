import { type Favorites, favoritesSchema } from '@/contracts/favorites'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const fetchFavorites = async (signal?: AbortSignal): Promise<Favorites> =>
  parseInDev(favoritesSchema, await http.get<Favorites>('/me/favorites', undefined, { signal }))

export const addFavorite = async (nftId: string): Promise<Favorites> =>
  parseInDev(favoritesSchema, await http.put<Favorites>(`/me/favorites/${encodeURIComponent(nftId)}`))

export const removeFavorite = async (nftId: string): Promise<Favorites> =>
  parseInDev(favoritesSchema, await http.delete<Favorites>(`/me/favorites/${encodeURIComponent(nftId)}`))
