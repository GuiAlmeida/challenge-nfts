import type { Edition } from '@/contracts/nft'
import { CATALOG_SEARCH_DEFAULTS, type CatalogSearch, joinCsv, splitCsv } from '@/contracts/search'
import { compareEth, formatEth, parseEth } from '@/lib/eth'

const withDefaults = (search: Partial<CatalogSearch>): CatalogSearch => ({
  q: search.q,
  collection: search.collection,
  network: search.network,
  priceMin: search.priceMin,
  priceMax: search.priceMax,
  sort: search.sort ?? CATALOG_SEARCH_DEFAULTS.sort,
  tab: search.tab ?? CATALOG_SEARCH_DEFAULTS.tab,
  page: search.page ?? CATALOG_SEARCH_DEFAULTS.page,
})

export function patchSearch(prev: Partial<CatalogSearch>, patch: Partial<CatalogSearch>): CatalogSearch {
  const keys = Object.keys(patch) as Array<keyof CatalogSearch>
  const onlyPage = keys.length > 0 && keys.every((key) => key === 'page')
  const base = withDefaults(prev)
  return withDefaults({
    ...base,
    ...patch,
    page: onlyPage ? (patch.page ?? base.page) : CATALOG_SEARCH_DEFAULTS.page,
  })
}

export function toggleCsvValue(csv: string | undefined, value: string): string | undefined {
  const values = splitCsv(csv)
  const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
  return joinCsv(next)
}

export function countActiveFilters(search: CatalogSearch): number {
  return [
    search.q,
    search.collection,
    search.network,
    search.priceMin || search.priceMax,
    search.tab !== CATALOG_SEARCH_DEFAULTS.tab ? search.tab : undefined,
  ].filter(Boolean).length
}

export function hasActiveFilters(search: CatalogSearch): boolean {
  return Boolean(search.q || search.collection || search.network || search.priceMin || search.priceMax || search.tab !== CATALOG_SEARCH_DEFAULTS.tab)
}

export function pageWindow(page: number, totalPages: number, size = 5): number[] {
  if (totalPages <= 0) return []
  const half = Math.floor(size / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + size - 1)
  start = Math.max(1, end - size + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function maxQuantityFor(edition: Pick<Edition, 'available' | 'maxPerOrder'>): number {
  return Math.max(0, Math.min(edition.available, edition.maxPerOrder))
}

export function clampQuantity(quantity: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(Math.max(1, Math.trunc(quantity)), max)
}

export function defaultEditionId(editions: readonly Edition[]): string | null {
  const available = editions.filter((e) => e.available > 0)
  const cheapest = available.reduce<Edition | null>((best, e) => (best === null || compareEth(e.price, best.price) < 0 ? e : best), null)
  return cheapest?.id ?? editions[0]?.id ?? null
}

export const PRICE_STEP = '0.01'

export function ethToStep(value: string, mode: 'floor' | 'ceil' = 'floor'): number {
  const wei = parseEth(value)
  const step = parseEth(PRICE_STEP)
  const whole = wei / step
  const rounded = mode === 'ceil' && wei % step !== 0n ? whole + 1n : whole
  return Number(rounded)
}

export function stepToEth(index: number): string {
  return formatEth(BigInt(Math.max(0, Math.trunc(index))) * parseEth(PRICE_STEP))
}

export function priceStepsFrom(
  range: { min: string; max: string },
  selected: { priceMin?: string; priceMax?: string },
): { bounds: [number, number]; value: [number, number] } {
  const lo = ethToStep(range.min, 'floor')
  const hi = Math.max(lo, ethToStep(range.max, 'ceil'))
  const from = selected.priceMin ? Math.min(Math.max(lo, ethToStep(selected.priceMin, 'floor')), hi) : lo
  const to = selected.priceMax ? Math.max(from, Math.min(hi, ethToStep(selected.priceMax, 'ceil'))) : hi
  return { bounds: [lo, hi], value: [from, to] }
}

export function formatPriceLabel(value: string): string {
  return formatEth(parseEth(value), { minDecimals: 2, maxDecimals: 2 }).replace('.', ',')
}

export function isPriceRangeWhole(range: { min: string; max: string }, value: [string, string]): boolean {
  return compareEth(value[0], range.min) <= 0 && compareEth(value[1], range.max) >= 0
}
