import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { register } from './api'
import { applyApiErrorToForm } from './form-errors'
import { safeRedirect } from './redirect'
import { registerFormSchema } from './schemas'
import { afterSignIn } from './session-actions'

export function useRegisterFlow(redirect: string | undefined) {
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({ mutationFn: register })

  const submit = form.handleSubmit(async ({ username, email, password }) => {
    try {
      const session = await mutation.mutateAsync({ username, email, password })
      afterSignIn(session, queryClient)
      await navigate({ href: safeRedirect(redirect) })
    } catch (error) {
      applyApiErrorToForm(form, error)
    }
  })

  return { form, submit, pending: mutation.isPending }
}
