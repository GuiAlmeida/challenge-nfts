import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NETWORK_LABEL } from '@/contracts/common'
import type { NftDetail } from '@/contracts/nft'
import { RatingStars } from './rating-stars'

const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4).toUpperCase()}`

const trigger =
  'h-auto flex-none shrink-0 rounded-none border-0 px-0 pb-3 text-[15px] leading-4 text-foreground group-data-[orientation=horizontal]/tabs:after:bottom-0 after:h-0.5 after:bg-primary data-[state=active]:text-brand data-[state=active]:font-bold md:text-[17px]'

export function DetailTabs({ nft }: { nft: NftDetail }) {
  const paragraphs = nft.description.split(/\n\s*\n/).filter(Boolean)
  return (
    <Tabs defaultValue="details" className="gap-0">
      <TabsList variant="line" className="h-auto w-full min-w-0 justify-start gap-8 overflow-x-auto overflow-y-hidden rounded-none [scrollbar-width:none] border-b border-border p-0">
        <TabsTrigger value="details" className={trigger}>
          Detalhes do NFT
        </TabsTrigger>
        <TabsTrigger value="reviews" className={trigger}>
          Avaliações de colecionadores ({nft.reviewsCount})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="flex flex-col gap-3 pt-3 text-sm leading-6 text-sand">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="font-bold text-foreground">Rede:</dt>
            <dd>Cunhado na {NETWORK_LABEL[nft.network]} com procedência imutável e metadados armazenados no IPFS.</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Contrato:</dt>
            <dd>
              <span className="font-mono">{shortAddress(nft.contractAddress)}</span> • Contrato inteligente ERC-721 verificado.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Direitos autorais:</dt>
            <dd>
              {nft.creator} recebe {nft.royaltyPct}% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.
            </dd>
          </div>
        </dl>
      </TabsContent>
      <TabsContent value="reviews" className="flex flex-col gap-3 pt-3 text-sm leading-6 text-sand">
        <p className="flex items-center gap-3 text-foreground">
          <RatingStars rating={nft.rating} />
          <span>
            {nft.rating.toLocaleString('pt-BR')} de 5 em {nft.reviewsCount} avaliações de colecionadores.
          </span>
        </p>
        <p>As avaliações individuais não fazem parte desta demonstração.</p>
      </TabsContent>
    </Tabs>
  )
}
