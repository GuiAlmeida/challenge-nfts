import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { AddCartItem } from '@/contracts/cart'
import { addCartItem } from './api'
import { cartKeys } from './queries/keys'
import { useCartScope } from './queries/use-cart'

export function useAddToCart() {
  const queryClient = useQueryClient()
  const scope = useCartScope()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (body: AddCartItem) => addCartItem(body),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.scope(scope), cart)
      toast.success('Adicionado ao carrinho', {
        action: { label: 'Ver carrinho', onClick: () => void navigate({ to: '/cart' }) },
      })
    },
  })
}
