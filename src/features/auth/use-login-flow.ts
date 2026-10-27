import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { login } from './api'
import { applyApiErrorToForm } from './form-errors'
import { safeRedirect } from './redirect'
import { loginFormSchema } from './schemas'
import { afterSignIn } from './session-actions'

export function useLoginFlow(redirect: string | undefined) {
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({ mutationFn: login })

  const submit = form.handleSubmit(async (values) => {
    try {
      const session = await mutation.mutateAsync(values)
      afterSignIn(session, queryClient)
      await navigate({ href: safeRedirect(redirect) })
    } catch (error) {
      applyApiErrorToForm(form, error)
    }
  })

  return { form, submit, pending: mutation.isPending }
}
