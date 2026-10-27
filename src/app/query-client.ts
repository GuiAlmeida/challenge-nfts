import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isApiError(error) && !error.retryable) return false
        return failureCount < 1
      },
    },
    mutations: { retry: 0 },
  },
})
