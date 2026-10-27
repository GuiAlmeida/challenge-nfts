import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import type { CatalogSearch } from '@/contracts/search'
import { patchSearch } from './catalog.rules'

export function useCatalogSearch(): CatalogSearch {
  return useSearch({ from: '/' })
}

export function useCatalogNavigate() {
  const navigate = useNavigate({ from: '/' })
  return useCallback(
    (patch: Partial<CatalogSearch>) => navigate({ to: '/', search: (prev) => patchSearch(prev, patch), resetScroll: false }),
    [navigate],
  )
}
