import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { PublicUser } from '@/contracts/auth'
import { applyApiErrorToForm, applyUserUpdate } from '@/features/auth'
import { PROFILE_FIELDS, passwordChangeFrom, profileFormFrom, profilePatch, savedMessage } from './account.rules'
import { changePassword, updateProfile } from './api'
import { type ProfileFormOutput, type ProfileFormValues, profileFormSchema } from './schemas'

export function useProfileFlow(user: PublicUser) {
  const queryClient = useQueryClient()
  const form = useForm<ProfileFormValues, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormFrom(user),
  })
  const profileMutation = useMutation({ mutationFn: updateProfile })
  const passwordMutation = useMutation({ mutationFn: changePassword })

  const submit = form.handleSubmit(async (values) => {
    const profileChanged = PROFILE_FIELDS.some((name) => form.getFieldState(name).isDirty)
    const passwordChange = passwordChangeFrom(values)
    if (!profileChanged && !passwordChange) {
      toast.info('Nenhuma alteração para salvar.', { id: 'profile-unchanged' })
      return
    }
    let current = user
    if (profileChanged) {
      try {
        current = await profileMutation.mutateAsync(profilePatch(values))
        applyUserUpdate(queryClient, current)
        form.reset({ ...profileFormFrom(current), currentPassword: values.currentPassword, newPassword: values.newPassword, confirmPassword: values.confirmPassword })
      } catch (error) {
        applyApiErrorToForm(form, error)
        return
      }
    }
    if (passwordChange) {
      try {
        await passwordMutation.mutateAsync(passwordChange)
      } catch (error) {
        applyApiErrorToForm(form, error)
        if (profileChanged) toast.success(savedMessage(true, false), { id: 'profile-saved' })
        return
      }
    }
    form.reset(profileFormFrom(current))
    toast.success(savedMessage(profileChanged, Boolean(passwordChange)), { id: 'profile-saved' })
  })

  return { form, submit, pending: form.formState.isSubmitting }
}

export type ProfileFlow = ReturnType<typeof useProfileFlow>
