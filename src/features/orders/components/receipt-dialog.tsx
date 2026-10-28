import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ThankYouIcon } from '@/assets/icons'
import { Icon, NftImage, Price } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { NETWORK_LABEL, WALLET_PROVIDER_LABEL } from '@/contracts/common'
import type { Order } from '@/contracts/order'
import { formatOrderDate, shortHash } from '../order.rules'
import { ExplorerDialog } from './explorer-dialog'

function Meta({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 whitespace-nowrap text-sand">
      <span className={bold ? 'text-sm leading-4 font-bold' : 'text-sm leading-4'}>{label}</span>
      <span className="text-sm md:text-[15px]">{value}</span>
    </div>
  )
}

export function ReceiptDialog({ order }: { order: Order }) {
  const navigate = useNavigate()
  const [explorer, setExplorer] = useState(false)
  const { receipt } = order
  return (
    <Dialog open onOpenChange={(open) => !open && void navigate({ to: '/' })}>
      <DialogContent
        data-testid="receipt"
        className="flex max-h-[92svh] w-139.5 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-x-hidden overflow-y-auto rounded-md border-0 bg-card p-0 sm:max-w-139.5"
      >
        <div className="flex h-39 flex-col items-center justify-center gap-4">
          <Icon icon={ThankYouIcon} size={80} />
          <DialogTitle className="text-center text-base leading-4 font-bold text-sand">Seus NFTs agora estão na sua carteira</DialogTitle>
        </div>
        <div className="h-px w-full bg-primary" />
        <dl className="flex flex-wrap justify-between gap-x-6 gap-y-3 px-5 py-3 sm:flex-nowrap sm:divide-x sm:divide-border sm:px-6 sm:[&>div]:pr-4 sm:[&>div+div]:pl-4">
          <Meta label="ID da transação" value={shortHash(order.txHash ?? '')} bold />
          <Meta label="Data" value={formatOrderDate(order.confirmedAt ?? order.updatedAt)} />
          <Meta label="Total" value={`${receipt.total} ETH`} />
          <Meta label="Carteira" value={WALLET_PROVIDER_LABEL[receipt.wallet.provider]} bold />
        </dl>
        <div className="h-px w-full bg-primary" />
        <div className="flex flex-col gap-3 px-6 pt-5 pb-12 sm:px-11">
          <h3 className="text-[15px] leading-4 font-bold text-foreground">Detalhes da transação</h3>
          <div className="flex items-center justify-between border-b border-border pb-3 text-base leading-4 font-bold text-foreground">
            <span>NFTs</span>
            <span className="flex gap-12">
              <span className="hidden sm:inline">Edições</span>
              <span className="font-medium">Subtotal</span>
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {receipt.items.map((item) => (
              <li key={`${item.nftId}-${item.editionLabel}`} className="flex items-center justify-between gap-3 sm:h-17.5">
                <div className="flex min-w-0 items-center gap-3">
                  <NftImage image={item.image} width={70} height={70} sizes="70px" className="size-14 shrink-0 rounded-lg sm:size-17.5" />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate text-sm leading-4 font-bold text-foreground sm:text-base">{item.name}</span>
                    <span className="truncate text-sm leading-4 text-muted-foreground">
                      ID do token: {item.tokenId} · {item.editionLabel}
                      <span className="sm:hidden"> · (x {item.quantity})</span>
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-12">
                  <span className="hidden text-sm leading-4 text-sand sm:inline">(x {item.quantity})</span>
                  <Price value={item.lineTotal} size="md" className="whitespace-nowrap" />
                </div>
              </li>
            ))}
          </ul>
          <dl className="ml-auto flex w-full max-w-80 flex-col gap-3 pt-2">
            {receipt.coupon ? (
              <div className="flex items-center justify-between text-[15px] text-foreground">
                <dt>Desconto ({receipt.coupon.code})</dt>
                <dd className="text-lg leading-4">(-) {receipt.discount} ETH</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-[15px] text-foreground">
              <dt>Taxa de rede</dt>
              <dd className="text-lg leading-4">{receipt.networkFee} ETH</dd>
            </div>
            <div className="flex items-center justify-between text-base leading-4 font-bold text-foreground">
              <dt>Total</dt>
              <dd>
                <Price value={receipt.total} size="md" />
              </dd>
            </div>
          </dl>
          <div className="border-t border-border" />
          <DialogDescription className="pt-2 text-center text-sm leading-5.5 text-sand">
            Transação confirmada na {NETWORK_LABEL[receipt.network]}. A propriedade foi transferida para sua carteira conectada e registrada na rede.
          </DialogDescription>
          <div className="flex justify-center pt-2">
            <Button type="button" size="md" radius="xs" className="px-4" onClick={() => setExplorer(true)}>
              Ver no Etherscan
            </Button>
          </div>
        </div>
        <div aria-hidden="true" className="h-2.5 w-full bg-primary" />
      </DialogContent>
      <ExplorerDialog order={order} open={explorer} onOpenChange={setExplorer} />
    </Dialog>
  )
}
