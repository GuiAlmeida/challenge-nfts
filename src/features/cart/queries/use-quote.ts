import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { requestQuote } from '../api'
import { quoteKeys } from './keys'
import { useCartScope } from './use-cart'

export function useQuote(couponCode: string | null, enabled: boolean) {
  const scope = useCartScope()
  return useQuery({
    queryKey: quoteKeys.for(scope, couponCode),
    queryFn: ({ signal }) => requestQuote(couponCode, signal),
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    placeholderData: keepPreviousData,
  })
}
