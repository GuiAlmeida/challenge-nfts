import type { Collection } from '@/contracts/nft'

export const COLLECTIONS: Collection[] = [
  { slug: 'arte-digital', name: 'Arte digital' },
  { slug: 'fotografia', name: 'Fotografia' },
  { slug: 'musica', name: 'Música' },
  { slug: 'arte-3d', name: 'Arte 3D' },
  { slug: 'colecionaveis', name: 'Colecionáveis' },
  { slug: 'generativa', name: 'Generativa' },
  { slug: 'jogos', name: 'Jogos' },
  { slug: 'assinaturas', name: 'Assinaturas' },
  { slug: 'utilidade', name: 'Utilidade' },
]

export const collectionBySlug = (slug: string): Collection | undefined => COLLECTIONS.find((c) => c.slug === slug)
