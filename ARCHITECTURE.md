# Arquitetura

Para rodar o projeto e reproduzir os cenários, veja o [README](README.md).

## Visão geral

A aplicação é uma SPA em React 19 com TanStack Router (rotas por arquivo, divisão de código por rota) e TanStack Query. A organização é por feature, inspirada em Feature-Sliced Design sem segui-lo à risca:

```text
app → routes → features → components | lib | contracts
```

As importações só descem nessa ordem, e uma feature só importa outra pelo `index.ts` dela. O ESLint (`eslint-plugin-boundaries`) quebra o lint se alguém atravessar uma fronteira. `src/mocks` é isolado: a aplicação nunca importa os mocks, que entram só pelo bootstrap quando `VITE_ENABLE_MOCKS=true`.

Cada dado tem um dono só:

| Dado                                                        | Dono                                           |
| ----------------------------------------------------------- | ---------------------------------------------- |
| dados do servidor (catálogo, carrinho, cotação, pedidos...) | TanStack Query                                 |
| sessão (token, validade) e estado de UI global              | zustand                                        |
| busca, filtros, ordenação, aba e página do catálogo         | URL (search params validados com zod)          |
| regras de negócio puras                                     | arquivos `*.rules.ts`, testados com Vitest     |
| fluxo de uma tela (formulário, envio, erros, navegação)     | hooks `useXFlow`; os componentes só renderizam |

`src/contracts` concentra os schemas zod usados pela aplicação e pelos mocks. Eles são a única definição de tipo entre o transporte e a interface.

## Contratos REST

Todas as chamadas passam por `src/lib/http.ts` (Axios, base `/api`, timeout de 10 s). O cliente envia `Authorization: Bearer <token>` quando há sessão, `X-Cart-Id` com o id do carrinho de visitante e `Idempotency-Key` na criação de pedido.

| Recurso      | Endpoints                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------ |
| Catálogo     | `GET /nfts` (busca, filtros, ordenação, aba, paginação e facets), `GET /nfts/:id`          |
| Autenticação | `POST /auth/register`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout`        |
| Perfil       | `GET /me`, `PATCH /me`, `POST /me/avatar`, `DELETE /me/avatar`, `POST /me/password`        |
| Favoritos    | `GET /me/favorites`, `PUT /me/favorites/:nftId`, `DELETE /me/favorites/:nftId`             |
| Carteiras    | `GET /me/wallets`, `POST /me/wallets`, `PATCH /me/wallets/:id`                             |
| Carrinho     | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId` |
| Cotação      | `POST /cart/quote`                                                                         |
| Pedidos      | `POST /orders`, `GET /orders`, `GET /orders/:id`                                           |

Os erros seguem um envelope único, `{ error: { code, message, fields?, details? } }`:

| Status  | Códigos                                                                                                              | Tratamento na interface                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 400     | `WRONG_PASSWORD`                                                                                                     | erro no campo "Senha atual"                                                    |
| 401     | `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, `SESSION_EXPIRED`                                                          | erro no formulário de login ou encerramento da sessão (ver política de sessão) |
| 404     | `NOT_FOUND`                                                                                                          | página de recurso inexistente                                                  |
| 409     | `EMAIL_TAKEN`, `USERNAME_TAKEN`, `AVAILABILITY_CONFLICT`, `QUOTE_OUTDATED`, `IDEMPOTENCY_CONFLICT`, `PRIMARY_EXISTS` | erro no campo, aviso com ação ou diálogo de nova cotação                       |
| 422     | `VALIDATION_ERROR`, `COUPON_INVALID`, `COUPON_EXPIRED`                                                               | `fields` vira erro em cada campo do formulário, com foco no primeiro           |
| 5xx     | `UNAVAILABLE`                                                                                                        | estado de erro com "Tentar novamente"                                          |
| cliente | `NETWORK_ERROR`, `TIMEOUT` (gerados pelo cliente)                                                                    | aviso de rede ou nova tentativa com a mesma chave                              |

Valores em ETH trafegam como string decimal, são calculados em `BigInt` (wei) em `src/lib/eth.ts` e formatados só na exibição. Nenhum valor monetário passa por `Number`.

## Eventos em tempo real

Os eventos chegam pelo cliente `socket.io-client` e são validados com zod antes de qualquer uso. O envelope é:

```ts
{ id: string, type: 'nft.updated' | 'order.updated', resource: { type: 'nft' | 'order', id: string }, version: number, occurredAt: string, payload: unknown }
```

| Evento          | Payload                                                             | Efeito                                                                          |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `nft.updated`   | `price?`, `editions?: [{ id, price, available }]`                   | atualiza catálogo, detalhe e carrinho ativo; marca a cotação como desatualizada |
| `order.updated` | `status`, `txHash?`, `explorerUrl?`, `receipt?` (só em `confirmed`) | atualiza o pedido em cache; confirmado invalida o carrinho                      |

`id` identifica a entrega e `version` é monotônica por recurso. O guarda de eventos (`features/realtime/event-guard.ts`) descarta envelope inválido, id já visto (memória dos últimos 500) e versão menor ou igual à que está em cache. A interface só escreve no cache em nome de um evento que de fato chegou pelo socket.

## Transporte do Socket.IO e limitações do mock

O cliente conecta em `/socket.io/` com `transports: ['websocket']`, porque o MSW intercepta WebSocket e não o long-polling HTTP. O token vai no `auth` do handshake. O servidor é simulado com `@mswjs/socket.io-binding`: fala o protocolo Engine.IO/Socket.IO, envia heartbeat a cada 20 s (o cliente derruba a conexão por ping timeout após 30 s sem ele), separa os eventos de pedido por usuário e expõe `socket.dropAll()` para simular queda.

O `socket.io-client` é importado depois que o service worker do MSW está ativo, porque o Engine.IO guarda o construtor de `WebSocket` no momento em que o módulo é avaliado.

Limitações do mock de tempo real:

- O "servidor" vive em cada aba. O banco simulado é compartilhado pelo `localStorage`, mas um evento emitido numa aba não chega às outras.
- Só há transporte WebSocket; o fallback para long-polling não é exercitado.
- Os eventos agendados (mudança de preço, esgotamento, confirmação de pedido) usam timers do navegador e param se a aba for fechada; ao reabrir, o estado é recuperado pela API.

## Política de sessão

- `POST /auth/login` e `POST /auth/register` devolvem token, validade (30 min no cenário padrão) e o usuário. O zustand guarda token e validade em `localStorage`; o usuário é dado do servidor e vive na query `['me', userId]`, com o último snapshot só como valor inicial.
- No boot, `GET /auth/session` revalida a sessão.
- Um 401 só encerra a sessão se a requisição foi feita com o token atual, o que evita que uma resposta atrasada de outra sessão derrube a nova. Ao encerrar: remove as queries privadas, mostra o aviso "Sua sessão expirou" e, se a rota é privada, leva ao login com `redirect` para voltar depois.
- Rotas privadas (`/checkout`, `/orders/:id`, `/account/*`) ficam sob o layout `_authenticated`, que redireciona antes de renderizar.
- Logout e troca de usuário removem todas as queries privadas (chaves prefixadas pelo `userId`), limpam carrinho e cotação em cache, reconectam o socket com o novo token, desconectam a carteira simulada e apagam os rascunhos do checkout.
- O rascunho do checkout é salvo por usuário em `sessionStorage`; se a sessão expira no meio do pagamento, ele volta preenchido depois do novo login.

## Estado do carrinho

- O carrinho pertence ao servidor. A chave é `['cart', 'user:<id>']` para usuários e `['cart', 'guest:<cartId>']` para visitantes, com o `cartId` gerado no navegador e enviado em `X-Cart-Id`.
- No login, o servidor mescla o carrinho de visitante no do usuário e avisa a interface (`cartMerged`).
- Alterar quantidade e remover são otimistas, com rollback em erro. Adicionar espera a resposta do servidor, que conhece a disponibilidade real (`409 AVAILABILITY_CONFLICT` vira aviso com ajuste sugerido).
- Totais, desconto e taxa vêm sempre de `POST /cart/quote`. A cotação tem `fingerprint` e não fica em cache (`staleTime` e `gcTime` zero); a interface nunca soma preços para exibir total.
- Um `nft.updated` que afeta um item do carrinho atualiza a linha, registra a mudança no banner "Preço mudou" e marca o resumo como desatualizado até o usuário atualizar.

## Pedidos e idempotência

- Ao confirmar, o checkout pede uma cotação nova e compara o `fingerprint` com a exibida. Se mudou, ou se houve mudança de preço pendente, abre o diálogo com as diferenças e exige nova confirmação.
- Cada tentativa guarda chave e corpo em `sessionStorage`, por usuário e `fingerprint`. Timeout, erro de rede, clique repetido ou nova tentativa reaproveitam a mesma `Idempotency-Key` com o mesmo corpo, então o servidor devolve o mesmo pedido em vez de criar outro. Uma trava síncrona impede envio duplo no mesmo clique.
- `409 QUOTE_OUTDATED` reabre o diálogo com a cotação nova enviada pelo servidor; `409 IDEMPOTENCY_CONFLICT` descarta a tentativa.
- A página do pedido mostra pendente e recusado como estados da própria página. O recibo só aparece com `order.status === 'confirmed'` vindo da API ou de um evento validado, e usa o snapshot do servidor, que não muda se o catálogo mudar depois.

## Estratégia de cache

| Query                | Chave                      | `staleTime` | `gcTime` | Observação                                       |
| -------------------- | -------------------------- | ----------- | -------- | ------------------------------------------------ |
| listagem do catálogo | `['nfts', 'list', busca]`  | 30 s        | 5 min    | mantém a página anterior enquanto a nova carrega |
| detalhe do NFT       | `['nfts', 'detail', id]`   | 60 s        | 10 min   | usado também pelo "adicionar" rápido do card     |
| carrinho             | `['cart', escopo]`         | 0           | 10 min   |                                                  |
| cotação              | `['quote', escopo, cupom]` | 0           | 0        | nunca reaproveitada                              |
| usuário              | `['me', userId]`           | 5 min       | 30 min   | privada                                          |
| favoritos            | `['favorites', userId]`    | 5 min       | 30 min   | privada, toggle otimista                         |
| carteiras            | `['wallets', userId]`      | 5 min       | 30 min   | privada                                          |
| pedido               | `['orders', userId, id]`   | 0           | 30 min   | polling a cada 2 s enquanto pendente             |

Padrões globais: `staleTime` 30 s, sem refetch ao focar a janela, uma nova tentativa só para erros recuperáveis (rede, timeout e 5xx). A barra fina no topo indica refetch em segundo plano; skeletons só aparecem na primeira carga.

## Reconciliação entre REST e Socket.IO

- Todo recurso tem `version`, e ela é o único critério: evento e resposta REST só substituem o cache quando trazem versão maior. Para pedidos, a função `newerOrder` escolhe entre a resposta do polling e o que o evento já escreveu.
- O pedido pendente é consultado a cada 2 s até sair de `pending`, então o resultado aparece mesmo se o evento se perder.
- Durante uma queda aparece "Reconectando…". Quando o socket volta, `reconcile()` invalida catálogo, carrinho, cotação e pedidos, e a API traz o estado atual. Eventos atrasados que chegam depois são descartados pela versão.
- Na troca de usuário o socket reconecta com o novo token. Eventos de pedido só chegam ao dono e as versões são por recurso, então nada da sessão anterior é reaplicado.

## Decisões de UX

- No detalhe o botão é "Adicionar ao carrinho", e o header desktop tem um mini carrinho que abre no hover ou no clique, com itens, subtotal da API, "Comprar" e "Ver carrinho". O ícone de carrinho do card adiciona a edição mais barata disponível, e a imagem voa até o carrinho do header.
- O header desktop fica fixo no topo, com divisor em todas as telas e compensação de altura para âncoras.
- O hero é um carrossel que troca a cada 9 s. Ele pausa no hover, no foco por teclado e com a aba em segundo plano. Escolher um destaque encerra o autoplay, e com movimento reduzido não há autoplay.
- Os filtros listam as coleções em ordem alfabética, e a faixa de preço tem slider e campos de mínimo e máximo sincronizados. Filtro novo volta para a página 1, e tudo vive na URL.
- O perfil tem um único "Salvar" para dados e senha e envia só o que mudou. O avatar sobe na hora, com checagem de tipo e tamanho (até 200 KB).
- A carteira principal fica sempre editável, e a secundária pode começar como cópia da principal. ENS só aparece na rede Ethereum, como campo único terminado em `.eth`.
- O pagamento mobile segue o Figma (carteiras, rede, total e confirmar), com "Resumo do pedido" e "Dados do colecionador" recolhidos. O painel abre sozinho e foca o campo quando há erro de validação ou `422`.
- Hovers têm transição de 150 ms e os overlays são animados. Todo elemento clicável mostra o cursor de mão, e os desabilitados mostram o de bloqueio. No mobile os toasts ficam acima das barras fixas. Toasts e estados de pedido usam `aria-live`, diálogos e sheets prendem e devolvem o foco, os alvos de toque têm pelo menos 24 px e não há rolagem horizontal de 320 a 1440 px.

## Desvios do Figma

| Onde                      | Desvio                                                                             | Motivo                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Detalhe                   | "Adicionar ao carrinho" no lugar de "COMPRAR" e mini carrinho no header            | padrão de loja; comprar acontece no mini carrinho ou no carrinho              |
| Card do catálogo          | imagem ocupa o card inteiro                                                        | pedido de revisão visual                                                      |
| Header                    | fixo no topo, com divisor em todas as telas                                        | navegação e alvo da animação do carrinho; comentário do Figma sobre o divisor |
| Formulários               | ENS, apelido da carteira e código de indicação opcionais; ENS sem o seletor `.eth` | nem todo usuário tem ENS; ENS só existe na Ethereum                           |
| Carteiras                 | sem "Adicionar" na carteira principal                                              | só existe uma principal                                                       |
| Pedido                    | pendente e recusado como estados da página; modal só para o recibo                 | o recibo só pode existir com `confirmed`                                      |
| Rodapé                    | ícones no lugar das letras W, C e D; duas colunas abaixo de 1280 px                | comentário do Figma; o selo de carteiras estourava a coluna                   |
| Catálogo mobile           | controle de ordenação visível                                                      | ordenação é requisito em todos os tamanhos                                    |
| Detalhe abaixo de 1024 px | galeria e informações empilhadas                                                   | não há frame de tablet e o layout lado a lado não cabe                        |
| Telas sem frame           | tablet, conta no mobile (abas no topo), pedido e recibo no mobile                  | desenhadas no padrão visual das telas existentes                              |
| Ícones                    | Lucide em chevrons, sino, carregamento e ações pontuais                            | ícones sem equivalente nos assets do Figma                                    |
| Assets                    | ícones de voltar, escanear e carteira limpos do fundo do frame exportado junto     | o export do Figma trouxe retângulos de fundo dentro dos SVGs                  |

Mantidos como no Figma, apesar de comentários sugerirem o contrário: grade escalonada do catálogo no mobile, segunda imagem do hero no mobile e largura do botão "Salvar" do perfil.

## Performance

Os resultados e a análise completa estão em [`lighthouse/reports/summary.md`](lighthouse/reports/summary.md). No desktop as metas são atingidas. No mobile a Performance fica abaixo de 90 por duas causas medidas:

- A renderização acontece no cliente. A primeira pintura depende de baixar e executar o bundle inicial (React DOM, TanStack Router e Query, Radix), o que leva mais de 3 s com a rede e a CPU simuladas do perfil mobile. Renderizar no servidor ou pré-renderizar ficaria fora da stack fixa do desafio.
- O backend roda no navegador. Os dados dependem do MSW (cerca de 176 KB comprimidos) e do registro do service worker, e o LCP é a primeira imagem do catálogo, que espera esses dados. Com uma API real esse custo desaparece. Para reduzir o impacto, o mock só começa a carregar depois da primeira pintura, e as requisições esperam por ele.

As imagens já são WebP em três larguras com `srcset`, as primeiras têm prioridade alta, a fonte é pré-carregada, o código é dividido por rota e os skeletons têm as dimensões reais, o que mantém o CLS em 0.

## Limitações

- O backend simulado exige service worker, ou seja, `localhost` ou HTTPS. A primeira visita registra o worker antes de qualquer dado.
- Os dados ficam no `localStorage` de cada navegador; não há sincronização entre dispositivos.
- Carteira, pagamento, blockchain e explorador de transações são simulados; "Ver no Etherscan" abre um explorador simulado.
- Atividade, lista de interesse, ofertas, arquivos baixados, suporte, criadores, aprenda, newsletter, redes sociais e escanear NFT estão fora do escopo e avisam isso ao serem acionados.
- As baselines de regressão visual foram geradas no Linux; outros sistemas devem rodar os testes visuais no container do Playwright.
- A interface tem só o tema escuro, como o Figma.
