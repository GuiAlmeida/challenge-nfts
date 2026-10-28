import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { NETWORK_LABEL } from '@/contracts/common'
import type { Order } from '@/contracts/order'

export function ExplorerDialog({ order, open, onOpenChange }: { order: Order; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4 border-border bg-card">
        <DialogTitle className="text-lg font-bold">Explorador simulado</DialogTitle>
        <DialogDescription className="text-sm text-sand">
          Esta demonstração não publica transações em nenhuma rede. Os dados abaixo são os do pedido simulado.
        </DialogDescription>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-sand">Hash</dt>
          <dd className="font-mono break-all text-foreground">{order.txHash}</dd>
          <dt className="text-sand">Rede</dt>
          <dd className="text-foreground">{NETWORK_LABEL[order.receipt.network]}</dd>
          <dt className="text-sand">Status</dt>
          <dd className="text-success">Confirmada</dd>
          <dt className="text-sand">Carteira</dt>
          <dd className="font-mono break-all text-foreground">{order.receipt.wallet.address}</dd>
          <dt className="text-sand">Explorador</dt>
          <dd className="break-all text-foreground">{order.explorerUrl ?? '—'}</dd>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
