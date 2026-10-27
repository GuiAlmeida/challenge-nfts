# Assets

Origem e substituições de tudo que é visual e não é código. Fonte: arquivo Figma `LupYhmHhcC6Gbren3WzDqK` (cópia pessoal do desafio, página `0:1`).

## Fonte

- Roboto Mono variável (400–700), vendorizada em `public/fonts/roboto-mono-latin-wght-normal.woff2` (licença Apache 2.0 em `public/fonts/LICENSE`). Carregada via `src/styles/fonts.css` com `font-display: swap` e preload no `index.html`.

## Ícones

Os 50 SVGs em `src/assets/icons/` foram exportados dos frames do Figma (família Iconly e ícones próprios do layout), convertidos para `currentColor` quando monocromáticos e expostos via svgr em `src/assets/icons/index.ts` (`<NomeIcon />`). Multicoloridos (`google`, `facebook`, `coinbase-pill`, `thank-you`, `hero-mask`, `tabbar-shape`) mantêm as cores originais.

| Uso                             | Ícone (Figma)                                    | Arquivo                                                                                             |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Header: busca, carrinho, entrar | Search, Buy, Login                               | `search.svg`, `cart.svg`, `login.svg`                                                               |
| Tab bar mobile                  | Home, Heart, Scan, Shop, Profile                 | `home.svg`, `tabbar-heart.svg`, `scan.svg`, `shop.svg`, `user-outline.svg`                          |
| Card e detalhe                  | Heart, Star, Zoom, Share (LinkedIn/Mail/Twitter) | `heart.svg`, `heart-outline.svg`, `star.svg`, `zoom.svg`, `linkedin.svg`, `mail.svg`, `twitter.svg` |
| Carrinho/checkout               | Delete, Wallet, Location, Download               | `trash.svg`, `wallet.svg`, `location.svg`, `download.svg`                                           |
| Formulários                     | Hide (olho), Arrow, Chevron, Close, Alert        | `eye-off*.svg`, `arrow-*.svg`, `chevron-down*.svg`, `close.svg`, `alert-triangle.svg`               |
| Rodapé                          | Redes sociais, pill Coinbase                     | `social-*.svg`, `coinbase-pill.svg`                                                                 |
| Confirmação                     | Ilustração "thank you"                           | `thank-you.svg`                                                                                     |

### Substituições (Lucide)

Primitivos do shadcn usam Lucide para glifos utilitários que não existem no Figma como componente exportável: `Check` (checkbox, select, dropdown), `ChevronDown`/`ChevronUp` (select), `ChevronRight`/`Circle` (dropdown, radio), `X` (dialog, sheet), `Minus`/`Plus` (stepper), e os ícones de status do toast (`CircleCheck`, `Info`, `Loader2`, `OctagonX`, `TriangleAlert`). Mesmo traço (1.5–2 px) e tamanho dos equivalentes do Figma.

## Imagens

O Figma usa apenas 4 artes únicas, repetidas nos 9 cards, no hero, nos destaques e no blog. Originais exportados em PNG (não versionados: `scripts/raw-images/*.png`) e otimizados por `pnpm images:optimize` (sharp) para `public/images/nfts/<slug>-{250,450,900}.webp`:

| Slug              | Descrição                         | Onde aparece no Figma                                             |
| ----------------- | --------------------------------- | ----------------------------------------------------------------- |
| `ape-emerald`     | macaco com óculos e jaqueta verde | hero, Emerald Ape #042, promo 1, blog 2                           |
| `ape-sage`        | gorila com chapéu e moletom lilás | Sage Nomad, Cosmic Bloom, Violet Nomad, "NFT em destaque", blog 3 |
| `ape-neon`        | chimpanzé de terno claro          | Neon Vessel, Ivory Baron, promo 2, blog 1                         |
| `ape-golden-beat` | macaco dourado com headphones     | Golden Beat, Golden Frequency, Golden Signal, blog 4              |

Os demais NFTs das fixtures (27 além dos 9 do Figma) reutilizam as 4 artes em rotação. `srcset` com 250/450/900 e `sizes` por contexto; hero com `fetchpriority="high"`, cards com `loading="lazy"`.
