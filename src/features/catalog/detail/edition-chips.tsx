import { cn } from 'cn'
import { useId } from 'react'
import type { Edition } from '@/contracts/nft'

export function EditionChips({
  editions,
  selectedId,
  onSelect,
  className,
}: {
  editions: Edition[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}) {
  const labelId = useId()
  const enabled = editions.filter((e) => e.available > 0)
  const move = (from: string, delta: 1 | -1) => {
    if (enabled.length === 0) return
    const index = enabled.findIndex((e) => e.id === from)
    const next = enabled[(index + delta + enabled.length) % enabled.length]
    if (next) onSelect(next.id)
  }
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p id={labelId} className="text-[15px] leading-4 font-bold text-foreground">
        Edição:
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-1.5 md:gap-1.5">
        {editions.map((edition) => {
          const selected = edition.id === selectedId
          const soldOut = edition.available <= 0
          return (
            <button
              key={edition.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={soldOut || undefined}
              aria-label={soldOut ? `${edition.label}, esgotada` : edition.label}
              tabIndex={selected ? 0 : -1}
              onClick={() => !soldOut && onSelect(edition.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  move(edition.id, 1)
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                  event.preventDefault()
                  move(edition.id, -1)
                }
              }}
              className={cn(
                'h-7 rounded-pill border px-2.5 text-sm leading-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                selected ? 'border-primary font-medium text-brand' : 'border-border-soft text-sand hover:border-primary',
                soldOut && 'cursor-not-allowed line-through opacity-50 hover:border-border-soft',
              )}
            >
              {edition.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
