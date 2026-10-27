import axios, { type AxiosRequestConfig } from 'axios'
import { env } from './env'
import { networkReady } from './ready'
import { toApiError } from './api-error'

export interface RequestOptions {
  idempotencyKey?: string
  signal?: AbortSignal
}

interface HttpConfig {
  getToken: () => string | null
  getCartId: () => string | null
  onUnauthorized?: (token: string) => void
}

let httpConfig: HttpConfig = { getToken: () => null, getCartId: () => null }

export function configureHttp(next: Partial<HttpConfig>): void {
  httpConfig = { ...httpConfig, ...next }
}

export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use(async (config) => {
  await networkReady.promise
  const token = httpConfig.getToken()
  const cartId = httpConfig.getCartId()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  if (cartId) config.headers.set('X-Cart-Id', cartId)
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)
    if (apiError.status === 401 && axios.isAxiosError(error)) {
      const sent = String(error.config?.headers?.Authorization ?? '')
      const current = httpConfig.getToken()
      if (current && sent === `Bearer ${current}`) httpConfig.onUnauthorized?.(current)
    }
    return Promise.reject(apiError)
  },
)

const withOptions = (options?: RequestOptions): AxiosRequestConfig => ({
  signal: options?.signal,
  headers: options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : undefined,
})

export const http = {
  get: async <T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> =>
    (await httpClient.get<T>(url, { params, ...withOptions(options) })).data,
  post: async <T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    (await httpClient.post<T>(url, body, withOptions(options))).data,
  patch: async <T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    (await httpClient.patch<T>(url, body, withOptions(options))).data,
  put: async <T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    (await httpClient.put<T>(url, body, withOptions(options))).data,
  delete: async <T>(url: string, options?: RequestOptions): Promise<T> => (await httpClient.delete<T>(url, withOptions(options))).data,
}
