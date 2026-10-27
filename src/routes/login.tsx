import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { safeRedirect, useSessionStore } from '@/features/auth'
import { AuthScreen } from './-auth-screen'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  beforeLoad: ({ search }) => {
    if (useSessionStore.getState().isAuthenticated()) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Entrar — Kurio' }] }),
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect: target } = Route.useSearch()
  return <AuthScreen mode="login" redirect={target} />
}
