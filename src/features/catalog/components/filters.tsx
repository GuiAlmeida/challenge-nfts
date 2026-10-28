import { TrashIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { cn } from 'cn'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import type { NftListResponse } from '@/contracts/nft'
import { type CatalogSearch, splitCsv } from '@/contracts/search'
import { formatPriceLabel, hasActiveFilters, isPriceRangeWhole, priceStepsFrom, sortFacetsByLabel, stepToEth, toggleCsvValue } from '../catalog.rules'

type Facets = NftListResponse['facets']

export interface FiltersProps {
  facets: Facets | undefined
  search: CatalogSearch
  onPatch: (patch: Partial<CatalogSearch>) => void
  className?: string
}

const CLEAR_PATCH: Partial<CatalogSearch> = {
  q: undefined,
  collection: undefined,
  network: undefined,
  priceMin: undefined,
  priceMax: undefined,
  tab: 'all',
}

function FilterSection({ title, action, children }: { title: string; action?: React.ReactNode; children: (titleId: string) => React.ReactNode }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <div className="flex h-6 items-center justify-between gap-3">
        <h2 id={titleId} className="text-lg leading-6 font-bold text-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children(titleId)}
    </section>
  )
}

function FacetList({
  labelledBy,
  items,
  selected,
  onToggle,
  pending,
}: {
  labelledBy: string
  items: Facets['collections']
  selected: string[]
  onToggle: (value: string) => void
  pending: boolean
}) {
  const id = useId()
  return (
    <ul role="group" aria-labelledby={labelledBy} className="flex flex-col" aria-busy={pending}>
      {items.map((item) => {
        const checked = selected.includes(item.value)
        const inputId = `${id}-${item.value}`
        return (
          <li key={item.value} className={cn('flex items-center justify-between text-[15px] leading-10', checked ? 'text-brand' : 'text-sand')}>
            <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox id={inputId} checked={checked} onCheckedChange={() => onToggle(item.value)} className="size-3.5 border-border-soft" />
              {item.label}
            </label>
            <span className="font-bold">
              <span className="sr-only">{item.count} itens</span>
              <span aria-hidden="true">({item.count})</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function PriceFilter({ range, search, onPatch }: { range: Facets['priceRange']; search: CatalogSearch; onPatch: FiltersProps['onPatch'] }) {
  const steps = priceStepsFrom(range, search)
  const [value, setValue] = useState<[number, number]>(steps.value)
  const labelId = useId()
  const [lo, hi] = [stepToEth(value[0]), stepToEth(value[1])]
  const apply = () => {
    const whole = isPriceRangeWhole(range, [lo, hi])
    onPatch(whole ? { priceMin: undefined, priceMax: undefined } : { priceMin: lo, priceMax: hi })
  }
  return (
    <FilterSection title="Faixa de preço">
      {() => (
        <div className="flex flex-col gap-3">
          <Slider
            min={steps.bounds[0]}
            max={steps.bounds[1]}
            step={1}
            minStepsBetweenThumbs={0}
            value={value}
            onValueChange={(next) => setValue([next[0] ?? steps.bounds[0], next[1] ?? steps.bounds[1]])}
            thumbLabels={['Preço mínimo em ETH', 'Preço máximo em ETH']}
            aria-describedby={labelId}
          />
          <p id={labelId} aria-live="polite" className="text-[15px] leading-4 text-foreground">
            Preço: {formatPriceLabel(lo)} - {formatPriceLabel(hi)} ETH
          </p>
          <Button type="button" size="xs" radius="md" className="h-9 self-start px-3" onClick={apply}>
            Aplicar
          </Button>
        </div>
      )}
    </FilterSection>
  )
}

export function Filters({ facets, search, onPatch, className }: FiltersProps) {
  const pending = !facets
  const collections = sortFacetsByLabel(facets?.collections ?? [])
  const networks = facets?.networks ?? []
  const active = hasActiveFilters(search)
  return (
    <div className={cn('flex flex-col gap-10 bg-card p-5', className)}>
      <FilterSection
        title="Coleções"
        action={
          active ? (
            <Button type="button" variant="link" className="h-auto gap-1 px-0 text-[13px] leading-4" onClick={() => onPatch(CLEAR_PATCH)}>
              <Icon icon={TrashIcon} size={12} />
              Limpar filtros
            </Button>
          ) : null
        }
      >
        {(titleId) => (
          <FacetList
            labelledBy={titleId}
            items={collections}
            selected={splitCsv(search.collection)}
            onToggle={(value) => onPatch({ collection: toggleCsvValue(search.collection, value) })}
            pending={pending}
          />
        )}
      </FilterSection>
      {facets ? (
        <PriceFilter
          key={`${facets.priceRange.min}:${facets.priceRange.max}:${search.priceMin ?? ''}:${search.priceMax ?? ''}`}
          range={facets.priceRange}
          search={search}
          onPatch={onPatch}
        />
      ) : null}
      <FilterSection title="Rede">
        {(titleId) => (
          <FacetList
            labelledBy={titleId}
            items={networks}
            selected={splitCsv(search.network)}
            onToggle={(value) => onPatch({ network: toggleCsvValue(search.network, value) })}
            pending={pending}
          />
        )}
      </FilterSection>
    </div>
  )
}
