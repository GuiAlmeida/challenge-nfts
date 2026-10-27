import { useMediaQuery } from '@/components/layout'
import { AuthDialog, type AuthMode, AuthPage } from '@/features/auth'
import { DEFAULT_CATALOG_SEARCH, HomePage } from '@/features/catalog'

export function AuthScreen({ mode, redirect }: { mode: AuthMode; redirect: string | undefined }) {
  const desktop = useMediaQuery('(min-width: 768px)')
  if (!desktop) return <AuthPage mode={mode} redirect={redirect} />
  return (
    <>
      <HomePage search={DEFAULT_CATALOG_SEARCH} />
      <AuthDialog mode={mode} redirect={redirect} />
    </>
  )
}
