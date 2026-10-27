import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { safeRedirect, useSessionStore } from '@/features/auth'
import { AuthScreen } from './-auth-screen'

export const Route = createFileRoute('/register')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  beforeLoad: ({ search }) => {
    if (useSessionStore.getState().isAuthenticated()) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Criar conta — Kurio' }] }),
  component: RegisterRoute,
})

function RegisterRoute() {
  const { redirect: target } = Route.useSearch()
  return <AuthScreen mode="register" redirect={target} />
}
