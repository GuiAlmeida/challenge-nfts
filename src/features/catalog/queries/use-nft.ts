import { useQuery } from '@tanstack/react-query'
import { nftDetailOptions } from './options'

export function useNft(id: string) {
  return useQuery(nftDetailOptions(id))
}
