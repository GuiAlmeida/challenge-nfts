import { Skeleton } from '@/components/ui/skeleton'

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row" role="status" aria-label="Carregando NFT">
      <div className="flex w-full gap-7 md:w-143.25">
        <div className="hidden flex-col gap-4 md:flex">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="size-25 rounded-lg" />
          ))}
        </div>
        <Skeleton className="aspect-square w-full rounded-md md:size-111" />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-7 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32.5" />
          <Skeleton className="h-10 w-32.5" />
        </div>
      </div>
    </div>
  )
}
