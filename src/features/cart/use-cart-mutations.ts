import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Cart } from '@/contracts/cart'
import { removeCartItem, updateCartItem } from './api'
import { removeItem, setItemQuantity } from './cart.rules'
import { cartKeys, quoteKeys } from './queries/keys'
import { useCartScope } from './queries/use-cart'

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  const key = cartKeys.scope(useCartScope())
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateCartItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Cart>(key)
      if (previous) queryClient.setQueryData(key, setItemQuantity(previous, itemId, quantity))
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      toast.error(error.message, { id: 'cart-update' })
    },
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()
  const key = cartKeys.scope(useCartScope())
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; name: string }) => removeCartItem(itemId),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Cart>(key)
      if (previous) queryClient.setQueryData(key, removeItem(previous, itemId))
      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      toast.error(error.message, { id: 'cart-remove' })
    },
    onSuccess: (cart, { name }) => {
      queryClient.setQueryData(key, cart)
      toast.success(`${name} removido do carrinho.`, { id: 'cart-remove' })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
  })
}
