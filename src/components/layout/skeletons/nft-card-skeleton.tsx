import { cn } from 'cn'
import { Skeleton } from '@/components/ui/skeleton'

export function NftCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-[20px] md:rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}

export function NftGridSkeleton({ count = 9, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-8.5 md:gap-y-18', className)}
      role="status"
      aria-label="Carregando NFTs"
    >
      {Array.from({ length: count }, (_, i) => (
        <NftCardSkeleton key={i} />
      ))}
    </div>
  )
}
