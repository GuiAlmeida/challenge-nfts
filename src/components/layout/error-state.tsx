import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/api-error'

export function ErrorState({
  error,
  title = 'Não foi possível carregar',
  onRetry,
  retrying,
  className,
}: {
  error?: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}) {
  const message = isApiError(error) ? error.message : error instanceof Error ? error.message : 'Tente novamente em instantes.'
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-md border border-coral/40 bg-card px-6 py-12 text-center', className)}>
      <p className="font-mono text-lg leading-5 font-bold text-foreground">{title}</p>
      <p className="max-w-110 font-mono text-sm leading-6 text-sand">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={retrying} className="mt-2">
          {retrying ? 'Tentando…' : 'Tentar novamente'}
        </Button>
      ) : null}
    </div>
  )
}
