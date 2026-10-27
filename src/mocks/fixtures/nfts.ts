import type { Network } from '@/contracts/common'
import type { Edition, NftImage } from '@/contracts/nft'
import { formatEth, parseEth } from '@/lib/eth'
import { COLLECTIONS } from './collections'

export interface NftRecord {
  id: string
  name: string
  tokenId: string
  collectionSlug: string
  network: Network
  basePrice: string
  previousPrice: string | null
  image: NftImage
  gallery: NftImage[]
  rare: boolean
  trending: boolean
  listedAt: string
  rating: number
  reviewsCount: number
  shortDescription: string
  description: string
  attributes: string[]
  creator: string
  royaltyPct: number
  contractAddress: string
  editions: Edition[]
  version: number
}

const ART = ['ape-emerald', 'ape-sage', 'ape-neon', 'ape-golden-beat'] as const

const FIGMA_ITEMS: Array<{
  name: string
  price: string
  previousPrice?: string
  art: (typeof ART)[number]
  rare?: boolean
  collection: string
  network: Network
}> = [
  {
    name: 'Emerald Ape #042',
    price: '1.19',
    art: 'ape-emerald',
    collection: 'arte-digital',
    network: 'ethereum',
  },
  {
    name: 'Sage Nomad #009',
    price: '1.69',
    art: 'ape-sage',
    collection: 'colecionaveis',
    network: 'ethereum',
  },
  {
    name: 'Neon Vessel #552',
    price: '1.99',
    previousPrice: '2.29',
    art: 'ape-neon',
    rare: true,
    collection: 'generativa',
    network: 'polygon',
  },
  { name: 'Cosmic Bloom #118', price: '1.29', art: 'ape-sage', collection: 'arte-3d', network: 'ethereum' },
  {
    name: 'Violet Nomad #314',
    price: '1.39',
    art: 'ape-sage',
    collection: 'arte-digital',
    network: 'ethereum',
  },
  {
    name: 'Ivory Baron #088',
    price: '1.79',
    art: 'ape-neon',
    collection: 'fotografia',
    network: 'ethereum',
  },
  {
    name: 'Golden Beat #207',
    price: '0.99',
    art: 'ape-golden-beat',
    collection: 'musica',
    network: 'solana',
  },
  {
    name: 'Golden Frequency #071',
    price: '0.59',
    art: 'ape-golden-beat',
    collection: 'musica',
    network: 'solana',
  },
  {
    name: 'Golden Signal #160',
    price: '0.39',
    art: 'ape-golden-beat',
    collection: 'utilidade',
    network: 'polygon',
  },
]

const ADJECTIVES = ['Amber', 'Velvet', 'Lunar', 'Crimson', 'Silver', 'Obsidian', 'Jade', 'Coral', 'Azure']
const NOUNS = ['Drifter', 'Oracle', 'Pilot', 'Monarch', 'Voyager', 'Sentinel', 'Nomad', 'Baron', 'Vessel']
const NETWORKS: Network[] = ['ethereum', 'polygon', 'solana']
const CREATORS = ['Nova Sato', 'Lia Moreau', 'Teo Albuquerque', 'Mina Okafor', 'Rafael Duarte', 'Ines Kowalski']

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace('#', '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const tokenIdOf = (name: string): string => `#${(name.match(/#(\d+)/)?.[1] ?? '0').padStart(4, '0')}`

const hex = (seed: number, length: number): string => {
  let out = ''
  let x = seed
  while (out.length < length) {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    out += x.toString(16)
  }
  return out.slice(0, length)
}

const times = (price: string, factor: bigint): string => formatEth(parseEth(price) * factor)

const editionsFor = (id: string, basePrice: string, index: number): Edition[] => {
  const uniqueSoldOut = index % 7 === 2
  const limitedLow = index % 5 === 3
  const allSoldOut = index === 30
  const avail = (n: number) => (allSoldOut ? 0 : n)
  return [
    {
      id: `${id}:1of1`,
      label: '1/1',
      kind: 'unique',
      price: times(basePrice, 2n),
      total: 1,
      available: uniqueSoldOut ? 0 : avail(1),
      maxPerOrder: 1,
    },
    {
      id: `${id}:1of10`,
      label: '1/10',
      kind: 'limited',
      price: basePrice,
      total: 10,
      available: avail(limitedLow ? 2 : 7),
      maxPerOrder: 10,
    },
    {
      id: `${id}:1of50`,
      label: '1/50',
      kind: 'limited',
      price: basePrice,
      total: 50,
      available: avail(42 - (index % 9)),
      maxPerOrder: 10,
    },
    {
      id: `${id}:open`,
      label: 'ABERTA',
      kind: 'open',
      price: basePrice,
      total: null,
      available: avail(999),
      maxPerOrder: 10,
    },
  ]
}

const listedAtFor = (index: number): string => {
  const base = Date.UTC(2026, 9, 20, 12, 0, 0)
  const daysAgo = index < 9 ? index : 9 + (index - 9) * 4
  return new Date(base - daysAgo * 86_400_000).toISOString()
}

const describe = (name: string, creator: string, editionLabel: string, collectionName: string): string =>
  `${name} é uma obra digital ${editionLabel} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na rede. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.\n\nA propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. ${creator} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade. Categoria: ${collectionName}.`

const ATTRIBUTE_SETS = [
  ['Óculos', 'Esmeralda', 'Raro'],
  ['Chapéu', 'Moletom', 'Comum'],
  ['Terno', 'Gola alta', 'Raro'],
  ['Headphones', 'Jaqueta', 'Épico'],
  ['Colar', 'Jaqueta universitária', 'Lendário'],
]

export function buildNftFixtures(): NftRecord[] {
  const records: NftRecord[] = []
  for (let index = 0; index < 36; index++) {
    const figma = FIGMA_ITEMS[index]
    const name = figma ? figma.name : `${ADJECTIVES[index % 9]} ${NOUNS[Math.floor(index / 9) % 9]} #${String(100 + index * 7).padStart(3, '0')}`
    const id = slugify(name)
    const art: (typeof ART)[number] = figma ? figma.art : ART[index % ART.length]!
    const collectionSlug = figma ? figma.collection : COLLECTIONS[index % COLLECTIONS.length]!.slug
    const collectionName = COLLECTIONS.find((c) => c.slug === collectionSlug)?.name ?? collectionSlug
    const basePrice = figma ? figma.price : formatEth(parseEth('0.25') + BigInt((index * 37) % 400) * parseEth('0.01'))
    const creator = CREATORS[index % CREATORS.length]!
    const image: NftImage = { slug: art, alt: `${name}, arte digital da coleção ${collectionName}` }
    const galleryArts: Array<(typeof ART)[number]> = [
      art,
      ART[(index + 1) % ART.length]!,
      ART[(index + 2) % ART.length]!,
      ART[(index + 3) % ART.length]!,
    ]
    records.push({
      id,
      name,
      tokenId: tokenIdOf(name),
      collectionSlug,
      network: figma ? figma.network : NETWORKS[index % 3]!,
      basePrice,
      previousPrice: figma?.previousPrice ?? (index % 6 === 4 ? formatEth(parseEth(basePrice) + parseEth('0.30')) : null),
      image,
      gallery: galleryArts.map((slug, i) => ({ slug, alt: `${name}, vista ${i + 1}` })),
      rare: figma?.rare ?? index % 8 === 5,
      trending: index % 3 === 0,
      listedAt: listedAtFor(index),
      rating: index === 0 ? 4.8 : 3.5 + ((index * 13) % 15) / 10,
      reviewsCount: index === 0 ? 19 : (index * 11) % 40,
      shortDescription:
        'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na rede, com arte desbloqueável e acesso para colecionadores.',
      description: describe(name, creator, '1/50', collectionName),
      attributes: ATTRIBUTE_SETS[index % ATTRIBUTE_SETS.length]!,
      creator,
      royaltyPct: 5,
      contractAddress: `0x${hex(index + 7, 40)}`,
      editions: editionsFor(id, basePrice, index),
      version: 1,
    })
  }
  return records
}
