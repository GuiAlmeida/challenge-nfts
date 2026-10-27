import { z } from 'zod'

const schema = z.object({
  VITE_ENABLE_MOCKS: z.enum(['true', 'false']).default('false'),
  VITE_API_BASE_URL: z.string().default('/api'),
  MODE: z.string(),
  DEV: z.boolean(),
  PROD: z.boolean(),
})

export const env = schema.parse(import.meta.env)
export const mocksEnabled = env.VITE_ENABLE_MOCKS === 'true'
