import { z } from 'zod'
import { ethStringSchema } from './common'

export const sortSchema = z.enum(['recent', 'price_asc', 'price_desc', 'trending'])
export type SortOption = z.infer<typeof sortSchema>

export const tabSchema = z.enum(['all', 'new', 'trending'])
export type TabOption = z.infer<typeof tabSchema>

export const CATALOG_SEARCH_DEFAULTS = { page: 1, sort: 'recent', tab: 'all' } as const
export const CATALOG_PAGE_SIZE = 9

export const catalogSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  collection: z.string().min(1).optional().catch(undefined),
  network: z.string().min(1).optional().catch(undefined),
  priceMin: z
    .string()
    .regex(/^\d+(\.\d{1,18})?$/)
    .optional()
    .catch(undefined),
  priceMax: z
    .string()
    .regex(/^\d+(\.\d{1,18})?$/)
    .optional()
    .catch(undefined),
  sort: sortSchema.catch(CATALOG_SEARCH_DEFAULTS.sort),
  tab: tabSchema.catch(CATALOG_SEARCH_DEFAULTS.tab),
  page: z.number().int().min(1).catch(CATALOG_SEARCH_DEFAULTS.page),
})
export type CatalogSearch = z.infer<typeof catalogSearchSchema>

export const splitCsv = (value: string | undefined): string[] =>
  value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : []

export const joinCsv = (values: readonly string[]): string | undefined => (values.length ? values.join(',') : undefined)

export const nftListQuerySchema = z.object({
  q: z.string().optional(),
  collection: z.array(z.string()).default([]),
  network: z.array(z.string()).default([]),
  priceMin: ethStringSchema.optional(),
  priceMax: ethStringSchema.optional(),
  sort: sortSchema.default('recent'),
  tab: tabSchema.default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(CATALOG_PAGE_SIZE),
})
export type NftListQuery = z.infer<typeof nftListQuerySchema>

export const toNftListQuery = (search: CatalogSearch): NftListQuery => ({
  q: search.q,
  collection: splitCsv(search.collection),
  network: splitCsv(search.network),
  priceMin: search.priceMin,
  priceMax: search.priceMax,
  sort: search.sort,
  tab: search.tab,
  page: search.page,
  pageSize: CATALOG_PAGE_SIZE,
})
