import { http } from 'msw'
import { getDb, mutate } from '../db/store'
import { API_PREFIX, applyScenario, authenticate, fail, json } from './shared'

export const favoritesHandlers = [
  http.get(`${API_PREFIX}/me/favorites`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return json({ nftIds: getDb().favorites[auth.user.id] ?? [] })
  }),

  http.put(`${API_PREFIX}/me/favorites/:nftId`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const nftId = String(params.nftId)
    if (!getDb().nfts.some((n) => n.id === nftId)) return fail(404, 'NOT_FOUND', 'NFT não encontrado.')
    const nftIds = mutate((db) => {
      const list = db.favorites[auth.user.id] ?? []
      if (!list.includes(nftId)) list.push(nftId)
      db.favorites[auth.user.id] = list
      return [...list]
    })
    return json({ nftIds })
  }),

  http.delete(`${API_PREFIX}/me/favorites/:nftId`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const nftId = String(params.nftId)
    const nftIds = mutate((db) => {
      const list = (db.favorites[auth.user.id] ?? []).filter((id) => id !== nftId)
      db.favorites[auth.user.id] = list
      return [...list]
    })
    return json({ nftIds })
  }),
]
