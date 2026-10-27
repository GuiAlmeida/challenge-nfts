import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSessionStore } from '@/features/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (!useSessionStore.getState().isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
})
