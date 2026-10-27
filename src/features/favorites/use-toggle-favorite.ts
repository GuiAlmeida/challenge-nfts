import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback } from 'react'
import { toast } from 'sonner'
import type { Favorites } from '@/contracts/favorites'
import { useSessionUser } from '@/features/auth'
import { addFavorite, removeFavorite } from './api'
import { favoriteKeys } from './queries/keys'

interface ToggleInput {
  nftId: string
  name: string
  next: boolean
}

export function useToggleFavorite() {
  const user = useSessionUser()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: (s) => s.location.href })
  const key = favoriteKeys.list(user?.id ?? 'anonymous')

  const mutation = useMutation({
    mutationFn: ({ nftId, next }: ToggleInput) => (next ? addFavorite(nftId) : removeFavorite(nftId)),
    onMutate: async ({ nftId, next }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Favorites>(key)
      queryClient.setQueryData<Favorites>(key, (old) => {
        const ids = new Set(old?.nftIds ?? [])
        if (next) ids.add(nftId)
        else ids.delete(nftId)
        return { nftIds: [...ids] }
      })
      return { previous }
    },
    onError: (error, { name }, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      else queryClient.removeQueries({ queryKey: key })
      toast.error(`Não foi possível atualizar ${name}. ${error.message}`, { id: `favorite:${name}` })
    },
    onSuccess: (data, { name, next }) => {
      queryClient.setQueryData(key, data)
      toast.success(next ? `${name} adicionado aos favoritos.` : `${name} removido dos favoritos.`, {
        id: `favorite:${name}`,
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  return useCallback(
    (nftId: string, name: string, current: boolean) => {
      if (!user) {
        void navigate({ to: '/login', search: { redirect: href } })
        return
      }
      mutation.mutate({ nftId, name, next: !current })
    },
    [user, navigate, href, mutation],
  )
}
