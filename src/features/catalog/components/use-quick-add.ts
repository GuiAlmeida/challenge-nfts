import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { NftSummary } from '@/contracts/nft'
import { flyToCart, useAddToCart } from '@/features/cart'
import { defaultEditionId } from '../catalog.rules'
import { nftDetailOptions } from '../queries/options'

export function useQuickAdd() {
  const queryClient = useQueryClient()
  const addToCart = useAddToCart({ desktopFeedback: 'announce' })
  const [adding, setAdding] = useState(false)

  const add = async (nft: NftSummary, source: HTMLElement | null) => {
    if (adding) return
    setAdding(true)
    if (source) flyToCart(source)
    try {
      const detail = await queryClient.fetchQuery(nftDetailOptions(nft.id))
      const edition = detail.editions.find((e) => e.id === defaultEditionId(detail.editions))
      if (!edition || edition.available === 0) {
        toast.error(`${nft.name} está esgotado.`)
        return
      }
      await addToCart.mutateAsync({ body: { nftId: nft.id, editionId: edition.id, quantity: 1 }, name: nft.name })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível adicionar ao carrinho.')
    } finally {
      setAdding(false)
    }
  }

  return { add, adding }
}
