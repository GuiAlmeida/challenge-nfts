import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { CartIcon, FavCircleIcon, ZoomIcon } from '@/assets/icons'
import { Icon, NftImage, Price } from '@/components/layout'
import type { NftSummary } from '@/contracts/nft'

export interface NftCardProps {
  nft: NftSummary
  onFavorite: (nft: NftSummary) => void
  onZoom: (nft: NftSummary) => void
  index?: number
}

export function NftCard({ nft, onFavorite, onZoom, index = 9 }: NftCardProps) {
  const actionClass =
    'flex size-7 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <article data-testid="nft-card" aria-label={nft.name} className={cn('group relative flex flex-col gap-2 md:gap-3', nft.soldOut && 'opacity-80')}>
      <div className="relative flex aspect-[175/200] items-center justify-center overflow-hidden rounded-[20px] bg-linear-[140deg] from-card from-[12%] to-surface-raised md:aspect-[258/300] md:rounded-md md:bg-card md:bg-none">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          aria-label={`Ver detalhes de ${nft.name}`}
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <NftImage
            image={nft.image}
            width={250}
            height={250}
            sizes="(min-width: 1024px) 250px, (min-width: 768px) 38vw, 43vw"
            priority={index < 3}
            className="size-42 rounded-2xl transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none md:size-62.5 md:rounded-[15px]"
          />
        </Link>
        {nft.rare ? <span className="absolute top-4 left-0 w-17 bg-primary py-2 pl-2 text-[13px] leading-4 font-medium text-ink">RARO</span> : null}
        {nft.soldOut ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-[13px] leading-4 font-medium tracking-wide text-foreground">
            ESGOTADO
          </span>
        ) : null}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-2 motion-reduce:transition-none md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onFavorite(nft)}
            aria-label={`Favoritar ${nft.name}`}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={FavCircleIcon} size={28} />
          </button>
          <Link
            to="/nft/$nftId"
            params={{ nftId: nft.id }}
            hash="comprar"
            aria-label={`Comprar ${nft.name}`}
            className={cn(actionClass, 'hidden md:flex')}
          >
            <Icon icon={CartIcon} size={16} />
          </Link>
          <button
            type="button"
            onClick={() => onZoom(nft)}
            aria-label={`Ampliar arte de ${nft.name}`}
            className="hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
          >
            <Icon icon={ZoomIcon} size={28} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 pl-2 md:gap-3 md:pl-0">
        <h3 className="text-[15px] leading-5 font-normal text-foreground md:text-base md:leading-4">
          <Link
            to="/nft/$nftId"
            params={{ nftId: nft.id }}
            className="rounded-xs outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
          >
            {nft.name}
          </Link>
        </h3>
        <Price value={nft.price} previous={nft.previousPrice} size="md" className="text-base md:text-lg" previousClassName="hidden md:inline" />
      </div>
    </article>
  )
}
