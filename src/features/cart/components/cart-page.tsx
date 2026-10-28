import { Link } from '@tanstack/react-router'
import { Breadcrumb, CartTableSkeleton, EmptyState, ErrorState, MobileTopBar, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useCartFlow } from '../use-cart-flow'
import { AlsoViewed } from './also-viewed'
import { CartListMobile } from './cart-list-mobile'
import { CartSummary } from './cart-summary'
import { CartTable } from './cart-table'
import { PriceChangeBanner } from './price-change-banner'

export function CartPage() {
  const flow = useCartFlow()
  const { cart, items, quote } = flow

  const summaryProps = (variant: 'desktop' | 'mobile') => ({
    quote: flow.displayQuote,
    pending: quote.isFetching,
    couponDraft: flow.couponDraft,
    onCouponDraft: flow.setCouponDraft,
    couponCode: flow.appliedCoupon,
    couponError: flow.couponError,
    onApplyCoupon: flow.applyCoupon,
    onRemoveCoupon: flow.removeCoupon,
    availabilityIssue: flow.availabilityIssue,
    onFixAvailability: flow.fixAvailability,
    quoteOutdated: flow.quoteOutdated,
    onRefresh: flow.refreshSummary,
    quoteError: flow.quoteError,
    onRetryQuote: flow.retryQuote,
    variant,
  })

  const body = cart.isPending ? (
    <CartTableSkeleton />
  ) : cart.isError ? (
    <ErrorState error={cart.error} onRetry={() => void cart.refetch()} retrying={cart.isFetching} />
  ) : items.length === 0 ? (
    <EmptyState
      title="Seu carrinho está vazio"
      description="Explore o catálogo e adicione NFTs para continuar."
      action={
        <Button asChild size="sm">
          <Link to="/">Explorar NFTs</Link>
        </Button>
      }
    />
  ) : null

  return (
    <>
      <div className="md:hidden">
        <MobileTopBar title="Carrinho de NFTs" />
        <div className="flex flex-col gap-3 px-7 pb-6">
          <PriceChangeBanner changes={flow.priceChanges} onRefresh={flow.refreshSummary} />
          {body ?? <CartListMobile items={items} onQuantity={flow.setQuantity} onRemove={flow.removeItem} disabled={flow.mutating} />}
        </div>
        {items.length > 0 ? <CartSummary {...summaryProps('mobile')} /> : null}
        {!cart.isPending ? (
          <PageContainer className="py-10">
            <AlsoViewed excludeIds={items.map((item) => item.nftId)} />
          </PageContainer>
        ) : null}
      </div>

      <PageContainer className="hidden flex-col gap-16 pt-8 pb-16 md:flex">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Mercado', to: '/' }, { label: 'Carrinho' }]} />
          <PriceChangeBanner changes={flow.priceChanges} onRefresh={flow.refreshSummary} />
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
            <div className="min-w-0 flex-1">
              {body ?? <CartTable items={items} onQuantity={flow.setQuantity} onRemove={flow.removeItem} disabled={flow.mutating} />}
            </div>
            {items.length > 0 ? <CartSummary {...summaryProps('desktop')} /> : null}
          </div>
        </div>
        {!cart.isPending ? <AlsoViewed excludeIds={items.map((item) => item.nftId)} /> : null}
      </PageContainer>
    </>
  )
}
