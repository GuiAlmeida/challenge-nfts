import { useQuery } from '@tanstack/react-query'
import { useSessionUser } from '@/features/auth'
import { fetchWallets } from '../api'
import { walletKeys } from './keys'

export function useWallets() {
  const user = useSessionUser()
  return useQuery({
    queryKey: walletKeys.list(user?.id ?? 'anonymous'),
    queryFn: ({ signal }) => fetchWallets(signal),
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  })
}
