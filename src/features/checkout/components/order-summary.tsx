import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { useId, useState } from 'react'
import { CartSummarySkeleton, NftImage, Price } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PriceChangeBanner } from '@/features/cart'
import type { CheckoutFlow } from '../use-checkout-flow'
import { WalletNetworkPicker } from './wallet-network-picker'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 text-[15px] leading-5 whitespace-nowrap text-foreground">
      <span>{label}</span>
      <span className="text-base">{value}</span>
    </div>
  )
}

export function OrderSummary({ flow, className }: { flow: CheckoutFlow; className?: string }) {
  const { quote } = flow
  const [couponOpen, setCouponOpen] = useState(Boolean(flow.appliedCoupon))
  const couponId = useId()
  const errorId = useId()
  const data = quote.data

  return (
    <aside aria-labelledby="checkout-summary-title" className={cn('flex flex-col gap-7', className)}>
      <PriceChangeBanner changes={flow.priceChanges} onRefresh={flow.refreshSummary} />
      <div className="flex flex-col gap-3">
        <h2 id="checkout-summary-title" className="text-base leading-4 font-bold text-foreground">
          Seus NFTs
        </h2>
        <div className="flex items-center justify-between border-b border-border pb-3 text-base leading-4 text-foreground">
          <span>NFTs</span>
          <span>Subtotal</span>
        </div>
        {!data && quote.isPending ? (
          <CartSummarySkeleton />
        ) : data ? (
          <ul className="flex flex-col gap-3">
            {data.lines.map((line) => (
              <li key={line.itemId} className="flex h-17.5 items-center justify-between gap-3 rounded-md bg-card pr-3">
                <div className="flex min-w-0 items-center gap-2">
                  <NftImage image={line.image} width={70} height={70} sizes="70px" className="size-17.5 shrink-0 rounded-l-md" />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate text-base leading-4 font-bold text-foreground">{line.name}</span>
                    <span className="truncate text-xs leading-4 text-muted-foreground md:text-sm">ID do token: {line.tokenId}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center md:gap-3">
                  <span className="text-xs text-sand md:text-sm">(x {line.quantity})</span>
                  <Price value={line.lineTotal} size="md" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {flow.availabilityError ? (
        <div role="alert" className="flex flex-col items-start gap-2 rounded-md border border-coral/50 px-3 py-3 text-sm text-foreground">
          {flow.availabilityError}
          <Button asChild variant="outline" size="xs" radius="md" className="text-sm">
            <Link to="/cart">Revisar carrinho</Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {flow.appliedCoupon ? (
          <p className="flex items-center justify-between text-sm text-success">
            Cupom {flow.appliedCoupon} aplicado.
            <Button type="button" variant="link" className="h-auto text-[13px]" onClick={flow.removeCoupon}>
              Remover
            </Button>
          </p>
        ) : couponOpen ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              flow.applyCoupon()
            }}
            className="flex flex-col gap-1"
          >
            <label htmlFor={couponId} className="sr-only">
              Código promocional
            </label>
            <div className="flex">
              <Input
                id={couponId}
                value={flow.couponDraft}
                onChange={(event) => flow.setCouponDraft(event.target.value)}
                placeholder="Digite o código promocional..."
                aria-invalid={flow.couponError ? true : undefined}
                aria-describedby={flow.couponError ? errorId : undefined}
                className="rounded-r-none text-[13px]"
              />
              <Button type="submit" size="sm" radius="xs" className="rounded-l-none px-4 text-[15px]" disabled={!flow.couponDraft.trim()}>
                Aplicar
              </Button>
            </div>
            {flow.couponError ? (
              <p id={errorId} role="alert" className="text-[13px] text-coral">
                {flow.couponError}
              </p>
            ) : null}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            className="w-fit self-center rounded-xs text-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tem um código promocional? Aplique aqui
          </button>
        )}
        {data ? (
          <div className="flex flex-col gap-3" aria-busy={quote.isFetching}>
            <Row label="Subtotal" value={`${data.subtotal} ETH`} />
            <Row label={data.coupon ? `Desconto (${data.coupon.code})` : 'Desconto do lançamento'} value={`(-) ${data.discount} ETH`} />
            <Row label="Taxa de rede" value={`${data.networkFee} ETH`} />
            <p className="text-center text-xs leading-4 text-brand">Taxa estimada</p>
            <div className="flex items-center justify-between border-t border-border px-10 pt-3 text-base leading-4 font-bold text-foreground">
              <span>Total</span>
              <Price value={data.total} size="md" />
            </div>
          </div>
        ) : null}
      </div>

      <WalletNetworkPicker flow={flow} />

      {flow.submitError ? (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-coral/50 px-3 py-3 text-sm text-foreground">
          {flow.submitError.message}
          {flow.submitError.retry ? (
            <Button type="button" variant="outline" size="xs" radius="md" className="self-start text-sm" onClick={flow.submitError.retry}>
              Tentar novamente
            </Button>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        form="checkout-form"
        size="md"
        radius="xs"
        disabled={flow.submitting}
        aria-disabled={!flow.canConfirm || undefined}
        onClick={(event) => {
          if (!flow.canConfirm && flow.walletSim.status !== 'connected') {
            event.preventDefault()
            flow.notifyWalletRequired()
          }
        }}
        className="w-full text-base md:rounded-xs"
      >
        {flow.submitting ? 'Confirmando…' : 'Confirmar compra'}
      </Button>
    </aside>
  )
}
