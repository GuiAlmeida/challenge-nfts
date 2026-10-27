import { Link } from '@tanstack/react-router'
import { NftImage } from '@/components/layout'

const FEATURED = {
  id: 'sage-nomad-009',
  image: { slug: 'ape-sage', alt: 'Sage Nomad #009, NFT em destaque' },
}

export function FeaturedBanner() {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: FEATURED.id }}
      className="relative flex flex-col gap-4 overflow-hidden rounded-md bg-linear-to-b from-primary/10 to-primary/[0.03] pt-6 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="absolute top-26.25 left-9.5 size-3.75 rounded-full bg-primary/20" />
      <span aria-hidden="true" className="absolute top-85.75 left-62 size-11.25 rounded-full bg-primary/15" />
      <div className="flex flex-col gap-4 px-5">
        <p className="text-2xl leading-8 font-bold text-brand">NFT EM DESTAQUE</p>
        <p className="text-center text-[22px] leading-4 font-bold text-foreground">OFERTA LIMITADA</p>
      </div>
      <NftImage image={FEATURED.image} width={310} height={368} sizes="310px" className="h-92 w-full rounded-[22px]" />
    </Link>
  )
}
