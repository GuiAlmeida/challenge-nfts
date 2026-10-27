import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { isApiError } from '@/lib/api-error'

export function applyApiErrorToForm<T extends FieldValues>(form: UseFormReturn<T, unknown, FieldValues>, error: unknown): void {
  if (!isApiError(error)) {
    form.setError('root', { message: error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.' })
    return
  }
  const known = Object.keys(form.getValues())
  const fields = Object.entries(error.fields ?? {}).filter(([name]) => known.includes(name))
  if (fields.length === 0) {
    form.setError('root', { message: error.message })
    return
  }
  for (const [name, message] of fields) form.setError(name as Path<T>, { message })
  form.setFocus(fields[0]![0] as Path<T>)
}
