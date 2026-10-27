import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Edition, NftDetail } from '@/contracts/nft'
import { useAddToCart } from '@/features/cart'
import { isApiError } from '@/lib/api-error'
import { clampQuantity, defaultEditionId, maxQuantityFor } from '../catalog.rules'
import { nftKeys } from '../queries/keys'

export interface NftDetailFlow {
  edition: Edition
  quantity: number
  max: number
  soldOut: boolean
  selectEdition: (id: string) => void
  setQuantity: (quantity: number) => void
  buy: () => void
  buying: boolean
}

export function useNftDetailFlow(nft: NftDetail): NftDetailFlow {
  const [editionId, setEditionId] = useState(() => defaultEditionId(nft.editions))
  const [requested, setRequested] = useState(1)
  const queryClient = useQueryClient()
  const addToCart = useAddToCart()

  const edition = nft.editions.find((e) => e.id === editionId) ?? nft.editions[0]!
  const max = maxQuantityFor(edition)
  const quantity = clampQuantity(requested, max)

  return {
    edition,
    quantity,
    max,
    soldOut: max === 0,
    selectEdition: (id) => {
      setEditionId(id)
      setRequested(1)
    },
    setQuantity: (next) => setRequested(clampQuantity(next, max)),
    buy: () => {
      if (max === 0 || addToCart.isPending) return
      addToCart.mutate(
        { nftId: nft.id, editionId: edition.id, quantity },
        {
          onError: (error) => {
            toast.error(error.message)
            if (isApiError(error) && error.code === 'AVAILABILITY_CONFLICT') {
              void queryClient.invalidateQueries({ queryKey: nftKeys.detail(nft.id) })
            }
          },
        },
      )
    },
    buying: addToCart.isPending,
  }
}
