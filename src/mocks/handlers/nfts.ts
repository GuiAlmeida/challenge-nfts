import { http } from 'msw'
import { nftListQuerySchema, type NftListQuery } from '@/contracts/search'
import { NETWORK_LABEL, type Network } from '@/contracts/common'
import { compareEth, parseEth } from '@/lib/eth'
import { getDb } from '../db/store'
import { COLLECTIONS } from '../fixtures/collections'
import type { NftRecord } from '../fixtures/nfts'
import { minPrice, toNftDetail, toNftSummary } from '../serializers'
import { API_PREFIX, applyScenario, fail, json, parseWith } from './shared'

const THIRTY_DAYS = 30 * 86_400_000

const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const readQuery = (url: URL): NftListQuery | null => {
  const list = (key: string) => [...url.searchParams.getAll(key), ...url.searchParams.getAll(`${key}[]`)].flatMap((v) => v.split(',')).filter(Boolean)
  const raw = {
    q: url.searchParams.get('q') ?? undefined,
    collection: list('collection'),
    network: list('network'),
    priceMin: url.searchParams.get('priceMin') ?? undefined,
    priceMax: url.searchParams.get('priceMax') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    tab: url.searchParams.get('tab') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
  }
  const parsed = parseWith(raw, nftListQuerySchema)
  return parsed.ok ? parsed.data : null
}

const matchesText = (nft: NftRecord, q: string | undefined): boolean => {
  if (!q) return true
  const needle = normalize(q)
  const haystack = normalize(`${nft.name} ${nft.collectionSlug} ${nft.creator} ${nft.tokenId}`)
  return haystack.includes(needle)
}

const matchesTab = (nft: NftRecord, tab: NftListQuery['tab'], now: number): boolean => {
  if (tab === 'new') return now - new Date(nft.listedAt).getTime() <= THIRTY_DAYS
  if (tab === 'trending') return nft.trending
  return true
}

const matchesPrice = (nft: NftRecord, min: string | undefined, max: string | undefined): boolean => {
  const price = minPrice(nft)
  if (min && compareEth(price, min) < 0) return false
  if (max && compareEth(price, max) > 0) return false
  return true
}

const sorters: Record<NftListQuery['sort'], (a: NftRecord, b: NftRecord) => number> = {
  recent: (a, b) => b.listedAt.localeCompare(a.listedAt),
  price_asc: (a, b) => compareEth(minPrice(a), minPrice(b)),
  price_desc: (a, b) => compareEth(minPrice(b), minPrice(a)),
  trending: (a, b) => Number(b.trending) - Number(a.trending) || b.rating - a.rating || b.reviewsCount - a.reviewsCount,
}

export function listNfts(query: NftListQuery, nfts: NftRecord[], now = Date.now()) {
  const textAndTab = nfts.filter(
    (nft) => matchesText(nft, query.q) && matchesTab(nft, query.tab, now) && matchesPrice(nft, query.priceMin, query.priceMax),
  )
  const byNetwork = textAndTab.filter((nft) => query.network.length === 0 || query.network.includes(nft.network))
  const byCollection = textAndTab.filter((nft) => query.collection.length === 0 || query.collection.includes(nft.collectionSlug))
  const filtered = byNetwork.filter((nft) => query.collection.length === 0 || query.collection.includes(nft.collectionSlug))
  const sorted = [...filtered].sort(sorters[query.sort])
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
  const page = Math.min(query.page, totalPages)
  const items = sorted.slice((page - 1) * query.pageSize, page * query.pageSize).map(toNftSummary)
  const prices = nfts.map(minPrice).sort(compareEth)
  return {
    items,
    page,
    pageSize: query.pageSize,
    total,
    totalPages: total === 0 ? 0 : totalPages,
    facets: {
      collections: COLLECTIONS.map((c) => ({
        value: c.slug,
        label: c.name,
        count: byNetwork.filter((n) => n.collectionSlug === c.slug).length,
      })),
      networks: (['ethereum', 'polygon', 'solana'] as Network[]).map((network) => ({
        value: network,
        label: NETWORK_LABEL[network],
        count: byCollection.filter((n) => n.network === network).length,
      })),
      priceRange: { min: prices[0] ?? '0', max: prices.at(-1) ?? '0' },
    },
  }
}

export const nftHandlers = [
  http.get(`${API_PREFIX}/nfts`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const query = readQuery(new URL(request.url))
    if (!query) return fail(422, 'VALIDATION_ERROR', 'Parâmetros de busca inválidos.')
    return json(listNfts(query, getDb().nfts))
  }),

  http.get(`${API_PREFIX}/nfts/:id`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const nft = getDb().nfts.find((n) => n.id === params.id)
    if (!nft) return fail(404, 'NOT_FOUND', 'NFT não encontrado.')
    return json(toNftDetail(nft))
  }),
]

void parseEth
