import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Carrinho de NFTs — Kurio' }] }),
  component: () => (
    <PageContainer className="py-16">
      <h1 className="font-mono text-[28px] font-bold">Carrinho de NFTs</h1>
      <p className="mt-2 font-mono text-sm text-sand">Em construção (Fase 5).</p>
    </PageContainer>
  ),
})
