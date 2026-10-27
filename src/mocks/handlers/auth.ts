import { http } from 'msw'
import { loginBodySchema, registerBodySchema } from '@/contracts/auth'
import { getDb, mutate, nextId, nowIso } from '../db/store'
import type { CartRecord } from '../db/schema'
import { toPublicUser } from '../serializers'
import { API_PREFIX, applyScenario, authenticate, createSession, fail, guestCartId, hashPassword, json, parseBody } from './shared'

function mergeGuestCart(guestId: string | null, userId: string): boolean {
  if (!guestId) return false
  return mutate((db) => {
    const guest = db.carts.find((c) => c.scope === 'guest' && c.ownerKey === guestId)
    if (!guest || guest.items.length === 0) return false
    let userCart = db.carts.find((c) => c.scope === 'user' && c.ownerKey === userId)
    if (!userCart) {
      userCart = {
        id: `cart_${userId}`,
        scope: 'user',
        ownerKey: userId,
        items: [],
        updatedAt: nowIso(),
        version: 0,
      } satisfies CartRecord
      db.carts.push(userCart)
    }
    for (const item of guest.items) {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      const edition = nft?.editions.find((e) => e.id === item.editionId)
      if (!edition) continue
      const existing = userCart.items.find((i) => i.editionId === item.editionId)
      const cap = Math.min(edition.maxPerOrder, Math.max(edition.available, 0))
      if (existing) existing.quantity = Math.min(cap, existing.quantity + item.quantity)
      else userCart.items.push({ ...item, id: nextId('ci'), quantity: Math.min(cap, item.quantity) })
    }
    userCart.items = userCart.items.filter((i) => i.quantity > 0)
    userCart.version += 1
    userCart.updatedAt = nowIso()
    db.carts = db.carts.filter((c) => c !== guest)
    return true
  })
}

export const authHandlers = [
  http.post(`${API_PREFIX}/auth/register`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const parsed = await parseBody(request, registerBodySchema)
    if (!parsed.ok) return parsed.response
    const { email, username, password } = parsed.data
    const db = getDb()
    if (db.users.some((u) => u.email === email)) {
      return fail(409, 'EMAIL_TAKEN', 'Este e-mail já está cadastrado.', {
        fields: { email: 'Este e-mail já está cadastrado.' },
      })
    }
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return fail(409, 'USERNAME_TAKEN', 'Este nome de usuário já existe.', {
        fields: { username: 'Este nome de usuário já existe.' },
      })
    }
    const id = nextId('u')
    const passwordHash = await hashPassword(id, password)
    const result = mutate((current) => {
      current.users.push({
        id,
        email,
        username,
        displayName: username,
        avatarUrl: null,
        ens: null,
        walletAlias: null,
        passwordHash,
        createdAt: nowIso(),
        version: 1,
      })
      current.favorites[id] = []
      return createSession(current, id)
    })
    const cartMerged = mergeGuestCart(guestCartId(request), id)
    const user = getDb().users.find((u) => u.id === id)!
    return json({ token: result.token, expiresAt: result.expiresAt, user: toPublicUser(user), cartMerged }, { status: 201 })
  }),

  http.post(`${API_PREFIX}/auth/login`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const parsed = await parseBody(request, loginBodySchema)
    if (!parsed.ok) return parsed.response
    const { email, password } = parsed.data
    const user = getDb().users.find((u) => u.email === email)
    const hash = user ? await hashPassword(user.id, password) : ''
    if (!user || hash !== user.passwordHash) {
      return fail(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.')
    }
    const session = mutate((db) => createSession(db, user.id))
    const cartMerged = mergeGuestCart(guestCartId(request), user.id)
    return json({ token: session.token, expiresAt: session.expiresAt, user: toPublicUser(user), cartMerged })
  }),

  http.get(`${API_PREFIX}/auth/session`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return json({
      token: auth.session.token,
      expiresAt: auth.session.expiresAt,
      user: toPublicUser(auth.user),
    })
  }),

  http.post(`${API_PREFIX}/auth/logout`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const header = request.headers.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
    mutate((db) => {
      db.sessions = db.sessions.filter((s) => s.token !== token)
    })
    return new Response(null, { status: 204 })
  }),
]
