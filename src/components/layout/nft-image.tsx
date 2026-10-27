import { cn } from 'cn'
import type { NftImage as NftImageData } from '@/contracts/nft'

const WIDTHS = [250, 450, 900] as const

const srcFor = (slug: string, width: number) => `/images/nfts/${slug}-${width}.webp`

export function NftImage({
  image,
  sizes,
  width,
  height,
  priority = false,
  className,
}: {
  image: NftImageData
  sizes: string
  width: number
  height: number
  priority?: boolean
  className?: string
}) {
  return (
    <img
      src={srcFor(image.slug, 450)}
      srcSet={WIDTHS.map((w) => `${srcFor(image.slug, w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={image.alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('object-cover', className)}
    />
  )
}
