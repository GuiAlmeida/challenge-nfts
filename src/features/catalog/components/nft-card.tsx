import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { cn } from 'cn'
import { CartIcon, ZoomIcon } from '@/assets/icons'
import { Icon, NftImage, Price } from '@/components/layout'
import type { NftSummary } from '@/contracts/nft'
import { FavoriteButton } from '@/features/favorites'
import { useQuickAdd } from './use-quick-add'

export interface NftCardProps {
  nft: NftSummary
  onZoom?: (nft: NftSummary) => void
  index?: number
}

export function NftCard({ nft, onZoom, index = 9 }: NftCardProps) {
  const quickAdd = useQuickAdd()
  const actionClass =
    'flex size-7 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <article data-testid="nft-card" aria-label={nft.name} className={cn('group relative flex flex-col gap-2 md:gap-3', nft.soldOut && 'opacity-80')}>
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-card md:rounded-md">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          aria-label={`Ver detalhes de ${nft.name}`}
          className="block size-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <NftImage
            image={nft.image}
            width={250}
            height={250}
            sizes="(min-width: 1024px) 340px, (min-width: 768px) 30vw, 45vw"
            priority={index < 3}
            className="size-full transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </Link>
        {nft.rare ? <span className="absolute top-4 left-0 w-17 bg-primary py-2 pl-2 text-[13px] leading-4 font-medium text-ink">RARO</span> : null}
        {nft.soldOut ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-[13px] leading-4 font-medium tracking-wide text-foreground">
            ESGOTADO
          </span>
        ) : null}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-2 motion-reduce:transition-none md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <FavoriteButton nftId={nft.id} name={nft.name} size={28} />
          <button
            type="button"
            onClick={(event) => void quickAdd.add(nft, event.currentTarget.closest('article')?.querySelector('img') ?? null)}
            disabled={nft.soldOut || quickAdd.adding}
            aria-label={`Adicionar ${nft.name} ao carrinho`}
            className={cn(actionClass, 'group/cart relative hidden disabled:opacity-50 md:flex')}
          >
            <Icon icon={CartIcon} size={16} />
            <PlusIcon
              aria-hidden="true"
              strokeWidth={3}
              className="absolute top-0.5 right-0.5 size-2.5 rounded-full bg-primary text-ink opacity-0 transition-opacity duration-200 group-hover/cart:opacity-100 group-focus-visible/cart:opacity-100"
            />
          </button>
          {onZoom ? (
            <button
              type="button"
              onClick={() => onZoom(nft)}
              aria-label={`Ampliar arte de ${nft.name}`}
              className="hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring md:block"
            >
              <Icon icon={ZoomIcon} size={28} />
            </button>
          ) : null}
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
