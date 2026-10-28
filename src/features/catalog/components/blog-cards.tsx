import { NftImage, notifyOutOfScope } from '@/components/layout'
import type { NftImage as NftImageData } from '@/contracts/nft'

interface Post {
  date: string
  readingMinutes: number
  title: string
  text: string
  image: NftImageData
}

const POSTS: Post[] = [
  {
    date: '12 de setembro',
    readingMinutes: 6,
    title: 'Como funciona a propriedade de NFTs',
    text: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: { slug: 'ape-neon', alt: '' },
  },
  {
    date: '13 de setembro',
    readingMinutes: 2,
    title: '10 artistas digitais para acompanhar',
    text: 'Conheça criadores que moldam a cultura digital.',
    image: { slug: 'ape-emerald', alt: '' },
  },
  {
    date: '15 de setembro',
    readingMinutes: 3,
    title: 'Raridade, atributos e procedência',
    text: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: { slug: 'ape-sage', alt: '' },
  },
  {
    date: '15 de setembro',
    readingMinutes: 2,
    title: 'Como proteger sua carteira',
    text: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: { slug: 'ape-golden-beat', alt: '' },
  },
]

export function BlogCards() {
  return (
    <section aria-labelledby="blog-heading" className="flex flex-col items-center gap-10">
      <div className="flex flex-col gap-3 text-center">
        <h2 id="blog-heading" className="text-[22px] font-bold text-foreground md:text-[28px]">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-sand">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </div>
      <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {POSTS.map((post) => (
          <li key={post.title} className="flex flex-col overflow-hidden rounded-lg bg-card">
            <NftImage
              image={post.image}
              width={268}
              height={195}
              sizes="(min-width: 1280px) 282px, (min-width: 640px) 45vw, 90vw"
              className="h-48.75 w-full"
            />
            <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
              <p className="flex items-center gap-2 text-xs leading-4 font-medium whitespace-nowrap text-sand">
                <span className="shrink-0">{post.date}</span>
                <span className="min-w-0 truncate border-l border-border-soft pl-2">Leitura de {post.readingMinutes} min</span>
              </p>
              <h3 className="text-base font-bold text-foreground">{post.title}</h3>
              <p className="text-xs leading-4 font-medium text-sand">{post.text}</p>
              <button
                type="button"
                onClick={() => notifyOutOfScope('Diário da Cunhagem')}
                aria-disabled="true"
                className="mt-auto inline-flex items-center gap-1 self-start rounded-xs pt-2 text-xs leading-3.5 font-bold text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Ler mais <span aria-hidden="true">→</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
