import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { diffQuotes } from '../checkout.rules'
import type { OutdatedQuote } from '../use-checkout-flow'

export function QuoteOutdatedDialog({
  outdated,
  onConfirm,
  onDismiss,
  busy,
}: {
  outdated: OutdatedQuote | null
  onConfirm: () => void
  onDismiss: () => void
  busy: boolean
}) {
  const diffs = outdated ? diffQuotes(outdated.previous, outdated.fresh) : []
  return (
    <Dialog open={outdated !== null} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-lg gap-4 border-border bg-card">
        <DialogTitle className="text-lg font-bold">A cotação mudou</DialogTitle>
        <DialogDescription className="text-sm text-sand">
          Preços, disponibilidade ou taxas foram atualizados desde o resumo que você viu. Revise antes de confirmar.
        </DialogDescription>
        <ul className="flex flex-col gap-2 text-sm text-foreground" aria-label="Diferenças">
          {diffs.map((diff, index) => (
            <li key={`${diff.name}-${index}`} className="flex flex-col gap-0.5 rounded-md bg-surface-raised px-3 py-2">
              <span className="font-bold">{diff.name}</span>
              <span className="text-sand">
                {diff.before} <span aria-hidden="true">→</span> <span className="sr-only">para</span>
                <span className="text-brand">{diff.after}</span>
              </span>
            </li>
          ))}
          {diffs.length === 0 ? <li className="text-sand">Nenhuma diferença visível; a versão da cotação foi renovada.</li> : null}
        </ul>
        <p className="text-sm text-foreground">
          Novo total: <span className="font-bold text-brand">{outdated?.fresh.total} ETH</span>
        </p>
        <DialogFooter>
          <Button asChild variant="outline" size="sm" radius="md">
            <Link to="/cart">Revisar carrinho</Link>
          </Button>
          <Button type="button" size="sm" radius="md" onClick={onConfirm} disabled={busy}>
            Confirmar com os novos valores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
