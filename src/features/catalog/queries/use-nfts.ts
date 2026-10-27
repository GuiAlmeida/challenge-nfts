import { useQuery } from '@tanstack/react-query'
import { type CatalogSearch, toNftListQuery } from '@/contracts/search'
import { nftListOptions } from './options'

export function useNfts(search: CatalogSearch) {
  return useQuery(nftListOptions(toNftListQuery(search)))
}
