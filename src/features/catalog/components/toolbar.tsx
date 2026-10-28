import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { FilterIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type CatalogSearch, type SortOption, sortSchema, type TabOption } from '@/contracts/search'
import { patchSearch } from '../catalog.rules'

const TABS: Array<{ value: TabOption; label: string }> = [
  { value: 'all', label: 'Todos os NFTs' },
  { value: 'new', label: 'Novos lançamentos' },
  { value: 'trending', label: 'Em alta' },
]

const SORT_LABEL: Record<SortOption, string> = {
  recent: 'Listados recentemente',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  trending: 'Mais populares',
}

export function Toolbar({
  search,
  onSort,
  onOpenFilters,
  activeFilterCount,
}: {
  search: CatalogSearch
  onSort: (sort: SortOption) => void
  onOpenFilters: () => void
  activeFilterCount: number
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4">
      <nav aria-label="Filtrar catálogo" className="flex max-w-full min-w-0 gap-3 overflow-x-auto text-[15px] leading-4 font-medium [scrollbar-width:none] md:gap-5">
        {TABS.map((tab) => {
          const active = search.tab === tab.value
          return (
            <Link
              key={tab.value}
              to="/"
              search={(prev) => patchSearch(prev, { tab: tab.value })}
              resetScroll={false}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative shrink-0 pb-2 whitespace-nowrap outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-opacity focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'text-brand after:bg-primary after:opacity-100' : 'text-foreground after:bg-primary after:opacity-0 hover:text-brand',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex max-w-full min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onOpenFilters}
          className="hidden h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground outline-none hover:border-border-soft focus-visible:ring-2 focus-visible:ring-ring md:inline-flex lg:hidden"
        >
          <Icon icon={FilterIcon} size={16} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
        <label className="flex min-w-0 items-center gap-1 text-[15px] leading-4 text-foreground">
          <span className="whitespace-nowrap xs:hidden">Ordenar:</span>
          <span className="hidden whitespace-nowrap xs:inline">Ordenar por:</span>
          <Select value={search.sort} onValueChange={(value) => onSort(sortSchema.parse(value))}>
            <SelectTrigger
              aria-label="Ordenar por"
              className="h-auto min-w-0 gap-1 rounded-xs border-0 bg-transparent p-0 text-[15px] text-foreground shadow-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring dark:bg-transparent dark:hover:bg-transparent [&_svg:not([class*='text-'])]:text-foreground"
            >
              <SelectValue>{SORT_LABEL[search.sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" align="end" className="min-w-55">
              {sortSchema.options.map((option) => (
                <SelectItem key={option} value={option} className="text-sm">
                  {SORT_LABEL[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
    </div>
  )
}
