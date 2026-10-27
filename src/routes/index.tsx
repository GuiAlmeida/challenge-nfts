import { createFileRoute, type SearchSchemaInput, stripSearchParams } from '@tanstack/react-router'
import { CATALOG_SEARCH_DEFAULTS, type CatalogSearch, catalogSearchSchema, toNftListQuery } from '@/contracts/search'
import { HomePage, nftListOptions } from '@/features/catalog'

export const Route = createFileRoute('/')({
  validateSearch: (input: Partial<CatalogSearch> & SearchSchemaInput) => catalogSearchSchema.parse(input),
  search: { middlewares: [stripSearchParams(CATALOG_SEARCH_DEFAULTS)] },
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(nftListOptions(toNftListQuery(deps)))
  },
  head: () => ({ meta: [{ title: 'Kurio — Marketplace de NFTs' }] }),
  component: HomeRoute,
})

function HomeRoute() {
  const search = Route.useSearch()
  return <HomePage search={search} />
}
