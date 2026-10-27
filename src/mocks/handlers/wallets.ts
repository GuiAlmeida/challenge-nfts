import { http } from 'msw'
import { walletCreateSchema, walletUpdateSchema } from '@/contracts/wallet'
import { getDb, mutate, nextId, nowIso } from '../db/store'
import type { WalletRecord } from '../fixtures/users'
import { toWallet } from '../serializers'
import { API_PREFIX, applyScenario, authenticate, fail, json, parseBody } from './shared'

export const walletHandlers = [
  http.get(`${API_PREFIX}/me/wallets`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    return json({
      items: getDb()
        .wallets.filter((w) => w.userId === auth.user.id)
        .map(toWallet),
    })
  }),

  http.post(`${API_PREFIX}/me/wallets`, async ({ request }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const parsed = await parseBody(request, walletCreateSchema)
    if (!parsed.ok) return parsed.response
    const data = parsed.data
    if (getDb().wallets.some((w) => w.userId === auth.user.id && w.kind === data.kind)) {
      return fail(409, 'PRIMARY_EXISTS', data.kind === 'primary' ? 'Você já tem uma carteira principal.' : 'Você já tem uma carteira secundária.')
    }
    const wallet = mutate((current) => {
      const record: WalletRecord = {
        id: nextId('w'),
        userId: auth.user.id,
        kind: data.kind,
        displayName: data.displayName,
        alias: data.alias,
        network: data.network,
        profileName: data.profileName,
        address: data.address,
        secondaryAddress: data.secondaryAddress ?? '',
        provider: data.provider,
        referralCode: data.referralCode ?? '',
        email: data.email,
        ens: data.ens ?? '',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        version: 1,
      }
      current.wallets.push(record)
      return record
    })
    return json(toWallet(wallet), { status: 201 })
  }),

  http.patch(`${API_PREFIX}/me/wallets/:id`, async ({ request, params }) => {
    const blocked = await applyScenario(request)
    if (blocked) return blocked
    const auth = authenticate(request)
    if (!auth.ok) return auth.response
    const parsed = await parseBody(request, walletUpdateSchema)
    if (!parsed.ok) return parsed.response
    const existing = getDb().wallets.find((w) => w.id === params.id && w.userId === auth.user.id)
    if (!existing) return fail(404, 'NOT_FOUND', 'Carteira não encontrada.')
    const wallet = mutate((current) => {
      const record = current.wallets.find((w) => w.id === params.id)!
      Object.assign(record, parsed.data, { updatedAt: nowIso(), version: record.version + 1 })
      return record
    })
    return json(toWallet(wallet))
  }),
]
