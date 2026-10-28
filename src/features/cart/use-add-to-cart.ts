import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { AddCartItem } from '@/contracts/cart'
import { addCartItem } from './api'
import { useCartUiStore } from './cart-ui-store'
import { cartKeys } from './queries/keys'
import { useCartScope } from './queries/use-cart'

const DESKTOP_QUERY = '(min-width: 768px)'

export interface AddToCartOptions {
  desktopFeedback?: 'mini-cart' | 'announce'
}

export function useAddToCart({ desktopFeedback = 'mini-cart' }: AddToCartOptions = {}) {
  const queryClient = useQueryClient()
  const scope = useCartScope()
  const navigate = useNavigate()
  const openMiniCart = useCartUiStore((s) => s.setMiniCartOpen)
  const announce = useCartUiStore((s) => s.announce)
  return useMutation({
    mutationFn: ({ body }: { body: AddCartItem; name: string }) => addCartItem(body),
    onSuccess: (cart, { name }) => {
      queryClient.setQueryData(cartKeys.scope(scope), cart)
      if (window.matchMedia(DESKTOP_QUERY).matches) {
        if (desktopFeedback === 'mini-cart') openMiniCart(true)
        else announce(`${name} adicionado ao carrinho.`)
        return
      }
      toast.success('Adicionado ao carrinho', {
        action: { label: 'Ver carrinho', onClick: () => void navigate({ to: '/cart' }) },
      })
    },
  })
}
