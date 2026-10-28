import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { ArrowRightIcon } from '@/assets/icons'
import { Icon, NftImage } from '@/components/layout'
import { Button } from '@/components/ui/button'
import type { NftImage as NftImageData } from '@/contracts/nft'
import type { CatalogSearch } from '@/contracts/search'
import { patchSearch } from '../catalog.rules'
import { type Carousel, useCarousel } from './use-carousel'

interface Slide {
  eyebrow: string
  title: [string, string]
  mobileTitle: [string, string]
  text: string
  mobileText: string
  image: NftImageData
  secondaryImage: NftImageData
  search: Partial<CatalogSearch>
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Bem-vindo à Kurio',
    title: ['SEJA DONO DO FUTURO', 'DA ARTE DIGITAL'],
    mobileTitle: ['SEJA DONO DA', 'CULTURA DIGITAL'],
    text: 'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    mobileText: 'Descubra NFTs selecionados de criadores do mundo todo.',
    image: {
      slug: 'ape-emerald',
      alt: 'Macaco com óculos escuros e jaqueta verde, arte em destaque da Kurio',
    },
    secondaryImage: { slug: 'ape-sage', alt: '' },
    search: {},
  },
  {
    eyebrow: 'Novos lançamentos',
    title: ['COLECIONE RARIDADES', 'VERIFICADAS NA REDE'],
    mobileTitle: ['RARIDADES', 'VERIFICADAS'],
    text: 'Edições 1/1 e séries limitadas com procedência registrada em cadeia. Cada peça traz atributos verificados e direitos autorais para o criador.',
    mobileText: 'Edições limitadas com procedência registrada.',
    image: { slug: 'ape-sage', alt: 'Gorila com chapéu e moletom lilás, lançamento recente' },
    secondaryImage: { slug: 'ape-neon', alt: '' },
    search: { tab: 'new' },
  },
  {
    eyebrow: 'Em alta',
    title: ['APOIE QUEM FAZ', 'A CULTURA DIGITAL'],
    mobileTitle: ['APOIE QUEM FAZ', 'A CULTURA'],
    text: 'Os NFTs mais procurados da semana, direto de artistas independentes. Compre, colecione e acompanhe o trabalho de quem cria.',
    mobileText: 'Os NFTs mais procurados da semana.',
    image: { slug: 'ape-golden-beat', alt: 'Macaco dourado com fones de ouvido, NFT em alta' },
    secondaryImage: { slug: 'ape-emerald', alt: '' },
    search: { tab: 'trending' },
  },
]

const AUTOPLAY_MS = 9000

function Controls({ carousel, className }: { carousel: Carousel; className?: string }) {
  return (
    <div role="group" aria-label="Escolher destaque" className={cn('flex items-center', className)}>
      {SLIDES.map((slide, index) => (
        <button
          key={slide.eyebrow}
          type="button"
          onClick={() => carousel.select(index)}
          aria-label={`Destaque ${index + 1} de ${SLIDES.length}: ${slide.eyebrow}`}
          aria-current={index === carousel.active ? 'true' : undefined}
          className="group/dot flex h-6 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className={cn(
              'h-2 rounded-full transition-all duration-300 motion-reduce:transition-none',
              index === carousel.active ? 'w-6 bg-primary' : 'w-2 bg-border-soft group-hover/dot:bg-secondary',
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function Hero() {
  const carousel = useCarousel(SLIDES.length, AUTOPLAY_MS)
  const active = carousel.active
  const slide = SLIDES[active] ?? SLIDES[0]!
  return (
    <>
      <section
        aria-label="Destaques"
        aria-roledescription="carrossel"
        {...carousel.holdProps}
        className="relative hidden h-112.5 overflow-hidden rounded-2xl bg-card md:flex"
      >
        <div className="flex w-full items-stretch justify-between gap-8">
          <div className="flex min-w-0 flex-1 flex-col justify-center pl-10 lg:pl-12">
            <div aria-live={carousel.playing ? 'off' : 'polite'}>
              <div key={active} className="flex max-w-150 animate-in flex-col gap-8 duration-500 fade-in-0 slide-in-from-bottom-2">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-2 text-foreground">
                    <p className="text-sm leading-4 font-medium tracking-[1.4px]">{slide.eyebrow}</p>
                    <h1 className="text-[32px] leading-13 font-bold lg:text-[43px] lg:leading-17.5">
                      {slide.title[0]}
                      <br />
                      {slide.title[1]}
                    </h1>
                  </div>
                  <p className="max-w-139.25 text-sm leading-6 text-sand">{slide.text}</p>
                </div>
                <Button asChild size="sm" radius="md" className="w-35">
                  <Link to="/" hash="catalogo" search={(prev) => patchSearch(prev, slide.search)}>
                    EXPLORAR
                  </Link>
                </Button>
              </div>
            </div>
            <Controls carousel={carousel} className="absolute bottom-7 left-10 lg:left-12" />
          </div>
          <div className="relative h-full w-80 shrink-0 overflow-hidden rounded-2xl lg:w-112.5">
            {SLIDES.map((s, index) => (
              <NftImage
                key={s.image.slug}
                image={s.image}
                width={450}
                height={450}
                sizes="(min-width: 1024px) 450px, 320px"
                priority={index === 0}
                className={cn(
                  'absolute inset-0 size-full rounded-2xl transition-opacity duration-700 ease-in-out',
                  index === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Destaques"
        aria-roledescription="carrossel"
        {...carousel.holdProps}
        className="relative flex flex-col items-center gap-4 overflow-hidden rounded-xl bg-card p-4 md:hidden"
      >
        <span aria-hidden="true" className="absolute -top-8 -left-20 size-62 rounded-full bg-primary/10" />
        <span aria-hidden="true" className="absolute -top-2.5 left-18.25 size-62 rounded-full bg-primary/5" />
        <div aria-live={carousel.playing ? 'off' : 'polite'} className="relative w-full">
          <div key={active} className="flex w-full animate-in items-center gap-2 duration-500 fade-in-0">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs leading-4 font-medium text-foreground">{slide.eyebrow}</p>
                <h1 className="w-47.5 text-lg leading-7.25 font-bold text-foreground">
                  {slide.mobileTitle[0]}
                  <br />
                  {slide.mobileTitle[1]}
                </h1>
                <p className="text-xs leading-4.5 text-sand">{slide.mobileText}</p>
              </div>
              <Link
                to="/"
                hash="catalogo"
                search={(prev) => patchSearch(prev, slide.search)}
                className="mt-2 inline-flex items-center gap-2 self-start rounded-xs text-xs leading-3.5 font-bold text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                EXPLORAR
                <Icon icon={ArrowRightIcon} size={16} />
              </Link>
            </div>
            <div className="relative h-36.5 w-34.5 shrink-0">
              <NftImage image={slide.image} width={138} height={138} sizes="138px" priority={active === 0} className="size-34.5 rounded-2xl" />
              <NftImage
                image={slide.secondaryImage}
                width={58}
                height={58}
                sizes="58px"
                className="absolute top-22 left-3.5 size-14.5 rounded-2xl border border-card"
              />
            </div>
          </div>
        </div>
        <Controls carousel={carousel} className="relative" />
      </section>
    </>
  )
}
