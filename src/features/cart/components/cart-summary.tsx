import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { useId } from 'react'
import { CartSummarySkeleton, ErrorState, Price } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Quote } from '@/contracts/quote'
import { NETWORK_LABEL } from '@/contracts/common'

interface SummaryProps {
  quote: Quote | undefined
  pending: boolean
  couponDraft: string
  onCouponDraft: (value: string) => void
  couponCode: string | null
  couponError: string | null
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  availabilityIssue: { message: string; allowed: number | null } | null
  onFixAvailability: () => void
  quoteOutdated: boolean
  onRefresh: () => void
  quoteError: unknown
  onRetryQuote: () => void
  variant: 'desktop' | 'mobile'
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className={cn('flex w-full items-center justify-between gap-4 text-[15px] leading-4 whitespace-nowrap', bold && 'font-bold')}>
      <span className="text-foreground">{label}</span>
      <span className="shrink-0 text-right text-base text-foreground">{value}</span>
    </div>
  )
}

export function CartSummary(props: SummaryProps) {
  const { quote, pending, variant } = props
  const couponId = useId()
  const couponErrorId = useId()
  const mobile = variant === 'mobile'

  return (
    <section
      aria-labelledby={`${couponId}-title`}
      className={cn('flex flex-col gap-6', mobile && 'rounded-t-pill bg-card px-6 pt-6 pb-9', !mobile && 'w-full lg:w-83')}
    >
      {!mobile ? (
        <h2 id={`${couponId}-title`} className="border-b border-border pb-3 text-lg leading-4 font-bold text-foreground">
          Resumo da carteira
        </h2>
      ) : (
        <h2 id={`${couponId}-title`} className="sr-only">
          Resumo da carteira
        </h2>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          props.onApplyCoupon()
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor={couponId} className={cn('text-sm leading-4 font-bold text-foreground', mobile && 'sr-only')}>
          Código promocional
        </label>
        <div
          className={cn('flex', mobile && 'h-12.5 items-center rounded-pill border border-border bg-card pl-4 shadow-[0_6px_10px_rgba(10,6,4,0.45)]')}
        >
          <Input
            id={couponId}
            value={props.couponDraft}
            onChange={(event) => props.onCouponDraft(event.target.value)}
            placeholder="Digite o código promocional..."
            aria-invalid={props.couponError ? true : undefined}
            aria-describedby={props.couponError ? couponErrorId : undefined}
            autoComplete="off"
            disabled={Boolean(props.couponCode)}
            className={cn('min-w-0 flex-1 text-[13px]', mobile ? 'h-full border-0 bg-transparent px-0 focus-visible:ring-0' : 'rounded-r-none pl-2')}
          />
          {props.couponCode ? (
            <Button
              type="button"
              variant={mobile ? 'pill' : 'outline'}
              size="sm"
              radius={mobile ? 'pill' : 'xs'}
              onClick={props.onRemoveCoupon}
              className={cn('shrink-0 text-[15px]', mobile ? 'h-12.5 w-24.25 px-0' : 'rounded-l-none')}
            >
              Remover
            </Button>
          ) : (
            <Button
              type="submit"
              variant={mobile ? 'pill' : 'primary'}
              size="sm"
              radius={mobile ? 'pill' : 'xs'}
              disabled={pending || !props.couponDraft.trim()}
              className={cn('shrink-0 text-[15px]', mobile ? 'h-12.5 w-24.25 px-0 text-foreground' : 'rounded-l-none px-4')}
            >
              Aplicar
            </Button>
          )}
        </div>
        {props.couponError ? (
          <p id={couponErrorId} role="alert" className="text-[13px] leading-4 text-coral">
            {props.couponError}
          </p>
        ) : quote?.coupon ? (
          <p className="text-[13px] leading-4 text-success">
            {quote.coupon.label}: {quote.coupon.discountBps / 100}% de desconto aplicado.
          </p>
        ) : null}
      </form>

      {props.availabilityIssue ? (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-coral/50 px-3 py-3 text-sm leading-5 text-foreground">
          {props.availabilityIssue.message}
          <Button type="button" variant="outline" size="xs" radius="md" onClick={props.onFixAvailability} className="self-start text-sm">
            {props.availabilityIssue.allowed ? `Ajustar para ${props.availabilityIssue.allowed}` : 'Remover do carrinho'}
          </Button>
        </div>
      ) : null}

      {props.quoteError && !quote ? (
        <ErrorState
          error={props.quoteError}
          title="Não foi possível calcular o resumo"
          onRetry={props.onRetryQuote}
          retrying={pending}
          className="py-6"
        />
      ) : !quote && pending ? (
        <CartSummarySkeleton />
      ) : quote ? (
        <div className={cn('flex flex-col gap-3', props.quoteOutdated && 'opacity-70')} aria-busy={pending}>
          <Row label="Subtotal" value={`${quote.subtotal} ETH`} />
          <Row label={quote.coupon ? `Desconto (${quote.coupon.code})` : 'Desconto do lançamento'} value={`(-) ${quote.discount} ETH`} />
          <div className="flex flex-col items-end gap-1">
            <Row label="Taxa de rede" value={`${quote.networkFee} ETH`} />
            <span className="text-xs leading-4 text-brand">
              Taxa estimada · {quote.networkFees.map((fee) => NETWORK_LABEL[fee.network]).join(', ')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-base leading-4 font-bold text-foreground">Total</span>
            <Price value={quote.total} size="md" />
          </div>
          {props.quoteOutdated ? (
            <p role="status" className="text-[13px] leading-4 text-coral">
              O resumo está desatualizado.{' '}
              <button
                type="button"
                onClick={props.onRefresh}
                className="underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Atualizar resumo
              </button>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-4">
        <Button
          asChild
          variant={mobile ? 'pill' : 'primary'}
          size={mobile ? 'lg' : 'sm'}
          radius={mobile ? 'pill' : 'xs'}
          className={cn('w-full text-[15px]', mobile && 'text-base')}
          aria-disabled={!quote || props.quoteOutdated || Boolean(props.availabilityIssue) || undefined}
        >
          <Link
            to="/checkout"
            onClick={(event) => {
              if (!quote || props.quoteOutdated || props.availabilityIssue) event.preventDefault()
            }}
          >
            Conectar e finalizar
          </Link>
        </Button>
        {!mobile ? (
          <Button asChild variant="ghost" size="sm" className="text-[15px]">
            <Link to="/">Continuar explorando</Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
