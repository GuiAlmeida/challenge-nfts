import { useState } from 'react'
import { Breadcrumb, ErrorState, NftDetailSkeleton, PageContainer, Price, Stepper } from '@/components/layout'
import { FavoriteButton } from '@/features/favorites'
import { Button } from '@/components/ui/button'
import type { NftDetail, NftSummary } from '@/contracts/nft'
import { ImageZoomDialog } from '../components/image-zoom-dialog'
import { useNft } from '../queries/use-nft'
import { BuyBar } from './buy-bar'
import { DetailTabs } from './detail-tabs'
import { EditionChips } from './edition-chips'
import { NftGallery } from './nft-gallery'
import { RatingStars } from './rating-stars'
import { RelatedNfts } from './related-nfts'
import { ShareLinks } from './share-links'
import { useNftDetailFlow } from './use-nft-detail-flow'

function StockNotice({ max, available }: { max: number; available: number }) {
  if (max === 0) {
    return (
      <p role="alert" className="text-[13px] leading-4 text-coral">
        Esta edição está esgotada. Escolha outra edição.
      </p>
    )
  }
  if (available <= 5) {
    return (
      <p aria-live="polite" className="text-[13px] leading-4 text-sand">
        Só {available === 1 ? 'resta 1 unidade' : `restam ${available} unidades`} desta edição.
      </p>
    )
  }
  return null
}

function MetaList({ nft, className }: { nft: NftDetail; className?: string }) {
  return (
    <dl className={className}>
      <div className="flex gap-1">
        <dt>ID do token:</dt>
        <dd>{nft.tokenId}</dd>
      </div>
      <div className="flex gap-1">
        <dt>Coleção:</dt>
        <dd>{nft.collection.name}</dd>
      </div>
      <div className="flex gap-1">
        <dt>Atributos:</dt>
        <dd>{nft.attributes.join(', ')}</dd>
      </div>
    </dl>
  )
}

function Loaded({ nft }: { nft: NftDetail }) {
  const flow = useNftDetailFlow(nft)
  const [zoom, setZoom] = useState<NftSummary | null>(null)
  const url = typeof window === 'undefined' ? '' : window.location.href

  return (
    <>
      <div className="pb-50 md:hidden">
        <NftGallery nft={nft} />
        <section className="relative -mt-7.5 flex flex-col gap-3 rounded-t-[31px] bg-card px-6 pt-8 pb-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl leading-4 font-bold text-foreground">{nft.name}</h1>
            <span className="flex h-6.75 items-center gap-1 rounded-pill border border-primary px-2 text-sm leading-4">
              <RatingStars rating={5} size={14} className="[&>svg:not(:first-child)]:hidden" />
              <span className="font-medium text-foreground">{nft.rating.toLocaleString('pt-BR')}</span>
              <span className="text-sand">({nft.reviewsCount})</span>
            </span>
          </div>
          <p className="text-sm leading-6 text-sand">{nft.shortDescription}</p>
          <EditionChips editions={nft.editions} selectedId={flow.edition.id} onSelect={flow.selectEdition} />
          <StockNotice max={flow.max} available={flow.edition.available} />
          <MetaList nft={nft} className="flex flex-col gap-3 text-[15px] leading-4 text-muted-foreground" />
        </section>
        <PageContainer className="flex flex-col gap-10 pt-6">
          <DetailTabs nft={nft} />
          <RelatedNfts nft={nft} onZoom={setZoom} />
        </PageContainer>
        <BuyBar flow={flow} name={nft.name} />
      </div>

      <PageContainer className="hidden flex-col gap-16 pt-8 pb-16 md:flex">
        <div className="flex flex-col gap-7">
          <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Mercado', to: '/' }, { label: nft.name }]} />
          <div className="flex items-start gap-8">
            <NftGallery nft={nft} />
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex flex-col gap-3 border-b border-border pb-3">
                <h1 className="text-[28px] font-bold text-foreground">{nft.name}</h1>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Price value={flow.edition.price} previous={nft.previousPrice} size="xl" />
                  <span className="flex items-center gap-1 text-[15px] text-foreground">
                    <RatingStars rating={nft.rating} />
                    <span>{nft.reviewsCount} avaliações de colecionadores</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[15px] leading-4 font-bold text-foreground">Sobre este NFT:</p>
                <p className="text-sm leading-6 text-sand">{nft.shortDescription}</p>
              </div>
              <EditionChips editions={nft.editions} selectedId={flow.edition.id} onSelect={flow.selectEdition} />
              <StockNotice max={flow.max} available={flow.edition.available} />
              <div id="comprar" className="flex scroll-mt-24 flex-wrap items-center justify-between gap-4">
                <Stepper
                  value={flow.quantity}
                  min={flow.soldOut ? 0 : 1}
                  max={flow.max}
                  onChange={flow.setQuantity}
                  size="lg"
                  label={nft.name}
                  disabled={flow.soldOut}
                />
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" radius="md" className="w-32.5 text-sm" onClick={flow.buy} disabled={flow.soldOut || flow.buying}>
                    {flow.buying ? 'ADICIONANDO…' : flow.soldOut ? 'ESGOTADO' : 'COMPRAR'}
                  </Button>
                  <FavoriteButton nftId={nft.id} name={nft.name} variant="outline" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <MetaList nft={nft} className="flex flex-col gap-3 text-[15px] leading-4 text-muted-foreground" />
                <ShareLinks title={nft.name} url={url} />
              </div>
            </div>
          </div>
        </div>
        <DetailTabs nft={nft} />
        <RelatedNfts nft={nft} onZoom={setZoom} />
      </PageContainer>

      <ImageZoomDialog image={zoom?.image ?? null} title={zoom?.name ?? ''} open={zoom !== null} onOpenChange={(open) => !open && setZoom(null)} />
    </>
  )
}

export function NftDetailPage({ nftId }: { nftId: string }) {
  const query = useNft(nftId)
  if (query.isPending) {
    return (
      <PageContainer className="py-8">
        <NftDetailSkeleton />
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
  return <Loaded nft={query.data} />
}
