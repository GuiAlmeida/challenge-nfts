import { TrashIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { cn } from 'cn'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { networkSchema } from '@/contracts/common'
import type { NftListResponse } from '@/contracts/nft'
import { type CatalogSearch, splitCsv } from '@/contracts/search'
import {
  formatPriceLabel,
  hasActiveFilters,
  isPriceRangeWhole,
  priceInputToStep,
  priceStepsFrom,
  sortFacetsByLabel,
  stepToEth,
  toggleCsvValue,
} from '../catalog.rules'

type Facets = NftListResponse['facets']

const COLLECTION_PLACEHOLDER_ROWS = 9

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
        <h3 id={titleId} className="text-lg leading-6 font-bold text-foreground">
          {title}
        </h3>
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
  placeholderRows,
}: {
  labelledBy: string
  items: Facets['collections']
  selected: string[]
  onToggle: (value: string) => void
  pending: boolean
  placeholderRows: number
}) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={labelledBy} aria-busy={pending}>
      <ul className="flex flex-col">
        {pending
          ? Array.from({ length: placeholderRows }, (_, i) => (
              <li key={i} className="flex h-10 items-center justify-between" aria-hidden="true">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-8" />
              </li>
            ))
          : null}
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
    </div>
  )
}

function PriceField({
  label,
  value,
  draft,
  onDraft,
  onCommit,
}: {
  label: string
  value: string
  draft: string | null
  onDraft: (text: string) => void
  onCommit: () => void
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs leading-4 text-sand">
        {label}
      </label>
      <div className="flex h-9 items-center gap-1 rounded-xs border border-input px-2 focus-within:border-primary">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? value}
          onChange={(event) => onDraft(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            onCommit()
          }}
          className="min-w-0 flex-1 bg-transparent text-sm leading-4 text-foreground outline-none"
        />
        <span aria-hidden="true" className="text-xs leading-4 text-sand">
          ETH
        </span>
      </div>
    </div>
  )
}

function PriceFilter({ range, search, onPatch }: { range: Facets['priceRange']; search: CatalogSearch; onPatch: FiltersProps['onPatch'] }) {
  const steps = priceStepsFrom(range, search)
  const [value, setValue] = useState<[number, number]>(steps.value)
  const [drafts, setDrafts] = useState<[string | null, string | null]>([null, null])
  const [lo, hi] = [stepToEth(value[0]), stepToEth(value[1])]
  const apply = () => {
    const whole = isPriceRangeWhole(range, [lo, hi])
    onPatch(whole ? { priceMin: undefined, priceMax: undefined } : { priceMin: lo, priceMax: hi })
  }
  const commit = (index: 0 | 1) => {
    const text = drafts[index]
    setDrafts((current) => (index === 0 ? [null, current[1]] : [current[0], null]))
    if (text === null) return
    const step = priceInputToStep(text, steps.bounds, index === 0 ? 'floor' : 'ceil')
    if (step === null) return
    setValue((current) => (index === 0 ? [Math.min(step, current[1]), current[1]] : [current[0], Math.max(step, current[0])]))
  }
  return (
    <div className="flex flex-col gap-3">
      <Slider
        min={steps.bounds[0]}
        max={steps.bounds[1]}
        step={1}
        minStepsBetweenThumbs={0}
        value={value}
        onValueChange={(next) => setValue([next[0] ?? steps.bounds[0], next[1] ?? steps.bounds[1]])}
        thumbLabels={['Preço mínimo em ETH', 'Preço máximo em ETH']}
      />
      <div className="flex items-end gap-2">
        <PriceField
          label="Mínimo"
          value={formatPriceLabel(lo)}
          draft={drafts[0]}
          onDraft={(text) => setDrafts((current) => [text, current[1]])}
          onCommit={() => commit(0)}
        />
        <span aria-hidden="true" className="pb-2.5 text-sand">
          –
        </span>
        <PriceField
          label="Máximo"
          value={formatPriceLabel(hi)}
          draft={drafts[1]}
          onDraft={(text) => setDrafts((current) => [current[0], text])}
          onCommit={() => commit(1)}
        />
      </div>
      <Button type="button" size="xs" radius="md" className="h-9 self-start px-3" onClick={apply}>
        Aplicar
      </Button>
    </div>
  )
}

function PriceFilterSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
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
            placeholderRows={COLLECTION_PLACEHOLDER_ROWS}
          />
        )}
      </FilterSection>
      <FilterSection title="Faixa de preço">
        {() =>
          facets ? (
            <PriceFilter
              key={`${facets.priceRange.min}:${facets.priceRange.max}:${search.priceMin ?? ''}:${search.priceMax ?? ''}`}
              range={facets.priceRange}
              search={search}
              onPatch={onPatch}
            />
          ) : (
            <PriceFilterSkeleton />
          )
        }
      </FilterSection>
      <FilterSection title="Rede">
        {(titleId) => (
          <FacetList
            labelledBy={titleId}
            items={networks}
            selected={splitCsv(search.network)}
            onToggle={(value) => onPatch({ network: toggleCsvValue(search.network, value) })}
            pending={pending}
            placeholderRows={networkSchema.options.length}
          />
        )}
      </FilterSection>
    </div>
  )
}
