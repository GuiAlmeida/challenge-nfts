import { Skeleton } from '@/components/ui/skeleton'
import { NftGridSkeleton } from './nft-card-skeleton'

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-16" role="status" aria-label="Carregando NFT">
      <div className="flex flex-col gap-7">
        <Skeleton className="hidden h-4 w-64 md:block" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex w-full gap-7 md:w-143.25 md:shrink-0">
            <div className="hidden flex-col gap-4 md:flex">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="size-25 rounded-lg" />
              ))}
            </div>
            <Skeleton className="aspect-square w-full rounded-md md:size-111" />
          </div>
          <div className="flex flex-1 flex-col gap-5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-7 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32.5" />
              <Skeleton className="h-10 w-32.5" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-full max-w-120" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex flex-col gap-8">
        <Skeleton className="h-5 w-48" />
        <NftGridSkeleton count={5} className="md:grid-cols-3 md:gap-y-8 lg:grid-cols-5 lg:gap-x-6.5" />
      </div>
    </div>
  )
}
