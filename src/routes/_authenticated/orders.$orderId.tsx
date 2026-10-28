import { createFileRoute } from '@tanstack/react-router'
import { OrderTrackingPage } from '@/features/orders'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  head: () => ({ meta: [{ title: 'Pedido — Kurio' }] }),
  component: OrderRoute,
})

function OrderRoute() {
  const { orderId } = Route.useParams()
  return <OrderTrackingPage key={orderId} orderId={orderId} />
}
