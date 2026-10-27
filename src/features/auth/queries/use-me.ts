import { useQuery } from '@tanstack/react-query'
import type { PublicUser, Session } from '@/contracts/auth'
import { fetchSession } from '../api'
import { useSessionStore } from '../session-store'
import { authKeys } from './keys'

export function useMe() {
  const token = useSessionStore((s) => s.token)
  const expiresAt = useSessionStore((s) => s.expiresAt)
  const snapshot = useSessionStore((s) => s.user)
  const placeholder: Session | undefined = token && expiresAt && snapshot ? { token, expiresAt, user: snapshot } : undefined
  return useQuery({
    queryKey: authKeys.me(snapshot?.id ?? null),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    placeholderData: placeholder,
  })
}

export function useSessionUser(): PublicUser | null {
  const token = useSessionStore((s) => s.token)
  const me = useMe()
  return token ? (me.data?.user ?? null) : null
}
