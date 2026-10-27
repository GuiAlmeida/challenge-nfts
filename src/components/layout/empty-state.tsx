import { cn } from 'cn'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div role="status" className={cn('flex flex-col items-center gap-3 rounded-md border border-border bg-card px-6 py-12 text-center', className)}>
      <p className="font-mono text-lg leading-5 font-bold text-foreground">{title}</p>
      {description ? <p className="max-w-110 font-mono text-sm leading-6 text-sand">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
