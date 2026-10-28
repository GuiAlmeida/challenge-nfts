import { ChevronDownIcon } from 'lucide-react'

export function Disclosure({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <details open={open} onToggle={(event) => onOpenChange(event.currentTarget.open)} className="group rounded-md bg-card">
      <summary className="flex list-none items-center justify-between gap-3 rounded-md px-4 py-3.5 text-base leading-4 font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-sand transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="px-4 pt-2 pb-5">{children}</div>
    </details>
  )
}
