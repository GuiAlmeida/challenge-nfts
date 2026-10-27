import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout'

export const Route = createFileRoute('/_authenticated/account/profile')({
  head: () => ({ meta: [{ title: 'Perfil do colecionador — Kurio' }] }),
  component: () => (
    <PageContainer className="py-16">
      <h1 className="font-mono text-[28px] font-bold">Perfil do colecionador</h1>
      <p className="mt-2 font-mono text-sm text-sand">Em construção (Fase 7).</p>
    </PageContainer>
  ),
})
