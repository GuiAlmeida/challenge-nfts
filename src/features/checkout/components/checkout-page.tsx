import { Link } from '@tanstack/react-router'
import { Breadcrumb, EmptyState, ErrorState, MobileTopBar, PageContainer, useMediaQuery } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { PublicUser } from '@/contracts/auth'
import type { Wallet } from '@/contracts/wallet'
import { useMe } from '@/features/auth'
import { useCart } from '@/features/cart'
import { useWallets } from '@/features/wallets'
import { useCheckoutFlow } from '../use-checkout-flow'
import { CollectorForm } from './collector-form'
import { OrderSummary } from './order-summary'
import { QuoteOutdatedDialog } from './quote-outdated-dialog'

function CheckoutScreen({ user, wallets }: { user: PublicUser; wallets: Wallet[] }) {
  const flow = useCheckoutFlow({ user, wallets })
  const desktop = useMediaQuery('(min-width: 768px)')
  const dialog = (
    <QuoteOutdatedDialog
      outdated={flow.outdated}
      onConfirm={() => void flow.confirmOutdated()}
      onDismiss={flow.dismissOutdated}
      busy={flow.submitting}
    />
  )
  if (!desktop) {
    return (
      <>
        <MobileTopBar title="Pagamento com carteira" />
        <div className="flex flex-col gap-8 px-7 pb-10">
          <CollectorForm flow={flow} />
          <OrderSummary flow={flow} />
        </div>
        {dialog}
      </>
    )
  }
  return (
    <PageContainer className="flex flex-col gap-12 pt-8 pb-16">
      <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Mercado', to: '/' }, { label: 'Pagamento' }]} />
      <h1 className="sr-only">Pagamento</h1>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,763fr)_minmax(0,405fr)] lg:gap-8">
        <CollectorForm flow={flow} />
        <OrderSummary flow={flow} />
      </div>
      {dialog}
    </PageContainer>
  )
}

function CheckoutSkeleton() {
  return (
    <PageContainer
      className="grid gap-12 py-8 lg:grid-cols-[minmax(0,763fr)_minmax(0,405fr)] lg:gap-8"
      role="status"
      aria-label="Carregando pagamento"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-xs" />
          </div>
        ))}
        <Skeleton className="h-38 w-full rounded-xs md:col-span-2 md:max-w-87.5" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-17.5 w-full" />
        <Skeleton className="h-17.5 w-full" />
        <Skeleton className="h-17.5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11.25 w-full rounded-xs" />
      </div>
    </PageContainer>
  )
}

export function CheckoutPage() {
  const me = useMe()
  const wallets = useWallets()
  const cart = useCart()
  const loading = me.isPending || wallets.isPending || cart.isPending
  if (loading && !(me.data && wallets.data && cart.data)) {
    return <CheckoutSkeleton />
  }
  const failed = me.error ?? wallets.error ?? cart.error
  if (failed || !me.data || !wallets.data || !cart.data) {
    return (
      <PageContainer className="py-16">
        <ErrorState
          error={failed}
          onRetry={() => {
            void me.refetch()
            void wallets.refetch()
            void cart.refetch()
          }}
          retrying={me.isFetching || wallets.isFetching || cart.isFetching}
        />
      </PageContainer>
    )
  }
  if (cart.data.items.length === 0) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          title="Seu carrinho está vazio"
          description="Adicione NFTs antes de finalizar a compra."
          action={
            <Button asChild size="sm">
              <Link to="/">Explorar NFTs</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }
  return <CheckoutScreen key={me.data.user.id} user={me.data.user} wallets={wallets.data} />
}
