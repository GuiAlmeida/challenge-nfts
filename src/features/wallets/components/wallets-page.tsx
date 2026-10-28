import { useId, useState } from 'react'
import { ErrorState } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import type { PublicUser } from '@/contracts/auth'
import type { Wallet } from '@/contracts/wallet'
import { useSessionUser } from '@/features/auth'
import { useWallets } from '../queries/use-wallets'
import { useWalletFlow } from '../use-wallet-flow'
import { newWalletForm } from '../wallets.rules'
import { WalletForm } from './wallet-form'

function SectionHeader({ id, title, description, action }: { id: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="flex flex-col gap-2">
        <h2 id={id} className="text-[17px] leading-5 font-bold text-foreground">
          {title}
        </h2>
        {description ? <p className="text-[13px] leading-5 text-sand">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

function PrimaryWallet({ user, wallet }: { user: PublicUser; wallet: Wallet | undefined }) {
  const titleId = useId()
  const flow = useWalletFlow({ userId: user.id, kind: 'primary', wallet, defaults: newWalletForm(user) })
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-7">
      <SectionHeader
        id={titleId}
        title="Carteira principal"
        description="Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados."
      />
      <WalletForm flow={flow} label="Carteira principal" />
    </section>
  )
}

function SecondaryWalletForm({ user, wallet, copyFrom }: { user: PublicUser; wallet: Wallet | undefined; copyFrom: Wallet | undefined }) {
  const flow = useWalletFlow({ userId: user.id, kind: 'secondary', wallet, defaults: newWalletForm(user, copyFrom) })
  return <WalletForm flow={flow} label="Carteira secundária" />
}

function SecondaryWallet({ user, wallet, primary }: { user: PublicUser; wallet: Wallet | undefined; primary: Wallet | undefined }) {
  const titleId = useId()
  const [adding, setAdding] = useState(false)
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const editing = Boolean(wallet) || adding
  const copyFrom = sameAsPrimary ? primary : undefined
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-7">
      <SectionHeader
        id={titleId}
        title="Carteira secundária"
        description={wallet ? undefined : 'Você ainda não adicionou uma carteira secundária.'}
        action={
          wallet ? null : (
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-sm leading-5 text-foreground has-disabled:opacity-50">
                <Checkbox
                  checked={sameAsPrimary}
                  onCheckedChange={(checked) => setSameAsPrimary(checked === true)}
                  disabled={!primary}
                  className="size-3.75 rounded-full border-primary"
                />
                Igual à carteira principal
              </label>
              <Button type="button" variant="link" className="h-auto px-0 text-base font-bold" onClick={() => setAdding((open) => !open)} aria-expanded={adding}>
                {adding ? 'Cancelar' : 'Adicionar'}
              </Button>
            </div>
          )
        }
      />
      {editing ? <SecondaryWalletForm key={wallet?.id ?? `new:${copyFrom?.id ?? 'blank'}`} user={user} wallet={wallet} copyFrom={copyFrom} /> : null}
    </section>
  )
}

function WalletsSkeleton() {
  return (
    <div role="status" aria-label="Carregando carteiras" className="flex flex-col gap-7">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-full max-w-120" />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3.75 w-1/2" />
            <Skeleton className="h-10 w-full rounded-xs" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-32.75 rounded-xs" />
    </div>
  )
}

export function WalletsPage() {
  const user = useSessionUser()
  const wallets = useWallets()
  if (!user || wallets.isPending) return <WalletsSkeleton />
  if (wallets.isError) return <ErrorState error={wallets.error} onRetry={() => void wallets.refetch()} retrying={wallets.isFetching} />
  const primary = wallets.data.find((w) => w.kind === 'primary')
  const secondary = wallets.data.find((w) => w.kind === 'secondary')
  return (
    <div className="flex flex-col gap-14">
      <h1 className="sr-only">Carteiras</h1>
      <PrimaryWallet key={primary?.id ?? 'new-primary'} user={user} wallet={primary} />
      <SecondaryWallet key={secondary?.id ?? 'new-secondary'} user={user} wallet={secondary} primary={primary} />
    </div>
  )
}
