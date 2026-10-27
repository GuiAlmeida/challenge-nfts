import axios from 'axios'

import { apiErrorBodySchema, type ApiErrorBody, type ApiErrorCode } from '@/contracts/errors'

export type { ApiErrorBody, ApiErrorCode }

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  readonly fields?: Record<string, string>
  readonly details?: unknown
  readonly retryable: boolean

  constructor(input: { code: ApiErrorCode; status: number; message: string; fields?: Record<string, string>; details?: unknown }) {
    super(input.message)
    this.name = 'ApiError'
    this.code = input.code
    this.status = input.status
    this.fields = input.fields
    this.details = input.details
    this.retryable = input.status === 0 || input.status >= 500 || input.code === 'TIMEOUT'
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ code: 'TIMEOUT', status: 0, message: 'A requisição demorou demais.' })
    }
    if (!error.response) {
      return new ApiError({ code: 'NETWORK_ERROR', status: 0, message: 'Sem conexão com o servidor.' })
    }
    const { status, data } = error.response
    const body = apiErrorBodySchema.safeParse(data)
    if (body.success) {
      return new ApiError({
        code: body.data.error.code,
        status,
        message: body.data.error.message,
        fields: body.data.error.fields,
        details: body.data.error.details,
      })
    }
    return new ApiError({ code: status >= 500 ? 'UNAVAILABLE' : 'UNKNOWN', status, message: error.message })
  }
  return new ApiError({
    code: 'UNKNOWN',
    status: 0,
    message: error instanceof Error ? error.message : String(error),
  })
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError
