# Lighthouse: resumo (mediana de 3 execuções)

- Data: 2026-10-28T20:01:51.180Z · Lighthouse 13.5.0 · Node v24.11.1 · Chromium 156.0.8078.4 (Playwright)
- URL base: http://localhost:4173 · build demo (`pnpm build:demo`, mocks ativos, cenário default)
- Condições mobile: 412x823 a 1.75x, RTT 150 ms, 1.6 Mbps, CPU 4x (simulate)
- Condições desktop: 1350x940 a 1x, RTT 40 ms, 10.0 Mbps, CPU 1x (simulate)

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |
|---|---|---|---|---|---|---|---|---|
| home | mobile | 69 | 100 | 100 | 100 | 5717 | 0 | 140 |
| home | desktop | 98 | 100 | 100 | 100 | 1016 | 0 | 0 |
| nft-detail | mobile | 73 | 100 | 100 | 100 | 4669 | 0 | 174 |
| nft-detail | desktop | 98 | 100 | 100 | 100 | 1018 | 0 | 0 |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

## Análise

Accessibility, Best Practices e SEO passam das metas nos quatro cenários, e a Performance no desktop também. A Performance no mobile fica abaixo de 90, e as medições apontam duas causas.

A primeira é a renderização no cliente. No perfil mobile (rede de 1,6 Mbps com 150 ms de latência e CPU 4x mais lenta), a primeira pintura só acontece depois de baixar e executar o bundle inicial: React DOM, TanStack Router e Query e os primitivos Radix do header. Isso deixa FCP e Speed Index acima de 3 s. O CLS é 0 porque os skeletons têm as dimensões do conteúdo real. Renderizar no servidor ou pré-renderizar as páginas resolveria, mas fica fora da stack fixa do desafio.

A segunda é o backend simulado no navegador. O LCP é a primeira imagem do catálogo ou da galeria, que depende dos dados. Antes da primeira resposta, o navegador precisa baixar o MSW com os handlers e as fixtures (cerca de 176 KB comprimidos) e registrar o service worker. Com uma API real esse trecho não existiria. O mock só começa a carregar depois da primeira pintura, para não disputar a rede com a interface, e as requisições esperam por ele.

Já estão aplicados: divisão de código por rota, `sideEffects` declarado para o bundler descartar código não usado, imagens WebP em 250, 450 e 900 px com `srcset` e `sizes`, prioridade alta nas primeiras imagens, fonte pré-carregada e `socket.io-client` carregado só quando o tempo real conecta. A auditoria roda com as imagens, a fonte e todas as funcionalidades da entrega, sem versão simplificada para pontuar.
