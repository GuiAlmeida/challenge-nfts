import { type LoginBody, type RegisterBody, type Session, sessionSchema } from '@/contracts/auth'
import { http } from '@/lib/http'
import { parseInDev } from '@/lib/parse'

export const login = async (body: LoginBody): Promise<Session> => parseInDev(sessionSchema, await http.post<Session>('/auth/login', body))

export const register = async (body: RegisterBody): Promise<Session> => parseInDev(sessionSchema, await http.post<Session>('/auth/register', body))

export const fetchSession = async (signal?: AbortSignal): Promise<Session> =>
  parseInDev(sessionSchema, await http.get<Session>('/auth/session', undefined, { signal }))

export const logout = (): Promise<void> => http.post<void>('/auth/logout')
