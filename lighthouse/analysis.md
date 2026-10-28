## Análise

Accessibility, Best Practices e SEO passam das metas nos quatro cenários, e a Performance no desktop também. A Performance no mobile fica abaixo de 90, e as medições apontam duas causas.

A primeira é a renderização no cliente. No perfil mobile (rede de 1,6 Mbps com 150 ms de latência e CPU 4x mais lenta), a primeira pintura só acontece depois de baixar e executar o bundle inicial: React DOM, TanStack Router e Query e os primitivos Radix do header. Isso deixa FCP e Speed Index acima de 3 s. O CLS é 0 porque os skeletons têm as dimensões do conteúdo real. Renderizar no servidor ou pré-renderizar as páginas resolveria, mas fica fora da stack fixa do desafio.

A segunda é o backend simulado no navegador. O LCP é a primeira imagem do catálogo ou da galeria, que depende dos dados. Antes da primeira resposta, o navegador precisa baixar o MSW com os handlers e as fixtures (cerca de 176 KB comprimidos) e registrar o service worker. Com uma API real esse trecho não existiria. O mock só começa a carregar depois da primeira pintura, para não disputar a rede com a interface, e as requisições esperam por ele.

Já estão aplicados: divisão de código por rota, `sideEffects` declarado para o bundler descartar código não usado, imagens WebP em 250, 450 e 900 px com `srcset` e `sizes`, prioridade alta nas primeiras imagens, fonte pré-carregada e `socket.io-client` carregado só quando o tempo real conecta. A auditoria roda com as imagens, a fonte e todas as funcionalidades da entrega, sem versão simplificada para pontuar.
