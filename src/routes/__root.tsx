import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, type ErrorComponentProps, HeadContent, Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import {
  AppFooter,
  AppHeader,
  FetchingBar,
  hidesFooterOnMobile,
  hidesTabBar,
  MobileTabBar,
  mobileToastOffset,
  OfflineBanner,
  PageContainer,
  ReconnectingBanner,
} from '@/components/layout'
import { useLogout, useSessionUser } from '@/features/auth'
import { MiniCart } from '@/features/cart'
import { RealtimeProvider, useRealtimeStatus } from '@/features/realtime'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showTabBar = !hidesTabBar(pathname)
  const user = useSessionUser()
  const logout = useLogout()
  const footerMobileHidden = hidesFooterOnMobile(pathname)
  const realtime = useRealtimeStatus()
  return (
    <RealtimeProvider>
      <div className="flex min-h-svh flex-col">
        <HeadContent />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <FetchingBar />
        <OfflineBanner />
        <ReconnectingBanner reconnecting={realtime === 'reconnecting'} />
        <AppHeader user={user} cart={<MiniCart />} onLogout={() => void logout()} />
        <main id="conteudo" className={showTabBar ? 'flex-1 pb-32 md:pb-0' : 'flex-1'}>
          <Outlet />
        </main>
        <div className={footerMobileHidden ? 'hidden md:block' : undefined}>
          <AppFooter />
        </div>
        {showTabBar ? <MobileTabBar /> : null}
        <Toaster mobileOffset={{ bottom: mobileToastOffset(pathname) }} />
      </div>
    </RealtimeProvider>
  )
}

function NotFound() {
  return (
    <PageContainer className="flex flex-col items-start gap-4 py-16">
      <h1 className="font-mono text-[28px] font-bold">Página não encontrada</h1>
      <p className="font-mono text-sm leading-6 text-sand">O endereço que você acessou não existe.</p>
      <Button asChild variant="primary" size="sm">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </PageContainer>
  )
}

function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const message = error instanceof Error ? error.message : String(error)
  const retry = () => {
    void router.invalidate()
    reset()
  }
  return (
    <PageContainer className="flex flex-col items-start gap-4 py-16">
      <div role="alert" className="flex flex-col gap-4">
        <h1 className="font-mono text-[28px] font-bold">Algo deu errado</h1>
        <p className="font-mono text-sm leading-6 text-sand">{message}</p>
      </div>
      <Button type="button" variant="primary" size="sm" onClick={retry}>
        Tentar novamente
      </Button>
    </PageContainer>
  )
}
