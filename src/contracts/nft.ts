import { z } from 'zod'
import { ethStringSchema, idSchema, isoDateSchema, networkSchema } from './common'

export const collectionSchema = z.object({ slug: z.string().min(1), name: z.string().min(1) })
export type Collection = z.infer<typeof collectionSchema>

export const editionKindSchema = z.enum(['unique', 'limited', 'open'])

/** `total: null` = edição aberta (sem limite de cópias). */
export const editionSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  kind: editionKindSchema,
  price: ethStringSchema,
  total: z.number().int().positive().nullable(),
  available: z.number().int().nonnegative(),
  maxPerOrder: z.number().int().positive(),
})
export type Edition = z.infer<typeof editionSchema>

export const nftImageSchema = z.object({
  slug: z.string().min(1),
  alt: z.string().min(1),
})
export type NftImage = z.infer<typeof nftImageSchema>

export const nftSummarySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  tokenId: z.string().min(1),
  collection: collectionSchema,
  network: networkSchema,
  price: ethStringSchema,
  previousPrice: ethStringSchema.nullable(),
  image: nftImageSchema,
  rare: z.boolean(),
  trending: z.boolean(),
  listedAt: isoDateSchema,
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().nonnegative(),
  soldOut: z.boolean(),
  version: z.number().int().nonnegative(),
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftDetailSchema = nftSummarySchema.extend({
  shortDescription: z.string(),
  description: z.string(),
  attributes: z.array(z.string()),
  creator: z.string(),
  royaltyPct: z.number().min(0).max(100),
  contractAddress: z.string(),
  gallery: z.array(nftImageSchema).min(1),
  editions: z.array(editionSchema).min(1),
})
export type NftDetail = z.infer<typeof nftDetailSchema>

export const facetSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
})

export const nftListResponseSchema = z.object({
  items: z.array(nftSummarySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  facets: z.object({
    collections: z.array(facetSchema),
    networks: z.array(facetSchema),
    priceRange: z.object({ min: ethStringSchema, max: ethStringSchema }),
  }),
})
export type NftListResponse = z.infer<typeof nftListResponseSchema>
