import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import type { CheckoutFlow } from '../use-checkout-flow'
import { WalletCards } from './wallet-cards'

export function ConnectedWallets({ flow }: { flow: CheckoutFlow }) {
  const titleId = useId()
  const walletId = useWatch({ control: flow.form.control, name: 'walletId' })
  const error = flow.form.formState.errors.walletId?.message
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-base leading-4 font-bold text-foreground">
          Carteira conectada
        </h2>
        <Link to="/account/wallets" className="rounded-xs text-sm leading-4 font-bold text-brand outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Trocar carteira
        </Link>
      </div>
      <WalletCards wallets={flow.wallets} selectedId={walletId} onSelect={flow.selectWallet} />
      {error ? (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      ) : null}
    </section>
  )
}
