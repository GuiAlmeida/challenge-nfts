import type { Network, WalletProvider } from '@/contracts/common'

export interface UserRecord {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  ens: string | null
  walletAlias: string | null
  passwordHash: string
  createdAt: string
  version: number
}

export interface WalletRecord {
  id: string
  userId: string
  kind: 'primary' | 'secondary'
  displayName: string
  alias: string
  network: Network
  profileName: string
  address: string
  secondaryAddress: string
  provider: WalletProvider
  referralCode: string
  email: string
  ens: string
  createdAt: string
  updatedAt: string
  version: number
}

export const FIXTURE_PASSWORD = 'Kurio!2026'

export const USERS: UserRecord[] = [
  {
    id: 'u_ana',
    email: 'ana@kurio.test',
    username: 'ana',
    displayName: 'Ana Lima',
    avatarUrl: null,
    ens: 'ana.kurio.eth',
    walletAlias: 'Principal',
    passwordHash: 'd83a2e729be0eba2adb217a37cb5791d7532f4455fbe5ed11c000f72ec0f1d84',
    createdAt: '2026-06-02T14:00:00.000Z',
    version: 1,
  },
  {
    id: 'u_bruno',
    email: 'bruno@kurio.test',
    username: 'bruno',
    displayName: 'Bruno Reis',
    avatarUrl: null,
    ens: null,
    walletAlias: null,
    passwordHash: '3f33024052e8e4492efea58894bc80166aa3845280ee5e64c97463950d4c6a50',
    createdAt: '2026-09-15T09:30:00.000Z',
    version: 1,
  },
]

export const WALLETS: WalletRecord[] = [
  {
    id: 'w_ana_primary',
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
    createdAt: '2026-06-02T14:05:00.000Z',
    updatedAt: '2026-06-02T14:05:00.000Z',
    version: 1,
  },
  {
    id: 'w_ana_secondary',
    userId: 'u_ana',
    kind: 'secondary',
    displayName: 'Ana Lima',
    alias: 'Reserva',
    network: 'polygon',
    profileName: 'Ana Lima',
    address: '0x5B2e9c1A7f4D3e8B6c0a2F9d1E7b5C3a8D4f6B10',
    secondaryAddress: 'nova.kurio.eth',
    provider: 'coinbase',
    referralCode: '',
    email: 'ana@kurio.test',
    ens: 'nova.kurio.eth',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
    version: 1,
  },
]

export const FAVORITES: Record<string, string[]> = {
  u_ana: ['emerald-ape-042', 'violet-nomad-314'],
  u_bruno: [],
}
