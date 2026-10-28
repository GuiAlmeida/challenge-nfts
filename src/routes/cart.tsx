import { createFileRoute } from '@tanstack/react-router'
import { CartPage } from '@/features/cart'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Carrinho de NFTs — Kurio' }] }),
  component: CartPage,
})
