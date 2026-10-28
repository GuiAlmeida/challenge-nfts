import { cn } from 'cn'
import type { NftImage as NftImageData } from '@/contracts/nft'

const WIDTHS = [250, 450, 650, 900] as const

const srcFor = (slug: string, width: number) => `/images/nfts/${slug}-${width}.webp`

export function NftImage({
  image,
  sizes,
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
  className,
}: {
  image: NftImageData
  sizes: string
  width: number
  height: number
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'auto'
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
      loading={loading}
      decoding={fetchPriority === 'high' ? 'sync' : 'async'}
      fetchPriority={fetchPriority}
      className={cn('object-cover', className)}
    />
  )
}
