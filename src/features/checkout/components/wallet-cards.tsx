import { cn } from 'cn'
import { NETWORK_LABEL } from '@/contracts/common'
import type { Wallet } from '@/contracts/wallet'

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`

export function WalletCards({
  wallets,
  selectedId,
  onSelect,
  className,
}: {
  wallets: Wallet[]
  selectedId: string | undefined
  onSelect: (wallet: Wallet) => void
  className?: string
}) {
  if (wallets.length === 0) {
    return <p className="text-sm text-sand">Você ainda não cadastrou carteiras.</p>
  }
  return (
    <div role="radiogroup" aria-label="Carteira cadastrada" className={cn('flex flex-col gap-3 md:gap-5', className)}>
      {wallets.map((wallet) => {
        const selected = wallet.id === selectedId
        return (
          <button
            key={wallet.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(wallet)}
            className={cn(
              'flex h-23.25 w-full items-start gap-3 rounded-[14px] bg-card px-5 py-4 text-left transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? 'shadow-[0_20px_20px_rgba(10,6,4,0.45)] ring-1 ring-primary/60' : 'hover:ring-1 hover:ring-border-soft',
            )}
          >
            <span
              aria-hidden="true"
              className={cn('mt-6 size-4 shrink-0 rounded-full border', selected ? 'border-primary bg-primary' : 'border-border-soft')}
            />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="text-base leading-4 font-bold text-foreground">{wallet.alias}</span>
              <span className="truncate text-sm leading-5.5 text-sand">{wallet.ens || shortAddress(wallet.address)}</span>
              <span className="text-sm leading-5.5 text-sand">
                {wallet.kind === 'primary' ? 'Rede principal' : 'Rede'} {NETWORK_LABEL[wallet.network]}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
