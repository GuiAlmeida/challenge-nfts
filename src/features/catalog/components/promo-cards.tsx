import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from '@/assets/icons'
import { Icon, NftImage } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { NftImage as NftImageData } from '@/contracts/nft'
import type { CatalogSearch } from '@/contracts/search'
import { patchSearch } from '../catalog.rules'

interface Promo {
  title: [string, string]
  text: string
  image: NftImageData
  search: Partial<CatalogSearch>
}

const PROMOS: Promo[] = [
  {
    title: ['Lançamentos gênesis', 'de edição limitada'],
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: { slug: 'ape-emerald', alt: 'Macaco com óculos escuros e jaqueta verde' },
    search: { tab: 'new' },
  },
  {
    title: ['Arte digital selecionada', 'e muito mais'],
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    image: { slug: 'ape-neon', alt: 'Chimpanzé de terno claro' },
    search: { collection: 'arte-digital' },
  },
]

export function PromoCards() {
  return (
    <section aria-label="Promoções" className="grid gap-6 lg:grid-cols-2 lg:gap-7">
      {PROMOS.map((promo) => (
        <article key={promo.title[0]} className="flex min-h-62.5 items-stretch gap-4 overflow-hidden rounded-lg bg-card">
          <NftImage
            image={promo.image}
            width={292}
            height={250}
            sizes="(min-width: 1024px) 240px, 40vw"
            className="h-auto w-2/5 shrink-0 rounded-[18px]"
          />
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-2 py-6 pr-6 text-right md:pr-7.5">
            <h2 className="text-base leading-6 font-bold text-foreground md:text-lg">
              {promo.title[0]}
              <br />
              {promo.title[1]}
            </h2>
            <p className="max-w-65.75 text-[13px] leading-5 text-sand md:text-sm md:leading-6">{promo.text}</p>
            <Button asChild size="sm" radius="md" className="mt-4 w-35 gap-1 text-sm font-medium">
              <Link to="/" hash="catalogo" search={(prev) => patchSearch(prev, promo.search)}>
                Explorar
                <Icon icon={ArrowRightIcon} size={18} />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </section>
  )
}
