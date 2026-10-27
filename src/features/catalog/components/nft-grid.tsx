import type { UseQueryResult } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { EmptyState, ErrorState, NftGridSkeleton } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { NftListResponse, NftSummary } from '@/contracts/nft'
import { ImageZoomDialog } from './image-zoom-dialog'
import { NftCard } from './nft-card'
import { Pagination } from './pagination'

export function NftGrid({
  query,
  page,
  onClearFilters,
  onFavorite,
}: {
  query: UseQueryResult<NftListResponse>
  page: number
  onClearFilters: () => void
  onFavorite: (nft: NftSummary) => void
}) {
  const [zoom, setZoom] = useState<NftSummary | null>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const lastPage = useRef(page)
  useEffect(() => {
    if (lastPage.current !== page) {
      lastPage.current = page
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [page])

  const { data, isPending, isError, isFetching, isPlaceholderData, error, refetch } = query
  const items = data?.items ?? []

  return (
    <div ref={topRef} className="flex scroll-mt-6 flex-col gap-12 lg:min-h-312.5">
      {isPending ? (
        <NftGridSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} retrying={isFetching} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhum NFT encontrado"
          description="Ajuste os filtros ou limpe a busca para ver mais itens."
          action={
            <Button type="button" size="sm" onClick={onClearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {data.total} NFTs encontrados, página {data.page} de {data.totalPages}.
          </p>
          <ul
            aria-busy={isFetching && isPlaceholderData}
            className="grid grid-cols-2 gap-x-4 gap-y-6 pb-8 transition-opacity aria-busy:opacity-60 md:grid-cols-2 md:gap-x-8.5 md:gap-y-18 md:pb-0 lg:grid-cols-3 [&>li:nth-child(even)]:translate-y-8 md:[&>li:nth-child(even)]:translate-y-0"
          >
            {items.map((nft, index) => (
              <li key={nft.id}>
                <NftCard nft={nft} index={index} onFavorite={onFavorite} onZoom={setZoom} />
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} />
        </>
      )}
      <ImageZoomDialog image={zoom?.image ?? null} title={zoom?.name ?? ''} open={zoom !== null} onOpenChange={(open) => !open && setZoom(null)} />
    </div>
  )
}
