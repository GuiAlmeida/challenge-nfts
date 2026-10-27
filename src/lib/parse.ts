import type { ZodType } from 'zod'
import { env } from './env'

export function parseInDev<T>(schema: ZodType<T>, data: unknown): T {
  if (env.DEV) return schema.parse(data)
  return data as T
}
