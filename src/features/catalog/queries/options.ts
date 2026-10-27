import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { NftListQuery } from '@/contracts/search'
import { fetchNft, fetchNfts } from '../api'
import { nftKeys } from './keys'

export const nftListOptions = (query: NftListQuery) =>
  queryOptions({
    queryKey: nftKeys.list(query),
    queryFn: ({ signal }) => fetchNfts(query, signal),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })

export const nftDetailOptions = (id: string) =>
  queryOptions({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => fetchNft(id, signal),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })
