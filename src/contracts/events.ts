import { z } from 'zod'

export const eventTypeSchema = z.enum(['nft.updated', 'order.updated'])
export type EventType = z.infer<typeof eventTypeSchema>

export const eventResourceSchema = z.object({
  type: z.enum(['nft', 'order']),
  id: z.string().min(1),
})

/** `id` identifica a entrega (dedupe); `version` é monotônica por recurso e decide se o evento ainda vale. */
export const eventEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: eventTypeSchema,
  resource: eventResourceSchema,
  version: z.number().int().nonnegative(),
  occurredAt: z.string(),
  payload: z.unknown(),
})

export type EventEnvelope<TPayload = unknown> = Omit<z.infer<typeof eventEnvelopeSchema>, 'payload'> & {
  payload: TPayload
}

export const nftUpdatedPayloadSchema = z.object({
  price: z.string().optional(),
  editions: z.array(z.object({ id: z.string(), price: z.string(), available: z.number().int().nonnegative() })).optional(),
})
export type NftUpdatedPayload = z.infer<typeof nftUpdatedPayloadSchema>

export const orderUpdatedPayloadSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'declined']),
  txHash: z.string().optional(),
  explorerUrl: z.string().optional(),
  receipt: z.unknown().optional(),
})
export type OrderUpdatedPayload = z.infer<typeof orderUpdatedPayloadSchema>
