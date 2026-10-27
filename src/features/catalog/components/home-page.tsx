import { useState } from 'react'
import { PageContainer } from '@/components/layout'
import type { CatalogSearch } from '@/contracts/search'
import { countActiveFilters } from '../catalog.rules'
import { useNfts } from '../queries/use-nfts'
import { useCatalogNavigate } from '../search-params'
import { useFavoriteAction } from '../use-favorite-action'
import { BlogCards } from './blog-cards'
import { FeaturedBanner } from './featured-banner'
import { Filters } from './filters'
import { FiltersSheet } from './filters-sheet'
import { Hero } from './hero'
import { MobileSearchBar } from './mobile-search-bar'
import { NftGrid } from './nft-grid'
import { PromoCards } from './promo-cards'
import { Toolbar } from './toolbar'

const CLEAR_ALL: Partial<CatalogSearch> = {
  q: undefined,
  collection: undefined,
  network: undefined,
  priceMin: undefined,
  priceMax: undefined,
  tab: 'all',
}

export function HomePage({ search }: { search: CatalogSearch }) {
  const query = useNfts(search)
  const patch = useCatalogNavigate()
  const favorite = useFavoriteAction()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeCount = countActiveFilters(search)
  const facets = query.data?.facets

  return (
    <PageContainer className="flex flex-col gap-10 pt-6 pb-16 md:gap-16 md:pt-8">
      <MobileSearchBar onOpenFilters={() => setFiltersOpen(true)} activeCount={activeCount} />
      <Hero />
      <section id="catalogo" aria-label="Catálogo de NFTs" className="flex scroll-mt-6 items-start gap-12">
        <aside className="hidden w-77.5 shrink-0 flex-col gap-6 lg:flex">
          <Filters facets={facets} search={search} onPatch={(p) => void patch(p)} />
          <FeaturedBanner />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-8 md:gap-12.5">
          <Toolbar
            search={search}
            onSort={(sort) => void patch({ sort })}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeCount}
          />
          <NftGrid query={query} page={search.page} onClearFilters={() => void patch(CLEAR_ALL)} onFavorite={(nft) => favorite(nft.name)} />
        </div>
      </section>
      <PromoCards />
      <BlogCards />
      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} facets={facets} search={search} onPatch={(p) => void patch(p)} />
    </PageContainer>
  )
}
