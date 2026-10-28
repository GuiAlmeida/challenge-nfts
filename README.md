# Kurio: marketplace de NFTs

Implementação do desafio Frontend "Marketplace de NFTs" (enunciado em [`docs/CHALLENGE.md`](docs/CHALLENGE.md)). A API REST, a sessão, as carteiras, o pagamento e os eventos em tempo real são simulados no navegador: REST com MSW e tempo real com o cliente `socket.io-client` real conectado a um servidor Socket.IO simulado pelo MSW. A arquitetura, os contratos e as decisões estão em [`ARCHITECTURE.md`](ARCHITECTURE.md).

**Aplicação publicada:** _a URL entra aqui após o deploy na Vercel._

## Stack

React 19, TypeScript 5.9, Vite 8, TanStack Router (rotas por arquivo) e TanStack Query 5, Axios, `socket.io-client` 4, Tailwind 4 com shadcn/ui, zod 4, react-hook-form, zustand, MSW 2.15 com `@mswjs/socket.io-binding`, Vitest, Playwright e Lighthouse.

## Requisitos

- Node 24.11.1 (`.nvmrc`; o mínimo aceito é 22.12)
- pnpm 11 (versão fixada em `packageManager`)

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

`pnpm dev` abre `http://localhost:5173` com os mocks ativos. Na primeira visita o service worker do MSW é registrado; a interface aparece antes e as requisições esperam o mock ficar pronto.

## Variáveis de ambiente

| Variável            | Valor padrão | Uso                                                                        |
| ------------------- | ------------ | -------------------------------------------------------------------------- |
| `VITE_ENABLE_MOCKS` | `false`      | `true` liga o MSW e o Socket.IO simulado. Necessário em dev, demo e testes |
| `VITE_API_BASE_URL` | `/api`       | prefixo das chamadas REST; os handlers do MSW respondem nele               |

`.env.development` já liga os mocks para `pnpm dev`. `pnpm build:demo` liga os mocks no build usado no deploy, nos testes e no Lighthouse. Não há segredos: nenhuma chave ou serviço externo é necessário.

## Comandos

| Comando                                        | O que faz                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                                     | desenvolvimento com mocks                                                    |
| `pnpm build` / `pnpm build:demo`               | build de produção / build com mocks (deploy, testes e Lighthouse)            |
| `pnpm preview`                                 | serve `dist/` em `http://localhost:4173`                                     |
| `pnpm typecheck` / `pnpm lint` / `pnpm format` | TypeScript, ESLint (inclui as fronteiras entre camadas) e Prettier           |
| `pnpm test:unit`                               | Vitest com as regras puras                                                   |
| `pnpm test:e2e`                                | build demo + Playwright nos projetos `desktop` (1440) e `mobile` (Pixel 7)   |
| `pnpm test:e2e:fast`                           | Playwright sem rebuild, reaproveitando o `dist/` atual                       |
| `pnpm test:visual`                             | build demo + regressão visual de início, detalhe, carrinho e pagamento       |
| `pnpm lighthouse`                              | 3 medições por página e perfil contra `pnpm preview`; relatórios versionados |

## Credenciais fictícias

| Usuário | E-mail             | Senha        | Estado inicial                                            |
| ------- | ------------------ | ------------ | --------------------------------------------------------- |
| Ana     | `ana@kurio.test`   | `Kurio!2026` | carteira principal e secundária, favoritos, avatar vazio  |
| Bruno   | `bruno@kurio.test` | `Kurio!2026` | nenhuma carteira, bom para testar o cadastro de carteiras |

Também é possível criar uma conta em `/register`. Cupons de teste: `KURIO10` (10%), `LANCAMENTO5` (5%) e `EXPIRADO` (vencido); qualquer outro código é inválido.

## Cenários e reset dos mocks

O estado do backend simulado fica no `localStorage` do navegador e sobrevive ao refresh. Para escolher um cenário ou voltar ao estado inicial:

- Na URL, `?mock-scenario=<nome>` ativa um cenário e `?mock-reset=1` restaura as fixtures. Podem ser combinados, por exemplo `/?mock-scenario=price-change&mock-reset=1`. Os parâmetros saem da URL depois de aplicados.
- No console, `window.__kurioMock` expõe `setScenario(nome, { reset })`, `reset()`, `scenarios()`, `state()`, `emit(tipo, id, payload, { version, id, userId })`, `updateNft(id, patch)` e `socket.dropAll()`.
- Por HTTP, com `GET /__mock/scenario`, `POST /__mock/scenario`, `POST /__mock/reset` e `POST /__mock/emit`, que o próprio MSW intercepta.

| Cenário             | Comportamento                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `default`           | latência leve; pagamento confirmado em 3 s                                                                      |
| `slow`              | latência de 1,5 a 3 s para ver os skeletons                                                                     |
| `out-of-order`      | a primeira listagem demora 1,5 s e a segunda 200 ms                                                             |
| `offline`           | toda chamada REST falha como erro de rede                                                                       |
| `http-errors`       | catálogo responde 500 duas vezes e recupera; favoritos sempre 500; adicionar ao carrinho falha 1 vez            |
| `session-expired`   | a sessão expira 15 s após o login                                                                               |
| `register-conflict` | o cadastro sempre responde e-mail já usado                                                                      |
| `coupon`            | cupons válido, vencido e inválido                                                                               |
| `price-change`      | 5 s após a cotação, o preço do primeiro item do carrinho sobe 10% via `nft.updated`                             |
| `sold-out`          | 5 s após a cotação, a edição do primeiro item esgota via `nft.updated`                                          |
| `order-timeout`     | `POST /orders` demora 15 s, acima do timeout do cliente; o pedido existe e o retry com a mesma chave o recupera |
| `payment-declined`  | pagamento recusado 3 s após o envio                                                                             |
| `payment-confirmed` | pagamento confirmado 3 s após o envio                                                                           |
| `cart-seeded`       | carrinho da Ana com os três itens do Figma                                                                      |

## Como reproduzir os fluxos de falha

Em todos os casos, comece com `?mock-reset=1` para partir do estado conhecido.

| Fluxo                                   | Como reproduzir                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skeletons e carregamento lento          | abrir `/?mock-scenario=slow`                                                                                                                                                   |
| Falha com nova tentativa                | abrir `/?mock-scenario=http-errors`; o catálogo mostra o erro, "Tentar novamente" recupera na terceira chamada                                                                 |
| Respostas fora de ordem                 | abrir `/?mock-scenario=out-of-order` e buscar duas vezes seguidas; a tela mostra só a última busca                                                                             |
| Sem rede                                | `/?mock-scenario=offline` ou o modo offline do DevTools; aparece o aviso de conexão e as ações mostram erro                                                                    |
| Sessão expirada                         | `/login?mock-scenario=session-expired`, entrar e esperar 15 s; a próxima ação avisa e leva ao login, e o rascunho do checkout volta preenchido                                 |
| Conflito no cadastro                    | `/register?mock-scenario=register-conflict`; o erro aparece no campo de e-mail                                                                                                 |
| Favorito que falha                      | entrar, ativar `http-errors` pelo console e favoritar; a marcação é desfeita e um aviso aparece                                                                                |
| Cupom inválido ou vencido               | no carrinho, aplicar `EXPIRADO` ou qualquer outro código                                                                                                                       |
| Preço muda durante o checkout           | `/login?mock-scenario=price-change`, entrar como Ana, adicionar um NFT e ir ao pagamento; após 5 s aparece o aviso, e confirmar abre a nova cotação                            |
| Item esgota durante o checkout          | o mesmo, com `sold-out`; confirmar mostra "esgotou" com o link para revisar o carrinho, e nenhum pedido é criado                                                               |
| Pagamento recusado                      | `payment-declined`; o pedido termina recusado e o carrinho continua intacto                                                                                                    |
| Timeout com recuperação do mesmo pedido | `order-timeout`; após o timeout, "Tentar novamente" reenvia com a mesma `Idempotency-Key` e chega ao mesmo pedido                                                              |
| Clique repetido em confirmar            | clicar várias vezes em "Confirmar compra"; só um pedido é criado (`window.__kurioMock.state().orders`)                                                                         |
| Carteira recusada                       | no pagamento, marcar "Simular recusa na próxima conexão" e escolher uma carteira                                                                                               |
| Evento duplicado ou antigo              | com um NFT no carrinho, chamar `__kurioMock.emit('nft.updated', id, payload, { id: 'evt-1', version: 50 })` duas vezes e depois com `version: 10`; só o primeiro altera a tela |
| Desconexão com pedido pendente          | com um pedido pendente aberto, chamar `__kurioMock.socket.dropAll()`; aparece "Reconectando…" e o pedido é reconciliado pela API ao voltar                                     |

## Testes

- Os unitários (`pnpm test:unit`) cobrem as regras puras de valores em ETH, catálogo, carrinho, checkout, pedidos, conta e carteiras, além do guarda de eventos.
- Os E2E (`pnpm test:e2e`) cobrem os 12 cenários do enunciado. Cada teste parte de um estado isolado (`?mock-reset=1`), e os fluxos sensíveis a tempo controlam o relógio. O tempo real passa pelo cliente Socket.IO e o REST pelos handlers do MSW. A suíte também verifica acessibilidade com axe, navegação por teclado, foco em diálogos, ausência de rolagem horizontal de 320 a 1440 px e o cursor dos elementos clicáveis.
- Cada execução gera `playwright-report/index.html`, com traces e screenshots dos testes que falharem (`trace: retain-on-failure`).
- A regressão visual (`pnpm test:visual`) compara com as baselines versionadas em `tests/visual/__screenshots__`, geradas no Linux (WSL2) com o Chromium do Playwright 1.64.1, relógio fixo e movimento reduzido. Em macOS ou Windows a renderização de fontes muda e a comparação pode falhar sem diferença real; rode no Linux ou no container `mcr.microsoft.com/playwright:v1.64.1-noble`.

## Lighthouse

`pnpm lighthouse` mede início e detalhe do NFT, nos perfis mobile e desktop, três vezes cada, contra `pnpm preview` do build demo. Os relatórios HTML e JSON de cada medição e o resumo com as medianas, LCP, CLS, TBT, versões e condições ficam em [`lighthouse/reports/`](lighthouse/reports/summary.md). A configuração das auditorias está em `lighthouse/`. Antes de rodar: `pnpm build:demo && pnpm preview`.

## Estrutura

```text
src/
  app/          bootstrap, providers, query client, router
  routes/       rotas por arquivo (TanStack Router)
  features/     auth, catalog, cart, checkout, orders, account, wallets, favorites, realtime
  components/   ui (shadcn) e layout compartilhado
  contracts/    schemas zod compartilhados pela aplicação e pelos mocks
  lib/          http (Axios), valores em ETH, utilitários
  mocks/        db, handlers REST, servidor Socket.IO simulado, cenários, controle
tests/
  e2e/          Playwright
  visual/       regressão visual
```

## Deploy

A Vercel usa `vercel.json`: build `pnpm build:demo`, saída `dist/` e rewrite de todas as rotas para `index.html`, o que garante acesso direto e refresh em qualquer URL. O service worker do MSW é servido sem cache.
