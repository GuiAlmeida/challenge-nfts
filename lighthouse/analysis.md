## Análise

As medianas acima foram medidas contra a aplicação publicada na Vercel, que é o ambiente de avaliação. No desktop as duas páginas marcam 100. No mobile o detalhe marca 90 e o início 88, dois pontos abaixo da meta. Accessibility, Best Practices e SEO marcam 100 em todos os casos, e o CLS é 0 porque os skeletons têm as dimensões do conteúdo real.

### O ambiente muda a nota

O `vite preview` serve em HTTP/1.1 com gzip, o que limita a seis downloads paralelos e penaliza as dezenas de chunks pequenos do build. A Vercel serve em HTTP/2 com brotli. Com o mesmo build, o preview local marca 70 no início e 74 no detalhe no perfil mobile; a URL publicada marca 88 e 90. Por isso os relatórios versionados são da URL publicada (`LH_BASE_URL=https://challenge-nfts.vercel.app pnpm lighthouse`). A nota mobile ainda varia uns três pontos entre máquinas e redes diferentes.

### O que segura o mobile

No início, FCP de 2,7 s e LCP de 3,4 s. As duas medidas têm causas conhecidas:

1. Renderização no cliente. Nada aparece antes de baixar e executar o bundle inicial, cerca de 240 KB comprimidos (React DOM, TanStack Router e Query, zod, Axios e os primitivos Radix do header). Com a rede de 1,6 Mbps e a CPU 4x mais lenta do perfil mobile, isso leva 2,7 s. Só renderização no servidor ou pré-renderização mudaria esse número, e as duas ficam fora da stack fixa do desafio.
2. Backend no navegador. O LCP é a primeira imagem do catálogo (ou a da galeria, no detalhe), que só aparece com os dados. Antes da primeira resposta, o navegador baixa o MSW com handlers e fixtures (cerca de 105 KB comprimidos, dos quais 40% são o `tough-cookie` e a lista de sufixos públicos que o MSW importa e este projeto não usa) e registra o service worker. Com uma API real esse trecho não existiria. O mock só começa a carregar depois da primeira pintura, para não disputar a rede com a interface, e as requisições esperam por ele.

### O que está aplicado

Divisão de código por rota e `sideEffects` declarado para o bundler descartar o que não é usado. Só um hero e uma galeria renderizados por largura: antes, o hero desktop baixava escondido uma imagem de 46 KB no mobile. Imagens WebP em 250, 450, 650 e 900 px com `srcset` e `sizes`, prioridade alta só na imagem candidata a LCP e carregamento imediato nas demais imagens da primeira tela. Fonte pré-carregada e `socket.io-client` carregado só quando o tempo real conecta.

### O que foi testado e descartado

- Moldura estática no `index.html` (header e barra de abas em HTML puro, substituídos pelo React no primeiro render). A primeira pintura real caiu de 194 ms para 51 ms, mas o Lighthouse estimou o FCP em 2,0 s em vez de 2,4 s e o TBT subiu de 34 ms para 145 ms, porque o trabalho do React passou a contar depois da primeira pintura. A nota caiu dois pontos.
- Preload da imagem do LCP. O arquivo já chega antes dos dados; o atraso está na espera pelos dados. Ganho zero.
- Trocar a lista de sufixos do `tough-cookie` pela versão experimental menor. Em brotli a diferença é de 4 KB.

A auditoria roda com as imagens, a fonte e todas as funcionalidades da entrega, sem versão simplificada para pontuar.
