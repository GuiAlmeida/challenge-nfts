import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'
import { NftGridSkeleton, SectionHeading } from '@/components/layout'
import { NftCard, nftListOptions } from '@/features/catalog'

export function AlsoViewed({ excludeIds }: { excludeIds: string[] }) {
  const query = useQuery(
    nftListOptions({
      q: undefined,
      collection: [],
      network: [],
      priceMin: undefined,
      priceMax: undefined,
      sort: 'trending',
      tab: 'all',
      page: 1,
      pageSize: 8,
    }),
  )
  const headingId = useId()
  const items = (query.data?.items ?? []).filter((item) => !excludeIds.includes(item.id)).slice(0, 5)
  if (query.isError || (query.isSuccess && items.length === 0)) return null
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-8">
      <SectionHeading headingId={headingId} className="[&>div>h2]:text-[17px]">
        Colecionadores também viram
      </SectionHeading>
      {query.isPending ? (
        <NftGridSkeleton count={5} className="md:grid-cols-3 md:gap-y-8 lg:grid-cols-5 lg:gap-x-6.5" />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6.5">
          {items.map((item) => (
            <li key={item.id}>
              <NftCard nft={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
