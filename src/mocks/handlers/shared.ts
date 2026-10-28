import { delay, HttpResponse, type DefaultBodyType, type StrictRequest } from 'msw'
import type { ZodType } from 'zod'
import type { ApiErrorCode } from '@/contracts/errors'
import { getDb, mutate } from '../db/store'
import type { MockDb, SessionRecord } from '../db/schema'
import type { UserRecord } from '../fixtures/users'
import { getScenario, latencyFor, matchFailure } from '../scenarios/runtime'

export const API_PREFIX = '/api'

export const json = <T>(data: T, init?: ResponseInit) => HttpResponse.json(data as DefaultBodyType, init)

export function fail(status: number, code: ApiErrorCode, message: string, extra: { fields?: Record<string, string>; details?: unknown } = {}) {
  return HttpResponse.json({ error: { code, message, ...extra } }, { status })
}

export async function applyScenario(request: Request): Promise<Response | null> {
  const url = new URL(request.url)
  const path = url.pathname.replace(API_PREFIX, '')
  const rule = matchFailure(request.method, path)
  if (rule?.kind === 'network') {
    await delay(latencyFor(request.method, path))
    return HttpResponse.error()
  }
  if (rule?.kind === 'timeout') {
    await delay(30_000)
    return HttpResponse.error()
  }
  await delay(latencyFor(request.method, path))
  if (rule) {
    return fail(rule.status ?? 500, rule.code ?? 'UNAVAILABLE', rule.message ?? 'Falha transitória.')
  }
  return null
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response }

export async function parseBody<T>(request: StrictRequest<DefaultBodyType>, schema: ZodType<T>): Promise<ParseResult<T>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { ok: false, response: fail(400, 'VALIDATION_ERROR', 'Corpo da requisição inválido.') }
  }
  return parseWith(raw, schema)
}

export function parseWith<T>(raw: unknown, schema: ZodType<T>): ParseResult<T> {
  const result = schema.safeParse(raw)
  if (result.success) return { ok: true, data: result.data }
  const fields: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join('.') || '_'
    if (!fields[key]) fields[key] = issue.message
  }
  return { ok: false, response: fail(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fields }) }
}

export type AuthResult = { ok: true; user: UserRecord; session: SessionRecord } | { ok: false; response: Response }

export function authenticate(request: Request): AuthResult {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return { ok: false, response: fail(401, 'UNAUTHENTICATED', 'Entre para continuar.') }
  const db = getDb()
  const session = db.sessions.find((s) => s.token === token)
  if (!session) return { ok: false, response: fail(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.') }
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    mutate((current) => {
      current.sessions = current.sessions.filter((s) => s.token !== token)
    })
    return { ok: false, response: fail(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.') }
  }
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return { ok: false, response: fail(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.') }
  return { ok: true, user, session }
}

export function optionalUser(request: Request): UserRecord | null | Response {
  const header = request.headers.get('authorization') ?? ''
  if (!header.startsWith('Bearer ')) return null
  const result = authenticate(request)
  return result.ok ? result.user : result.response
}

export const guestCartId = (request: Request): string | null => request.headers.get('x-cart-id')?.trim() || null

export function createSession(db: MockDb, userId: string): SessionRecord {
  const ttl = getScenario().sessionTtlMs
  const now = Date.now()
  const session: SessionRecord = {
    token: `sess_${crypto.randomUUID()}`,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttl).toISOString(),
  }
  db.sessions.push(session)
  return session
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const hashPassword = (userId: string, password: string): Promise<string> => sha256Hex(`${userId}:${password}`)
