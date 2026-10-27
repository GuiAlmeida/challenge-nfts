import { Skeleton } from '@/components/ui/skeleton'

export function CartTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Carregando carrinho">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-17.5 w-full rounded-md" />
      ))}
    </div>
  )
}

export function CartSummarySkeleton() {
  return (
    <div className="flex w-full flex-col gap-3" role="status" aria-label="Carregando resumo">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
