import { Button } from '@/components/ui/button'
import { describeChange, type PriceChange } from '../cart.rules'

export function PriceChangeBanner({ changes, onRefresh }: { changes: PriceChange[]; onRefresh: () => void }) {
  if (changes.length === 0) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-md border border-coral/50 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between"
    >
      <ul className="flex flex-col gap-1 text-sm leading-5 text-foreground">
        {changes.map((change) => (
          <li key={change.itemId}>{describeChange(change)}</li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="xs" radius="md" onClick={onRefresh} className="shrink-0 text-sm">
        Atualizar resumo
      </Button>
    </div>
  )
}
