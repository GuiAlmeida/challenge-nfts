import { cn } from 'cn'
import { WalletIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type WalletProvider, WALLET_PROVIDER_LABEL } from '@/contracts/common'
import type { CheckoutFlow } from '../use-checkout-flow'

const OPTIONS: Array<{ provider: WalletProvider; letter: string }> = [
  { provider: 'walletconnect', letter: 'W' },
  { provider: 'metamask', letter: 'M' },
  { provider: 'coinbase', letter: 'C' },
]

export function WalletNetworkPicker({ flow }: { flow: CheckoutFlow }) {
  const { walletSim } = flow
  const choose = (provider: WalletProvider) => {
    flow.form.setValue('walletProvider', provider, { shouldDirty: true })
    walletSim.connect(provider)
  }
  const statusText =
    walletSim.status === 'connecting'
      ? `Conectando ${WALLET_PROVIDER_LABEL[walletSim.provider ?? 'metamask']}…`
      : walletSim.status === 'connected'
        ? `${WALLET_PROVIDER_LABEL[walletSim.provider ?? 'metamask']} conectada.`
        : walletSim.status === 'rejected'
          ? 'A carteira recusou a conexão.'
          : 'Escolha uma carteira para conectar.'

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base leading-4 font-bold text-foreground">Carteira e rede</h3>
      <div role="radiogroup" aria-label="Carteira e rede" className="flex flex-col gap-4">
        {OPTIONS.map(({ provider, letter }) => {
          const selected = walletSim.provider === provider && walletSim.status !== 'disconnected'
          return (
            <button
              key={provider}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(provider)}
              className={cn(
                'flex h-16.25 w-full items-center gap-3 rounded-[15px] bg-card px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11.25 md:rounded-xs md:border md:bg-transparent md:px-3',
                selected ? 'shadow-[0_0_20px_rgba(10,6,4,0.45)] md:border-primary' : 'md:border-border',
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-bold text-brand md:hidden"
              >
                {provider === 'coinbase' ? <Icon icon={WalletIcon} size={18} /> : letter}
              </span>
              <span
                aria-hidden="true"
                className={cn('hidden size-4 shrink-0 rounded-full border md:block', selected ? 'border-primary bg-primary' : 'border-border-soft')}
              />
              {provider === 'walletconnect' ? (
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <span className="md:hidden">WalletConnect</span>
                  <span className="hidden h-6.5 items-center rounded-md border border-border-soft bg-surface-dark px-2 text-[9px] font-bold tracking-[0.1px] text-brand md:inline-flex">
                    METAMASK&nbsp;&nbsp;•&nbsp;&nbsp;WALLETCONNECT&nbsp;&nbsp;•&nbsp;&nbsp;COINBASE
                  </span>
                </span>
              ) : (
                <span className="text-sm text-foreground">{WALLET_PROVIDER_LABEL[provider]}</span>
              )}
              <span
                aria-hidden="true"
                className={cn('ml-auto size-4 shrink-0 rounded-full border md:hidden', selected ? 'border-primary bg-primary' : 'border-border-soft')}
              />
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] leading-4">
        <p role="status" aria-live="polite" className={cn(walletSim.status === 'rejected' ? 'text-coral' : 'text-sand')}>
          {statusText}
        </p>
        {walletSim.status === 'connected' ? (
          <Button type="button" variant="link" className="h-auto text-[13px]" onClick={walletSim.disconnect}>
            Desconectar
          </Button>
        ) : null}
        {walletSim.status === 'rejected' && walletSim.provider ? (
          <Button type="button" variant="link" className="h-auto text-[13px]" onClick={() => choose(walletSim.provider!)}>
            Tentar de novo
          </Button>
        ) : null}
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <Checkbox checked={walletSim.rejectNext} onCheckedChange={(checked) => walletSim.setRejectNext(checked === true)} className="size-3.5" />
        Simular recusa na próxima conexão (demo)
      </label>
    </div>
  )
}
