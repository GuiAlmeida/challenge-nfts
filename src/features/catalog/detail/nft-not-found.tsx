import { Link } from '@tanstack/react-router'
import { EmptyState, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'

export function NftNotFound() {
  return (
    <PageContainer className="py-16">
      <EmptyState
        title="NFT não encontrado"
        description="Este item não existe ou saiu do catálogo. Volte ao mercado para continuar explorando."
        action={
          <Button asChild size="sm">
            <Link to="/">Voltar ao catálogo</Link>
          </Button>
        }
      />
    </PageContainer>
  )
}
