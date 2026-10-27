import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PageContainer } from '@/components/layout'

export const Route = createFileRoute('/register')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  head: () => ({ meta: [{ title: 'Criar conta — Kurio' }] }),
  component: () => (
    <PageContainer className="py-16">
      <h1 className="font-mono text-[28px] font-bold">Criar conta</h1>
      <p className="mt-2 font-mono text-sm text-sand">Em construção (Fase 4).</p>
    </PageContainer>
  ),
})
