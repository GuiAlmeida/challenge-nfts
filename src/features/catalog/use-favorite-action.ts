import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useIsAuthenticated } from '@/features/auth'

export function useFavoriteAction() {
  const authenticated = useIsAuthenticated()
  const navigate = useNavigate()
  const href = useRouterState({ select: (s) => s.location.href })
  return useCallback(
    (name: string) => {
      if (!authenticated) {
        void navigate({ to: '/login', search: { redirect: href } })
        return
      }
      toast.info(`Favoritos ainda não estão disponíveis. ${name} não foi salvo.`, { id: 'favorites-pending' })
    },
    [authenticated, navigate, href],
  )
}
