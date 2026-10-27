import { useQuery } from '@tanstack/react-query'
import { NftGridSkeleton, SectionHeading } from '@/components/layout'
import type { NftDetail, NftSummary } from '@/contracts/nft'
import { NftCard } from '../components/nft-card'
import { nftListOptions } from '../queries/options'

export function RelatedNfts({ nft, onZoom }: { nft: NftDetail; onZoom: (nft: NftSummary) => void }) {
  const query = useQuery(
    nftListOptions({
      q: undefined,
      collection: [nft.collection.slug],
      network: [],
      priceMin: undefined,
      priceMax: undefined,
      sort: 'recent',
      tab: 'all',
      page: 1,
      pageSize: 6,
    }),
  )
  const items = (query.data?.items ?? []).filter((item) => item.id !== nft.id).slice(0, 5)
  if (query.isError || (query.isSuccess && items.length === 0)) return null
  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-8">
      <SectionHeading id="related-heading">Mais desta coleção</SectionHeading>
      {query.isPending ? (
        <NftGridSkeleton count={5} className="md:grid-cols-3 md:gap-y-8 lg:grid-cols-5 lg:gap-x-6.5" />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6.5">
          {items.map((item) => (
            <li key={item.id}>
              <NftCard nft={item} onZoom={onZoom} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
