import { createFileRoute } from '@tanstack/react-router'
import { WalletsPage } from '@/features/wallets'

export const Route = createFileRoute('/_authenticated/account/wallets')({
  head: () => ({ meta: [{ title: 'Carteiras — Kurio' }] }),
  component: WalletsPage,
})
