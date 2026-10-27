import { cn } from 'cn'
import { formatEth, parseEth } from '@/lib/eth'

type PriceSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE: Record<PriceSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-[22px]',
}

export function Price({
  value,
  previous,
  size = 'md',
  className,
  previousClassName,
  tone = 'brand',
}: {
  value: string
  previous?: string | null
  size?: PriceSize
  tone?: 'brand' | 'foreground' | 'sand'
  className?: string
  previousClassName?: string
}) {
  const formatted = formatEth(parseEth(value))
  const toneClass = tone === 'brand' ? 'text-brand' : tone === 'sand' ? 'text-sand' : 'text-foreground'
  return (
    <span className={cn('inline-flex items-baseline gap-3 font-mono leading-4', SIZE[size], className)}>
      <span className={cn('font-bold', toneClass)}>
        {formatted} <span className="font-bold">ETH</span>
      </span>
      {previous ? (
        <span className={cn('font-normal text-muted-foreground', previousClassName)}>
          <span className="sr-only">Preço anterior: </span>
          {formatEth(parseEth(previous))} ETH
        </span>
      ) : null}
    </span>
  )
}
