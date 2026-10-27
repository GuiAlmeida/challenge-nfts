import { createFileRoute, notFound } from '@tanstack/react-router'
import { NftDetailSkeleton, PageContainer } from '@/components/layout'
import { nftDetailOptions, NftDetailPage, NftNotFound } from '@/features/catalog'
import { isApiError } from '@/lib/api-error'

export const Route = createFileRoute('/nft/$nftId')({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      return await queryClient.ensureQueryData({ ...nftDetailOptions(params.nftId), revalidateIfStale: true })
    } catch (error) {
      if (isApiError(error) && error.status === 404) throw notFound()
      throw error
    }
  },
  pendingMs: 200,
  pendingMinMs: 300,
  pendingComponent: () => (
    <PageContainer className="py-8">
      <NftDetailSkeleton />
    </PageContainer>
  ),
  notFoundComponent: NftNotFound,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} — Kurio` : 'NFT — Kurio' }],
  }),
  component: NftDetailRoute,
})

function NftDetailRoute() {
  const { nftId } = Route.useParams()
  return <NftDetailPage key={nftId} nftId={nftId} />
}
