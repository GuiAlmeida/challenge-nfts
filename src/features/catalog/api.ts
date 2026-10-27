import { type NftDetail, type NftListResponse, nftDetailSchema, nftListResponseSchema } from '@/contracts/nft'
import { joinCsv, type NftListQuery } from '@/contracts/search'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

const toParams = (query: NftListQuery): Record<string, unknown> => ({
  q: query.q,
  collection: joinCsv(query.collection),
  network: joinCsv(query.network),
  priceMin: query.priceMin,
  priceMax: query.priceMax,
  sort: query.sort,
  tab: query.tab,
  page: query.page,
  pageSize: query.pageSize,
})

export const fetchNfts = async (query: NftListQuery, signal?: AbortSignal): Promise<NftListResponse> =>
  parseInDev(nftListResponseSchema, await http.get<NftListResponse>('/nfts', toParams(query), { signal }))

export const fetchNft = async (id: string, signal?: AbortSignal): Promise<NftDetail> =>
  parseInDev(nftDetailSchema, await http.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, undefined, { signal }))
