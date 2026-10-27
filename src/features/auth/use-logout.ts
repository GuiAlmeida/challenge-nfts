import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { logout } from './api'
import { isPrivatePath } from './redirect'
import { signOut } from './session-actions'
import { useSessionStore } from './session-store'

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return useCallback(async () => {
    if (useSessionStore.getState().token) await logout().catch(() => undefined)
    signOut(queryClient, 'logout')
    toast.success('Você saiu da sua conta.', { id: 'logout' })
    if (isPrivatePath(pathname)) await navigate({ to: '/' })
  }, [queryClient, navigate, pathname])
}
