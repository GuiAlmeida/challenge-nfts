import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { CartIcon, HeartIcon, SearchIcon, StarIcon, TrashIcon } from '@/assets/icons'
import {
  Breadcrumb,
  CartSummarySkeleton,
  EmptyState,
  ErrorState,
  Icon,
  NftGridSkeleton,
  PageContainer,
  Price,
  SectionHeading,
  Stepper,
} from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mocksEnabled } from '@/lib/env'

export const Route = createFileRoute('/dev/ui')({
  beforeLoad: () => {
    if (!mocksEnabled) throw notFound()
  },
  component: UiPage,
})

function UiPage() {
  const [qty, setQty] = useState(1)
  return (
    <PageContainer className="flex flex-col gap-10 py-10">
      <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Mercado', to: '/' }, { label: 'UI' }]} />
      <section className="flex flex-col gap-4">
        <SectionHeading>Botões</SectionHeading>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">Entrar</Button>
          <Button size="sm" radius="md">
            EXPLORAR
          </Button>
          <Button size="sm" radius="xs">
            Conectar e finalizar
          </Button>
          <Button size="md" radius="sm">
            Entrar
          </Button>
          <Button variant="outline" size="sm">
            <Icon icon={HeartIcon} size={20} /> Favoritar
          </Button>
          <Button variant="ghost">Continuar explorando</Button>
          <Button variant="link">Esqueceu a senha?</Button>
          <Button variant="pill" size="lg">
            Comprar NFT
          </Button>
          <Button variant="subtle" size="icon-lg" radius="pill" aria-label="Carrinho">
            <Icon icon={CartIcon} size={20} />
          </Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </section>
      <section className="grid max-w-104.25 gap-4">
        <SectionHeading>Formulário</SectionHeading>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ui-nome" required>
            Nome de exibição
          </Label>
          <Input id="ui-nome" placeholder="Selecione uma rede" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ui-email" required>
            E-mail
          </Label>
          <Input id="ui-email" aria-invalid="true" aria-describedby="ui-email-err" defaultValue="invalido" />
          <p id="ui-email-err" className="font-mono text-[13px] text-coral">
            Informe um e-mail válido
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <SectionHeading>Preço, stepper, ícones</SectionHeading>
        <div className="flex flex-wrap items-center gap-8">
          <Price value="1.19" />
          <Price value="1.99" previous="2.29" />
          <Price value="26.846" size="xl" />
          <Stepper value={qty} max={10} onChange={setQty} label="Emerald Ape #042" />
          <Stepper value={qty} max={10} onChange={setQty} size="lg" label="Emerald Ape #042 (grande)" />
          <span className="flex gap-3 text-brand">
            <Icon icon={SearchIcon} /> <Icon icon={CartIcon} size={24} /> <Icon icon={StarIcon} size={15} /> <Icon icon={TrashIcon} size={24} />
          </span>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <SectionHeading>Estados</SectionHeading>
        <NftGridSkeleton count={3} />
        <div className="grid gap-4 md:grid-cols-3">
          <CartSummarySkeleton />
          <EmptyState
            title="Nenhum NFT encontrado"
            description="Ajuste os filtros ou limpe a busca."
            action={<Button size="sm">Limpar filtros</Button>}
          />
          <ErrorState onRetry={() => undefined} />
        </div>
      </section>
    </PageContainer>
  )
}
