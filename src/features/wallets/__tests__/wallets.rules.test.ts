import { describe, expect, it } from 'vitest'
import type { Wallet } from '@/contracts/wallet'
import { walletFormSchema } from '../schemas'
import { upsertWallet, walletFormFrom, walletPayload } from '../wallets.rules'

const wallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: 'w_1',
  userId: 'u_ana',
  kind: 'primary',
  displayName: 'Ana Lima',
  alias: 'Principal',
  network: 'ethereum',
  profileName: 'Ana Lima',
  address: '0xA91F3c7d2E4b8a19F0c6d5e2B7a4c3D1e9f2E82C',
  secondaryAddress: '',
  provider: 'metamask',
  referralCode: '',
  email: 'ana@kurio.test',
  ens: 'ana.kurio.eth',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  version: 1,
  ...overrides,
})

const parse = (overrides: Record<string, string> = {}) => walletFormSchema.safeParse({ ...walletFormFrom(wallet()), ...overrides })

describe('walletPayload', () => {
  it('envia o ENS só na Ethereum', () => {
    const ethereum = parse()
    const polygon = parse({ network: 'polygon' })
    if (!ethereum.success || !polygon.success) throw new Error('fixture inválida')
    expect(walletPayload(ethereum.data).ens).toBe('ana.kurio.eth')
    expect(walletPayload(polygon.data)).not.toHaveProperty('ens')
  })
})

describe('walletFormSchema', () => {
  it('valida o endereço e só cobra ENS válido na Ethereum', () => {
    const issues = (overrides: Record<string, string>) => {
      const result = parse(overrides)
      return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    }
    expect(issues({ address: '' })).toEqual(['address: Informe o endereço da carteira'])
    expect(issues({ address: '0x123' })).toEqual(['address: Endereço 0x inválido'])
    expect(issues({ ens: 'ana' })).toEqual(['ens: Use um nome terminado em .eth'])
    expect(issues({ ens: 'ana', network: 'solana' })).toEqual([])
  })
})

describe('upsertWallet', () => {
  it('substitui a carteira existente e acrescenta a nova', () => {
    const list = [wallet()]
    expect(upsertWallet(list, wallet({ alias: 'Cofre', version: 2 }))).toEqual([wallet({ alias: 'Cofre', version: 2 })])
    expect(upsertWallet(list, wallet({ id: 'w_2', kind: 'secondary' }))).toHaveLength(2)
    expect(upsertWallet(undefined, wallet())).toHaveLength(1)
  })
})
