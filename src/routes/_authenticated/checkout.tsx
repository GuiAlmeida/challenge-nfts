import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout'

export const Route = createFileRoute('/_authenticated/checkout')({
  head: () => ({ meta: [{ title: 'Pagamento — Kurio' }] }),
  component: () => (
    <PageContainer className="py-16">
      <h1 className="font-mono text-[28px] font-bold">Pagamento</h1>
      <p className="mt-2 font-mono text-sm text-sand">Em construção (Fase 6).</p>
    </PageContainer>
  ),
})
