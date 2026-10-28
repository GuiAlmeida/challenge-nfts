import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { PublicUser } from '@/contracts/auth'
import { applyUserUpdate } from '@/features/auth'
import { isApiError } from '@/lib/api-error'
import { readFileAsDataUrl } from '@/lib/files'
import { avatarFileError } from './account.rules'
import { removeAvatar, uploadAvatar } from './api'

const errorMessage = (error: unknown): string => {
  if (isApiError(error)) return error.fields?.dataUrl ?? error.message
  return error instanceof Error ? error.message : 'Não foi possível atualizar o avatar.'
}

export function useAvatarFlow() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const onSuccess = (message: string) => (user: PublicUser) => {
    applyUserUpdate(queryClient, user)
    toast.success(message, { id: 'avatar' })
  }
  const upload = useMutation({ mutationFn: uploadAvatar, onSuccess: onSuccess('Avatar atualizado.'), onError: (e) => setError(errorMessage(e)) })
  const remove = useMutation({ mutationFn: removeAvatar, onSuccess: onSuccess('Avatar removido.'), onError: (e) => setError(errorMessage(e)) })

  const choose = async (file: File | undefined) => {
    if (!file) return
    const problem = avatarFileError(file)
    setError(problem)
    if (problem) return
    try {
      upload.mutate(await readFileAsDataUrl(file))
    } catch (readError) {
      setError(errorMessage(readError))
    }
  }

  return {
    choose,
    remove: () => {
      setError(null)
      remove.mutate()
    },
    error,
    pending: upload.isPending || remove.isPending,
  }
}

export type AvatarFlow = ReturnType<typeof useAvatarFlow>
