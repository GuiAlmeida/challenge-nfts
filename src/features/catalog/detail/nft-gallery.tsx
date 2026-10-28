import { cn } from 'cn'
import { useState } from 'react'
import { ZoomIcon } from '@/assets/icons'
import { BackButton, Icon, NftImage, useMediaQuery } from '@/components/layout'
import type { NftDetail } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites'
import { ImageZoomDialog } from '../components/image-zoom-dialog'

export function NftGallery({ nft }: { nft: NftDetail }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = nft.gallery[index] ?? nft.image
  const desktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      {desktop ? (
        <div className="flex w-143.25 shrink-0 gap-7" aria-label="Galeria">
          <ul className="flex flex-col gap-4">
            {nft.gallery.map((image, i) => (
              <li key={`${image.slug}-${i}`}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Imagem ${i + 1} de ${nft.gallery.length}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={cn(
                    'block size-25 overflow-hidden rounded-lg border bg-card transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    i === index ? 'border-primary' : 'border-transparent hover:border-border-soft',
                  )}
                >
                  <NftImage image={image} width={100} height={100} sizes="100px" className="size-full" />
                </button>
              </li>
            ))}
          </ul>
          <div className="relative flex size-111 items-center justify-center rounded-md bg-card p-4">
            <NftImage image={current} width={404} height={404} sizes="404px" loading="eager" fetchPriority="high" className="size-101 rounded-2xl" />
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label="Ampliar imagem"
              className="absolute top-3.25 right-3.25 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon icon={ZoomIcon} size={30} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col gap-2 bg-linear-[138deg] from-card from-12% to-surface-raised px-7 pt-6">
          <div className="flex items-center justify-between">
            <BackButton />
            <FavoriteButton nftId={nft.id} name={nft.name} size={35} />
          </div>
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagem"
            className="block w-full overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <NftImage
              image={current}
              width={361}
              height={356}
              sizes="(min-width: 414px) 361px, 90vw"
              loading="eager"
              fetchPriority="high"
              className="aspect-361/356 w-full"
            />
          </button>
          <div role="group" aria-label="Imagens da galeria" className="absolute inset-x-0 bottom-9 flex justify-center">
            {nft.gallery.map((image, i) => (
              <button
                key={`${image.slug}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Imagem ${i + 1} de ${nft.gallery.length}`}
                aria-pressed={i === index}
                className="flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true" className={cn('size-1.75 rounded-full', i === index ? 'bg-primary' : 'bg-border-soft')} />
              </button>
            ))}
          </div>
        </div>
      )}

      <ImageZoomDialog image={current} title={nft.name} open={zoom} onOpenChange={setZoom} />
    </>
  )
}
