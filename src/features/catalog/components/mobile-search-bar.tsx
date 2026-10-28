import { useId, useState } from 'react'
import { FilterIcon, SearchMobileIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import type { CatalogSearch } from '@/contracts/search'
import { useCatalogNavigate } from '../search-params'

export function MobileSearchBar({ search, onOpenFilters, activeCount }: { search: CatalogSearch; onOpenFilters: () => void; activeCount: number }) {
  const patch = useCatalogNavigate()
  const [value, setValue] = useState(search.q ?? '')
  const inputId = useId()
  return (
    <div className="flex items-center gap-2 md:hidden">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          void patch({ q: value.trim() || undefined })
        }}
        className="flex h-11.25 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-card pr-3 pl-3 focus-within:ring-2 focus-within:ring-ring/60"
      >
        <label htmlFor={inputId} className="sr-only">
          Buscar NFTs
        </label>
        <Icon icon={SearchMobileIcon} size={22} className="shrink-0 text-foreground" />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Explorar coleções"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-4 font-bold text-foreground outline-none placeholder:text-muted-foreground"
        />
      </form>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={activeCount > 0 ? `Filtros, ${activeCount} ativos` : 'Filtros'}
        className="relative flex size-11.25 shrink-0 items-center justify-center rounded-[14px] bg-linear-[137deg] from-primary/45 from-[25%] to-primary text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Icon icon={FilterIcon} size={22} />
        {activeCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] leading-none font-bold text-ink"
          >
            {activeCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}
