import { Link } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react'
import { EmptyState, ErrorState, NftImage, PageContainer, Price } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order } from '@/contracts/order'
import { useOrder } from '../queries/use-order'
import { ReceiptDialog } from './receipt-dialog'

function OrderItems({ order }: { order: Order }) {
  return (
    <ul className="flex flex-col gap-3">
      {order.receipt.items.map((item) => (
        <li key={`${item.nftId}-${item.editionLabel}`} className="flex h-17.5 items-center justify-between gap-3 rounded-md bg-card pr-4">
          <div className="flex min-w-0 items-center gap-3">
            <NftImage image={item.image} width={70} height={70} sizes="70px" className="size-17.5 shrink-0 rounded-l-md" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-[15px] leading-4 font-bold text-foreground">{item.name}</span>
              <span className="text-sm leading-4 text-muted-foreground">
                ID do token: {item.tokenId} · (x {item.quantity})
              </span>
            </div>
          </div>
          <Price value={item.lineTotal} size="sm" />
        </li>
      ))}
    </ul>
  )
}

function PendingState({ order }: { order: Order }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 rounded-md border border-border bg-card px-6 py-12 text-center">
      <Loader2Icon aria-hidden="true" className="size-8 animate-spin text-brand motion-reduce:animate-none" />
      <p className="text-lg leading-5 font-bold text-foreground">Pedido pendente</p>
      <p className="max-w-110 text-sm leading-6 text-sand">
        Aguardando a confirmação da carteira. Você pode fechar esta página: o pedido {order.id} continua sendo processado e o resultado aparece aqui.
      </p>
    </div>
  )
}

function DeclinedState({ order }: { order: Order }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-md border border-coral/50 bg-card px-6 py-12 text-center">
      <p className="text-lg leading-5 font-bold text-foreground">Pagamento recusado</p>
      <p className="max-w-110 text-sm leading-6 text-sand">
        {order.declineReason ?? 'A carteira recusou a transação.'} Seus itens continuam no carrinho.
      </p>
      <Button asChild size="sm">
        <Link to="/cart">Voltar ao carrinho</Link>
      </Button>
    </div>
  )
}

export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const query = useOrder(orderId)
  if (query.isPending) {
    return (
      <PageContainer className="flex flex-col gap-4 py-10" role="status" aria-label="Carregando pedido">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-17.5 w-full" />
        <Skeleton className="h-17.5 w-full" />
      </PageContainer>
    )
  }
  if (query.isError) {
    return (
      <PageContainer className="py-16">
        <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
      </PageContainer>
    )
  }
  const order = query.data
  if (!order) {
    return (
      <PageContainer className="py-16">
        <EmptyState title="Pedido não encontrado" />
      </PageContainer>
    )
  }
  return (
    <PageContainer className="flex flex-col gap-8 py-8 md:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] font-bold text-foreground md:text-[28px]">Pedido {order.id}</h1>
        <p className="text-sm text-sand">
          Total <span className="font-bold text-brand">{order.receipt.total} ETH</span> · {order.receipt.items.length}{' '}
          {order.receipt.items.length === 1 ? 'item' : 'itens'}
        </p>
      </div>
      {order.status === 'pending' ? <PendingState order={order} /> : null}
      {order.status === 'declined' ? <DeclinedState order={order} /> : null}
      <OrderItems order={order} />
      {order.status === 'confirmed' ? <ReceiptDialog order={order} /> : null}
    </PageContainer>
  )
}
