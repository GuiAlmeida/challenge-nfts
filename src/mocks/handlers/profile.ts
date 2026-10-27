import { http } from 'msw'
import { avatarUploadSchema, passwordChangeSchema, profileUpdateSchema } from '@/contracts/user'
import { getDb, mutate } from '../db/store'
import { toPublicUser } from '../serializers'
import { API_PREFIX, applyScenario, authenticate, fail, hashPassword, json, parseBody } from './shared'

export const profileHandlers = [
  http.get(`${API_PREFIX}/me`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return json(toPublicUser(auth.user))
  }),

  http.patch(`${API_PREFIX}/me`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const parsed = await parseBody(request, profileUpdateSchema)
    if (!parsed.ok) return parsed.response
    const data = parsed.data
    const db = getDb()
    if (db.users.some((u) => u.id !== auth.user.id && u.username.toLowerCase() === data.username.toLowerCase())) {
      return fail(409, 'USERNAME_TAKEN', 'Este nome de usuário já existe.', {
        fields: { username: 'Este nome de usuário já existe.' },
      })
    }
    if (db.users.some((u) => u.id !== auth.user.id && u.email === data.email)) {
      return fail(409, 'EMAIL_TAKEN', 'Este e-mail já está cadastrado.', {
        fields: { email: 'Este e-mail já está cadastrado.' },
      })
    }
    const updated = mutate((current) => {
      const user = current.users.find((u) => u.id === auth.user.id)!
      user.displayName = data.displayName
      user.username = data.username
      user.email = data.email
      user.walletAlias = data.walletAlias ? data.walletAlias : null
      user.ens = data.ens ? data.ens : null
      user.version += 1
      return user
    })
    return json(toPublicUser(updated))
  }),

  http.post(`${API_PREFIX}/me/avatar`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const parsed = await parseBody(request, avatarUploadSchema)
    if (!parsed.ok) return parsed.response
    const updated = mutate((current) => {
      const user = current.users.find((u) => u.id === auth.user.id)!
      user.avatarUrl = parsed.data.dataUrl
      user.version += 1
      return user
    })
    return json(toPublicUser(updated))
  }),

  http.delete(`${API_PREFIX}/me/avatar`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const updated = mutate((current) => {
      const user = current.users.find((u) => u.id === auth.user.id)!
      user.avatarUrl = null
      user.version += 1
      return user
    })
    return json(toPublicUser(updated))
  }),

  http.post(`${API_PREFIX}/me/password`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const parsed = await parseBody(request, passwordChangeSchema)
    if (!parsed.ok) return parsed.response
    const currentHash = await hashPassword(auth.user.id, parsed.data.currentPassword)
    if (currentHash !== auth.user.passwordHash) {
      return fail(400, 'WRONG_PASSWORD', 'Senha atual incorreta.', {
        fields: { currentPassword: 'Senha atual incorreta.' },
      })
    }
    const nextHash = await hashPassword(auth.user.id, parsed.data.newPassword)
    mutate((current) => {
      const user = current.users.find((u) => u.id === auth.user.id)!
      user.passwordHash = nextHash
      user.version += 1
    })
    return new Response(null, { status: 204 })
  }),
]
